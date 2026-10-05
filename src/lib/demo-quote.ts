import type { QuotationResponse } from '@/types/allianz';
import type { AddonInputState } from '@/lib/addon-quote';
import { clampWindscreenSumInsured } from '@/lib/addon-quote';

/** Base total from DEMO_QUOTATION (no add-ons, default driver plan). */
export const DEMO_BASE_PREMIUM_DUE = 1086.5;

export type DemoDriverPlan = '0' | '1' | '2' | 'unlimited';

export function demoDriverPlanExtraCost(plan: DemoDriverPlan): number {
  if (plan === '2') return 10;
  if (plan === 'unlimited') return 20;
  return 0;
}

/** UAT demo: windscreen premium scales from RM75 at RM500 SI. */
export function demoWindscreenPremium(sumInsured: number): number {
  const si = clampWindscreenSumInsured(sumInsured);
  return Math.round((si / 500) * 75 * 100) / 100;
}

/** Local quote refresh for `/results?demo=true` (no Allianz updateQuote). */
export function applyDemoQuoteUpdate(
  base: QuotationResponse,
  selectedCodes: Set<string>,
  addonInputs: Record<string, AddonInputState>,
  driverPlan: DemoDriverPlan,
  rahmahApplied: boolean,
): QuotationResponse {
  const additionalCover = base.additionalCover.map((c) => {
    const selected = selectedCodes.has(c.coverCode);
    if (!selected) {
      return { ...c, selectedIndicator: false };
    }
    let displayPremium = c.displayPremium;
    let coverSumInsured = c.coverSumInsured;
    if (c.coverCode === '89') {
      const si = addonInputs['89']?.sumInsured ?? c.coverSumInsured ?? 500;
      coverSumInsured = clampWindscreenSumInsured(si);
      displayPremium = demoWindscreenPremium(coverSumInsured);
    }
    return { ...c, selectedIndicator: true, displayPremium, coverSumInsured };
  });

  const addonsTotal = additionalCover
    .filter((c) => selectedCodes.has(c.coverCode))
    .reduce((sum, c) => sum + c.displayPremium, 0);
  const driverCost = demoDriverPlanExtraCost(driverPlan);
  const rahmahAdjust = rahmahApplied ? -50 : 0;

  const premiumDueRounded =
    Math.round((DEMO_BASE_PREMIUM_DUE + addonsTotal + driverCost + rahmahAdjust) * 100) / 100;

  return {
    ...base,
    additionalCover,
    premium: {
      ...base.premium,
      premiumDue: premiumDueRounded,
      premiumDueRounded,
      premiumDueAfterPTV: premiumDueRounded,
      premiumDueRoundedAfterPTV: premiumDueRounded,
      packagePremium: rahmahApplied ? rahmahAdjust : base.premium.packagePremium,
    },
  };
}
