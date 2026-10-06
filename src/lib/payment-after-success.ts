import { submitTransaction } from '@/lib/allianz-api';
import type { InsuranceFormData } from '@/types';
import type { QuotationResponse, VehicleDetailsResponse, NvicItem, IdentityType, Gender } from '@/types/allianz';

function extractGenderFromNRIC(nric: string): Gender {
  const digits = nric.replace(/-/g, '');
  const lastDigit = Number.parseInt(digits[digits.length - 1], 10);
  return lastDigit % 2 === 0 ? 'F' : 'M';
}

function extractBirthDateFromNRIC(nric: string): string {
  const digits = nric.replace(/-/g, '');
  const yy = digits.substring(0, 2);
  const mm = digits.substring(2, 4);
  const dd = digits.substring(4, 6);
  const year = Number.parseInt(yy, 10) > 30 ? `19${yy}` : `20${yy}`;
  return `${year}-${mm}-${dd}`;
}

async function submitWithRetry(
  params: Parameters<typeof submitTransaction>[0],
  maxRetries = 3,
): Promise<{ Status: string }> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await submitTransaction(params);
    } catch (err: unknown) {
      const apiErr = err as { status?: number };
      if (apiErr?.status === 500 && attempt < maxRetries) {
        const delay = Math.min(2000 * 2 ** attempt, 15000);
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }
      throw err;
    }
  }
  throw new Error('Max retries exceeded');
}

/** After payment is verified, submit policy to Allianz (non-blocking errors logged by caller). */
export async function submitAllianzAfterPayment(
  paymentOrderId: string,
  transactionId: string,
  paymentMode: string,
): Promise<void> {
  const formDataRaw = sessionStorage.getItem('insuranceFormData');
  const quotationRaw = sessionStorage.getItem('allianz_quotation');
  if (!formDataRaw || !quotationRaw) return;

  const vehicleRaw = sessionStorage.getItem('allianz_vehicleDetails');
  const nvicRaw = sessionStorage.getItem('allianz_selectedNvic');
  const marketingConsent = sessionStorage.getItem('allianz_marketingConsent') || 'N';
  const customerDetailsRaw = sessionStorage.getItem('allianz_customerDetails');
  const driverPlan = sessionStorage.getItem('allianz_driverPlan') || '0';
  const additionalDriversRaw = sessionStorage.getItem('allianz_additionalDrivers');
  const ehailingDriverRaw = sessionStorage.getItem('allianz_ehailingDriver');
  const selectedAddonsRaw = sessionStorage.getItem('allianz_selectedAddons');

  const formData: InsuranceFormData = JSON.parse(formDataRaw);
  const quotation: QuotationResponse = JSON.parse(quotationRaw);
  const vehicleDetails: VehicleDetailsResponse | null = vehicleRaw ? JSON.parse(vehicleRaw) : null;
  const selectedNvic: NvicItem | null = nvicRaw ? JSON.parse(nvicRaw) : null;

  let mobilePrefix = '6012';
  let mobile = formData.phoneNumber;
  let fullName = formData.fullName;
  let email = formData.email;
  let postalCode = formData.postcode;
  let addressLine1 = formData.postcode;
  let addressLine2: string | undefined;
  let addressLine3: string | undefined;

  if (customerDetailsRaw) {
    const cd = JSON.parse(customerDetailsRaw);
    mobilePrefix = cd.mobilePrefix || mobilePrefix;
    mobile = cd.mobileNumber || mobile;
    fullName = cd.fullName || fullName;
    email = cd.email || email;
    postalCode = cd.postcode || postalCode;
    addressLine1 = cd.addressLine1 || addressLine1;
    addressLine2 = cd.addressLine2 || undefined;
    addressLine3 = cd.addressLine3 || undefined;
  } else {
    const phoneParts = formData.phoneNumber.match(/^(\+?6?0\d{1,2})(\d{7,8})$/);
    mobilePrefix = phoneParts ? phoneParts[1] : '6012';
    mobile = phoneParts ? phoneParts[2] : formData.phoneNumber;
  }

  const driverDetails: Array<{ fullName: string; identityNumber: string; driverType?: string }> = [];

  if ((driverPlan === '1' || driverPlan === '2') && additionalDriversRaw) {
    const drivers = JSON.parse(additionalDriversRaw);
    drivers.forEach((d: { fullName: string; idNumber: string }) => {
      if (d.fullName && d.idNumber) {
        driverDetails.push({ fullName: d.fullName, identityNumber: d.idNumber });
      }
    });
  }

  if (selectedAddonsRaw) {
    const addons: string[] = JSON.parse(selectedAddonsRaw);
    if (addons.includes('A202') && ehailingDriverRaw) {
      const ehd = JSON.parse(ehailingDriverRaw);
      if (ehd.fullName && ehd.idNumber) {
        driverDetails.push({
          fullName: ehd.fullName,
          identityNumber: ehd.idNumber,
          driverType: 'EHAIL',
        });
      }
    }
  }

  const totalAmount = quotation.premium.premiumDueRounded.toFixed(2);

  await submitWithRetry({
    paymentOrderId,
    salesChannel: 'PTR',
    contract: {
      contractNumber: quotation.contract.contractNumber,
      emarketingConsentInd: marketingConsent as 'Y' | 'N',
    },
    person: {
      identityType: (formData.identityType as IdentityType) || 'NRIC',
      identityNumber: formData.nric.replace(/-/g, ''),
      fullName,
      birthDate: extractBirthDateFromNRIC(formData.nric),
      gender: formData.customerType === 'company' ? 'C' : extractGenderFromNRIC(formData.nric),
      email,
      postalCode,
      mobilePrefix,
      mobile,
      addressLine1,
      addressLine2,
      addressLine3,
    },
    vehicle: {
      nvicCode: selectedNvic?.nvic || '',
      vehicleEngineCC: vehicleDetails?.vehicleEngineCC || '',
      yearOfManufacture: vehicleDetails?.yearOfManufacture || '',
      occupantsNumber: vehicleDetails?.seatingCapacity || 5,
    },
    driverDetails,
    payment: {
      paymentMode,
      paymentBankRef: transactionId,
      paymentId: transactionId,
      paymentDate: new Date().toISOString().replace('T', ' ').substring(0, 19),
      paymentAmount: totalAmount,
    },
  });
}
