/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { buildContentSecurityPolicy, generateCspNonce } from '@/lib/security-headers';
import { middleware } from '@/middleware';

const nextConfig = require('../../next.config.js');

function directives(csp: string): Map<string, string[]> {
  return new Map(
    csp
      .split(';')
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const [name, ...values] = part.split(/\s+/);
        return [name, values] as [string, string[]];
      }),
  );
}

describe('buildContentSecurityPolicy', () => {
  const csp = directives(buildContentSecurityPolicy({ nonce: 'abc123', isDev: false }));

  it('defines default-src and the directives that do not fall back to it', () => {
    expect(csp.get('default-src')).toEqual(["'self'"]);
    expect(csp.get('frame-ancestors')).toEqual(["'none'"]);
    expect(csp.get('form-action')).toContain("'self'");
    expect(csp.get('base-uri')).toEqual(["'self'"]);
    expect(csp.get('object-src')).toEqual(["'none'"]);
  });

  it('allows scripts only from self and the per-request nonce', () => {
    const scriptSrc = csp.get('script-src') ?? [];
    expect(scriptSrc).toEqual(expect.arrayContaining(["'self'", "'nonce-abc123'"]));
    expect(scriptSrc).not.toContain("'unsafe-inline'");
    expect(scriptSrc).not.toContain("'unsafe-eval'");
  });

  it('does not allow unsafe-inline in style-src', () => {
    expect(csp.get('style-src')).not.toContain("'unsafe-inline'");
  });

  it('contains no wildcard sources', () => {
    for (const values of csp.values()) {
      expect(values).not.toContain('*');
    }
  });

  it('allows the SenangPay payment form post', () => {
    expect(csp.get('form-action')).toEqual(
      expect.arrayContaining(['https://sandbox.senangpay.my', 'https://app.senangpay.my']),
    );
  });

  it('adds unsafe-eval only in development for React refresh', () => {
    const dev = directives(buildContentSecurityPolicy({ nonce: 'n', isDev: true }));
    expect(dev.get('script-src')).toContain("'unsafe-eval'");
  });
});

describe('generateCspNonce', () => {
  it('returns a different base64 value each call', () => {
    const a = generateCspNonce();
    const b = generateCspNonce();
    expect(a).toMatch(/^[A-Za-z0-9+/]+=*$/);
    expect(a).not.toBe(b);
  });
});

describe('middleware CSP', () => {
  it('sets a nonce-based CSP on page responses', () => {
    const res = middleware(new NextRequest('https://hallu.com.my/quote'));
    const csp = res.headers.get('content-security-policy') ?? '';
    expect(csp).toMatch(/script-src 'self' 'nonce-[A-Za-z0-9+/=]+'/);
    expect(res.headers.get('x-middleware-request-content-security-policy')).toBe(csp);
  });

  it('sets a CSP on API responses', () => {
    const res = middleware(new NextRequest('https://hallu.com.my/api/health'));
    expect(res.headers.get('content-security-policy')).toContain("default-src 'self'");
  });
});

describe('next.config security headers', () => {
  async function headersFor(): Promise<Record<string, string>> {
    const rules = await nextConfig.headers();
    const catchAll = rules.find((r: { source: string }) => r.source === '/:path*');
    return Object.fromEntries(
      catchAll.headers.map((h: { key: string; value: string }) => [h.key.toLowerCase(), h.value]),
    );
  }

  it('applies baseline security headers to every route', async () => {
    const headers = await headersFor();
    expect(headers['strict-transport-security']).toMatch(/max-age=\d{8,}; includeSubDomains/);
    expect(headers['x-content-type-options']).toBe('nosniff');
    expect(headers['x-frame-options']).toBe('DENY');
    expect(headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
    expect(headers['permissions-policy']).toContain('camera=()');
  });

  it('marks API responses as not cacheable', async () => {
    const rules = await nextConfig.headers();
    const api = rules.find((r: { source: string }) => r.source === '/api/:path*');
    const cache = api.headers.find((h: { key: string }) => h.key === 'Cache-Control');
    expect(cache.value).toContain('no-store');
  });
});
