import { NextRequest, NextResponse } from 'next/server';
import { assertSafeContractNumber } from '@/lib/server/contract-number';
import { amountsMatch, getCachedQuote, saveQuotePremium } from '@/lib/server/quote-cache';
import { isDemoContract, isDemoModeEnabledOnServer } from '@/lib/server/demo-mode';

/**
 * Syncs contract premium into server cache so /api/payment/hash can verify amounts.
 * - Demo (UAT): stores client premium when demo mode is enabled.
 * - Live: refreshes cache timestamp when amount matches existing cache; does not trust new amounts.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { contract_number, premium_due_rounded, source } = body as {
      contract_number?: string;
      premium_due_rounded?: string | number;
      source?: 'demo' | 'live';
    };

    if (!contract_number || premium_due_rounded === undefined || premium_due_rounded === null) {
      return NextResponse.json(
        { status: 400, code: 'VALIDATION_ERROR', message: 'contract_number and premium_due_rounded are required' },
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

    const premiumStr =
      typeof premium_due_rounded === 'number'
        ? premium_due_rounded.toFixed(2)
        : String(premium_due_rounded);

    if (!/^\d+(\.\d{1,2})?$/.test(premiumStr) || Number.parseFloat(premiumStr) <= 0) {
      return NextResponse.json(
        { status: 400, code: 'VALIDATION_ERROR', message: 'Invalid premium_due_rounded' },
        { status: 400 },
      );
    }

    const premium = Number.parseFloat(premiumStr);

    if (source === 'demo' && isDemoModeEnabledOnServer() && isDemoContract(contractNumber)) {
      await saveQuotePremium(contractNumber, premium);
      return NextResponse.json({ ok: true, cached: true, mode: 'demo' });
    }

    const cached = await getCachedQuote(contractNumber);
    if (!cached) {
      return NextResponse.json(
        {
          status: 409,
          code: 'QUOTE_NOT_CACHED',
          message:
            'Quotation is not ready for payment on the server. Return to the quote step and update your coverage, then try again.',
        },
        { status: 409 },
      );
    }

    if (!amountsMatch(cached.premiumDueRounded, premiumStr)) {
      return NextResponse.json(
        {
          status: 400,
          code: 'QUOTE_MISMATCH',
          message: 'Payment amount does not match the latest quotation for this contract',
        },
        { status: 400 },
      );
    }

    await saveQuotePremium(contractNumber, cached.premiumDueRounded);
    return NextResponse.json({ ok: true, cached: true, mode: 'live' });
  } catch {
    console.error('[quote/premium] Error');
    return NextResponse.json({ message: 'Failed to sync quotation premium' }, { status: 500 });
  }
}
