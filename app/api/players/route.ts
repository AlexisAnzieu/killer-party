import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function generateSecretCode(length = 6) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { gameId, name, photoUrl } = data as { gameId: string; name: string; photoUrl: string };

    if (!gameId || !name || !photoUrl) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const missions = await prisma.mission.findMany();
    if (missions.length === 0) {
      return NextResponse.json({ error: 'No missions available' }, { status: 500 });
    }

    const randomMission = missions[Math.floor(Math.random() * missions.length)];
    const uniqueCode = generateSecretCode();

    const player = await prisma.player.create({
      data: {
        name,
        photoUrl,
        uniqueCode,
        gameId,
        missionId: randomMission.id,
      },
    });

    return NextResponse.json({ playerId: player.id, uniqueCode });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create player' }, { status: 500 });
  }
}
