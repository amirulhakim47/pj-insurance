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
  avMakeCode: '33',
  makeCode: '33',
  vehicleMake: 'PERODUA',
  modelCode: '10',
  vehicleModel: 'MYVI',
  vehicleModelDesc: 'MYVI',
  vehicleEngineCC: '1498',
  vehicleEngine: 'K3M48C',
  vehicleChassis: 'PM2B200S003264462',
  vehicleYear: '2023',
  vehicleSeat: '5',
  vehicleTransmission: 'AUTO',
  vehicleFuel: 'PETROL',
  polEffectiveDate: '2026-09-15',
  polExpiryDate: '2027-09-14',
  ncdPercentage: 55,
  prevNcdPercentage: 55,
  ismClaimsNo: 0,
  nvicList: [
    {
      nvic: '33101FAAN',
      variant: 'MYVI 1.5 (A) AV',
      sumInsured: 45000,
      recommendInd: 'Y',
    },
  ],
};

const DEMO_QUOTATION = {
  contract: { contractNumber: 'CNAZ00004272328', hrtvInd: false, highPerformanceInd: false, excessWaiveInd: false },
  premium: {
    basicPremium: 2215.40,
    annualPremium: 996.93,
    grossPremium: 996.93,
    premiumDue: 1086.48,
    premiumDueRounded: 1086.48,
    ncdAmount: 1218.47,
    ncdPct: 55,
    ncdAmt: 1218.47,
    serviceTaxPercentage: 8,
    serviceTaxAmount: 79.75,
    stampDuty: 10,
    commissionAmount: 99.69,
    commissionPercentage: 10,
    excessAmount: 400,
  },
  additionalCover: [
    { coverCode: 'WSC', coverName: 'Windscreen Cover', coverDescription: 'Windscreen Cover', coverSumInsured: 500, coverPremium: 62.50, displayPremium: 62.50, sequence: 1 },
    { coverCode: 'FLD', coverName: 'Special Perils (Flood/Storm)', coverDescription: 'Special Perils (Flood/Storm)', coverSumInsured: 0, coverPremium: 45.00, displayPremium: 45.00, sequence: 2 },
  ],
};

const DEMO_CUSTOMER_DETAILS = {
  address1: '123, JALAN BUKIT BINTANG',
  address2: 'TAMAN SRI HARTAMAS',
  address3: '',
  postcode: '50000',
  city: 'KUALA LUMPUR',
  state: 'WP KUALA LUMPUR',
  nationality: 'MALAYSIA',
  maritalStatus: 'MARRIED',
  mobilePrefix: '012',
  mobileNumber: '1234567',
};

