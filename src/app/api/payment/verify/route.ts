import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

function hmacSha256(key: string, data: string): string {
  return crypto.createHmac('sha256', key).update(data).digest('hex');
}

export async function POST(req: NextRequest) {
  try {
    const { status_id, order_id, transaction_id, msg, hash } = await req.json();

    if (!status_id || !hash) {
      return NextResponse.json(
        { status: 400, code: 'VALIDATION_ERROR', message: 'status_id and hash are required' },
        { status: 400 },
      );
    }

    const secretKey = process.env.SENANGPAY_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json(
        { status: 500, code: 'CONFIG_ERROR', message: 'SENANGPAY_SECRET_KEY is not configured' },
        { status: 500 },
      );
    }

    const str = secretKey + status_id + order_id + transaction_id + msg;
    const expectedHash = hmacSha256(secretKey, str);
    const valid = expectedHash === hash;

    return NextResponse.json({ valid });
  } catch (err: any) {
    console.error('[payment/verify] Error:', err.message);
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
