import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { IScorecard, Scorecard, ScorecardTemplate } from "@/lib/Scorecard";
import {
  buildScorecardSummary,
  normalizeWeightTotal,
  sanitizeScorecardPayload,
} from "@/lib/scorecard-utils";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const scorecards = (await Scorecard.find({ createdBy: session.user.id })
      .sort({ createdAt: -1 })
      .lean()) as unknown as Array<
      Pick<IScorecard, "criteria" | "entries"> & Record<string, unknown>
    >;

    const enriched = scorecards.map((scorecard) => ({
      ...scorecard,
      summary: buildScorecardSummary({
        criteria: scorecard.criteria || [],
        entries: scorecard.entries || [],
      }),
    }));

    return NextResponse.json(enriched);
  } catch (error) {
    console.error("Error fetching scorecards:", error);
    return NextResponse.json({ error: "Failed to fetch scorecards" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    await connectDB();

    if (body.duplicateOf) {
      const source = (await Scorecard.findOne({
        _id: body.duplicateOf,
        createdBy: session.user.id,
      }).lean()) as unknown as
        | ({
            title: string;
            description?: string;
            entityLabel: string;
            template: ScorecardTemplate;
            criteria: IScorecard["criteria"];
            entries: IScorecard["entries"];
          } & Record<string, unknown>)
        | null;

      if (!source) {
        return NextResponse.json({ error: "Source scorecard not found" }, { status: 404 });
      }

      const duplicate = sanitizeScorecardPayload({
        ...source,
        title: `${source.title} Copy`,
      });
      duplicate.entries = [];

      const created = await Scorecard.create({
        ...duplicate,
        createdBy: session.user.id,
      });

      return NextResponse.json(created, { status: 201 });
    }

    const payload = sanitizeScorecardPayload(body);
    const totalWeight = normalizeWeightTotal(payload.criteria);

    if (!payload.title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    if (!payload.entityLabel) {
      return NextResponse.json({ error: "Entity label is required" }, { status: 400 });
    }

    if (payload.criteria.length === 0) {
      return NextResponse.json(
        { error: "At least one scoring criterion is required" },
        { status: 400 }
      );
    }

    if (Math.round(totalWeight) !== 100) {
      return NextResponse.json(
        { error: "Criteria weights must total 100%" },
        { status: 400 }
      );
    }

    const entries = payload.entries.map((entry) => ({
      ...entry,
      finalScore: buildScorecardSummary({
        criteria: payload.criteria,
        entries: [entry],
      }).rankedEntries[0]?.finalScore || 0,
    }));

    const scorecard = await Scorecard.create({
      ...payload,
      entries,
      createdBy: session.user.id,
    });

    return NextResponse.json(scorecard, { status: 201 });
  } catch (error) {
    console.error("Error creating scorecard:", error);
    return NextResponse.json({ error: "Failed to create scorecard" }, { status: 500 });
  }
}
