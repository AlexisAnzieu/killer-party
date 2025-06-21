import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { name } = data as { name?: string };

    const game = await prisma.game.create({
      data: {
        name,
        status: "NOT_STARTED",
      },
    });

    return NextResponse.json({ gameId: game.id });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to create game" },
      { status: 500 }
    );
  }
}
