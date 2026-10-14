import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { checkStorageWritable } from '@/lib/server/storage-health';

describe('checkStorageWritable', () => {
  const originalPolicyDir = process.env.POLICY_STORAGE_DIR;

  afterEach(() => {
    if (originalPolicyDir === undefined) {
      delete process.env.POLICY_STORAGE_DIR;
    } else {
      process.env.POLICY_STORAGE_DIR = originalPolicyDir;
    }
  });

  it('returns writable when probe file can be created under data dir', async () => {
    const base = await fs.mkdtemp(path.join(os.tmpdir(), 'pj-storage-health-'));
    process.env.POLICY_STORAGE_DIR = base;

    const result = await checkStorageWritable();

    expect(result).toEqual({ writable: true });
    await fs.rm(base, { recursive: true, force: true });
  });

  it('returns not writable when data root is read-only', async () => {
    const base = await fs.mkdtemp(path.join(os.tmpdir(), 'pj-storage-ro-'));
    await fs.chmod(base, 0o555);
    process.env.POLICY_STORAGE_DIR = base;

    const result = await checkStorageWritable();

    expect(result.writable).toBe(false);
    expect(result.errorCode).toBeDefined();

    await fs.chmod(base, 0o755);
    await fs.rm(base, { recursive: true, force: true });
  });
});
