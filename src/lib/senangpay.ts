
const MERCHANT_ID = process.env.NEXT_PUBLIC_SENANGPAY_MERCHANT_ID || '136175265133530';
const SECRET_KEY = process.env.SENANGPAY_SECRET_KEY || process.env.NEXT_PUBLIC_SENANGPAY_SECRET_KEY || 'SK-IHRzWygdRgIPOiq9leu7';

export const SENANGPAY_CONFIG = {
  merchantId: MERCHANT_ID,
  url: 'https://sandbox.senangpay.my/payment/' + MERCHANT_ID,
};

/**
 * Generates HMAC-SHA256 hash using Web Crypto API (Browser compatible).
 * WARNING: In production, hash generation should be done server-side
 * via a backend API to avoid exposing the secret key.
 */
export async function generateSenangPayHash(detail: string, amount: string, orderId: string): Promise<string> {
  const str = SECRET_KEY + detail + amount + orderId;
  return await hmacSha256(SECRET_KEY, str);
}

/**
 * Verifies HMAC-SHA256 hash using Web Crypto API (Browser compatible).
 * In production, this verification should also happen server-side.
 */
export async function verifySenangPayHash(status_id: string, order_id: string, transaction_id: string, msg: string, receivedHash: string): Promise<boolean> {
  const str = SECRET_KEY + status_id + order_id + transaction_id + msg;
  const generatedHash = await hmacSha256(SECRET_KEY, str);
  return generatedHash === receivedHash;
}

async function hmacSha256(key: string, data: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(key);
  const msgData = encoder.encode(data);

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign(
    'HMAC',
    cryptoKey,
    msgData
  );

  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}
