import crypto from 'crypto';

const MERCHANT_ID = '136175265133530';
const SECRET_KEY = 'SK-IHRzWygdRgIPOiq9leu7';

export const SENANGPAY_CONFIG = {
  merchantId: MERCHANT_ID,
  secretKey: SECRET_KEY,
  url: 'https://sandbox.senangpay.my/payment/' + MERCHANT_ID,
};

export function generateSenangPayHash(detail: string, amount: string, orderId: string): string {
  const str = SECRET_KEY + detail + amount + orderId;
  return crypto.createHmac('sha256', SECRET_KEY).update(str).digest('hex');
}

export function verifySenangPayHash(status_id: string, order_id: string, transaction_id: string, msg: string, receivedHash: string): boolean {
  const str = SECRET_KEY + status_id + order_id + transaction_id + msg;
  const generatedHash = crypto.createHmac('sha256', SECRET_KEY).update(str).digest('hex');
  return generatedHash === receivedHash;
}

