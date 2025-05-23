import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { name, playerNames } = data as { name?: string; playerNames: string[] };

    if (!playerNames || !Array.isArray(playerNames) || playerNames.length < 2) {
      return NextResponse.json({ error: 'At least two player names required' }, { status: 400 });
    }

    const playersData = playerNames.map((playerName) => {
      // Clean the player name: remove special characters but keep letters, numbers, spaces, accents, and apostrophes
      const cleanedName = playerName.replace(/[^a-zA-ZÀ-ÿ0-9 ']/g, '').trim();

      // Generate a 3-letter uppercase code
      const uniqueCode = Array.from({ length: 3 }, () =>
        "ABCDEFGHIJKLMNOPQRSTUVWXYZ".charAt(Math.floor(Math.random() * 26))
      ).join("");

      return {
        name: cleanedName,
        photoUrl: "",
        uniqueCode,
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
