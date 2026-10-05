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

export async function storePolicyPdf(
  contractNumber: string,
  pdfBase64: string,
): Promise<string> {
  await ensureDir();
  const pdfPath = resolvePolicyPath(contractNumber, 'pdf');
  const buffer = Buffer.from(pdfBase64, 'base64');
  await fs.writeFile(pdfPath, buffer);
  return pdfPath;
}

export async function storePolicyMetadata(metadata: PolicyMetadata): Promise<void> {
  await ensureDir();
  const safeContract = assertSafeContractNumber(metadata.contractNumber);
  const metaPath = resolvePolicyPath(safeContract, 'json');
  await fs.writeFile(metaPath, JSON.stringify({ ...metadata, contractNumber: safeContract }, null, 2), 'utf-8');
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
