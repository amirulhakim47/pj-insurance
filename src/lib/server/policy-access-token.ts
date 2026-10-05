import crypto from 'node:crypto';
import { assertSafeContractNumber } from './contract-number';

const TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

function getSigningSecret(): string {
  const secret =
    process.env.POLICY_ACCESS_SECRET ||
    process.env.SENANGPAY_SECRET_KEY ||
    process.env.CALLBACK_API_KEY;

  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('POLICY_ACCESS_SECRET (or payment/callback secrets) must be configured');
    }
    return 'dev-only-policy-access-secret';
  }
  return secret;
}

function signPayload(payload: string): string {
  return crypto.createHmac('sha256', getSigningSecret()).update(payload).digest('base64url');
}

export function createPolicyAccessToken(contractNumber: string): string {
  const contract = assertSafeContractNumber(contractNumber);
  const exp = Date.now() + TOKEN_TTL_MS;
  const payload = `${contract}.${exp}`;
  const sig = signPayload(payload);
  return `${Buffer.from(payload).toString('base64url')}.${sig}`;
}

export function verifyPolicyAccessToken(token: string, contractNumber: string): boolean {
  try {
    const contract = assertSafeContractNumber(contractNumber);
    const [payloadB64, sig] = token.split('.');
    if (!payloadB64 || !sig) return false;

    const payload = Buffer.from(payloadB64, 'base64url').toString('utf8');
    const expectedSig = signPayload(payload);
    if (!secureCompareStrings(sig, expectedSig)) return false;

    const [tokenContract, expStr] = payload.split('.');
    if (tokenContract !== contract) return false;

    const exp = Number(expStr);
    if (!Number.isFinite(exp) || Date.now() > exp) return false;

    return true;
  } catch {
    return false;
  }
}

function secureCompareStrings(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}
