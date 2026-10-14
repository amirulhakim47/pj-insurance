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
  });

});
