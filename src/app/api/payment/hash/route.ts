import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

function hmacSha256(key: string, data: string): string {
  return crypto.createHmac('sha256', key).update(data).digest('hex');
}

export async function POST(req: NextRequest) {
  try {
    const { detail, amount, order_id } = await req.json();

    if (!detail || !amount || !order_id) {
      return NextResponse.json(
        { status: 400, code: 'VALIDATION_ERROR', message: 'detail, amount, and order_id are required' },
        { status: 400 },
      );
    }

    if (!/^\d+(\.\d{1,2})?$/.test(amount) || parseFloat(amount) <= 0) {
      return NextResponse.json(
        { status: 400, code: 'VALIDATION_ERROR', message: 'amount must be a positive number with up to 2 decimal places' },
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

    const str = secretKey + detail + amount + order_id;
    const hash = hmacSha256(secretKey, str);

    return NextResponse.json({
      hash,
      merchant_id: process.env.SENANGPAY_MERCHANT_ID || '',
    });
  } catch (err: any) {
    console.error('[payment/hash] Error:', err.message);
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
