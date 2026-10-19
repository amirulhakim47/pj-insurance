const SENANGPAY_ORIGINS = ['https://sandbox.senangpay.my', 'https://app.senangpay.my'];

type CspOptions = { nonce: string; isDev: boolean };

export function generateCspNonce(): string {
  return btoa(crypto.randomUUID());
}

export function buildContentSecurityPolicy({ nonce, isDev }: CspOptions): string {
  const scriptSrc = ["'self'", `'nonce-${nonce}'`, ...(isDev ? ["'unsafe-eval'"] : [])];
  const directives: Array<[string, string[]]> = [
    ['default-src', ["'self'"]],
    ['script-src', scriptSrc],
    ['style-src', ["'self'", `'nonce-${nonce}'`]],
    // React renders `style={{...}}` as attributes on SSR; attributes cannot carry a nonce.
    ['style-src-attr', ["'unsafe-inline'"]],
    ['img-src', ["'self'", 'data:', 'blob:']],
    ['font-src', ["'self'", 'data:']],
    ['connect-src', ["'self'", ...(isDev ? ['ws:'] : [])]],
    ['frame-src', ["'self'"]],
    ['worker-src', ["'self'", 'blob:']],
    ['manifest-src', ["'self'"]],
    ['media-src', ["'self'"]],
    ['object-src', ["'none'"]],
    ['base-uri', ["'self'"]],
    ['form-action', ["'self'", ...SENANGPAY_ORIGINS]],
    ['frame-ancestors', ["'none'"]],
    ['upgrade-insecure-requests', []],
  ];
  return directives.map(([name, values]) => [name, ...values].join(' ')).join('; ');
}
