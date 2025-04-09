import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: NextRequest, { params }: { params: Promise<{ gameId: string }> }) {
  try {
    const { gameId } = await params;

    const players = await prisma.player.findMany({
      where: { gameId, alive: true },
    });

    if (players.length < 2) {
      return NextResponse.json({ error: 'Not enough players to assign targets' }, { status: 400 });
    }

    // Shuffle players
    const shuffled = players.sort(() => Math.random() - 0.5);

    // Assign targets circularly
    for (let i = 0; i < shuffled.length; i++) {
      const killer = shuffled[i];
      const target = shuffled[(i + 1) % shuffled.length];
      await prisma.player.update({
        where: { id: killer.id },
        data: { targetId: target.id },
      });
    }

    await prisma.game.update({
      where: { id: gameId },
      data: { status: 'IN_PROGRESS' },
    });

    return NextResponse.json({ message: 'Targets assigned' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to assign targets' }, { status: 500 });
  }
}
