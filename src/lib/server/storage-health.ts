import fs from 'node:fs/promises';
import path from 'node:path';
import { getDataDir } from './data-dir';

export type StorageHealthResult = {
  writable: boolean;
  errorCode?: string;
  message?: string;
};

/**
 * Verifies the app can create the runtime data directory and write a probe file.
 * Quote/payment/policy features depend on this (see quote-cache, policy-storage).
 */
export async function checkStorageWritable(): Promise<StorageHealthResult> {
  const dataDir = getDataDir();
  const probeDir = path.join(dataDir, '.health-probes');
  const probeFile = path.join(probeDir, `write-${Date.now()}.tmp`);

  try {
    await fs.mkdir(probeDir, { recursive: true });
    await fs.writeFile(probeFile, 'ok', 'utf-8');
    await fs.unlink(probeFile);
    return { writable: true };
  } catch (err: unknown) {
    const code =
      err && typeof err === 'object' && 'code' in err && typeof (err as NodeJS.ErrnoException).code === 'string'
        ? (err as NodeJS.ErrnoException).code
        : undefined;
    const message = err instanceof Error ? err.message : 'Storage probe failed';
    return {
      writable: false,
      errorCode: code ?? 'UNKNOWN',
      message,
    };
  }
}
