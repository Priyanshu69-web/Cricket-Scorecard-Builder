import { connectDB } from '@/lib/mongodb';
import { Scorecard } from '@/lib/Scorecard';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const scorecards = await Scorecard.find({ createdBy: session.user.id }).sort({ createdAt: -1 });
    return NextResponse.json(scorecards);
  } catch (error) {
    console.error('Error fetching scorecards:', error);
    return NextResponse.json({ error: 'Failed to fetch scorecards' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    await connectDB();

    const scorecard = await Scorecard.create({
      ...body,
      createdBy: session.user.id,
    });

    return NextResponse.json(scorecard, { status: 201 });
  } catch (error) {
    console.error('Error creating scorecard:', error);
    return NextResponse.json({ error: 'Failed to create scorecard' }, { status: 500 });
  }
}
