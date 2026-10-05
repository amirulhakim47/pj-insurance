const BASE_URL = '';

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
  contractNumber: string,
): Promise<{ hash: string; merchantId: string }> {
  const res = await fetch(`${BASE_URL}/api/payment/hash`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      detail,
      amount,
      order_id: orderId,
      contract_number: contractNumber,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Hash generation failed' }));
    throw new Error(err.message || 'Failed to generate payment hash');
  }

  const data = await res.json();
  cachedMerchantId = data.merchant_id;
  return { hash: data.hash, merchantId: data.merchant_id };
}

export type SenangPayVerifyResult = {
  valid: boolean;
  policyAccessToken?: string | null;
  contractNumber?: string | null;
};

export async function verifySenangPayHash(
  status_id: string,
  order_id: string,
  transaction_id: string,
  msg: string,
  receivedHash: string,
): Promise<SenangPayVerifyResult> {
  const res = await fetch(`${BASE_URL}/api/payment/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status_id, order_id, transaction_id, msg, hash: receivedHash }),
  });

  if (!res.ok) {
    return { valid: false };
  }

  const data = await res.json();
  return {
    valid: data.valid === true,
    policyAccessToken: data.policyAccessToken ?? null,
    contractNumber: data.contractNumber ?? null,
  };
}
