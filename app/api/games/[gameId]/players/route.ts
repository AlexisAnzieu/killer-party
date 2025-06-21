import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../../lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ gameId: string }> }
) {
  try {
    const { gameId } = await params;
    const { name, uniqueCode } = await req.json();

    const game = await prisma.game.findUnique({
      where: { id: gameId },
    });

    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    if (game.status !== "NOT_STARTED") {
      return NextResponse.json(
        { error: "Cannot join a game that has already started" },
        { status: 400 }
      );
    }

    const player = await prisma.player.create({
      data: {
        name,
        uniqueCode,
        gameId,
      },
    });

    return NextResponse.json({ playerId: player.id });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to create player" },
      { status: 500 }
    );
  }
}
