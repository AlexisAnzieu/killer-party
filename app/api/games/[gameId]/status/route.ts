import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: NextRequest, { params }: { params: Promise<{ gameId: string }> }) {
  try {
    const { gameId } = await params;

    const game = await prisma.game.findUnique({
      where: { id: gameId },
      include: {
        players: true,
      },
    });

    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    const alivePlayers = game.players.filter((p) => p.alive).map((p) => ({
      id: p.id,
      name: p.name,
      photoUrl: p.photoUrl,
    }));

    const eliminatedPlayers = game.players.filter((p) => !p.alive).map((p) => ({
      id: p.id,
      name: p.name,
      photoUrl: p.photoUrl,
    }));

    const winner = game.status === 'ENDED' && alivePlayers.length === 1 ? alivePlayers[0] : null;

    return NextResponse.json({
      status: game.status,
      alivePlayers,
      eliminatedPlayers,
      winner,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch game status' }, { status: 500 });
  }
}
