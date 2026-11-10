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
  describe("Allianz's native callback payload (ReferenceNo / PolicyNo / BufferValue)", () => {
    const allianzPayload = {
      ReferenceNo: 'AOKJ0004405',
      PolicyNo: '26VKJM0000253-00',
      IncludeAttachment: 'Y',
      DestSystems: { DestSystem: 'DCAUTO' },
      BufferValue: Buffer.from('%PDF-1.4 test').toString('base64'),
    };
    const send = (body: object) =>
      POST(
        new NextRequest('https://hallu.com.my/api/callback', {
          method: 'POST',
          headers: { 'content-type': 'application/json', 'x-api-key': API_KEY },
          body: JSON.stringify(body),
        }),
      );

    it('accepts it, stores the metadata and decodes the PDF', async () => {
      const res = await send(allianzPayload);
      expect(res.status).toBe(200);
      const meta = JSON.parse(
        fs.readFileSync(path.join(storageDir, 'policies', 'AOKJ0004405.json'), 'utf-8'),
      );
      expect(meta).toMatchObject({
        contractNumber: 'AOKJ0004405',
        policyNumber: '26VKJM0000253-00',
        status: 'SUCCESS',
      });
      expect(fs.readFileSync(path.join(storageDir, 'policies', 'AOKJ0004405.pdf'), 'utf-8')).toBe(
        '%PDF-1.4 test',
      );
    });

    it('prefers the original field names when both formats are present', async () => {
      const res = await send({ ...allianzPayload, contractNumber: 'CNAZ00005359739', policyNumber: 'P-1', status: 'SUCCESS' });
      expect(res.status).toBe(200);
      expect(fs.existsSync(path.join(storageDir, 'policies', 'CNAZ00005359739.json'))).toBe(true);
    });
  });

  describe('lenient field matching and unmatched payloads', () => {
    const unmatchedDir = path.join(storageDir, 'callback-unmatched');
    const policyFile = (name: string) => path.join(storageDir, 'policies', name);
    const unmatchedFiles = () => (fs.existsSync(unmatchedDir) ? fs.readdirSync(unmatchedDir) : []);
    const send = (body: string | object, headers: Record<string, string> = { 'x-api-key': API_KEY }) =>
      POST(
        new NextRequest('https://hallu.com.my/api/callback', {
          method: 'POST',
          headers: { 'content-type': 'application/json', ...headers },
          body: typeof body === 'string' ? body : JSON.stringify(body),
        }),
      );

    beforeEach(() => {
      fs.rmSync(unmatchedDir, { recursive: true, force: true });
    });

    it('matches field names regardless of case, underscores and spacing', async () => {
      const res = await send({
        reference_no: 'CNAZLENIENT01',
        POLICY_NUMBER: '26VKJM0000300-00',
        bufferValue: Buffer.from('%PDF-1.7 lenient').toString('base64'),
      });
      expect(res.status).toBe(200);
      expect(JSON.parse(fs.readFileSync(policyFile('CNAZLENIENT01.json'), 'utf-8'))).toMatchObject({
        policyNumber: '26VKJM0000300-00',
        status: 'SUCCESS',
      });
      expect(fs.readFileSync(policyFile('CNAZLENIENT01.pdf'), 'utf-8')).toBe('%PDF-1.7 lenient');
      expect(unmatchedFiles()).toEqual([]);
    });

    it('finds the fields when Allianz wraps them in a nested object', async () => {
      const res = await send({ header: { source: 'ALLIANZ' }, data: { ReferenceNo: 'CNAZNESTED001', PolicyNo: 'P-NESTED' } });
      expect(res.status).toBe(200);
      expect(JSON.parse(fs.readFileSync(policyFile('CNAZNESTED001.json'), 'utf-8')).policyNumber).toBe('P-NESTED');
    });

    it('skips an unsafe candidate and uses the next alias that is a valid contract number', async () => {
      const res = await send({ ReferenceNo: '../escape', contractNumber: 'CNAZSAFE0001', policyNumber: 'P-SAFE' });
      expect(res.status).toBe(200);
      expect(fs.existsSync(policyFile('CNAZSAFE0001.json'))).toBe(true);
    });

    it('acknowledges a payload with no usable reference and keeps the raw body, including the PDF', async () => {
      const pdf = Buffer.from('%PDF-1.4 orphan').toString('base64');
      const res = await send({ SomeNewField: 'X123456789', PolicyNo: '26VKJM0000999-00', Attachment: pdf });
      expect(res.status).toBe(200);
      expect(await res.json()).toMatchObject({ received: true, matched: false });

      const files = unmatchedFiles();
      expect(files).toHaveLength(1);
      const saved = JSON.parse(fs.readFileSync(path.join(unmatchedDir, files[0]), 'utf-8'));
      expect(saved.reason).toBe('no_usable_reference');
      expect(saved.keys).toEqual(['SomeNewField', 'PolicyNo', 'Attachment']);
      expect(saved.body.Attachment).toBe(pdf);
      expect(JSON.stringify(saved)).not.toContain(API_KEY);
    });

    it('never saves anything for an unauthenticated request', async () => {
      const res = await send({ ReferenceNo: 'CNAZNOAUTH001' }, { 'x-api-key': 'wrong-key-value00' });
      expect(res.status).toBe(401);
      expect(unmatchedFiles()).toEqual([]);
      expect(fs.existsSync(policyFile('CNAZNOAUTH001.json'))).toBe(false);
    });

    it('keeps a body that is not valid JSON and answers 400', async () => {
      const res = await send('{ not json');
      expect(res.status).toBe(400);
      const saved = JSON.parse(fs.readFileSync(path.join(unmatchedDir, unmatchedFiles()[0]), 'utf-8'));
      expect(saved).toMatchObject({ reason: 'invalid_json', rawText: '{ not json' });
    });

    it('truncates oversized strings instead of filling the disk', async () => {
      const huge = 'A'.repeat(11 * 1024 * 1024);
      const res = await send({ Unknown: 'x', Blob: huge });
      expect(res.status).toBe(200);
      const file = path.join(unmatchedDir, unmatchedFiles()[0]);
      expect(fs.statSync(file).size).toBeLessThan(1024 * 1024);
      expect(JSON.parse(fs.readFileSync(file, 'utf-8')).body.Blob).toMatch(/omitted/);
    });
  });

  describe('audit log', () => {
    const auditDir = path.join(storageDir, 'callback-audit');
    const readAudit = () =>
      fs
        .readdirSync(auditDir)
        .flatMap((f) => fs.readFileSync(path.join(auditDir, f), 'utf-8').trim().split('\n'))
        .map((line) => JSON.parse(line) as Record<string, unknown>);

    beforeEach(() => {
      fs.rmSync(auditDir, { recursive: true, force: true });
    });

    it('records an accepted callback without the API key or PDF', async () => {
      await POST(
        callback(
          { 'x-api-key': API_KEY, 'x-forwarded-for': '203.0.113.9', 'user-agent': 'AllianzTest/1.0' },
          { contractNumber: 'CNAZ00005359739', policyPdf: 'QUJD' },
        ),
      );
      const [entry] = readAudit();
      expect(entry).toMatchObject({
        outcome: 'accepted',
        httpStatus: 200,
        ip: '203.0.113.9',
        userAgent: 'AllianzTest/1.0',
        contractNumber: 'CNAZ00005359739',
        policyNumber: '26VKJM0000228-00',
        apiKeyPresent: true,
        hasPdf: true,
      });
      const raw = JSON.stringify(entry);
      expect(raw).not.toContain(API_KEY);
      expect(raw).not.toContain('QUJD');
    });

    it('records rejected callbacks too, with the reason', async () => {
      await POST(callback({ 'x-api-key': 'wrong-key-value00', 'x-forwarded-for': '203.0.113.9' }));
      await POST(callback({ 'x-api-key': API_KEY }, { contractNumber: '../bad' }));
      const entries = readAudit();
      expect(entries.map((e) => e.outcome)).toEqual(['unauthorized', 'unmatched']);
      expect(entries[0]).toMatchObject({ httpStatus: 401, apiKeyPresent: true });
      expect(entries[0].contractNumber).toBeUndefined();
      expect(entries[1]).toMatchObject({ httpStatus: 200 });
      expect(entries[1].payloadKeys).toEqual(expect.arrayContaining(['contractNumber', 'policyNumber', 'status']));
    });

    it('records a request whose body is not valid JSON', async () => {
      const req = new NextRequest('https://hallu.com.my/api/callback', {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-api-key': API_KEY },
        body: 'not-json',
      });
      const res = await POST(req);
      expect(res.status).toBe(400);
      expect(readAudit()[0]).toMatchObject({ outcome: 'invalid_json', httpStatus: 400 });
    });

    it('does not break the callback when the audit directory is unwritable', async () => {
      fs.writeFileSync(auditDir, 'a file where the directory should be');
      const res = await POST(callback({ 'x-api-key': API_KEY }));
      expect(res.status).toBe(200);
      fs.rmSync(auditDir, { force: true });
    });
  });
  describe('history (no overwriting)', () => {
    const contract = 'CNAZ00005377080';
    const metaFile = () => path.join(storageDir, 'policies', `${contract}.json`);
    const read = () => JSON.parse(fs.readFileSync(metaFile(), 'utf-8'));

    beforeEach(() => {
      fs.rmSync(path.join(storageDir, 'policies'), { recursive: true, force: true });
    });

    it('keeps both policy numbers when Allianz re-issues for the same contract', async () => {
      const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
      await POST(callback({ 'x-api-key': API_KEY }, { contractNumber: contract, policyNumber: '26VKJ0005323-00' }));
      await POST(callback({ 'x-api-key': API_KEY }, { contractNumber: contract, policyNumber: '26VKJM0000254-00' }));

      const stored = read();
      expect(stored.policyNumber).toBe('26VKJM0000254-00');
      expect(stored.history.map((h: { policyNumber: string }) => h.policyNumber)).toEqual([
        '26VKJ0005323-00',
        '26VKJM0000254-00',
      ]);
      expect(warn.mock.calls.some((c) => String(c[0]).includes('POLICY NUMBER CHANGED'))).toBe(true);
      warn.mockRestore();
    });

    it('keeps a separate copy of each PDF', async () => {
      const pdfA = Buffer.from('%PDF-first').toString('base64');
      const pdfB = Buffer.from('%PDF-second').toString('base64');
      await POST(callback({ 'x-api-key': API_KEY }, { contractNumber: contract, policyPdf: pdfA }));
      await new Promise((r) => setTimeout(r, 5));
      await POST(callback({ 'x-api-key': API_KEY }, { contractNumber: contract, policyPdf: pdfB }));

      const stored = read();
      const [first, second] = stored.history.map((h: { pdfPath: string }) => h.pdfPath);
      expect(first).not.toBe(second);
      expect(fs.readFileSync(first, 'utf-8')).toBe('%PDF-first');
      expect(fs.readFileSync(second, 'utf-8')).toBe('%PDF-second');
      expect(fs.readFileSync(path.join(storageDir, 'policies', `${contract}.pdf`), 'utf-8')).toBe('%PDF-second');
    });

    it('carries a file written before history existed into the history', async () => {
      fs.mkdirSync(path.join(storageDir, 'policies'), { recursive: true });
      const legacy = {
        contractNumber: contract,
        policyNumber: '26VKJ0005323-00',
        status: 'SUCCESS',
        vehicleLicenseId: null,
        pdfPath: null,
        receivedAt: '2026-11-10T03:14:03.725Z',
      };
      fs.writeFileSync(metaFile(), JSON.stringify(legacy));
      await POST(callback({ 'x-api-key': API_KEY }, { contractNumber: contract, policyNumber: '26VKJM0000254-00' }));

      const stored = read();
      expect(stored.history).toHaveLength(2);
      expect(stored.history[0]).toEqual(legacy);
      expect(stored.policyNumber).toBe('26VKJM0000254-00');
    });
  });
});
