import { isSafeContractNumber } from './contract-number';

/**
 * Tolerant reader for Allianz callback bodies. The callback format is not in our spec and has already
 * differed from what we assumed (ReferenceNo / PolicyNo / BufferValue), so keys are matched
 * case-insensitively, ignoring punctuation, and searched in nested objects (shallowest first).
 */

const MAX_DEPTH = 4;

const ALIASES = {
  contractNumber: ['contractnumber', 'referenceno', 'referencenumber', 'contractno'],
  policyNumber: ['policynumber', 'policyno'],
  policyPdf: ['policypdf', 'buffervalue'],
  status: ['status'],
  vehicleLicenseId: ['vehiclelicenseid', 'vehicleno'],
} as const;

export interface CallbackFields {
  contractNumber?: string;
  policyNumber?: string;
  policyPdf?: string;
  vehicleLicenseId?: string;
  status: 'SUCCESS' | 'FAILED';
}

const normalizeKey = (key: string) => key.toLowerCase().replace(/[^a-z0-9]/g, '');

function flatten(body: unknown): Array<[string, unknown]> {
  const entries: Array<[string, unknown]> = [];
  let level: unknown[] = [body];
  for (let depth = 0; depth < MAX_DEPTH && level.length > 0; depth++) {
    const next: unknown[] = [];
    for (const node of level) {
      if (Array.isArray(node)) {
        next.push(...node);
      } else if (node && typeof node === 'object') {
        for (const [key, value] of Object.entries(node)) {
          entries.push([normalizeKey(key), value]);
          next.push(value);
        }
      }
    }
    level = next;
  }
  return entries;
}

function pick(
  entries: Array<[string, unknown]>,
  aliases: readonly string[],
  accept: (value: string) => boolean = () => true,
): string | undefined {
  for (const alias of aliases) {
    for (const [key, value] of entries) {
      if (key !== alias || typeof value !== 'string') continue;
      const trimmed = value.trim();
      if (trimmed && accept(trimmed)) return trimmed;
    }
  }
  return undefined;
}

export function extractCallbackFields(body: unknown): CallbackFields {
  const entries = flatten(body);
  const policyNumber = pick(entries, ALIASES.policyNumber);
  const declared = pick(entries, ALIASES.status)?.toUpperCase();
  return {
    contractNumber: pick(entries, ALIASES.contractNumber, isSafeContractNumber),
    policyNumber,
    policyPdf: pick(entries, ALIASES.policyPdf),
    vehicleLicenseId: pick(entries, ALIASES.vehicleLicenseId),
    status:
      declared === 'SUCCESS' || declared === 'FAILED' ? declared : policyNumber ? 'SUCCESS' : 'FAILED',
  };
}

/** Field names of the top-level object, for logs. Names only, never values. */
export function topLevelKeys(body: unknown): string[] {
  return body && typeof body === 'object' && !Array.isArray(body) ? Object.keys(body) : [];
}
