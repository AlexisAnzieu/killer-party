import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const victimId = url.searchParams.get('victimId');
    const killerId = url.searchParams.get('killerId');
    
    if (!victimId && !killerId) {
      return NextResponse.json({ error: 'Missing victimId or killerId parameter' }, { status: 400 });
    }
    
    const where = victimId 
      ? { victimId } 
      : killerId 
      ? { killerId }
      : undefined;

    if (!where) {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
    }

    const assassinations = await prisma.assassination.findMany({
      where,
      include: {
        killer: true,
        victim: true,
      },
    });
    
    return NextResponse.json(assassinations);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch assassinations' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { gameId, killerId, victimCode } = data as { gameId: string; killerId: string; victimCode: string };

    if (!gameId || !killerId || !victimCode) {
      return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 });
    }

    const killer = await prisma.player.findUnique({ where: { id: killerId } });
    if (!killer || !killer.alive) {
      return NextResponse.json({ error: 'Assassin invalide' }, { status: 400 });
    }

    const victim = await prisma.player.findUnique({ where: { id: killer.targetId ?? '' } });
    if (!victim || !victim.alive) {
      return NextResponse.json({ error: 'Victime invalide ou déjà morte' }, { status: 400 });
    }

    if (victim.uniqueCode !== victimCode) {
      return NextResponse.json({ error: 'Code de la victime incorrect' }, { status: 403 });
    }

    // Marquer la victime comme morte
    await prisma.player.update({
      where: { id: victim.id },
      data: { alive: false },
    });

    // Réassigner la cible et la mission de la victime à l'assassin
    // Prevent self-targeting: if victim's target was the killer, set targetId to null
    await prisma.player.update({
      where: { id: killer.id },
      data: { 
        targetId: victim.targetId === killer.id ? null : victim.targetId,
        missionId: victim.missionId
      },
    });

    // Enregistrer l'assassinat
    await prisma.assassination.create({
      data: {
        gameId,
        killerId: killer.id,
        victimId: victim.id,
      },
    });

    // Vérifier s'il ne reste qu'un seul joueur en vie
    const aliveCount = await prisma.player.count({
      where: { gameId, alive: true },
    });

    if (aliveCount === 1) {
      await prisma.game.update({
        where: { id: gameId },
        data: { status: 'ENDED' },
      });
    }

    return NextResponse.json({ message: 'Assassinat confirmé' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Échec de la confirmation de l\'assassinat' }, { status: 500 });
  }
}
