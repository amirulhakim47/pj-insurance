import { applyDemoQuoteUpdate, demoWindscreenPremium, DEMO_BASE_PREMIUM_DUE } from '@/lib/demo-quote';
import type { QuotationResponse } from '@/types/allianz';

const baseQuote: QuotationResponse = {
  contract: { contractNumber: 'CNAZ00004272328', hrtvInd: false, highPerformanceInd: false, excessWaiveInd: false },
  premium: {
    basicPremium: 2215.4,
    annualPremium: 996.93,
    grossPremium: 996.93,
    premiumDue: DEMO_BASE_PREMIUM_DUE,
    premiumDueRounded: DEMO_BASE_PREMIUM_DUE,
    stampDuty: 10,
    serviceTaxPercentage: 8,
    serviceTaxAmount: 79.75,
    excessAmount: 0,
    ncdPct: 55,
    ncdAmt: 1218.47,
    rebatePct: 0,
    rebateAmt: 0,
    commissionAmount: 0,
    commissionPercentage: 0,
    basicAnnualPremium: 2215.4,
    premiumDueAfterPTV: DEMO_BASE_PREMIUM_DUE,
    premiumDueRoundedAfterPTV: DEMO_BASE_PREMIUM_DUE,
    packagePremium: 0,
  },
  additionalCover: [
    {
      coverCode: '89',
      coverName: 'Windscreen',
      coverDescription: '',
      coverNarration: '',
      displayPremium: 80,
      coverSumInsured: 500,
      selectedIndicator: false,
      addDisplayInd: true,
      sequence: 4,
      azolSequence: 4,
      azolHiddenInd: 0,
    },
    {
      coverCode: '72',
      coverName: 'LL Passengers',
      coverDescription: '',
      coverNarration: '',
      displayPremium: 7.5,
      coverSumInsured: 0,
      selectedIndicator: false,
      addDisplayInd: true,
      sequence: 6,
      azolSequence: 6,
      azolHiddenInd: 0,
    },
  ],
};

describe('demo-quote', () => {
  it('computes windscreen demo premium at minimum SI', () => {
    expect(demoWindscreenPremium(500)).toBe(75);
    expect(demoWindscreenPremium(100)).toBe(75);
  });

  it('updates total when add-ons and driver plan change', () => {
    const selected = new Set(['89', '72']);
    const updated = applyDemoQuoteUpdate(baseQuote, selected, { '89': { sumInsured: 500 } }, '2', false);
    expect(updated.premium.premiumDueRounded).toBe(DEMO_BASE_PREMIUM_DUE + 75 + 7.5 + 10);
    expect(updated.additionalCover.find((c) => c.coverCode === '89')?.displayPremium).toBe(75);
  });
});
