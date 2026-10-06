/** Demo quotation contract used in `/results?demo=true` (UAT walkthrough). */
export const DEMO_CONTRACT_NUMBER = 'CNAZ00004272328';

export function isDemoModeEnabledOnServer(): boolean {
  return process.env.NEXT_PUBLIC_ALLOW_DEMO === 'true';
}

export function isDemoContract(contractNumber: string): boolean {
  return contractNumber.trim() === DEMO_CONTRACT_NUMBER;
}
