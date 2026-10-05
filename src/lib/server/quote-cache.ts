import fs from 'node:fs/promises';
import path from 'node:path';
import { assertSafeContractNumber } from './contract-number';
import { getDataDir } from './data-dir';

const QUOTES_DIR = path.join(getDataDir(), 'quotes');
const QUOTE_TTL_MS = 24 * 60 * 60 * 1000;

export interface CachedQuote {
  contractNumber: string;
  premiumDueRounded: number;
  updatedAt: string;
}

async function ensureDir(): Promise<void> {
  await fs.mkdir(QUOTES_DIR, { recursive: true });
}

function quotePath(contractNumber: string): string {
  const safe = assertSafeContractNumber(contractNumber);
  const base = path.resolve(QUOTES_DIR);
  const resolved = path.resolve(base, `${safe}.json`);
  if (!resolved.startsWith(`${base}${path.sep}`)) {
    throw new Error('Invalid contract number');
  }
  return resolved;
}

export async function saveQuotePremium(
  contractNumber: string,
  premiumDueRounded: number,
): Promise<void> {
  if (typeof premiumDueRounded !== 'number' || !Number.isFinite(premiumDueRounded)) {
    return;
  }
  await ensureDir();
  const record: CachedQuote = {
    contractNumber: assertSafeContractNumber(contractNumber),
    premiumDueRounded,
    updatedAt: new Date().toISOString(),
  };
  await fs.writeFile(quotePath(contractNumber), JSON.stringify(record), 'utf-8');
}

export async function getCachedQuote(contractNumber: string): Promise<CachedQuote | null> {
  try {
    const raw = await fs.readFile(quotePath(contractNumber), 'utf-8');
    const record = JSON.parse(raw) as CachedQuote;
    const updated = new Date(record.updatedAt).getTime();
    if (Date.now() - updated > QUOTE_TTL_MS) {
      return null;
    }
    return record;
  } catch {
    return null;
  }
}

export function amountsMatch(cached: number, requested: string): boolean {
  const parsed = Number.parseFloat(requested);
  if (!Number.isFinite(parsed)) return false;
  return cached.toFixed(2) === parsed.toFixed(2);
}
