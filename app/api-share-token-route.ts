import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { MatchModel } from "@/lib/Match";
import { Match } from "@/types/cricket";

export async function GET(
  _req: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    await connectDB();
    const record = await MatchModel.findOne({
      shareToken: params.token,
      isPublic: true,
    }).lean();

    if (!record) {
      return NextResponse.json({ error: "Shared match not found" }, { status: 404 });
    }

    const sharedRecord = record as unknown as { payload: Match; updatedAt: string };

    return NextResponse.json({
      type: "cricket-match",
      match: sharedRecord.payload,
      sharedAt: sharedRecord.updatedAt,
    });
  } catch (error) {
    console.error("GET /api/share/:token error", error);
    return NextResponse.json({ error: "Failed to load shared match" }, { status: 500 });
  }
}
