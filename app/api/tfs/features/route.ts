// app/api/tfs/features/route.ts

import { fetchWorkItemDetails } from '@/lib/tfs';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { ids } = await request.json();

    if (!ids || !Array.isArray(ids)) {
      return NextResponse.json(
        { error: 'An array of feature IDs is required.' },
        { status: 400 }
      );
    }

    const details = await fetchWorkItemDetails(ids);

    return NextResponse.json(details, { status: 200 });
  } catch (error: any) {
    console.error('Feature Details Fetch Error:', error.message);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
