/**
 * @jest-environment node
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { NextRequest } from 'next/server';

const storageDir = fs.mkdtempSync(path.join(os.tmpdir(), 'callback-test-'));
process.env.POLICY_STORAGE_DIR = storageDir;

const { POST } = require('@/app/api/callback/route') as typeof import('@/app/api/callback/route');

const API_KEY = 'test-callback-key';
const env = process.env as Record<string, string | undefined>;

function callback(headers: Record<string, string>, body: object = {}): NextRequest {
  return new NextRequest('https://hallu.com.my/api/callback', {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...headers },
    body: JSON.stringify({
      contractNumber: 'CNAZ00005342961',
      policyNumber: '26VKJM0000228-00',
      status: 'SUCCESS',
      ...body,
    }),
  });
}

describe('POST /api/callback', () => {
  const originalNodeEnv = env.NODE_ENV;

  beforeEach(() => {
    env.NODE_ENV = 'production';
    env.CALLBACK_API_KEY = API_KEY;
    delete env.CALLBACK_ALLOWED_IPS;
  });

  afterAll(() => {
    env.NODE_ENV = originalNodeEnv;
    fs.rmSync(storageDir, { recursive: true, force: true });
  });

  it('accepts a valid API key from any IP when no allowlist is configured', async () => {
    const res = await POST(callback({ 'x-api-key': API_KEY, 'x-forwarded-for': '203.0.113.9' }));
    expect(res.status).toBe(200);
    const stored = JSON.parse(
      fs.readFileSync(path.join(storageDir, 'policies', 'CNAZ00005342961.json'), 'utf-8'),
    );
    expect(stored.policyNumber).toBe('26VKJM0000228-00');
  });

  it('rejects a missing API key', async () => {
    const res = await POST(callback({ 'x-forwarded-for': '203.0.113.9' }));
    expect(res.status).toBe(401);
  });

  it('rejects a wrong API key', async () => {
    const res = await POST(callback({ 'x-api-key': 'wrong-key-value00' }));
    expect(res.status).toBe(401);
  });

  it('fails closed when CALLBACK_API_KEY is not configured in production', async () => {
    delete env.CALLBACK_API_KEY;
    const res = await POST(callback({ 'x-api-key': API_KEY }));
    expect(res.status).toBe(401);
  });

  it('enforces the allowlist when CALLBACK_ALLOWED_IPS is set', async () => {
    env.CALLBACK_ALLOWED_IPS = '198.51.100.7, 198.51.100.8';
    const blocked = await POST(callback({ 'x-api-key': API_KEY, 'x-forwarded-for': '203.0.113.9' }));
    expect(blocked.status).toBe(403);

    const allowed = await POST(
      callback({ 'x-api-key': API_KEY, 'x-forwarded-for': '198.51.100.8, 10.0.0.1' }),
    );
    expect(allowed.status).toBe(200);
  });
});
