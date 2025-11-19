
const MERCHANT_ID = '136175265133530';
const SECRET_KEY = 'SK-IHRzWygdRgIPOiq9leu7';

export const SENANGPAY_CONFIG = {
  merchantId: MERCHANT_ID,
  secretKey: SECRET_KEY,
  url: 'https://sandbox.senangpay.my/payment/' + MERCHANT_ID,
};

/**
 * Generates HMAC-SHA256 hash using Web Crypto API (Browser compatible)
 */
export async function generateSenangPayHash(detail: string, amount: string, orderId: string): Promise<string> {
  const str = SECRET_KEY + detail + amount + orderId;
  return await hmacSha256(SECRET_KEY, str);
}

/**
 * Verifies HMAC-SHA256 hash using Web Crypto API (Browser compatible)
 */
export async function verifySenangPayHash(status_id: string, order_id: string, transaction_id: string, msg: string, receivedHash: string): Promise<boolean> {
  const str = SECRET_KEY + status_id + order_id + transaction_id + msg;
  const generatedHash = await hmacSha256(SECRET_KEY, str);
  return generatedHash === receivedHash;
}

/**
 * Helper function to compute HMAC-SHA256 in the browser
 */
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

  // Convert ArrayBuffer to hex string
  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}
