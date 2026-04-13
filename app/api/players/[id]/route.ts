import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { BattingStyle, Player, PlayerRole } from "@/lib/Player";

function isRole(value: string): value is PlayerRole {
  return ["Batsman", "Bowler", "All-rounder", "Wicketkeeper"].includes(value);
}

function isBattingStyle(value: string): value is BattingStyle {
  return ["Right", "Left"].includes(value);
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const player = await Player.findById(params.id).lean();
    if (!player) {
      return NextResponse.json({ error: "Player not found" }, { status: 404 });
    }
    return NextResponse.json(player);
  } catch (error) {
    console.error("GET /api/players/:id error", error);
    return NextResponse.json({ error: "Failed to fetch player" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    await connectDB();

    const player = await Player.findById(params.id);
    if (!player) {
      return NextResponse.json({ error: "Player not found" }, { status: 404 });
    }

    if (body.name !== undefined) {
      const name = String(body.name).trim();
      if (!name) {
        return NextResponse.json({ error: "Name cannot be empty" }, { status: 400 });
      }
      player.name = name;
    }
    if (body.role !== undefined) {
      const role = String(body.role);
      if (!isRole(role)) {
        return NextResponse.json({ error: "Invalid role" }, { status: 400 });
      }
      player.role = role;
    }
    if (body.battingStyle !== undefined) {
      const battingStyle = String(body.battingStyle);
      if (!isBattingStyle(battingStyle)) {
        return NextResponse.json({ error: "Invalid batting style" }, { status: 400 });
      }
      player.battingStyle = battingStyle;
    }
    if (body.bowlingStyle !== undefined) {
      player.bowlingStyle = String(body.bowlingStyle || "").trim();
    }
    if (body.imageUrl !== undefined) {
      player.imageUrl = String(body.imageUrl || "").trim();
    }

    await player.save();
    return NextResponse.json(player);
  } catch (error) {
    console.error("PATCH /api/players/:id error", error);
    return NextResponse.json({ error: "Failed to update player" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const player = await Player.findByIdAndDelete(params.id);
    if (!player) {
      return NextResponse.json({ error: "Player not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/players/:id error", error);
    return NextResponse.json({ error: "Failed to delete player" }, { status: 500 });
  }
}
