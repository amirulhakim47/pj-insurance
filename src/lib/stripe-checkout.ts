import { syncQuotePremiumForPayment } from '@/lib/quote-premium-sync';

export type StripeVerifyResult = {
  valid: boolean;
  message?: string;
  policyAccessToken?: string | null;
  contractNumber?: string | null;
  order_id?: string | null;
  transaction_id?: string | null;
};

export async function createStripeCheckoutSession(params: {
  contractNumber: string;
  amount: string;
  orderId: string;
  customerEmail: string;
  customerName: string;
  demo?: boolean;
}): Promise<{ url: string }> {
  const premium = Number.parseFloat(params.amount);
  await syncQuotePremiumForPayment(params.contractNumber, premium, { demo: params.demo });

  const res = await fetch('/api/stripe/checkout-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contract_number: params.contractNumber,
      amount: params.amount,
      order_id: params.orderId,
      customer_email: params.customerEmail,
      customer_name: params.customerName,
      demo: params.demo ?? false,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Could not start Stripe Checkout' }));
    throw new Error(err.message || 'Could not start Stripe Checkout');
  }

  const data = await res.json();
  if (!data.url) {
    throw new Error('Stripe did not return a checkout URL');
  }
  return { url: data.url };
}

export async function verifyStripeCheckoutSession(sessionId: string): Promise<StripeVerifyResult> {
  const res = await fetch('/api/stripe/verify-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id: sessionId }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { valid: false, message: data.message || 'Payment verification failed' };
  }

  return {
    valid: data.valid === true,
    message: data.message,
    policyAccessToken: data.policyAccessToken ?? null,
    contractNumber: data.contractNumber ?? null,
    order_id: data.order_id ?? null,
    transaction_id: data.transaction_id ?? null,
  };
}
