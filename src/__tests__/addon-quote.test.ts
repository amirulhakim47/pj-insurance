import {
  buildAdditionalCoverPayload,
  clampWindscreenSumInsured,
  clampGasKitSumInsured,
  formatSumInsuredInputTyping,
  formatSumInsuredThousands,
  parseSumInsuredDigits,
  groupAvVariantsBySumInsured,
  getUniqueAvVariantNames,
  getAvTiersForVariantName,
  getAvTierOptions,
  getAvSumInsuredRange,
  avTierLabel,
} from '@/lib/addon-quote';
import type { AdditionalCoverItem } from '@/types/allianz';

describe('addon-quote utilities', () => {
  it('clamps windscreen sum insured to UAT limits', () => {
    expect(clampWindscreenSumInsured(1)).toBe(500);
    expect(clampWindscreenSumInsured(500)).toBe(500);
    expect(clampWindscreenSumInsured(30_000)).toBe(30_000);
    expect(clampWindscreenSumInsured(99_999_999)).toBe(30_000);
  });

  it('clamps gas kit sum insured to five-digit max', () => {
    expect(clampGasKitSumInsured(999_999)).toBe(99_999);
  });

  it('formats and parses sum insured without changing numeric value', () => {
    expect(formatSumInsuredThousands(30_000)).toBe('30,000');
    expect(parseSumInsuredDigits('30,000')).toBe(30_000);
    expect(formatSumInsuredInputTyping('30000')).toBe('30,000');
    expect(clampWindscreenSumInsured(parseSumInsuredDigits('5,000'))).toBe(5000);
  });

  it('includes default windscreen SI in update payload', () => {
    const cover: AdditionalCoverItem = {
      coverCode: '89',
      coverName: 'Windscreen',
      coverDescription: '',
      coverNarration: '',
      displayPremium: 75,
      coverSumInsured: 0,
      selectedIndicator: true,
      addDisplayInd: true,
      sequence: 1,
      azolSequence: 1,
      azolHiddenInd: 0,
    };
    const payload = buildAdditionalCoverPayload([cover], new Set(['89']), {});
    expect(payload[0].coverSumInsured).toBe(500);
  });

  it('groups AV variants by sum insured', () => {
    const grouped = groupAvVariantsBySumInsured([
      { SumInsured: '30000', Variant: 'LONG NAME A', AvCode: 'A', VehicleEngineCC: '1500', MakeYear: '2020' },
      { SumInsured: '30000', Variant: 'SHORT', AvCode: 'B', VehicleEngineCC: '1500', MakeYear: '2020' },
      { SumInsured: '35000', Variant: 'HIGH', AvCode: 'C', VehicleEngineCC: '1500', MakeYear: '2020' },
    ]);
    expect(grouped).toHaveLength(2);
    expect(grouped[0].Variant).toBe('SHORT');
  });

  it('lists unique AV variant names then tiers per variant', () => {
    const rows = [
      { SumInsured: '28000', Variant: 'HATCH AV', AvCode: 'A', VehicleEngineCC: '1500', MakeYear: '2020' },
      { SumInsured: '30000', Variant: 'HATCH AV', AvCode: 'B', VehicleEngineCC: '1500', MakeYear: '2020' },
      { SumInsured: '32000', Variant: 'HATCH G', AvCode: 'C', VehicleEngineCC: '1500', MakeYear: '2020' },
    ];
    expect(getUniqueAvVariantNames(rows)).toEqual(['HATCH AV', 'HATCH G']);
    const tiers = getAvTiersForVariantName(rows, 'HATCH AV');
    expect(tiers).toHaveLength(2);
    expect(avTierLabel(0, 2, tiers[0].SumInsured)).toBe('Low');
    expect(avTierLabel(1, 2, tiers[1].SumInsured)).toBe('High');
    expect(getAvTierOptions(rows, 'HATCH AV').map((o) => o.label)).toEqual(['Low', 'High']);
  });

  describe('Allianz AV LOV with tier encoded in the variant name', () => {
    const base = 'STANDARD 4D HATCHBACK 5 SP MANUAL CKD 1332 CC';
    const exec = 'EXECUTIVE 4D HATCHBACK 5 SP MANUAL CKD 1332 CC';
    const row = (Variant: string, AvCode: string, SumInsured: string) => ({
      Variant, AvCode, SumInsured, VehicleEngineCC: 1332, MakeYear: '2014', AzVariant: '31*0013232',
    });
    const rows = [
      row(`${base} - HIGH`, 'IYZ14I-HI', '14000.00'),
      row(`${base} - LOW`, 'IYZ14I-LO', '12000.00'),
      row(base, 'IYZ14I', '13000.00'),
      row(`${exec} - LOW`, 'IZ114I-LO', '13000.00'),
      row(exec, 'IZ114I', '14000.00'),
      row(`${exec} - HIGH`, 'IZ114I-HI', '15000.00'),
    ];

    it('groups LOW / MED / HIGH rows under one variant name', () => {
      expect(getUniqueAvVariantNames(rows)).toEqual([exec, base]);
    });

    it('returns Low, Med, High options with their sum insured, in that order', () => {
      const options = getAvTierOptions(rows, base);
      expect(options.map((o) => [o.label, o.variant.AvCode, o.variant.SumInsured])).toEqual([
        ['Low', 'IYZ14I-LO', '12000.00'],
        ['Med', 'IYZ14I', '13000.00'],
        ['High', 'IYZ14I-HI', '14000.00'],
      ]);
    });

    it('falls back to the AvCode suffix when the name has no tier suffix', () => {
      const codeOnly = [
        row('SEDAN X', 'ABC-HI', '20000.00'),
        row('SEDAN X', 'ABC-LO', '18000.00'),
        row('SEDAN X', 'ABC', '19000.00'),
      ];
      expect(getUniqueAvVariantNames(codeOnly)).toEqual(['SEDAN X']);
      expect(getAvTierOptions(codeOnly, 'SEDAN X').map((o) => o.label)).toEqual(['Low', 'Med', 'High']);
    });

    it('summarises the sum insured range for a variant', () => {
      expect(getAvSumInsuredRange(rows, base)).toEqual({ min: 12000, max: 14000 });
    });
  });

});
