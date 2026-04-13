import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { BattingStyle, Player, PlayerRole } from "@/lib/Player";

function isRole(value: string): value is PlayerRole {
  return ["Batsman", "Bowler", "All-rounder", "Wicketkeeper"].includes(value);
}

function isBattingStyle(value: string): value is BattingStyle {
  return ["Right", "Left"].includes(value);
}

export async function GET() {
  try {
    await connectDB();
    const players = await Player.find().sort({ name: 1 }).lean();
    return NextResponse.json(players);
  } catch (error) {
    console.error("GET /api/players error", error);
    return NextResponse.json({ error: "Failed to fetch players" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = String(body.name || "").trim();
    const role = String(body.role || "Batsman");
    const battingStyle = String(body.battingStyle || "Right");
    const bowlingStyle = String(body.bowlingStyle || "").trim();
    const imageUrl = String(body.imageUrl || "").trim();

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    if (!isRole(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }
    if (!isBattingStyle(battingStyle)) {
      return NextResponse.json({ error: "Invalid batting style" }, { status: 400 });
    }

    await connectDB();
    const player = await Player.create({
      name,
      role,
      battingStyle,
      bowlingStyle,
      imageUrl,
    });

    return NextResponse.json(player, { status: 201 });
  } catch (error) {
    console.error("POST /api/players error", error);
    return NextResponse.json({ error: "Failed to create player" }, { status: 500 });
  }
}
