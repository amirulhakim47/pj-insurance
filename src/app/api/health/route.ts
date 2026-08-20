import { NextResponse } from 'next/server';
import { isConfigured } from '@/lib/server/allianz-auth';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    allianzConfigured: isConfigured(),
    timestamp: new Date().toISOString(),
  });
}
