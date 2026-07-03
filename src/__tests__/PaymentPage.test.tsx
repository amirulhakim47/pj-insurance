import { render, screen, fireEvent, act } from '@testing-library/react';

const mockPush = jest.fn();
const mockBack = jest.fn();
const mockRouter = {
  push: mockPush,
  back: mockBack,
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

jest.mock('../lib/senangpay', () => ({
  SENANGPAY_CONFIG: { url: 'https://sandbox.senangpay.my/payment/test', merchantId: 'test', secretKey: 'test' },
  generateSenangPayHash: jest.fn().mockResolvedValue('mock-hash'),
}));

import PaymentPage from '@/app/payment/page';

const mockQuotation = {
  contract: { contractNumber: 'CNAZ00004272328', hrtvInd: false, highPerformanceInd: false, excessWaiveInd: false },
  premium: {
    basicPremium: 2215.40,
    annualPremium: 996.93,
    grossPremium: 996.93,
    premiumDue: 1086.48,
    premiumDueRounded: 1086.50,
    stampDuty: 10,
    serviceTaxPercentage: 8,
    serviceTaxAmount: 79.75,
    excessAmount: 0,
    ncdPct: 55,
    ncdAmt: 1218.47,
    rebatePct: 0,
    rebateAmt: 0,
    commissionAmount: 150.00,
    commissionPercentage: 10,
    basicAnnualPremium: 2215.40,
    premiumDueAfterPTV: 1086.48,
    premiumDueRoundedAfterPTV: 1086.50,
    packagePremium: 0,
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
  isEhailing: false,
  isElectricVehicle: false,
  pdpaConsent: true,
};

const mockVehicleDetails = {
  contractNumber: 'CNAZ00004272328',
  vehicleLicenseId: 'VAP2104',
  vehicleMake: 'PERODUA',
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
    expect(screen.getByText('Order Summary')).toBeInTheDocument();
    expect(screen.getByText('Allianz Motor Comprehensive')).toBeInTheDocument();
  });

  it('displays commission disclosure in premium breakdown', async () => {
    await act(async () => { render(<PaymentPage />); });
    expect(screen.getByText('Commission Disclosure')).toBeInTheDocument();
    expect(screen.getByText('Commission Rate')).toBeInTheDocument();
    expect(screen.getByText('10%')).toBeInTheDocument();
    expect(screen.getByText('Commission Amount')).toBeInTheDocument();
    expect(screen.getByText('RM 150.00')).toBeInTheDocument();
  });

  it('displays PDS acknowledgment checkbox unchecked', async () => {
    await act(async () => { render(<PaymentPage />); });
    const pdsCheckbox = screen.getByRole('checkbox', { name: /I confirm that I have read and understood/i });
    expect(pdsCheckbox).toBeInTheDocument();
    expect(pdsCheckbox).not.toBeChecked();
  });

  it('displays marketing consent checkbox unchecked', async () => {
    await act(async () => { render(<PaymentPage />); });
    const marketingCheckbox = screen.getByRole('checkbox', { name: /I consent to Allianz General/i });
    expect(marketingCheckbox).toBeInTheDocument();
    expect(marketingCheckbox).not.toBeChecked();
  });

  it('disables pay button when PDS is not acknowledged', async () => {
    await act(async () => { render(<PaymentPage />); });
    const payButton = screen.getByRole('button', { name: /Pay RM/i });
    expect(payButton).toBeDisabled();
  });

  it('enables pay button when PDS is acknowledged', async () => {
    await act(async () => { render(<PaymentPage />); });
    const pdsCheckbox = screen.getByRole('checkbox', { name: /I confirm that I have read and understood/i });
    await act(async () => { fireEvent.click(pdsCheckbox); });
    const payButton = screen.getByRole('button', { name: /Pay RM/i });
    expect(payButton).not.toBeDisabled();
  });

  it('shows warning message when PDS is not acknowledged', async () => {
    await act(async () => { render(<PaymentPage />); });
    expect(screen.getByText(/Please acknowledge the Product Disclosure Sheet/i)).toBeInTheDocument();
  });

  it('hides warning message after PDS is acknowledged', async () => {
    await act(async () => { render(<PaymentPage />); });
    const pdsCheckbox = screen.getByRole('checkbox', { name: /I confirm that I have read and understood/i });
    await act(async () => { fireEvent.click(pdsCheckbox); });
    expect(screen.queryByText(/Please acknowledge the Product Disclosure Sheet/i)).not.toBeInTheDocument();
  });

  it('stores marketing consent Y in sessionStorage on payment', async () => {
    await act(async () => { render(<PaymentPage />); });

    const pdsCheckbox = screen.getByRole('checkbox', { name: /I confirm that I have read and understood/i });
    const marketingCheckbox = screen.getByRole('checkbox', { name: /I consent to Allianz General/i });

    await act(async () => {
      fireEvent.click(pdsCheckbox);
      fireEvent.click(marketingCheckbox);
    });

    const payButton = screen.getByRole('button', { name: /Pay RM/i });
    await act(async () => { fireEvent.click(payButton); });

    expect(window.sessionStorage.setItem).toHaveBeenCalledWith('allianz_marketingConsent', 'Y');
  });

  it('stores marketing consent N when not checked', async () => {
    await act(async () => { render(<PaymentPage />); });

    const pdsCheckbox = screen.getByRole('checkbox', { name: /I confirm that I have read and understood/i });
    await act(async () => { fireEvent.click(pdsCheckbox); });

    const payButton = screen.getByRole('button', { name: /Pay RM/i });
    await act(async () => { fireEvent.click(payButton); });

    expect(window.sessionStorage.setItem).toHaveBeenCalledWith('allianz_marketingConsent', 'N');
  });

  it('displays premium total amount', async () => {
    await act(async () => { render(<PaymentPage />); });
    expect(screen.getByText('RM 1086.50')).toBeInTheDocument();
  });

  it('redirects to /results if no quotation in session', async () => {
    (window.sessionStorage.getItem as jest.Mock).mockReturnValue(null);
    await act(async () => { render(<PaymentPage />); });
    expect(mockPush).toHaveBeenCalledWith('/results');
  });
});
