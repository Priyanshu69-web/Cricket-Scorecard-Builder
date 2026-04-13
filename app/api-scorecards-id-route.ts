import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { IScorecard, Scorecard } from "@/lib/Scorecard";
import {
  buildScorecardSummary,
  normalizeWeightTotal,
  sanitizeScorecardPayload,
} from "@/lib/scorecard-utils";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const scorecard = (await Scorecard.findById(params.id).lean()) as
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

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    await connectDB();

    const existing = await Scorecard.findOne({
      _id: params.id,
      createdBy: session.user.id,
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Scorecard not found" },
        { status: 404 }
      );
    }

    const payload = sanitizeScorecardPayload({
      title: body.title ?? existing.title,
      description: body.description ?? existing.description,
      entityLabel: body.entityLabel ?? existing.entityLabel,
      template: body.template ?? existing.template,
      criteria: body.criteria ?? existing.criteria,
      entries: body.entries ?? existing.entries,
    });

    const totalWeight = normalizeWeightTotal(payload.criteria);
    if (Math.round(totalWeight) !== 100) {
      return NextResponse.json(
        { error: "Criteria weights must total 100%" },
        { status: 400 }
      );
    }

    const summary = buildScorecardSummary({
      criteria: payload.criteria,
      entries: payload.entries,
    });

    existing.title = payload.title;
    existing.description = payload.description;
    existing.entityLabel = payload.entityLabel;
    existing.template = payload.template;
    existing.criteria = payload.criteria;
    existing.entries = summary.rankedEntries;

    await existing.save();

    return NextResponse.json({
      ...existing.toObject(),
      summary,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update scorecard" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const scorecard = await Scorecard.findOneAndDelete({
      _id: params.id,
      createdBy: session.user.id,
    });

    if (!scorecard) {
      return NextResponse.json(
        { error: "Scorecard not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete scorecard" },
      { status: 500 }
    );
  }
}
