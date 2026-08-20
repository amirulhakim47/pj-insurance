import { NextRequest, NextResponse } from 'next/server';
import { checkUBB } from '@/lib/server/allianz-api';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.ReferenceNo || !body.Policy) {
      return NextResponse.json(
        { status: 400, code: 'VALIDATION_ERROR', message: 'ReferenceNo and Policy are required' },
        { status: 400 },
      );
    }

    body.SourceSystem = process.env.ALLIANZ_PARTNER_ID ?? 'DCAUTO';
    body.CheckUbbInd = 2;

    console.log('[CheckUBB] Request payload:', JSON.stringify(body, null, 2));

    const result = await checkUBB(body);

    console.log('[CheckUBB] Response:', JSON.stringify(result, null, 2));

    return NextResponse.json(result);
  } catch (err: any) {
    console.error('[CheckUBB] Error:', JSON.stringify({
      status: err?.status,
      response: err?.response?.data,
      message: err?.message,
    }, null, 2));
    const status = err.status || err.response?.status || 500;
    const data = err.response?.data || { message: err.message };
    return NextResponse.json(data, { status });
  }
}
