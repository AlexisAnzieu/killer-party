import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { name, playerNames } = data as { name?: string; playerNames: string[] };

    if (!playerNames || !Array.isArray(playerNames) || playerNames.length < 2) {
      return NextResponse.json({ error: 'At least two player names required' }, { status: 400 });
    }

    const missions = await prisma.mission.findMany();
    if (missions.length === 0) {
      return NextResponse.json({ error: 'No missions available' }, { status: 500 });
    }

    const playersData = playerNames.map((playerName) => {
      const randomMission = missions[Math.floor(Math.random() * missions.length)];

      // Clean the player name: remove special characters but keep letters, numbers, and spaces
      const cleanedName = playerName.replace(/[^a-zA-Z0-9 ]/g, '').trim();

      // Generate a 3-letter uppercase code
      const uniqueCode = Array.from({ length: 3 }, () =>
        "ABCDEFGHIJKLMNOPQRSTUVWXYZ".charAt(Math.floor(Math.random() * 26))
      ).join("");

      return {
        name: cleanedName,
        photoUrl: "",
        uniqueCode,
        missionId: randomMission.id,
      };
    });

    const game = await prisma.game.create({
      data: {
        name,
        status: 'NOT_STARTED',
        players: {
          create: playersData,
        },
      },
    });

    return NextResponse.json({ gameId: game.id });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create game' }, { status: 500 });
  }
}
