import { NextRequest, NextResponse } from 'next/server';
import { submitTransaction } from '@/lib/server/allianz-api';
import {
  assertVerifiedPaymentForSubmission,
  consumeVerifiedPayment,
  PaymentVerificationError,
} from '@/lib/server/payment-records';

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const paymentOrderId = body.paymentOrderId as string | undefined;

    if (!body.contract?.contractNumber || !body.person || !body.payment) {
      return NextResponse.json(
        { status: 400, code: 'VALIDATION_ERROR', message: 'contract, person, and payment objects are required' },
        { status: 400 },
      );
    }

    if (!paymentOrderId) {
      return NextResponse.json(
        { status: 403, code: 'PAYMENT_REQUIRED', message: 'Verified payment is required before submission' },
        { status: 403 },
      );
    }

    try {
      await assertVerifiedPaymentForSubmission(
        paymentOrderId,
        body.contract.contractNumber,
        body.payment.paymentAmount,
      );
    } catch (err) {
      if (err instanceof PaymentVerificationError) {
        return NextResponse.json(
          { status: 403, code: 'PAYMENT_VERIFICATION_FAILED', message: err.message },
          { status: 403 },
        );
      }
      throw err;
    }

    let lastError: any = null;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const { paymentOrderId: _omit, ...submissionBody } = body;
        const result = await submitTransaction(submissionBody);
        await consumeVerifiedPayment(paymentOrderId);
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
    const data = lastError?.response?.data || { message: 'Submission failed' };
    return NextResponse.json(data, { status });
  } catch {
    console.error('[submission] Error');
    return NextResponse.json({ message: 'Submission failed' }, { status: 500 });
  }
}
