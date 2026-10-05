import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCREENSHOTS_DIR = path.join(__dirname, '..', 'docs', 'demo-screenshots');
const BASE_URL = 'http://localhost:3000';

const DEMO_FORM_DATA = {
  fullName: 'AHMAD BIN ABDULLAH',
  vehicleType: 'car',
  plateNumber: 'VAP2104',
  nric: '841103-01-1116',
  postcode: '50000',
  customerType: 'individual',
  identityType: 'NRIC',
  email: 'demo@example.com',
  phoneNumber: '0121234567',
  isEhailing: false,
  isElectricVehicle: false,
  pdpaConsent: true,
};

async function run() {
  console.log('Capturing error scenario screenshots...\n');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: { width: 390, height: 844, isMobile: true, hasTouch: true },
  });

  const page = await browser.newPage();

  // First navigate to set sessionStorage on the correct origin
  await page.goto(BASE_URL, { waitUntil: 'networkidle0' });
  await page.evaluate((formData) => {
    sessionStorage.setItem('insuranceFormData', JSON.stringify(formData));
  }, DEMO_FORM_DATA);

  // Scenario 1: Not time to renew yet (UBBE002)
  console.log('Scenario 1: Policy not due for renewal yet...');
  await page.setRequestInterception(true);
  page.on('request', (req) => {
    if (req.url().includes('/api/vehicle-details')) {
      req.respond({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 400,
          code: 'UBB_REFER',
          message: 'Oops! Your motor policy will expire on 15/03/2027. Please come back again on 15/12/2026 to renew your motor policy.',
          ubbReferCodes: ['UBBE002'],
          policyExpiryDate: '2027-03-15',
        }),
      });
    } else {
      req.continue();
    }
  });

  await page.goto(`${BASE_URL}/loading`, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '10-error-not-due-yet.png'), fullPage: false });
  console.log('  ✓ 10-error-not-due-yet.png');

  // Scenario 2: Policy expired (UBBE001)
  console.log('Scenario 2: Policy already expired...');
  page.removeAllListeners('request');
  page.on('request', (req) => {
    if (req.url().includes('/api/vehicle-details')) {
      req.respond({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 400,
          code: 'UBB_REFER',
          message: 'Oops! Your previous policy expired on 01/01/2026 and therefore we are unable to process your request online.',
          ubbReferCodes: ['UBBE001'],
          policyExpiryDate: '2026-01-01',
        }),
      });
    } else {
      req.continue();
    }
  });

  await page.goto(`${BASE_URL}/loading`, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '11-error-policy-expired.png'), fullPage: false });
  console.log('  ✓ 11-error-policy-expired.png');

  // Scenario 3: UBB Risk block (UBBE003 - risk acceptance)
  console.log('Scenario 3: UBB risk block...');
  page.removeAllListeners('request');
  page.on('request', (req) => {
    if (req.url().includes('/api/vehicle-details')) {
      req.respond({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 400,
          code: 'UBB_REFER',
          message: 'Oops! We are sorry that we are unable to process your request due to our online risk acceptance controls.',
          ubbReferCodes: ['UBBE003'],
        }),
      });
    } else {
      req.continue();
    }
  });

  await page.goto(`${BASE_URL}/loading`, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '12-error-ubb-risk-block.png'), fullPage: false });
  console.log('  ✓ 12-error-ubb-risk-block.png');

  // Scenario 4: ID mismatch
  console.log('Scenario 4: NRIC / vehicle mismatch...');
  page.removeAllListeners('request');
  page.on('request', (req) => {
    if (req.url().includes('/api/vehicle-details')) {
      req.respond({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 400,
          code: 'UBB_REFER',
          message: 'Oops! The ID (NRIC / Old IC / Passport / Army / Police) no. does not match the vehicle no. provided. Please refer to your previous policy or vehicle registration card for the ID no. and retry.',
          ubbReferCodes: ['ID_MISMATCH'],
        }),
      });
    } else {
      req.continue();
    }
  });

  await page.goto(`${BASE_URL}/loading`, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '13-error-id-mismatch.png'), fullPage: false });
  console.log('  ✓ 13-error-id-mismatch.png');

  await page.setRequestInterception(false);
  await browser.close();

  console.log('\n✅ All error scenario screenshots captured!');
}

run();
