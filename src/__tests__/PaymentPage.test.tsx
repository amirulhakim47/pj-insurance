import { render, screen, act, fireEvent } from '@testing-library/react';
import PaymentPage from '@/app/payment/page';
import { AGENT_DISPLAY_NAME } from '@/config/allianz-documents';

const mockPush = jest.fn();
const mockRouter = {
  push: mockPush,
  back: jest.fn(),
  replace: jest.fn(),
  prefetch: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
};

jest.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/payment',
}));

jest.mock('@/config/payment-provider', () => ({
  isStripePayment: () => false,
}));

jest.mock('@/lib/senangpay', () => ({
  SENANGPAY_CONFIG: {},
  generateSenangPayHash: jest.fn().mockResolvedValue({ hash: 'test-hash', merchantId: 'test-merchant' }),
}));

const mockQuotation = {
  contract: { contractNumber: 'CNAZ00004272328' },
  premium: {
    basicPremium: 1482.96,
    premiumDueRounded: 1315.95,
    ncdPct: 30,
    ncdAmt: 444.89,
    serviceTaxPercentage: 8,
    serviceTaxAmount: 85.45,
    stampDuty: 10,
    excessAmount: 0,
    commissionAmount: 150.0,
    commissionPercentage: 10,
  },
  additionalCover: [],
};

const mockFormData = {
  fullName: 'AHMAD BIN IBRAHIM',
  vehicleType: 'car',
  identityType: 'NRIC',
  nric: '841103-01-1116',
  plateNumber: 'VAP2104',
  postcode: '50000',
  phoneNumber: '0121234567',
  email: 'ahmad@example.com',
  customerType: 'individual',
  gender: 'M',
  maritalStatus: '0',
  isEhailing: false,
  isElectricVehicle: false,
  pdpaConsent: true,
};

const mockVehicleDetails = {
  contractNumber: 'CNAZ00004272328',
  vehicleLicenseId: 'VAP2104',
  vehicleMake: 'PROTON',
  vehicleModel: 'SAGA',
  vehicleModelDesc: 'SAGA',
  vehicleEngineCC: '1332',
  polEffectiveDate: '2026-08-30',
  polExpiryDate: '2027-08-29',
};

describe('PaymentPage', () => {
  let sessionData: Record<string, string>;

  beforeEach(() => {
    jest.clearAllMocks();
    sessionData = {
      allianz_quotation: JSON.stringify(mockQuotation),
      insuranceFormData: JSON.stringify(mockFormData),
      allianz_vehicleDetails: JSON.stringify(mockVehicleDetails),
    };
    (window.sessionStorage.getItem as jest.Mock).mockImplementation(
      (key: string) => sessionData[key] || null,
    );
    (window.sessionStorage.setItem as jest.Mock).mockImplementation(
      (key: string, value: string) => { sessionData[key] = value; },
    );
  });

  it('renders the payment page with order summary', async () => {
    await act(async () => { render(<PaymentPage />); });
    expect(screen.getByText('My Motor Insurance Details')).toBeInTheDocument();
    expect(screen.getByText('Motor Comprehensive Insurance')).toBeInTheDocument();
  });

  it('displays commission disclosure in premium breakdown', async () => {
    await act(async () => { render(<PaymentPage />); });
    expect(screen.getByText('Commission Disclosure')).toBeInTheDocument();
    expect(screen.getByText('Commission Rate')).toBeInTheDocument();
    expect(screen.getByText('10%')).toBeInTheDocument();
    expect(screen.getByText('Commission Amount')).toBeInTheDocument();
    expect(screen.getByText('RM 150.00')).toBeInTheDocument();
    expect(screen.getByText(new RegExp(AGENT_DISPLAY_NAME.replace(/[()]/g, '\\$&')))).toBeInTheDocument();
  });

  it('displays PDS acknowledgment checkbox unchecked', async () => {
    await act(async () => { render(<PaymentPage />); });
    const pdsCheckbox = screen.getByRole('checkbox', { name: /I confirm that I have read and understood/i });
    expect(pdsCheckbox).toBeInTheDocument();
    expect(pdsCheckbox).not.toBeChecked();
  });

  it('disables pay button when PDS is not acknowledged', async () => {
    await act(async () => { render(<PaymentPage />); });
    expect(screen.getByRole('button', { name: /Pay RM/i })).toBeDisabled();
  });

  it('enables pay button when PDS is acknowledged', async () => {
    await act(async () => { render(<PaymentPage />); });
    const pdsCheckbox = screen.getByRole('checkbox', { name: /I confirm that I have read and understood/i });
    await act(async () => { fireEvent.click(pdsCheckbox); });
    expect(screen.getByRole('button', { name: /Pay RM/i })).not.toBeDisabled();
  });
});
