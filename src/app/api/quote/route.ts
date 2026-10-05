import { NextRequest, NextResponse } from 'next/server';
import { generateQuote, updateQuote } from '@/lib/server/allianz-api';
import { cacheQuoteFromAllianzResponse } from '@/lib/server/quote-sync';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.person || !body.vehicle) {
      return NextResponse.json(
        { status: 400, code: 'VALIDATION_ERROR', message: 'person and vehicle objects are required' },
        { status: 400 },
      );
    }

    const partnerId = process.env.ALLIANZ_PARTNER_ID ?? '';
    body.partnerId = body.partnerId || partnerId;
    body.transactionType = body.transactionType || 'NWOO';

    const result = await generateQuote(body);
    await cacheQuoteFromAllianzResponse(result);
    return NextResponse.json(result);
  } catch (err: any) {
    console.error('[quote POST] Error:', err.message);
    const status = err.status || err.response?.status || 500;
    const data = err.response?.data || { message: err.message };
    return NextResponse.json(data, { status });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.contractNumber) {
      return NextResponse.json(
        { status: 400, code: 'VALIDATION_ERROR', message: 'contractNumber is required' },
        { status: 400 },
      );
    }

    const partnerId = process.env.ALLIANZ_PARTNER_ID ?? '';
    body.partnerId = body.partnerId || partnerId;
    body.transactionType = body.transactionType || 'NWOO';

    const result = await updateQuote(body);
    await cacheQuoteFromAllianzResponse(result);
    return NextResponse.json(result);
  } catch (err: any) {
    console.error('[quote PUT] Error:', err.message);
    const status = err.status || err.response?.status || 500;
    const data = err.response?.data || { message: err.message };
    return NextResponse.json(data, { status });
  }
}
