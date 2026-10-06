import { NextResponse } from 'next/server';
import { isConfigured } from '@/lib/server/allianz-auth';
import { getAllianzApiHost } from '@/lib/server/allianz-api';

export async function GET() {
  const apiHost = getAllianzApiHost();
  const partnerIdSet = Boolean(process.env.ALLIANZ_PARTNER_ID?.trim());

  return NextResponse.json({
    status: 'ok',
    allianzConfigured: isConfigured(),
    allianzApiHost: apiHost,
    allianzPartnerIdConfigured: partnerIdSet,
    allianzEnvironment: apiHost.includes('uat') ? 'uat' : 'other',
    timestamp: new Date().toISOString(),
  });
}
