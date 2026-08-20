import { NextRequest, NextResponse } from 'next/server';

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

  return providedKey === expectedKey;
}

function verifySourceIP(req: NextRequest): boolean {
  const allowedIPs = getAllowedIPs();
  if (allowedIPs.length === 0) return true;

  const forwarded = req.headers.get('x-forwarded-for') || '';
  const sourceIP = forwarded.split(',')[0].trim() || req.headers.get('x-real-ip') || '';

  return allowedIPs.some((allowed) => sourceIP.includes(allowed));
}

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

    const body = await req.json();
    const { contractNumber, policyNumber, status, policyPdf, vehicleLicenseId } = body;

    if (!IS_UAT && !contractNumber) {
      console.warn('[Allianz Callback] REJECTED — Missing contractNumber');
      return NextResponse.json({ received: false, error: 'contractNumber is required' }, { status: 400 });
    }

    console.log('[Allianz Callback] ACCEPTED:', {
      contractNumber,
      policyNumber,
      status,
      vehicleLicenseId,
      hasPdf: !!policyPdf,
      pdfLength: policyPdf ? policyPdf.length : 0,
    });

    if (status === 'SUCCESS' && policyNumber) {
      console.log(`[Allianz Callback] Policy issued: ${policyNumber} for contract ${contractNumber}`);
    } else if (status === 'FAILED') {
      console.error(`[Allianz Callback] Policy issuance FAILED for contract ${contractNumber}`);
    }

    return NextResponse.json({ received: true, timestamp: new Date().toISOString() });
  } catch (err) {
    console.error('[Allianz Callback] Processing error:', err);
    return NextResponse.json({ received: false, error: 'Internal processing error' }, { status: 500 });
  }
}
