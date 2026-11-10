import { NextRequest, NextResponse } from 'next/server';
import {
  storePolicyPdf,
  storePolicyMetadata,
  type PolicyMetadata,
} from '@/lib/server/policy-storage';
import { extractCallbackFields, topLevelKeys } from '@/lib/server/callback-payload';
import { storeUnmatchedCallback } from '@/lib/server/callback-unmatched';
import { secureCompare } from '@/lib/server/secure-compare';
import { recordCallbackAudit, type CallbackAuditEntry } from '@/lib/server/callback-audit';

function getAllowedIPs(): string[] {
  return (process.env.CALLBACK_ALLOWED_IPS || '')
    .split(',')
    .map((ip) => ip.trim())
    .filter(Boolean);
}

function verifyApiKey(req: NextRequest): boolean {
  const expectedKey = process.env.CALLBACK_API_KEY;
  if (!expectedKey) {
    console.warn('[Allianz Callback] CALLBACK_API_KEY not set — accepting in non-production');
    return process.env.NODE_ENV !== 'production';
  }

  const providedKey =
    req.headers.get('x-api-key') || req.headers.get('X-Api-Key');

  if (!providedKey) {
    console.warn('[Allianz Callback] No x-api-key header found.');
    return false;
  }

  return secureCompare(providedKey, expectedKey);
}

function verifySourceIP(req: NextRequest): boolean {
  const allowedIPs = getAllowedIPs();
  // Optional hardening: Allianz has not confirmed fixed callback source IPs, so the API key is the primary control.
  if (allowedIPs.length === 0) {
    return true;
  }

  const forwarded = req.headers.get('x-forwarded-for') || '';
  const sourceIP = forwarded.split(',')[0].trim() || req.headers.get('x-real-ip') || '';

  return allowedIPs.some((allowed) => sourceIP === allowed);
}

/**
 * Model B callback handler — Allianz sends policy PDF in callback payload
 * and also emails the customer directly.
 *
 * Flow:
 *  1. Validate IP + API key
 *  2. Parse payload (contractNumber, policyNumber, status, policyPdf base64)
 *  3. If status=SUCCESS and policyPdf present → store PDF to filesystem
 *  4. Store metadata JSON alongside the PDF for status lookups
 */
