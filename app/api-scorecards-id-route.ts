import { connectDB } from '@/lib/mongodb';
import { Scorecard } from '@/lib/Scorecard';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const scorecard = await Scorecard.findById(params.id);

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

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    await connectDB();

    const scorecard = await Scorecard.findByIdAndUpdate(
      params.id,
      body,
      { new: true }
    );

    if (!scorecard) {
      return NextResponse.json(
        { error: 'Scorecard not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(scorecard);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update scorecard' },
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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const scorecard = await Scorecard.findByIdAndDelete(params.id);

    if (!scorecard) {
      return NextResponse.json(
        { error: 'Scorecard not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete scorecard' },
      { status: 500 }
    );
  }
}
