import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { buildContentSecurityPolicy, generateCspNonce } from '@/lib/security-headers';

const API_CSP = "default-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'";

const WINDOW_MS = 60_000;
const MAX_API_REQUESTS = 80;
const MAX_SENSITIVE_REQUESTS = 25;

type Bucket = { count: number; resetAt: number };

const globalStore = globalThis as typeof globalThis & {
  __pjApiRateLimit?: Map<string, Bucket>;
};

function getStore(): Map<string, Bucket> {
  if (!globalStore.__pjApiRateLimit) {
    globalStore.__pjApiRateLimit = new Map();
  }
  return globalStore.__pjApiRateLimit;
}

function clientKey(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown';
  return ip;
}

function rateLimit(key: string, limit: number): { allowed: boolean; retryAfterSec: number } {
  const store = getStore();
  const now = Date.now();
  const bucket = store.get(key);

  if (!bucket || now >= bucket.resetAt) {
    store.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, retryAfterSec: 0 };
  }

  if (bucket.count >= limit) {
    return { allowed: false, retryAfterSec: Math.ceil((bucket.resetAt - now) / 1000) };
  }

  bucket.count += 1;
  store.set(key, bucket);
  return { allowed: true, retryAfterSec: 0 };
}

function withPageCsp(req: NextRequest): NextResponse {
  const nonce = generateCspNonce();
  const csp = buildContentSecurityPolicy({ nonce, isDev: process.env.NODE_ENV === 'development' });
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('Content-Security-Policy', csp);
  const res = NextResponse.next({ request: { headers: requestHeaders } });
  res.headers.set('Content-Security-Policy', csp);
  return res;
}

export function middleware(req: NextRequest) {
  if (!req.nextUrl.pathname.startsWith('/api/')) {
    return withPageCsp(req);
  }
  const res = handleApi(req);
  res.headers.set('Content-Security-Policy', API_CSP);
  return res;
}

function handleApi(req: NextRequest): NextResponse {
  const { pathname } = req.nextUrl;
  if (pathname === '/api/health') {
    return NextResponse.next();
  }

  const sensitive =
    pathname.startsWith('/api/vehicle-details') ||
    pathname.startsWith('/api/quote') ||
    pathname.startsWith('/api/submission') ||
    pathname.startsWith('/api/payment/') ||
    pathname.startsWith('/api/stripe/') ||
    pathname.startsWith('/api/check-ubb');

  const limit = sensitive ? MAX_SENSITIVE_REQUESTS : MAX_API_REQUESTS;
  const key = `${clientKey(req)}:${sensitive ? 's' : 'g'}`;
  const { allowed, retryAfterSec } = rateLimit(key, limit);

  if (!allowed) {
    return NextResponse.json(
      { status: 429, code: 'RATE_LIMIT', message: 'Too many requests. Please try again later.' },
      { status: 429, headers: { 'Retry-After': String(retryAfterSec) } },
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
