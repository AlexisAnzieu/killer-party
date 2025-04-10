import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { gameId, killerId, victimCode } = data as { gameId: string; killerId: string; victimCode: string };

    if (!gameId || !killerId || !victimCode) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const killer = await prisma.player.findUnique({ where: { id: killerId } });
    if (!killer || !killer.alive) {
      return NextResponse.json({ error: 'Invalid killer' }, { status: 400 });
    }

    const victim = await prisma.player.findUnique({ where: { id: killer.targetId ?? '' } });
    if (!victim || !victim.alive) {
      return NextResponse.json({ error: 'Invalid or already dead victim' }, { status: 400 });
    }

    if (victim.uniqueCode !== victimCode) {
      return NextResponse.json({ error: 'Incorrect victim code' }, { status: 403 });
    }

    // Mark victim as dead
    await prisma.player.update({
      where: { id: victim.id },
      data: { alive: false },
    });

    // Reassign killer's target to victim's target
    await prisma.player.update({
      where: { id: killer.id },
      data: { targetId: victim.targetId },
    });

    // Record assassination
    await prisma.assassination.create({
      data: {
        gameId,
        killerId: killer.id,
        victimId: victim.id,
      },
    });

    // Check if only one player remains alive
    const aliveCount = await prisma.player.count({
      where: { gameId, alive: true },
    });

    if (aliveCount === 1) {
      await prisma.game.update({
        where: { id: gameId },
        data: { status: 'ENDED' },
      });
    }

    return NextResponse.json({ message: 'Assassination confirmed' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to confirm assassination' }, { status: 500 });
  }
}
