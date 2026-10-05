import type { NextRequest } from 'next/server';
import { isSafeContractNumber } from './contract-number';
import { verifyPolicyAccessToken } from './policy-access-token';

export function contractNumberFromRequest(
  contractNumber: string,
  req: NextRequest,
): { ok: true; contractNumber: string } | { ok: false; status: number; message: string } {
  if (!contractNumber || !isSafeContractNumber(contractNumber)) {
    return { ok: false, status: 400, message: 'Invalid contract number' };
  }

  const token = req.nextUrl.searchParams.get('token');
  if (!token || !verifyPolicyAccessToken(token, contractNumber)) {
    return { ok: false, status: 401, message: 'Unauthorized' };
  }

  return { ok: true, contractNumber: contractNumber.trim() };
}
