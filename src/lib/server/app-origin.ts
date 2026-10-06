import type { NextRequest } from 'next/server';

/** Absolute site origin for payment return URLs (Stripe Checkout). */
export function resolveAppOrigin(req: NextRequest): string {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '');
  if (configured) return configured;

  const host = req.headers.get('x-forwarded-host') || req.headers.get('host');
  const proto = req.headers.get('x-forwarded-proto') || 'http';
  if (host) return `${proto}://${host}`;

  return 'http://localhost:3000';
}

export function appPath(path: string): string {
  const base = (process.env.NEXT_PUBLIC_REPO_NAME || '').replace(/\/$/, '');
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalized}`;
}
