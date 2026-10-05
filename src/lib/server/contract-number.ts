/** Allianz contract numbers observed in integration (alphanumeric, fixed-ish length). */
const CONTRACT_NUMBER_PATTERN = /^[A-Za-z0-9]{8,32}$/;

export function assertSafeContractNumber(contractNumber: string): string {
  const trimmed = contractNumber.trim();
  if (!CONTRACT_NUMBER_PATTERN.test(trimmed)) {
    throw new Error('Invalid contract number format');
  }
  return trimmed;
}

export function isSafeContractNumber(contractNumber: string): boolean {
  try {
    assertSafeContractNumber(contractNumber);
    return true;
  } catch {
    return false;
  }
}
