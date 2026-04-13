import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { IScorecard, Scorecard } from "@/lib/Scorecard";
import { buildScorecardSummary } from "@/lib/scorecard-utils";

export async function GET(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    await connectDB();
    const scorecard = (await Scorecard.findOne({
      shareToken: params.token,
      isPublic: true,
    }).lean()) as
      | (Pick<IScorecard, "criteria" | "entries"> & Record<string, unknown>)
      | null;

    if (!scorecard) {
      return NextResponse.json(
        { error: "Scorecard not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ...scorecard,
      summary: buildScorecardSummary({
        criteria: scorecard.criteria || [],
        entries: scorecard.entries || [],
      }),
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch scorecard" },
      { status: 500 }
    );
  }
}
