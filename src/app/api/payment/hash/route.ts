import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { amountsMatch, getCachedQuote } from '@/lib/server/quote-cache';
import { savePendingPaymentOrder } from '@/lib/server/payment-records';
import { assertSafeContractNumber } from '@/lib/server/contract-number';

function hmacSha256(key: string, data: string): string {
  return crypto.createHmac('sha256', key).update(data).digest('hex');
}

export async function POST(req: NextRequest) {
  try {
    const { detail, amount, order_id, contract_number } = await req.json();

    if (!detail || !amount || !order_id || !contract_number) {
      return NextResponse.json(
        {
          status: 400,
          code: 'VALIDATION_ERROR',
          message: 'detail, amount, order_id, and contract_number are required',
        },
        { status: 400 },
      );
    }

    if (!/^\d+(\.\d{1,2})?$/.test(amount) || parseFloat(amount) <= 0) {
      return NextResponse.json(
        {
          status: 400,
          code: 'VALIDATION_ERROR',
          message: 'amount must be a positive number with up to 2 decimal places',
        },
        { status: 400 },
      );
    }

    if (!/^[A-Za-z0-9_-]{8,128}$/.test(order_id)) {
      return NextResponse.json(
        { status: 400, code: 'VALIDATION_ERROR', message: 'Invalid order_id' },
        { status: 400 },
      );
    }

    let contractNumber: string;
    try {
      contractNumber = assertSafeContractNumber(contract_number);
    } catch {
      return NextResponse.json(
        { status: 400, code: 'VALIDATION_ERROR', message: 'Invalid contract_number' },
        { status: 400 },
      );
    }

    const cached = await getCachedQuote(contractNumber);
    if (!cached || !amountsMatch(cached.premiumDueRounded, amount)) {
      return NextResponse.json(
        {
          status: 400,
          code: 'QUOTE_MISMATCH',
          message: 'Payment amount does not match the latest quotation for this contract',
        },
        { status: 400 },
      );
    }

    const secretKey = process.env.SENANGPAY_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json(
        { status: 500, code: 'CONFIG_ERROR', message: 'Payment is not configured' },
        { status: 500 },
      );
    }

    await savePendingPaymentOrder({
      orderId: order_id,
      contractNumber,
      amount: Number.parseFloat(amount).toFixed(2),
      createdAt: new Date().toISOString(),
    });

    const str = secretKey + detail + amount + order_id;
    const hash = hmacSha256(secretKey, str);

    return NextResponse.json({
      hash,
      merchant_id: process.env.SENANGPAY_MERCHANT_ID || '',
    });
  } catch {
    console.error('[payment/hash] Error');
    return NextResponse.json({ message: 'Failed to generate payment hash' }, { status: 500 });
  }
}
