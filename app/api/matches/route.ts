import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { MatchModel } from "@/lib/Match";
import { Match } from "@/types/cricket";

export async function GET() {
  try {
    await connectDB();
    const matches = await MatchModel.find().sort({ updatedAt: -1 }).lean();
    return NextResponse.json(
      (matches as unknown as Array<{ payload: Match }>).map((item) => item.payload)
    );
  } catch (error) {
    console.error("GET /api/matches error", error);
    return NextResponse.json({ error: "Failed to fetch matches" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const match = body?.match;
    if (!match?.id) {
      return NextResponse.json({ error: "Invalid match payload" }, { status: 400 });
    }

    await connectDB();
    await MatchModel.findOneAndUpdate(
      { matchId: match.id },
      {
        matchId: match.id,
        status: match.status || "live",
        teamAName: match.teamA?.name || "",
        teamBName: match.teamB?.name || "",
        date: match.date || "",
        venue: match.venue || "",
        shareToken: match.shareToken || undefined,
        isPublic: Boolean(match.isPublic),
        payload: match,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return NextResponse.json({ success: true, id: match.id }, { status: 201 });
  } catch (error) {
    console.error("POST /api/matches error", error);
    return NextResponse.json({ error: "Failed to save match" }, { status: 500 });
  }
}
