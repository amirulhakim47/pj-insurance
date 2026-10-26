// Live UAT smoke test: drives the real UI against Allianz UAT up to quotation.
// Stops before payment/submission so no policy is issued.
// Usage: UAT_PLATE=... UAT_NRIC=... BASE_URL=http://localhost:3100 node scripts/e2e-uat-live-check.mjs
import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, '..', 'docs', 'uat-live-check');
const BASE_URL = process.env.BASE_URL || 'http://localhost:3100';
const PLATE = process.env.UAT_PLATE;
const NRIC = process.env.UAT_NRIC;

if (!PLATE || !NRIC) {
  console.error('UAT_PLATE and UAT_NRIC are required');
  process.exit(1);
}

const mask = (v) => (typeof v === 'string' && v.length > 4 ? `${v.slice(0, 2)}***${v.slice(-2)}` : '***');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function summarize(url, status, body) {
  const route = new URL(url).pathname;
  const b = body && typeof body === 'object' ? body : {};
  const premium = b.premium || b.quotation?.premium || {};
  return {
    route,
    status,
    code: b.code,
    message: b.message || b.errors?.[0]?.message || b.error,
    requestId: b.requestId,
    contractNumber: b.contractNumber || b.contract?.contractNumber,
    nvicCount: Array.isArray(b.nvicList) ? b.nvicList.length : undefined,
    referRiskList: b.ReferRiskList ?? b.UBBStatus?.ReferRiskList,
    premiumDue: premium.premiumDue ?? premium.premiumDueRounded,
  };
}

async function clickByText(page, selector, pattern) {
  const handle = await page.evaluateHandle(
    (sel, src) => {
      const re = new RegExp(src, 'i');
      return [...document.querySelectorAll(sel)].find((el) => re.test(el.textContent || '')) || null;
    },
    selector,
    pattern.source,
  );
  const el = handle.asElement();
  if (!el) return false;
  await el.click();
  return true;
}

async function typeInto(page, selector, value) {
  const el = await page.$(selector);
  if (!el) throw new Error(`Field not found: ${selector}`);
  await el.click();
  await el.evaluate((input) => input.select());
  await page.keyboard.press('Backspace');
  await el.type(value);
}

async function run() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  const calls = [];
  const consoleErrors = [];
  page.on('console', (m) => m.type() === 'error' && consoleErrors.push(m.text().slice(0, 200)));
  page.on('response', async (res) => {
    if (!res.url().includes('/api/') || res.request().method() === 'OPTIONS') return;
    let body;
    try {
      body = await res.json();
    } catch {
      body = undefined;
    }
    calls.push({ method: res.request().method(), ...summarize(res.url(), res.status(), body) });
  });

  const shot = (name) => page.screenshot({ path: path.join(OUT_DIR, `${name}.png`), fullPage: true });

  try {
    await page.goto(`${BASE_URL}/quote`, { waitUntil: 'networkidle0', timeout: 60000 });
    await clickByText(page, 'label', /individual/);
    await typeInto(page, 'input[placeholder="ENTER YOUR FULL NAME"]', 'UAT TEST USER');
    await clickByText(page, 'label', /^\s*car/);
    await typeInto(page, 'input[placeholder="123456-12-1234"]', NRIC);
    await typeInto(page, 'input[placeholder="ABC1234"]', PLATE);
    await typeInto(page, 'input[placeholder="50450"]', '50450');
    await typeInto(page, 'input[placeholder="0123456789"]', '0123456789');
    await typeInto(page, 'input[type="email"]', 'uat-test@example.com');
    const pdpa = await page.$('button[role="checkbox"], input[type="checkbox"]');
    if (pdpa) await pdpa.click();
    await sleep(500);
    await shot('01-form-filled');

    const submitDisabled = await page.$eval('button[type="submit"]', (b) => b.disabled);
    if (submitDisabled) throw new Error('Submit button still disabled — form validation failed');
    await page.click('button[type="submit"]');

    await page.waitForFunction(() => location.pathname.startsWith('/results') || document.body.innerText.match(/error|not found|unable/i), { timeout: 90000 });
    await sleep(4000);
    await shot('02-results');
    console.log('Landed on:', new URL(page.url()).pathname);

    if (new URL(page.url()).pathname.startsWith('/results')) {
      await clickByText(page, 'label', /^\s*No\s*$/);
      await sleep(300);
      await clickByText(page, 'button, [role="button"], div[class*="cursor-pointer"]', /Variant/);
      await sleep(500);
      const clicked = await clickByText(page, 'button', /get my quote/);
      console.log('Generate-quote button clicked:', clicked);
      if (clicked) {
        await sleep(45000);
        await shot('03-quote');
      }
    }

    const bodyText = await page.evaluate(() => document.body.innerText);
    const visibleError = bodyText.split('\n').find((l) => /error|unable|not found|refer|blocked/i.test(l));
    console.log('Visible error/notice on page:', visibleError ? visibleError.slice(0, 200) : 'none');
  } catch (err) {
    console.error('Run error:', err.message);
    await shot('99-error');
  } finally {
    console.log('\nAPI calls (PII masked):');
    for (const c of calls) {
      console.log(JSON.stringify(c, (k, v) => (k === 'vehicleLicenseId' ? mask(v) : v)));
    }
    if (consoleErrors.length) console.log('\nBrowser console errors:', consoleErrors.slice(0, 5));
    await browser.close();
  }
}

run();
