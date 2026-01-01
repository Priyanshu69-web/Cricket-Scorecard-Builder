import { connectDB } from '@/lib/mongodb';
import { Scorecard } from '@/lib/Scorecard';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    await connectDB();
    const scorecard = await Scorecard.findOne({ shareToken: params.token });

    if (!scorecard) {
      return NextResponse.json(
        { error: 'Scorecard not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(scorecard);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch scorecard' },
      { status: 500 }
    );
  }
}
