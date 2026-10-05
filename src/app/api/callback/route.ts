import { NextRequest, NextResponse } from 'next/server';
import {
  storePolicyPdf,
  storePolicyMetadata,
  type PolicyMetadata,
} from '@/lib/server/policy-storage';
import { assertSafeContractNumber } from '@/lib/server/contract-number';
import { secureCompare } from '@/lib/server/secure-compare';

const IS_UAT = process.env.NODE_ENV !== 'production';

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
  if (allowedIPs.length === 0) {
    return process.env.NODE_ENV !== 'production';
  }

  const forwarded = req.headers.get('x-forwarded-for') || '';
  const sourceIP = forwarded.split(',')[0].trim() || req.headers.get('x-real-ip') || '';

  return allowedIPs.some((allowed) => sourceIP === allowed);
}

interface CallbackPayload {
  contractNumber: string;
  policyNumber?: string;
  status: 'SUCCESS' | 'FAILED';
  policyPdf?: string;
  vehicleLicenseId?: string;
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

    console.log('[Allianz Callback] Incoming request:', {
      ip: clientIP,
      headers: {
        'content-type': req.headers.get('content-type'),
        'x-api-key': req.headers.get('x-api-key') ? '***present***' : 'not present',
      },
      timestamp: new Date().toISOString(),
    });

    if (!IS_UAT && !verifySourceIP(req)) {
      console.warn('[Allianz Callback] BLOCKED — IP not in whitelist:', clientIP);
      return NextResponse.json({ received: false, error: 'Forbidden' }, { status: 403 });
    }

    if (!verifyApiKey(req)) {
      console.warn('[Allianz Callback] BLOCKED — Invalid x-api-key from:', clientIP);
      return NextResponse.json({ received: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body: CallbackPayload = await req.json();
    const { contractNumber, policyNumber, status, policyPdf, vehicleLicenseId } = body;

    if (!contractNumber) {
      console.warn('[Allianz Callback] REJECTED — Missing contractNumber');
      return NextResponse.json({ received: false, error: 'contractNumber is required' }, { status: 400 });
    }

    let safeContractNumber: string;
    try {
      safeContractNumber = assertSafeContractNumber(contractNumber);
    } catch {
      console.warn('[Allianz Callback] REJECTED — Invalid contractNumber format');
      return NextResponse.json({ received: false, error: 'Invalid contractNumber' }, { status: 400 });
    }

    console.log('[Allianz Callback] ACCEPTED:', {
      contractNumber,
      policyNumber,
      status,
      vehicleLicenseId,
      hasPdf: !!policyPdf,
      pdfLength: policyPdf ? policyPdf.length : 0,
    });

    // ── Store PDF to filesystem (Model B) ────────────────────────
    let pdfStored = false;
    let pdfPath: string | null = null;

    if (status === 'SUCCESS' && policyPdf) {
      try {
        pdfPath = await storePolicyPdf(safeContractNumber, policyPdf);
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
      receivedAt: new Date().toISOString(),
    };

    try {
      await storePolicyMetadata(metadata);
      console.log(`[Allianz Callback] Metadata stored for contract ${contractNumber}`);
    } catch (metaErr) {
      console.error('[Allianz Callback] Metadata storage failed:', metaErr);
    }

    if (status === 'SUCCESS' && policyNumber) {
      console.log(`[Allianz Callback] Policy issued: ${policyNumber} for contract ${contractNumber}`);
    } else if (status === 'FAILED') {
      console.error(`[Allianz Callback] Policy issuance FAILED for contract ${contractNumber}`);
    }

    return NextResponse.json({
      received: true,
      pdfStored,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[Allianz Callback] Processing error:', err);
    return NextResponse.json({ received: false, error: 'Internal processing error' }, { status: 500 });
  }
}
