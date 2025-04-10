import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';

export async function GET(req: NextRequest, { params }: { params: Promise<{ playerId: string }> }) {
  try {
    const { playerId } = await params;
    const player = await prisma.player.findUnique({
      where: { id: playerId },
      include: { mission: true },
    });
    if (!player) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 });
    }
    return NextResponse.json(player);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch player' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ playerId: string }> }) {
  try {
    const { playerId } = await params;
    const data = await req.json();
    const { photoUrl } = data as { photoUrl: string };

    const player = await prisma.player.update({
      where: { id: playerId },
      data: { photoUrl },
    });

    return NextResponse.json(player);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update player' }, { status: 500 });
  }
}
