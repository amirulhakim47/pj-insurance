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

const DEMO_VEHICLE = {
  contractNumber: 'CNAZ00004272328',
  vehicleLicenseId: 'VAP2104',
  avMakeCode: '33', makeCode: '33',
  vehicleMake: 'PERODUA', modelCode: '10',
  vehicleModel: 'MYVI', vehicleModelDesc: 'MYVI',
  vehicleEngineCC: '1498', vehicleEngine: 'K3M48C',
  vehicleChassis: 'PM2B200S003264462', vehicleYear: '2023',
  vehicleSeat: '5', vehicleTransmission: 'AUTO', vehicleFuel: 'PETROL',
  polEffectiveDate: '2026-09-15', polExpiryDate: '2027-09-14',
  ncdPercentage: 55, prevNcdPercentage: 55, ismClaimsNo: 0,
  nvicList: [{ nvic: '33101FAAN', variant: 'MYVI 1.5 (A) AV', sumInsured: 45000, recommendInd: 'Y' }],
};

const DEMO_QUOTATION = {
  contract: { contractNumber: 'CNAZ00004272328', hrtvInd: false, highPerformanceInd: false, excessWaiveInd: false },
  premium: {
    basicPremium: 2215.40, annualPremium: 996.93, grossPremium: 996.93,
    premiumDue: 1086.48, premiumDueRounded: 1086.48,
    ncdAmount: 1218.47, ncdPct: 55, ncdAmt: 1218.47,
    serviceTaxPercentage: 8, serviceTaxAmount: 79.75, stampDuty: 10,
    commissionAmount: 99.69, commissionPercentage: 10, excessAmount: 400,
  },
  additionalCover: [
    { coverCode: 'WSC', coverName: 'Windscreen Cover', coverDescription: 'Windscreen Cover', coverSumInsured: 500, coverPremium: 62.50, displayPremium: 62.50, sequence: 1 },
    { coverCode: 'FLD', coverName: 'Special Perils (Flood/Storm)', coverDescription: 'Special Perils (Flood/Storm)', coverSumInsured: 0, coverPremium: 45.00, displayPremium: 45.00, sequence: 2 },
  ],
};

async function run() {
  console.log('Capturing missing step screenshots (Step 3 & Step 7)...\n');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: { width: 390, height: 844, isMobile: true, hasTouch: true },
  });

  const page = await browser.newPage();

  // ===== STEP 3: Loading Screen =====
  console.log('Step 3: Loading / Vehicle Lookup...');
  await page.goto(BASE_URL, { waitUntil: 'networkidle0' });

  // Set session data so loading page doesn't redirect
  await page.evaluate((formData) => {
    sessionStorage.setItem('insuranceFormData', JSON.stringify(formData));
  }, DEMO_FORM_DATA);

  // Intercept the vehicle-details API to keep loading state visible
  await page.setRequestInterception(true);
  const pendingRequests = [];
  page.on('request', (req) => {
    if (req.url().includes('/api/vehicle-details') || req.url().includes('/api/allianz/')) {
      pendingRequests.push(req);
    } else {
      req.continue();
    }
  });

  await page.goto(`${BASE_URL}/loading`, { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({
    path: path.join(SCREENSHOTS_DIR, '03b-loading-vehicle-lookup.png'),
    fullPage: false,
  });
  console.log('  ✓ 03b-loading-vehicle-lookup.png');

  // Abort pending requests
  for (const req of pendingRequests) {
    try { await req.abort(); } catch (e) {}
  }
  await page.setRequestInterception(false);
  page.removeAllListeners('request');

  // ===== STEP 7: Payment Verification =====
  console.log('Step 7: Payment Verification / Submission...');

  await page.goto(BASE_URL, { waitUntil: 'networkidle0' });

  // Set all needed session data
  await page.evaluate((formData, vehicle, quotation) => {
    sessionStorage.setItem('insuranceFormData', JSON.stringify(formData));
    sessionStorage.setItem('allianz_vehicleDetails', JSON.stringify(vehicle));
    sessionStorage.setItem('allianz_quotation', JSON.stringify(quotation));
    sessionStorage.setItem('allianz_selectedNvic', JSON.stringify(vehicle.nvicList[0]));
    sessionStorage.setItem('allianz_selectedAddons', JSON.stringify(['WSC', 'FLD']));
    sessionStorage.setItem('allianz_driverPlanCost', '0');
    sessionStorage.setItem('allianz_noOfClaims', '0');
    sessionStorage.setItem('allianz_customerDetails', JSON.stringify({
      fullName: formData.fullName,
      identityType: 'NRIC',
      identityNumber: formData.nric,
      email: formData.email,
      mobilePrefix: '012',
      mobileNumber: '1234567',
      addressLine1: '123, JALAN BUKIT BINTANG',
      addressLine2: 'TAMAN SRI HARTAMAS',
      postcode: '50000',
      city: 'KUALA LUMPUR',
      state: 'WP KUALA LUMPUR',
    }));
  }, DEMO_FORM_DATA, DEMO_VEHICLE, DEMO_QUOTATION);

  // Navigate to payment/status with simulated success params
  // Intercept the submission API to show the "submitting" state
  await page.setRequestInterception(true);
  const submissionRequests = [];
  page.on('request', (req) => {
    if (req.url().includes('/api/submission') || req.url().includes('/api/allianz/')) {
      submissionRequests.push(req);
    } else {
      req.continue();
    }
  });

  await page.goto(
    `${BASE_URL}/payment/status?status_id=1&order_id=HALLU-CNAZ00004272328-1724123456&transaction_id=14992013261&msg=Payment_was_successful&hash=abc123def456`,
    { waitUntil: 'domcontentloaded' }
  );
  await new Promise(r => setTimeout(r, 2500));
  await page.screenshot({
    path: path.join(SCREENSHOTS_DIR, '07b-payment-verification.png'),
    fullPage: false,
  });
  console.log('  ✓ 07b-payment-verification.png');

  // Abort pending submission
  for (const req of submissionRequests) {
    try { await req.abort(); } catch (e) {}
  }
  await page.setRequestInterception(false);
  page.removeAllListeners('request');

  // ===== RE-CAPTURE: Customer Details (Step 5) to verify =====
  console.log('Step 5: Customer Details (re-verify)...');
  await page.goto(BASE_URL, { waitUntil: 'networkidle0' });
  await page.evaluate((formData, vehicle, quotation) => {
    sessionStorage.setItem('insuranceFormData', JSON.stringify(formData));
    sessionStorage.setItem('allianz_vehicleDetails', JSON.stringify(vehicle));
    sessionStorage.setItem('allianz_quotation', JSON.stringify(quotation));
    sessionStorage.setItem('allianz_selectedNvic', JSON.stringify(vehicle.nvicList[0]));
    sessionStorage.setItem('allianz_noOfClaims', '0');
  }, DEMO_FORM_DATA, DEMO_VEHICLE, DEMO_QUOTATION);

  await page.goto(`${BASE_URL}/customer-details`, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({
    path: path.join(SCREENSHOTS_DIR, '06-customer-details.png'),
    fullPage: false,
  });
  console.log('  ✓ 06-customer-details.png (re-captured)');

  await browser.close();
  console.log('\n✅ Missing screenshots captured!');
}

run();
