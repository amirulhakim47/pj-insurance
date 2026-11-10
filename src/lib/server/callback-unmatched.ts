import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { getDataDir } from './data-dir';
import { topLevelKeys } from './callback-payload';

/**
 * Authenticated callbacks we cannot map to a contract are kept verbatim in DATA_DIR/callback-unmatched/
 * so nothing Allianz sends is lost when their format changes; they can be reprocessed later.
 * Bodies over MAX_FILE_CHARS have long strings (the base64 PDF) replaced by a placeholder.
 */

const MAX_FILE_CHARS = 10 * 1024 * 1024;
const MAX_STRING_CHARS = 100 * 1024;

export type UnmatchedReason = 'no_usable_reference' | 'invalid_json';

function shrink(value: unknown): unknown {
  if (typeof value === 'string') {
    return value.length > MAX_STRING_CHARS ? `<omitted ${value.length} chars>` : value;
  }
  if (Array.isArray(value)) return value.map(shrink);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, shrink(v)]));
  }
  return value;
}

/** Best-effort: never throws, so keeping a payload cannot change the callback response. */
export async function storeUnmatchedCallback(input: {
  reason: UnmatchedReason;
  rawText: string;
  body?: unknown;
  ip: string;
}): Promise<string | null> {
  try {
    const dir = path.join(getDataDir(), 'callback-unmatched');
    await fs.mkdir(dir, { recursive: true });
    const receivedAt = new Date().toISOString();
    const file = path.join(dir, `${receivedAt.replace(/[:.]/g, '-')}-${crypto.randomUUID().slice(0, 8)}.json`);

    const oversized = input.rawText.length > MAX_FILE_CHARS;
    const record =
      input.body === undefined
        ? {
            receivedAt,
            reason: input.reason,
            ip: input.ip,
            rawText: oversized ? `${input.rawText.slice(0, MAX_STRING_CHARS)}<truncated>` : input.rawText,
          }
        : {
            receivedAt,
            reason: input.reason,
            ip: input.ip,
            keys: topLevelKeys(input.body),
            body: oversized ? shrink(input.body) : input.body,
          };
    await fs.writeFile(file, JSON.stringify(record, null, 2), 'utf-8');
    return file;
  } catch (err) {
    console.error('[Allianz Callback] Could not store unmatched payload:', err);
    return null;
  }
}
