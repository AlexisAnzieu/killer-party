import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';

export async function POST(req: NextRequest, { params }: { params: Promise<{ gameId: string }> }) {
  try {
    const { gameId } = await params;
    const { playerName } = await req.json();

    if (!playerName || playerName.trim() === '') {
      return NextResponse.json({ error: 'Player name is required' }, { status: 400 });
    }

    // Clean the player name: remove special characters but keep letters, numbers, spaces, accents, and apostrophes
    const cleanedName = playerName.replace(/[^a-zA-ZÀ-ÿ0-9 ']/g, '').trim();

    // Generate a 3-letter uppercase code
    const uniqueCode = Array.from({ length: 3 }, () =>
      "ABCDEFGHIJKLMNOPQRSTUVWXYZ".charAt(Math.floor(Math.random() * 26))
    ).join("");

    // Check if game exists and is not started
    const game = await prisma.game.findUnique({
      where: { id: gameId },
    });

    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    if (game.status !== 'NOT_STARTED') {
      return NextResponse.json(
        { error: 'Cannot add players to a game that has already started' },
        { status: 400 }
      );
    }

    const newPlayer = await prisma.player.create({
      data: {
        name: cleanedName,
        uniqueCode,
        gameId,
        alive: true,
      },
    });

    return NextResponse.json(newPlayer);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to add player' }, { status: 500 });
  }
}