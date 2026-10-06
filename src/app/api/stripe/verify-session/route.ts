import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/server/stripe-client';
import {
  getPaymentOrder,
  markPaymentVerified,
} from '@/lib/server/payment-records';
import { createPolicyAccessToken } from '@/lib/server/policy-access-token';
import { assertSafeContractNumber } from '@/lib/server/contract-number';

export async function POST(req: NextRequest) {
  try {
    const { session_id } = (await req.json()) as { session_id?: string };

    if (!session_id || !session_id.startsWith('cs_')) {
      return NextResponse.json(
        { status: 400, code: 'VALIDATION_ERROR', message: 'Valid session_id is required' },
        { status: 400 },
      );
    }

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status !== 'paid') {
      return NextResponse.json({
        valid: false,
        message: 'Payment was not completed.',
      });
    }

    const orderId = session.metadata?.order_id;
    const contractRaw = session.metadata?.contract_number;

    if (!orderId || !contractRaw) {
      return NextResponse.json(
        { valid: false, message: 'Checkout session is missing order metadata.' },
        { status: 400 },
      );
    }

    let contractNumber: string;
    try {
      contractNumber = assertSafeContractNumber(contractRaw);
    } catch {
      return NextResponse.json({ valid: false, message: 'Invalid contract in session.' }, { status: 400 });
    }

    const pending = await getPaymentOrder(orderId);
    if (!pending) {
      return NextResponse.json(
        { valid: false, message: 'Payment order not found. Please restart checkout.' },
        { status: 400 },
      );
    }

    if (pending.contractNumber !== contractNumber) {
      return NextResponse.json({ valid: false, message: 'Contract mismatch.' }, { status: 400 });
    }

    const paidAmount = (session.amount_total ?? 0) / 100;
    const expected = Number.parseFloat(pending.amount);
    if (Math.abs(paidAmount - expected) > 0.01) {
      return NextResponse.json({ valid: false, message: 'Paid amount mismatch.' }, { status: 400 });
    }

    const paymentIntentId =
      typeof session.payment_intent === 'string'
        ? session.payment_intent
        : session.payment_intent?.id || session.id;

    if (!pending.verifiedAt) {
      await markPaymentVerified(orderId, paymentIntentId);
    }

    const policyAccessToken = createPolicyAccessToken(contractNumber);

    return NextResponse.json({
      valid: true,
      policyAccessToken,
      contractNumber,
      order_id: orderId,
      transaction_id: paymentIntentId,
    });
  } catch {
    console.error('[stripe/verify-session] Error');
    return NextResponse.json({ valid: false, message: 'Failed to verify payment' }, { status: 500 });
  }
}
