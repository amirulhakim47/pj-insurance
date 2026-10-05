import path from 'node:path';

/** Shared runtime data root (policies, quotes, payment records). */
export function getDataDir(): string {
  return process.env.POLICY_STORAGE_DIR || path.join(process.cwd(), 'data');
}
