import { NextRequest, NextResponse } from 'next/server';
import { submitTransaction } from '@/lib/server/allianz-api';

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.contract?.contractNumber || !body.person || !body.payment) {
      return NextResponse.json(
        { status: 400, code: 'VALIDATION_ERROR', message: 'contract, person, and payment objects are required' },
        { status: 400 },
      );
    }

    let lastError: any = null;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const result = await submitTransaction(body);
        return NextResponse.json(result);
      } catch (err: any) {
        lastError = err;
        if (err?.response?.status === 500 && attempt < MAX_RETRIES) {
          console.log(`[Submission] Attempt ${attempt} failed with 500, retrying in ${RETRY_DELAY_MS}ms...`);
          await delay(RETRY_DELAY_MS * attempt);
        } else {
          break;
        }
      }
    }

    const status = lastError?.status || lastError?.response?.status || 500;
    const data = lastError?.response?.data || { message: lastError?.message };
    return NextResponse.json(data, { status });
  } catch (err: any) {
    console.error('[submission] Error:', err.message);
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
