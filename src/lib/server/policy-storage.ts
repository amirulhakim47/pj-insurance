import fs from 'node:fs/promises';
import path from 'node:path';
import { assertSafeContractNumber } from './contract-number';
import { getDataDir } from './data-dir';

/**
 * Filesystem-based policy storage for VPS deployments.
 *
 * Stores policy PDFs and metadata under DATA_DIR/policies/.
 */

const DATA_DIR = getDataDir();
const POLICIES_DIR = path.join(DATA_DIR, 'policies');

export interface PolicyMetadata {
  contractNumber: string;
  policyNumber: string | null;
  status: 'SUCCESS' | 'FAILED';
  vehicleLicenseId: string | null;
  pdfPath: string | null;
  receivedAt: string;
}

/** One callback as received. Never rewritten once appended. */
export type PolicyCallbackRecord = PolicyMetadata;

/**
 * Stored file: top-level fields mirror the latest callback (what the site reads);
 * `history` keeps every callback in arrival order so nothing is lost when Allianz
 * sends a second callback (e.g. a re-issue with a new policy number).
 */
export interface StoredPolicyMetadata extends PolicyMetadata {
  history: PolicyCallbackRecord[];
}

async function ensureDir(): Promise<void> {
  await fs.mkdir(POLICIES_DIR, { recursive: true });
}

function resolvePolicyPath(contractNumber: string, ext: 'pdf' | 'json'): string {
  const safe = assertSafeContractNumber(contractNumber);
  const base = path.resolve(POLICIES_DIR);
  const resolved = path.resolve(base, `${safe}.${ext}`);
  if (!resolved.startsWith(`${base}${path.sep}`)) {
    throw new Error('Invalid contract number');
  }
  return resolved;
}

/** Filesystem-safe form of an ISO timestamp, e.g. 2026-11-10T03-18-04-190Z. */
function timestampSlug(iso: string): string {
  return iso.replace(/[:.]/g, '-');
}

async function writeFileAtomic(filePath: string, data: string | Buffer): Promise<void> {
  const tmp = `${filePath}.${process.pid}.${Date.now()}.tmp`;
  await fs.writeFile(tmp, data);
  await fs.rename(tmp, filePath);
}

/**
 * Stores the PDF twice: a per-callback copy (`<contract>-<receivedAt>.pdf`, never
 * overwritten) and `<contract>.pdf`, the latest copy the download route serves.
 * Returns the per-callback path.
 */
export async function storePolicyPdf(
  contractNumber: string,
  pdfBase64: string,
  receivedAt: string,
): Promise<string> {
  await ensureDir();
  const safe = assertSafeContractNumber(contractNumber);
  const buffer = Buffer.from(pdfBase64, 'base64');
  const base = path.resolve(POLICIES_DIR);
  const archivePath = path.resolve(base, `${safe}-${timestampSlug(receivedAt)}.pdf`);
  if (!archivePath.startsWith(`${base}${path.sep}`)) {
    throw new Error('Invalid contract number');
  }
  // 'wx' fails rather than overwrite if two callbacks share a millisecond.
  await fs.writeFile(archivePath, buffer, { flag: 'wx' });
  await writeFileAtomic(resolvePolicyPath(safe, 'pdf'), buffer);
  return archivePath;
}

async function readStored(metaPath: string): Promise<StoredPolicyMetadata | null> {
  let raw: string;
  try {
    raw = await fs.readFile(metaPath, 'utf-8');
  } catch {
    return null;
  }
  const parsed = JSON.parse(raw) as Partial<StoredPolicyMetadata>;
  if (Array.isArray(parsed.history)) return parsed as StoredPolicyMetadata;
  // File written before history existed: its single record becomes the first entry.
  const { history: _ignored, ...legacy } = parsed;
  return { ...(legacy as PolicyMetadata), history: [legacy as PolicyMetadata] };
}

/**
 * Appends this callback to the contract's history and updates the top-level
 * (latest) fields. Earlier callbacks are kept as-is. Returns the stored file and
 * the previous latest record, so the caller can flag a changed policy number.
 */
export async function storePolicyMetadata(
  metadata: PolicyMetadata,
): Promise<{ stored: StoredPolicyMetadata; previous: PolicyMetadata | null }> {
  await ensureDir();
  const safeContract = assertSafeContractNumber(metadata.contractNumber);
  const metaPath = resolvePolicyPath(safeContract, 'json');
  const record: PolicyCallbackRecord = { ...metadata, contractNumber: safeContract };

  const existing = await readStored(metaPath);
  const previous = existing ? existing.history[existing.history.length - 1] ?? null : null;
  const stored: StoredPolicyMetadata = {
    ...record,
    history: [...(existing?.history ?? []), record],
  };

  await writeFileAtomic(metaPath, JSON.stringify(stored, null, 2));
  return { stored, previous };
}

export async function getPolicyMetadata(
  contractNumber: string,
): Promise<PolicyMetadata | null> {
  const metaPath = resolvePolicyPath(contractNumber, 'json');
  try {
    const raw = await fs.readFile(metaPath, 'utf-8');
    return JSON.parse(raw) as PolicyMetadata;
  } catch {
    return null;
  }
}

export async function getPolicyPdf(contractNumber: string): Promise<Buffer | null> {
  const pdfPath = resolvePolicyPath(contractNumber, 'pdf');
  try {
    return await fs.readFile(pdfPath);
  } catch {
    return null;
  }
}
