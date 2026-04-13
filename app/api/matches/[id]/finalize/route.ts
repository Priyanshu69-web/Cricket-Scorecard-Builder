import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Player } from "@/lib/Player";
import { collectProfileIds, updateDerivedStats } from "@/lib/player-stats";
import { Match } from "@/types/cricket";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const match = body.match as Match | undefined;

    if (!match || match.status !== "completed") {
      return NextResponse.json(
        { error: "Only completed matches can be finalized." },
        { status: 400 }
      );
    }
    if (body.finalized) {
      return NextResponse.json({ success: true, skipped: true });
    }

    await connectDB();
    const profileIds = collectProfileIds(match);
    const players = await Player.find({ _id: { $in: profileIds } });
    const playerMap = new Map(players.map((p) => [String(p._id), p]));
    const matchPlayersCounted = new Set<string>();

    for (const innings of match.innings) {
      for (const batter of innings.batting) {
        if (!batter.profileId) continue;
        const player = playerMap.get(batter.profileId);
        if (!player) continue;

        if (!matchPlayersCounted.has(batter.profileId)) {
          player.matchesPlayed += 1;
          matchPlayersCounted.add(batter.profileId);
        }
        player.batting.runs += batter.runs;
        player.batting.balls += batter.balls;
        player.batting.fours += batter.fours;
        player.batting.sixes += batter.sixes;
        if (batter.isOut) {
          player.batting.outs += 1;
        }
      }

      for (const bowler of innings.bowling) {
        if (!bowler.profileId) continue;
        const player = playerMap.get(bowler.profileId);
        if (!player) continue;

        player.bowling.balls += bowler.balls;
        player.bowling.runsConceded += bowler.runsConceded;
        player.bowling.wickets += bowler.wickets;
      }
    }

    await Promise.all(
      players.map(async (player) => {
        updateDerivedStats(player);
        await player.save();
      })
    );

    return NextResponse.json({
      success: true,
      updatedPlayers: players.length,
    });
  } catch (error) {
    console.error("POST /api/matches/:id/finalize error", error);
    return NextResponse.json(
      { error: "Failed to finalize match stats." },
      { status: 500 }
    );
  }
}
