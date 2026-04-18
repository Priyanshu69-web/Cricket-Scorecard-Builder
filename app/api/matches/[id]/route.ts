import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { MatchModel } from "@/lib/Match";
import { Match } from "@/types/cricket";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const record = await MatchModel.findOne({ matchId: params.id }).lean();
    if (!record) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 });
    }
    return NextResponse.json((record as unknown as { payload: Match }).payload);
  } catch (error) {
    console.error("GET /api/matches/:id error", error);
    return NextResponse.json({ error: "Failed to fetch match" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const match = body?.match;
    if (!match?.id) {
      return NextResponse.json({ error: "Invalid match payload" }, { status: 400 });
    }

    await connectDB();
    await MatchModel.findOneAndUpdate(
      { matchId: params.id },
      {
        status: match.status || "live",
        teamAName: match.teamA?.name || "",
        teamBName: match.teamB?.name || "",
        date: match.date || "",
        venue: match.venue || "",
        shareToken: match.shareToken || undefined,
        isPublic: Boolean(match.isPublic),
        payload: match,
      },
      { new: true }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PATCH /api/matches/:id error", error);
    return NextResponse.json({ error: "Failed to update match" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    await MatchModel.findOneAndDelete({ matchId: params.id });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/matches/:id error", error);
    return NextResponse.json({ error: "Failed to delete match" }, { status: 500 });
  }
}