async function run() {
  console.log('Starting E2E demo screenshot capture...\n');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: { width: 390, height: 844, isMobile: true, hasTouch: true },
  });

  const page = await browser.newPage();
  let stepNum = 0;

  async function screenshot(name, description) {
    stepNum++;
    const filename = `${String(stepNum).padStart(2, '0')}-${name}.png`;
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, filename), fullPage: false });
    console.log(`✓ Step ${stepNum}: ${description} → ${filename}`);
  }

  try {
    // Step 1: Landing Page (hero)
    await page.goto(BASE_URL, { waitUntil: 'networkidle0', timeout: 30000 });
    await new Promise(r => setTimeout(r, 500));
    await screenshot('landing-page', 'Landing Page - Hero section with plate number input');

    // Step 2: Quote Form (empty - top)
    await page.goto(`${BASE_URL}/quote`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 500));
    await screenshot('quote-form-empty', 'Quote Form - Empty form ready for user input');

    // Step 3: Quote Form (filled - scroll to show fields)
    const nameInput = await page.$('input[name="fullName"], input[placeholder*="name" i]');
    if (nameInput) {
      await nameInput.click({ clickCount: 3 });
      await nameInput.type('AHMAD BIN ABDULLAH');
    }

    const nricInput = await page.$('input[name="nric"], input[placeholder*="NRIC" i], input[placeholder*="nric" i]');
    if (nricInput) {
      await nricInput.click({ clickCount: 3 });
      await nricInput.type('841103011116');
    }

    const plateInput = await page.$('input[name="plateNumber"], input[placeholder*="plate" i]');
    if (plateInput) {
      await plateInput.click({ clickCount: 3 });
      await plateInput.type('VAP2104');
    }

    const postcodeInput = await page.$('input[name="postcode"], input[placeholder*="postcode" i]');
    if (postcodeInput) {
      await postcodeInput.click({ clickCount: 3 });
      await postcodeInput.type('50000');
    }

    const phoneInput = await page.$('input[name="phoneNumber"], input[placeholder*="phone" i]');
    if (phoneInput) {
      await phoneInput.click({ clickCount: 3 });
      await phoneInput.type('0121234567');
    }

    const emailInput = await page.$('input[name="email"], input[type="email"]');
    if (emailInput) {
      await emailInput.click({ clickCount: 3 });
      await emailInput.type('demo@example.com');
    }

    await new Promise(r => setTimeout(r, 500));
    // Scroll to show the filled fields
    await page.evaluate(() => { window.scrollTo(0, 200); });
    await new Promise(r => setTimeout(r, 300));
    await screenshot('quote-form-filled', 'Quote Form - Filled with customer details (NRIC, plate, contact)');

    // Step 4: Results Page (Demo mode)
    await page.evaluate((formData, vehicle, quotation) => {
      sessionStorage.setItem('insuranceFormData', JSON.stringify(formData));
      sessionStorage.setItem('allianz_vehicleDetails', JSON.stringify(vehicle));
      sessionStorage.setItem('allianz_quotation', JSON.stringify(quotation));
      sessionStorage.setItem('allianz_selectedNvic', JSON.stringify(vehicle.nvicList[0]));
      sessionStorage.setItem('allianz_noOfClaims', '0');
    }, DEMO_FORM_DATA, DEMO_VEHICLE, DEMO_QUOTATION);

    await page.goto(`${BASE_URL}/results?demo=true`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 2000));
    await screenshot('results-vehicle-info', 'Results - Vehicle information and variant selection');

    // Scroll down to show variant selection
    await page.evaluate(() => { window.scrollTo(0, 500); });
    await new Promise(r => setTimeout(r, 500));
    await screenshot('results-quotation', 'Results - Variant selection and Get Quote button');

    // Generate quote if button is visible
    const quoteBtn = await page.evaluateHandle(() => {
      const buttons = [...document.querySelectorAll('button')];
      return buttons.find(b => /generate quote|get quote/i.test(b.textContent)) || null;
    });
    if (quoteBtn && quoteBtn.asElement()) {
      await quoteBtn.asElement().click();
      await new Promise(r => setTimeout(r, 2000));
      await screenshot('results-quote-generated', 'Results - Generated quote with premium breakdown');
    }

    // Step 5: Customer Details
    await page.evaluate((formData, vehicle, quotation, customerDetails) => {
      sessionStorage.setItem('insuranceFormData', JSON.stringify(formData));
      sessionStorage.setItem('allianz_vehicleDetails', JSON.stringify(vehicle));
      sessionStorage.setItem('allianz_quotation', JSON.stringify(quotation));
      sessionStorage.setItem('allianz_selectedNvic', JSON.stringify(vehicle.nvicList[0]));
      sessionStorage.setItem('allianz_customerDetails', JSON.stringify(customerDetails));
      sessionStorage.setItem('allianz_noOfClaims', '0');
    }, DEMO_FORM_DATA, DEMO_VEHICLE, DEMO_QUOTATION, DEMO_CUSTOMER_DETAILS);

    await page.goto(`${BASE_URL}/customer-details`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 1000));
    await screenshot('customer-details', 'Customer Details - Address and personal information form');

    // Step 6: Payment Page
    await page.evaluate((formData, vehicle, quotation, customerDetails) => {
      sessionStorage.setItem('insuranceFormData', JSON.stringify(formData));
      sessionStorage.setItem('allianz_vehicleDetails', JSON.stringify(vehicle));
      sessionStorage.setItem('allianz_quotation', JSON.stringify(quotation));
      sessionStorage.setItem('allianz_selectedNvic', JSON.stringify(vehicle.nvicList[0]));
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
      sessionStorage.setItem('allianz_selectedAddons', JSON.stringify(['WSC', 'FLD']));
      sessionStorage.setItem('allianz_driverPlanCost', '0');
      sessionStorage.setItem('allianz_noOfClaims', '0');
    }, DEMO_FORM_DATA, DEMO_VEHICLE, DEMO_QUOTATION, DEMO_CUSTOMER_DETAILS);

    await page.goto(`${BASE_URL}/payment`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 1500));
    await screenshot('payment-page', 'Payment - Order summary and SenangPay checkout');

    // Step 7: Thank You Page (simulate success)
    await page.evaluate((formData, vehicle, quotation) => {
      sessionStorage.setItem('insuranceFormData', JSON.stringify(formData));
      sessionStorage.setItem('allianz_vehicleDetails', JSON.stringify(vehicle));
      sessionStorage.setItem('allianz_quotation', JSON.stringify(quotation));
      sessionStorage.setItem('payment_status', 'success');
      sessionStorage.setItem('allianz_submission', JSON.stringify({
        status: 'Success',
        contractNumber: 'CNAZ00004272328',
        policyNumber: 'POL-2026-001234',
      }));
    }, DEMO_FORM_DATA, DEMO_VEHICLE, DEMO_QUOTATION);

    await page.goto(`${BASE_URL}/thank-you`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 1000));
    await screenshot('thank-you-page', 'Thank You - Policy confirmation and next steps');

    // Step 8: PDPA Policy Page
    await page.goto(`${BASE_URL}/pdpa-policy`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 500));
    await screenshot('pdpa-policy', 'PDPA Policy - Data protection and privacy notice');

    console.log(`\n✅ All screenshots captured successfully in: docs/demo-screenshots/`);
    console.log(`   Total: ${stepNum} screenshots`);

  } catch (error) {
    console.error('Error during screenshot capture:', error.message);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'error-state.png'), fullPage: true });
  } finally {
    await browser.close();
  }
}

run();
