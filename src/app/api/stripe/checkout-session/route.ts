import { NextRequest, NextResponse } from 'next/server';
import { assertSafeContractNumber } from '@/lib/server/contract-number';
import { amountsMatch, getCachedQuote, saveQuotePremium } from '@/lib/server/quote-cache';
import { savePendingPaymentOrder } from '@/lib/server/payment-records';
import { getStripe } from '@/lib/server/stripe-client';
import { appPath, resolveAppOrigin } from '@/lib/server/app-origin';
import { isDemoContract, isDemoModeEnabledOnServer } from '@/lib/server/demo-mode';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      contract_number,
      amount,
      order_id,
      customer_email,
      customer_name,
      demo,
    } = body as {
      contract_number?: string;
      amount?: string;
      order_id?: string;
      customer_email?: string;
      customer_name?: string;
      demo?: boolean;
    };

    if (!contract_number || !amount || !order_id) {
      return NextResponse.json(
        { status: 400, code: 'VALIDATION_ERROR', message: 'contract_number, amount, and order_id are required' },
        { status: 400 },
      );
    }

    if (!/^\d+(\.\d{1,2})?$/.test(amount) || Number.parseFloat(amount) <= 0) {
      return NextResponse.json(
        { status: 400, code: 'VALIDATION_ERROR', message: 'Invalid amount' },
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

    const premium = Number.parseFloat(amount);

    if (demo && isDemoModeEnabledOnServer() && isDemoContract(contractNumber)) {
      await saveQuotePremium(contractNumber, premium);
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

    await savePendingPaymentOrder({
      orderId: order_id,
      contractNumber,
      amount: premium.toFixed(2),
      createdAt: new Date().toISOString(),
    });

    const origin = resolveAppOrigin(req);
    const successPath = appPath('/payment/status');
    const cancelPath = appPath('/payment');

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      customer_email: customer_email || undefined,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'myr',
            unit_amount: Math.round(premium * 100),
            product_data: {
              name: 'Motor insurance premium (UAT)',
              description: `Allianz contract ${contractNumber}`,
            },
          },
        },
      ],
      metadata: {
        order_id,
        contract_number: contractNumber,
        customer_name: customer_name?.slice(0, 100) || '',
        uat_provider: 'stripe',
      },
      success_url: `${origin}${successPath}?provider=stripe&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}${cancelPath}?cancelled=1`,
    });

    if (!session.url) {
      return NextResponse.json(
        { status: 500, code: 'STRIPE_ERROR', message: 'Could not start Stripe Checkout' },
        { status: 500 },
      );
    }

    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (err) {
    console.error('[stripe/checkout-session] Error:', err instanceof Error ? err.message : err);
    return NextResponse.json(
      { status: 500, code: 'STRIPE_ERROR', message: 'Failed to create checkout session' },
      { status: 500 },
    );
  }
}
