import fs from 'node:fs/promises';
import path from 'node:path';
import { getDataDir } from './data-dir';

/**
 * Append-only audit trail of every request to /api/callback (accepted or rejected), one JSON line per
 * request in DATA_DIR/callback-audit/YYYY-MM-DD.jsonl. Never stores the API key or the policy PDF.
 */

const MAX_FIELD_LENGTH = 200;
const MAX_DAILY_FILE_BYTES = 1_000_000;

export type CallbackAuditOutcome =
  | 'accepted'
  | 'blocked_ip'
  | 'unauthorized'
  | 'unmatched'
  | 'invalid_json'
  | 'error';

export interface CallbackAuditEntry {
  outcome: CallbackAuditOutcome;
  httpStatus: number;
  ip: string;
  userAgent: string | null;
  contentType: string | null;
  apiKeyPresent: boolean;
  contractNumber?: string;
  policyNumber?: string | null;
  status?: string;
  hasPdf?: boolean;
  payloadKeys?: string[];
  error?: string;
}

function clip(value: string | null | undefined): string | null {
  return value ? value.slice(0, MAX_FIELD_LENGTH) : null;
}

/** Best-effort: never throws, so an audit failure cannot change the callback response. */
export async function recordCallbackAudit(entry: CallbackAuditEntry): Promise<void> {
  try {
    const now = new Date();
    const dir = path.join(getDataDir(), 'callback-audit');
    await fs.mkdir(dir, { recursive: true });
    const file = path.join(dir, `${now.toISOString().slice(0, 10)}.jsonl`);

    // Unauthenticated requests can reach this, so cap the daily file instead of letting it grow unbounded.
    const size = await fs.stat(file).then((s) => s.size).catch(() => 0);
    if (size >= MAX_DAILY_FILE_BYTES) return;

    const line = JSON.stringify({
      receivedAt: now.toISOString(),
      ...entry,
      ip: clip(entry.ip),
      userAgent: clip(entry.userAgent),
      contentType: clip(entry.contentType),
      policyNumber: clip(entry.policyNumber),
      payloadKeys: entry.payloadKeys?.slice(0, 30).map((k) => k.slice(0, 50)),
      status: clip(entry.status) ?? undefined,
      error: clip(entry.error) ?? undefined,
    });
    await fs.appendFile(file, `${line}\n`, 'utf-8');
  } catch (err) {
    console.error('[Allianz Callback] Audit log write failed:', err);
  }
}