export async function POST(req: NextRequest) {
  try {
    const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';

    const respond = async (
      outcome: CallbackAuditEntry['outcome'],
      body: object,
      httpStatus: number,
      extra: Partial<CallbackAuditEntry> = {},
    ) => {
      await recordCallbackAudit({
        outcome,
        httpStatus,
        ip: clientIP,
        userAgent: req.headers.get('user-agent'),
        contentType: req.headers.get('content-type'),
        apiKeyPresent: Boolean(req.headers.get('x-api-key')),
        ...extra,
      });
      return NextResponse.json(body, { status: httpStatus });
    };

    console.log('[Allianz Callback] Incoming request:', {
      ip: clientIP,
      headers: {
        'content-type': req.headers.get('content-type'),
        'x-api-key': req.headers.get('x-api-key') ? '***present***' : 'not present',
      },
      timestamp: new Date().toISOString(),
    });

    if (!verifySourceIP(req)) {
      console.warn('[Allianz Callback] BLOCKED — IP not in whitelist:', clientIP);
      return respond('blocked_ip', { received: false, error: 'Forbidden' }, 403);
    }

    if (!verifyApiKey(req)) {
      console.warn('[Allianz Callback] BLOCKED — Invalid x-api-key from:', clientIP);
      return respond('unauthorized', { received: false, error: 'Unauthorized' }, 401);
    }

    // Read as text first so a body we cannot use is still kept for reprocessing.
    const rawText = await req.text();
    let body: unknown;
    try {
      body = JSON.parse(rawText);
    } catch {
      await storeUnmatchedCallback({ reason: 'invalid_json', rawText, ip: clientIP });
      console.warn('[Allianz Callback] REJECTED — body is not valid JSON (raw body kept in callback-unmatched)');
      return respond('invalid_json', { received: false, error: 'Invalid JSON' }, 400);
    }

    const { contractNumber, policyNumber, status, policyPdf, vehicleLicenseId } = extractCallbackFields(body);

    if (!contractNumber) {
      // Authenticated but no recognisable contract reference (e.g. Allianz renamed a field):
      // acknowledge and keep the payload instead of rejecting it.
      const keys = topLevelKeys(body);
      await storeUnmatchedCallback({ reason: 'no_usable_reference', rawText, body, ip: clientIP });
      console.error('[Allianz Callback] UNMATCHED — no usable contract reference. Payload kept in callback-unmatched.', {
        keys,
        policyNumber,
        hasPdf: !!policyPdf,
      });
      return respond(
        'unmatched',
        { received: true, matched: false, pdfStored: false, timestamp: new Date().toISOString() },
        200,
        { policyNumber: policyNumber || null, hasPdf: !!policyPdf, payloadKeys: keys },
      );
    }

    const safeContractNumber = contractNumber;

    console.log('[Allianz Callback] ACCEPTED:', {
      contractNumber,
      policyNumber,
      status,
      vehicleLicenseId,
      hasPdf: !!policyPdf,
      pdfLength: policyPdf ? policyPdf.length : 0,
    });

    // ── Store PDF to filesystem (Model B) ────────────────────────
    const receivedAt = new Date().toISOString();
    let pdfStored = false;
    let pdfPath: string | null = null;

    if (status === 'SUCCESS' && policyPdf) {
      try {
        pdfPath = await storePolicyPdf(safeContractNumber, policyPdf, receivedAt);
        pdfStored = true;
        console.log(`[Allianz Callback] PDF stored: ${pdfPath}`);
      } catch (storageErr) {
        console.error('[Allianz Callback] PDF storage failed:', storageErr);
      }
    }

    // ── Store metadata JSON for status lookups ───────────────────
    const metadata: PolicyMetadata = {
      contractNumber: safeContractNumber,
      policyNumber: policyNumber || null,
      status,
      vehicleLicenseId: vehicleLicenseId || null,
      pdfPath,
      receivedAt,
    };

    try {
      const { stored, previous } = await storePolicyMetadata(metadata);
      console.log(
        `[Allianz Callback] Metadata stored for contract ${contractNumber} (callback #${stored.history.length})`,
      );
      if (previous && previous.policyNumber !== metadata.policyNumber) {
        console.warn(
          `[Allianz Callback] POLICY NUMBER CHANGED for contract ${contractNumber}: ` +
            `${previous.policyNumber ?? 'none'} (${previous.receivedAt}) -> ${metadata.policyNumber ?? 'none'}. ` +
            'Both kept in policy history.',
        );
      }
    } catch (metaErr) {
      console.error('[Allianz Callback] Metadata storage failed:', metaErr);
    }

    if (status === 'SUCCESS' && policyNumber) {
      console.log(`[Allianz Callback] Policy issued: ${policyNumber} for contract ${contractNumber}`);
    } else if (status === 'FAILED') {
      console.error(`[Allianz Callback] Policy issuance FAILED for contract ${contractNumber}`);
    }

    return respond(
      'accepted',
      { received: true, pdfStored, timestamp: new Date().toISOString() },
      200,
      { contractNumber: safeContractNumber, policyNumber: policyNumber || null, status, hasPdf: !!policyPdf },
    );
  } catch (err) {
    console.error('[Allianz Callback] Processing error:', err);
    await recordCallbackAudit({
      outcome: 'error',
      httpStatus: 500,
      ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
      userAgent: req.headers.get('user-agent'),
      contentType: req.headers.get('content-type'),
      apiKeyPresent: Boolean(req.headers.get('x-api-key')),
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json({ received: false, error: 'Internal processing error' }, { status: 500 });
  }
}
