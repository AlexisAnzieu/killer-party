import { NextRequest, NextResponse } from 'next/server';
import { GameStatus, Player as PrismaPlayer } from '@prisma/client';
import prisma from '@/lib/prisma';


export async function PATCH(req: NextRequest, { params }: { params: Promise<{ gameId: string }> }) {
  try {
    const { gameId } = await params;
    const data = await req.json();
    const { status } = data as { status: string };

    if (!status) {
      return NextResponse.json({ error: 'Missing status' }, { status: 400 });
    }

    if (!Object.values(GameStatus).includes(status as GameStatus)) {
      return NextResponse.json({ error: 'Invalid status value' }, { status: 400 });
    }

    // Fetch current game status
    const game = await prisma.game.findUnique({
      where: { id: gameId },
      include: { players: true },
    });

    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    const currentStatus = game.status;

    // If transitioning from NOT_STARTED to IN_PROGRESS, assign targets and missions
    if (currentStatus === 'NOT_STARTED' && status === 'IN_PROGRESS') {
      // Filter alive players with a photo
      const eligiblePlayers = game.players.filter(
        (p) => p.alive && p.photoUrl && p.photoUrl.trim() !== ''
      );

      if (eligiblePlayers.length < 2) {
        return NextResponse.json(
          { error: 'Not enough players with photos to start the game' },
          { status: 400 }
        );
      }

      // Shuffle players
      const shuffledPlayers = eligiblePlayers.sort(() => Math.random() - 0.5);

      // Fetch all missions
      const missions = await prisma.mission.findMany();
      if (missions.length < shuffledPlayers.length) {
        return NextResponse.json(
          { error: 'Not enough missions for all players' },
          { status: 400 }
        );
      }

      // Shuffle missions
      const shuffledMissions = missions.sort(() => Math.random() - 0.5);

      // Create a set to track used mission IDs to ensure uniqueness
      const usedMissionIds = new Set<string>();

      // Assign targets and missions
      for (let i = 0; i < shuffledPlayers.length; i++) {
        const killer = shuffledPlayers[i];
        const target = shuffledPlayers[(i + 1) % shuffledPlayers.length];
        
        // Find an unused mission
        let missionIndex = i;
        while (usedMissionIds.has(shuffledMissions[missionIndex].id)) {
          missionIndex = (missionIndex + 1) % shuffledMissions.length;
          // Safety check: if we've gone through all missions and found none available
          // (shouldn't happen due to our earlier check, but just to be safe)
          if (missionIndex === i) {
            return NextResponse.json(
              { error: 'Could not assign unique missions to all players' },
              { status: 400 }
            );
          }
        }
        
        const mission = shuffledMissions[missionIndex];
        usedMissionIds.add(mission.id);

        await prisma.player.update({
          where: { id: killer.id },
          data: {
            targetId: target.id,
            missionId: mission.id,
          },
        });
      }
    }

    // Update game status regardless
    const updatedGame = await prisma.game.update({
      where: { id: gameId },
      data: { status: status as GameStatus },
    });

    return NextResponse.json({ status: updatedGame.status });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update game status' }, { status: 500 });
  }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ gameId: string }> }) {
  try {
    const { gameId } = await params;

    const game = await prisma.game.findUnique({
      where: { id: gameId },
      include: {
        players: {
          orderBy: {
            updatedAt: 'desc', // Order players by updatedAt descending
          },
        },
      },
    });

    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }
    const alivePlayers = game!.players
      .filter((p: PrismaPlayer) => p.alive && p.photoUrl)
      .map((p: PrismaPlayer) => ({
        id: p.id,
        name: p.name,
        photoUrl: p.photoUrl,
        updatedAt: p.updatedAt,
      }));

    const eliminatedPlayers = game!.players
      .filter((p: PrismaPlayer) => !p.alive)
      .map((p: PrismaPlayer) => ({
        id: p.id,
        name: p.name,
        photoUrl: p.photoUrl,
        updatedAt: p.updatedAt,
      }));

    const offlinePlayers = game!.players
      .filter((p: PrismaPlayer) => !p.photoUrl)
      .map((p: PrismaPlayer) => ({
        id: p.id,
        name: p.name,
        photoUrl: null,
        updatedAt: p.updatedAt,
      }));

    const winner = game.status === 'ENDED' && alivePlayers.length === 1 ? alivePlayers[0] : null;

    return NextResponse.json({
      status: game.status,
      alivePlayers,
      offlinePlayers,
      eliminatedPlayers,
      winner,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch game status' }, { status: 500 });
  }
}
