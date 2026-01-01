import { connectDB } from '@/lib/mongodb';
import { Scorecard } from '@/lib/Scorecard';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const shareToken = uuidv4();
    
    const scorecard = await Scorecard.findByIdAndUpdate(
      params.id,
      { shareToken, isPublic: true },
      { new: true }
    );

    if (!scorecard) {
      return NextResponse.json(
        { error: 'Scorecard not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ shareToken });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create share link' },
      { status: 500 }
    );
  }
}
