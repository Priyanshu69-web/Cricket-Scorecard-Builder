import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { connectDB } from "@/lib/mongodb";
import { MatchModel } from "@/lib/Match";

export async function POST(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const existing = await MatchModel.findOne({ matchId: params.id });
    if (!existing) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 });
    }

    const shareToken = existing.shareToken || uuidv4();
    const payload = {
      ...(existing.payload as Record<string, unknown>),
      shareToken,
      isPublic: true,
    };

    await MatchModel.updateOne(
      { matchId: params.id },
      {
        shareToken,
        isPublic: true,
        payload,
      }
    );

    return NextResponse.json({ shareToken });
  } catch (error) {
    console.error("POST /api/matches/:id/share error", error);
    return NextResponse.json({ error: "Failed to create share link" }, { status: 500 });
  }
}
