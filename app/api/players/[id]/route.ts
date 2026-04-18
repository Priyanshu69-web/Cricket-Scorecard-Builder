import { NextRequest, NextResponse } from "next/server";
import { BattingStyle, Player, PlayerRole } from "@/lib/Player";
import { connectDB } from "@/lib/mongodb";
import { MatchModel } from "@/lib/Match";
import { Match, PlayerMatchRecord } from "@/types/cricket";
import { getMatchResult, getTeamById } from "@/lib/cricket";

function isRole(value: string): value is PlayerRole {
  return ["Batsman", "Bowler", "All-rounder", "Wicketkeeper"].includes(value);
}

function isBattingStyle(value: string): value is BattingStyle {
  return ["Right", "Left"].includes(value);
}

function toDismissalLabel(dismissal?: string, isOut?: boolean) {
  if (!isOut) {
    return "not out";
  }
  return dismissal || "out";
}

function buildMatchRecord(match: Match, profileId: string): PlayerMatchRecord | null {
  const inningsEntries = match.innings.flatMap((innings) => {
    const batter = innings.batting.find((item) => item.profileId === profileId);
    const bowler = innings.bowling.find((item) => item.profileId === profileId);
    if (!batter && !bowler) {
      return [];
    }

    const team = batter
      ? getTeamById(match, innings.battingTeamId)
      : getTeamById(match, innings.bowlingTeamId);
    const opponent = team.id === match.teamA.id ? match.teamB : match.teamA;

    return [
      {
        innings,
        batter,
        bowler,
        team,
        opponent,
      },
    ];
  });

  if (inningsEntries.length === 0) {
    return null;
  }

  const batting = inningsEntries.reduce(
    (acc, entry) => {
      if (!entry.batter) {
        return acc;
      }
      acc.runs += entry.batter.runs;
      acc.balls += entry.batter.balls;
      acc.fours += entry.batter.fours;
      acc.sixes += entry.batter.sixes;
      acc.dismissal =
        entry.batter.isOut || acc.dismissal === "not out"
          ? toDismissalLabel(entry.batter.dismissal, entry.batter.isOut)
          : acc.dismissal;
      return acc;
    },
    { runs: 0, balls: 0, fours: 0, sixes: 0, dismissal: "DNB" }
  );

  const bowling = inningsEntries.reduce(
    (acc, entry) => {
      if (!entry.bowler) {
        return acc;
      }
      acc.balls += entry.bowler.balls;
      acc.maidens += entry.bowler.maidens;
      acc.runsConceded += entry.bowler.runsConceded;
      acc.wickets += entry.bowler.wickets;
      return acc;
    },
    { balls: 0, maidens: 0, runsConceded: 0, wickets: 0 }
  );

  const primaryTeam = inningsEntries[0].team;
  const opponent = inningsEntries[0].opponent;

  return {
    matchId: match.id,
    matchLabel: `${match.teamA.name} vs ${match.teamB.name}`,
    date: match.date,
    venue: match.venue,
    format: match.format,
    teamName: primaryTeam.name,
    opponentName: opponent.name,
    result: match.status === "completed" ? getMatchResult(match) : "Match in progress",
    batting,
    bowling,
  };
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

    const matchRecords = await MatchModel.find(
      { "payload.id": { $exists: true } },
      { payload: 1 }
    )
      .sort({ updatedAt: -1 })
      .lean();

    const recentMatches = matchRecords
      .map((record) => buildMatchRecord(record.payload as Match, params.id))
      .filter((value): value is PlayerMatchRecord => Boolean(value))
      .slice(0, 12);

    return NextResponse.json({
      ...player,
      recentMatches,
    });
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
