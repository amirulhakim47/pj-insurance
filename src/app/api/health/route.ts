import { NextResponse } from 'next/server';
import { isConfigured } from '@/lib/server/allianz-auth';
import { getAllianzApiHost } from '@/lib/server/allianz-api';
import { checkStorageWritable } from '@/lib/server/storage-health';

export async function GET() {
  const apiHost = getAllianzApiHost();
  const partnerIdSet = Boolean(process.env.ALLIANZ_PARTNER_ID?.trim());
  const storage = await checkStorageWritable();
  const status = storage.writable ? 'ok' : 'degraded';

  return NextResponse.json({
    status,
    allianzConfigured: isConfigured(),
    allianzApiHost: apiHost,
    allianzPartnerIdConfigured: partnerIdSet,
    allianzEnvironment: apiHost.includes('uat') ? 'uat' : 'other',
    storage: {
      writable: storage.writable,
      ...(storage.errorCode ? { errorCode: storage.errorCode } : {}),
      ...(process.env.NODE_ENV !== 'production' && storage.message
        ? { message: storage.message }
        : {}),
    },
    timestamp: new Date().toISOString(),
  });
}
