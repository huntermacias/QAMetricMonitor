// app/api/tfs/wiql/route.ts

import { executeWiql } from '@/lib/tfs';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();

    if (!query) {
      return NextResponse.json(
        { error: 'WIQL query is required.' },
        { status: 400 }
      );
    }

    const workItems = await executeWiql(query);

    return NextResponse.json(workItems, { status: 200 });
  } catch (error: any) {
    console.error('WIQL Execution Error:', error.message);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
