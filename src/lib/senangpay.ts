const BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:3001';

let cachedMerchantId: string | null = null;

export const SENANGPAY_CONFIG = {
  get merchantId(): string {
    return cachedMerchantId || process.env.NEXT_PUBLIC_SENANGPAY_MERCHANT_ID || '';
  },
  get url(): string {
    const id = this.merchantId;
    return `https://sandbox.senangpay.my/payment/${id}`;
  },
};

export async function generateSenangPayHash(
  detail: string,
  amount: string,
  orderId: string,
): Promise<{ hash: string; merchantId: string }> {
  const res = await fetch(`${BASE_URL}/api/payment/hash`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ detail, amount, order_id: orderId }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Hash generation failed' }));
    throw new Error(err.message || 'Failed to generate payment hash');
  }

  const data = await res.json();
  cachedMerchantId = data.merchant_id;
  return { hash: data.hash, merchantId: data.merchant_id };
}

export async function verifySenangPayHash(
  status_id: string,
  order_id: string,
  transaction_id: string,
  msg: string,
  receivedHash: string,
): Promise<boolean> {
  const res = await fetch(`${BASE_URL}/api/payment/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status_id, order_id, transaction_id, msg, hash: receivedHash }),
  });

  if (!res.ok) return false;

  const data = await res.json();
  return data.valid === true;
}
