import { saveQuotePremium } from './quote-cache';

export async function cacheQuoteFromAllianzResponse(result: unknown): Promise<void> {
  const data = result as {
    contract?: { contractNumber?: string };
    premium?: { premiumDueRounded?: number };
  };
  const contractNumber = data?.contract?.contractNumber;
  const premiumDueRounded = data?.premium?.premiumDueRounded;
  if (contractNumber && typeof premiumDueRounded === 'number') {
    await saveQuotePremium(contractNumber, premiumDueRounded);
  }
}
