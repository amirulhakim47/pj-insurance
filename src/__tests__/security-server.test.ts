import {
  assertSafeContractNumber,
  isSafeContractNumber,
} from '@/lib/server/contract-number';
import {
  createPolicyAccessToken,
  verifyPolicyAccessToken,
} from '@/lib/server/policy-access-token';
import { amountsMatch } from '@/lib/server/quote-cache';

describe('contract-number', () => {
  it('accepts valid Allianz-style contract numbers', () => {
    expect(assertSafeContractNumber('CNAZ00004272328')).toBe('CNAZ00004272328');
  });

  it('rejects path traversal segments', () => {
    expect(isSafeContractNumber('../etc/passwd')).toBe(false);
    expect(isSafeContractNumber('')).toBe(false);
  });
});

describe('policy-access-token', () => {
  beforeAll(() => {
    process.env.POLICY_ACCESS_SECRET = 'test-policy-secret';
  });

  it('issues and verifies a token for a contract', () => {
    const token = createPolicyAccessToken('CNAZ00004272328');
    expect(verifyPolicyAccessToken(token, 'CNAZ00004272328')).toBe(true);
    expect(verifyPolicyAccessToken(token, 'CNAZ00004272329')).toBe(false);
  });
});

describe('quote-cache amountsMatch', () => {
  it('compares monetary amounts to two decimal places', () => {
    expect(amountsMatch(1086.5, '1086.50')).toBe(true);
    expect(amountsMatch(1086.5, '1.00')).toBe(false);
  });
});
