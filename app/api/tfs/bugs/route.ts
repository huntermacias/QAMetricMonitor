// app/api/tfs/bugs/route.ts

import { computeBugMetrics } from '@/lib/tfs';
import { BugMetrics } from '@/types/tfs';
import { NextRequest, NextResponse } from 'next/server';


export async function POST(request: NextRequest) {
  try {
    const { featureId, relations } = await request.json();

    if (
      featureId === undefined ||
      !Array.isArray(relations)
    ) {
      return NextResponse.json(
        { error: 'featureId and relations are required.' },
        { status: 400 }
      );
    }

    const bugMetrics: BugMetrics = await computeBugMetrics(
      featureId,
      relations
    );

    return NextResponse.json(bugMetrics, { status: 200 });
  } catch (error: any) {
    console.error('Bug Metrics Computation Error:', error.message);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
