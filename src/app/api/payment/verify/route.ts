import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { secureCompare } from '@/lib/server/secure-compare';
import { getPaymentOrder, markPaymentVerified } from '@/lib/server/payment-records';
import { createPolicyAccessToken } from '@/lib/server/policy-access-token';

function hmacSha256(key: string, data: string): string {
  return crypto.createHmac('sha256', key).update(data).digest('hex');
}

export async function POST(req: NextRequest) {
  try {
    const { status_id, order_id, transaction_id, msg, hash } = await req.json();

    if (!status_id || !hash || !order_id) {
      return NextResponse.json(
        { status: 400, code: 'VALIDATION_ERROR', message: 'status_id, order_id, and hash are required' },
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

    const str = secretKey + status_id + order_id + (transaction_id || '') + (msg || '');
    const expectedHash = hmacSha256(secretKey, str);
    const valid = secureCompare(expectedHash, hash);

    if (!valid) {
      return NextResponse.json({ valid: false });
    }

    if (status_id !== '1') {
      return NextResponse.json({ valid: true, policyAccessToken: null, contractNumber: null });
    }

    const pending = await getPaymentOrder(order_id);
    if (!pending) {
      return NextResponse.json(
        { valid: false, code: 'UNKNOWN_ORDER', message: 'Payment order not found' },
        { status: 400 },
      );
    }

    await markPaymentVerified(order_id, transaction_id || '');

    const policyAccessToken = createPolicyAccessToken(pending.contractNumber);

    return NextResponse.json({
      valid: true,
      policyAccessToken,
      contractNumber: pending.contractNumber,
    });
  } catch {
    console.error('[payment/verify] Error');
    return NextResponse.json({ message: 'Failed to verify payment' }, { status: 500 });
  }
}
