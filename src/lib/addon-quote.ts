import type { AdditionalCoverItem } from '@/types/allianz';

export const WINDSCREEN_MIN_SI = 500;
export const WINDSCREEN_MAX_SI = 30_000;
export const GAS_KIT_MAX_SI = 99_999;

export type AddonInputState = {
  sumInsured?: number;
  cartDay?: string;
  cartAmount?: string;
  planCode?: string;
};

export function clampWindscreenSumInsured(value: number): number {
  if (!Number.isFinite(value) || value < WINDSCREEN_MIN_SI) return WINDSCREEN_MIN_SI;
  return Math.min(WINDSCREEN_MAX_SI, Math.floor(value));
}

export function clampGasKitSumInsured(value: number): number {
  if (!Number.isFinite(value) || value < 100) return 100;
  return Math.min(GAS_KIT_MAX_SI, Math.floor(value));
}

/** Strip formatting; used only for commit/clamp (never store formatted strings as SI). */
export function parseSumInsuredDigits(input: string): number {
  const digits = input.replace(/\D/g, '');
  if (!digits) return 0;
  const n = parseInt(digits, 10);
  return Number.isFinite(n) ? n : 0;
}

export function formatSumInsuredThousands(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return '';
  return Math.floor(value).toLocaleString('en-MY');
}

/** Apply thousand separators while the user types (digits-only semantics). */
export function formatSumInsuredInputTyping(input: string): string {
  const digits = input.replace(/\D/g, '');
  if (!digits) return '';
  const n = parseInt(digits, 10);
  if (!Number.isFinite(n)) return '';
  return n.toLocaleString('en-MY');
}

export function defaultAddonInputsForCover(cover: AdditionalCoverItem): AddonInputState {
  switch (cover.coverCode) {
    case '89':
      return { sumInsured: clampWindscreenSumInsured(cover.coverSumInsured || WINDSCREEN_MIN_SI) };
    case '97A':
      return { sumInsured: clampGasKitSumInsured(cover.coverSumInsured || 1000) };
    case '112':
      return { cartDay: '7', cartAmount: '100' };
    case 'PAB-ERW':
      return { planCode: 'PABERWA' };
    case 'PAB3':
      return { planCode: 'PAB3A' };
    default:
      return {};
  }
}

export function mergeAddonInputs(
  cover: AdditionalCoverItem,
  inputs?: AddonInputState,
): AddonInputState {
  return { ...defaultAddonInputsForCover(cover), ...inputs };
}

export function buildAdditionalCoverPayload(
  covers: AdditionalCoverItem[],
  selectedCodes: Set<string>,
  addonInputs: Record<string, AddonInputState>,
) {
  return covers
    .filter((c) => selectedCodes.has(c.coverCode))
    .map((c) => {
      const inputs = mergeAddonInputs(c, addonInputs[c.coverCode]);
      let coverSumInsured = inputs.sumInsured ?? c.coverSumInsured;
      if (c.coverCode === '89') {
        coverSumInsured = clampWindscreenSumInsured(coverSumInsured);
      }
      if (c.coverCode === '97A') {
        coverSumInsured = clampGasKitSumInsured(coverSumInsured);
      }
      return {
        coverCode: c.coverCode,
        coverSumInsured,
        ...(inputs.cartDay ? { cartDay: inputs.cartDay } : {}),
        ...(inputs.cartAmount ? { cartAmount: inputs.cartAmount } : {}),
        ...(inputs.planCode ? { planCode: inputs.planCode } : {}),
      };
    });
}

/** Group AV LOV rows by sum insured; pick one representative variant per tier. */
export function groupAvVariantsBySumInsured<T extends { SumInsured: string; Variant: string }>(
  variants: T[],
): T[] {
  const bySi = new Map<number, T>();
  for (const v of variants) {
    const si = parseFloat(v.SumInsured);
    if (!Number.isFinite(si)) continue;
    const existing = bySi.get(si);
    if (!existing || v.Variant.length < existing.Variant.length) {
      bySi.set(si, v);
    }
  }
  return [...bySi.values()].sort(
    (a, b) => parseFloat(a.SumInsured) - parseFloat(b.SumInsured),
  );
}

export function avTierLabel(index: number, total: number, sumInsured?: string): string {
  if (total <= 1) return 'Agreed value';
  if (total === 2) return index === 0 ? 'Low' : 'High';
  if (total === 3) {
    if (index === 0) return 'Low';
    if (index === 1) return 'Med';
    return 'High';
  }
  if (sumInsured) {
    const si = parseFloat(sumInsured);
    if (Number.isFinite(si)) {
      return `RM ${si.toLocaleString('en-MY', { maximumFractionDigits: 0 })}`;
    }
  }
  return `Tier ${index + 1}`;
}

type AvTier = 'LOW' | 'MED' | 'HIGH';

const AV_TIER_ORDER: AvTier[] = ['LOW', 'MED', 'HIGH'];
const AV_TIER_LABELS: Record<AvTier, string> = { LOW: 'Low', MED: 'Med', HIGH: 'High' };
const AV_NAME_TIER_SUFFIX = /\s*-\s*(LOW|HIGH)\s*$/i;
const AV_CODE_TIER_SUFFIX = /-(LO|HI)$/i;

/**
 * Allianz AV LOV returns one row per tier, e.g. "X CC - LOW" / "X CC" / "X CC - HIGH"
 * (AvCode "…-LO" / "…" / "…-HI"); the unsuffixed row is the MED tier.
 */
function parseAvVariant(v: { Variant: string; AvCode?: string }): {
  baseName: string;
  explicitTier: AvTier | null;
} {
  const name = v.Variant.trim();
  const nameMatch = name.match(AV_NAME_TIER_SUFFIX);
  if (nameMatch) {
    return {
      baseName: name.replace(AV_NAME_TIER_SUFFIX, '').trim(),
      explicitTier: nameMatch[1].toUpperCase() as AvTier,
    };
  }
  const codeMatch = v.AvCode?.trim().match(AV_CODE_TIER_SUFFIX);
  if (codeMatch) {
    return { baseName: name, explicitTier: codeMatch[1].toUpperCase() === 'LO' ? 'LOW' : 'HIGH' };
  }
  return { baseName: name, explicitTier: null };
}

/** Step 1: distinct variant descriptions from AV LOV (tier suffix removed). */
export function getUniqueAvVariantNames<T extends { Variant: string; AvCode?: string }>(
  variants: T[],
): string[] {
  const names = new Set<string>();
  for (const v of variants) {
    const { baseName } = parseAvVariant(v);
    if (baseName) names.add(baseName);
  }
  return [...names].sort((a, b) => a.localeCompare(b));
}

function rowsForAvVariantName<T extends { Variant: string; AvCode?: string }>(
  variants: T[],
  variantName: string,
): T[] {
  const trimmed = variantName.trim();
  return variants.filter((v) => parseAvVariant(v).baseName === trimmed);
}

/** Step 2: sum-insured tiers for one variant (deduped by SI). */
export function getAvTiersForVariantName<
  T extends { Variant: string; SumInsured: string; AvCode?: string },
>(variants: T[], variantName: string): T[] {
  return getAvTierOptions(variants, variantName).map((o) => o.variant);
}

/** Step 2 options with display label: Low / Med / High when Allianz encodes the tier. */
export function getAvTierOptions<
  T extends { Variant: string; SumInsured: string; AvCode?: string },
>(variants: T[], variantName: string): { label: string; variant: T }[] {
  const rows = rowsForAvVariantName(variants, variantName);
  const hasExplicitTiers = rows.some((v) => parseAvVariant(v).explicitTier !== null);

  if (!hasExplicitTiers) {
    const tiers = groupAvVariantsBySumInsured(rows);
    return tiers.map((variant, i) => ({
      label: avTierLabel(i, tiers.length, variant.SumInsured),
      variant,
    }));
  }

  const byTier = new Map<AvTier, T>();
  for (const v of rows) {
    const tier = parseAvVariant(v).explicitTier ?? 'MED';
    if (!byTier.has(tier)) byTier.set(tier, v);
  }
  return AV_TIER_ORDER.flatMap((t) => {
    const variant = byTier.get(t);
    return variant ? [{ label: AV_TIER_LABELS[t], variant }] : [];
  });
}

export function getAvSumInsuredRange<
  T extends { Variant: string; SumInsured: string; AvCode?: string },
>(variants: T[], variantName: string): { min: number; max: number } | null {
  const values = rowsForAvVariantName(variants, variantName)
    .map((v) => parseFloat(v.SumInsured))
    .filter(Number.isFinite);
  if (values.length === 0) return null;
  return { min: Math.min(...values), max: Math.max(...values) };
}
