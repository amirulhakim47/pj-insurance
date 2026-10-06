import { render, screen, act } from '@testing-library/react';
import ThankYouPage from '@/app/thank-you/page';
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, back: jest.fn(), replace: jest.fn(), prefetch: jest.fn(), forward: jest.fn(), refresh: jest.fn() }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/thank-you',
}));

const mockQuotation = {
  contract: { contractNumber: 'CNAZ00004272328' },
  premium: { premiumDueRounded: 1086.50 },
  additionalCover: [],
};

const mockVehicleDetails = {
  contractNumber: 'CNAZ00004272328',
  vehicleLicenseId: 'VAP2104',
  vehicleMake: 'PERODUA',
  vehicleModel: 'MYVI',
  vehicleModelDesc: 'MYVI',
  polEffectiveDate: '2026-08-30',
  polExpiryDate: '2027-08-29',
};

const mockFormData = {
  fullName: 'AHMAD BIN IBRAHIM',
  email: 'ahmad@example.com',
  nric: '841103-01-1116',
};

describe('ThankYouPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ ready: false }),
    }) as jest.Mock;
    const sessionData: Record<string, string> = {
      allianz_quotation: JSON.stringify(mockQuotation),
      allianz_vehicleDetails: JSON.stringify(mockVehicleDetails),
      insuranceFormData: JSON.stringify(mockFormData),
      policyAccessToken: 'test-token',
    };
    (window.sessionStorage.getItem as jest.Mock).mockImplementation(
      (key: string) => sessionData[key] || null,
    );
  });

  it('renders payment successful message', async () => {
    await act(async () => { render(<ThankYouPage />); });
    expect(screen.getByText('Payment successful')).toBeInTheDocument();
  });

  it('displays policy summary with contract number', async () => {
    await act(async () => { render(<ThankYouPage />); });
    expect(screen.getByText('Policy summary')).toBeInTheDocument();
    expect(screen.getByText('CNAZ00004272328')).toBeInTheDocument();
  });

  it('displays vehicle license ID', async () => {
    await act(async () => { render(<ThankYouPage />); });
    expect(screen.getByText('VAP2104')).toBeInTheDocument();
  });

  it('displays total paid amount', async () => {
    await act(async () => { render(<ThankYouPage />); });
    expect(screen.getByText('RM 1086.50')).toBeInTheDocument();
  });

  it('shows policy processing message while waiting for callback', async () => {
    await act(async () => { render(<ThankYouPage />); });
    expect(screen.getByText(/checking for your policy document/i)).toBeInTheDocument();
    expect(screen.getByText(/sent to you via email once it/i)).toBeInTheDocument();
  });

  it('has a Return to Home button', async () => {
    await act(async () => { render(<ThankYouPage />); });
    expect(screen.getByRole('button', { name: /Return to Home/i })).toBeInTheDocument();
  });

  it('mentions email notification to user', async () => {
    await act(async () => { render(<ThankYouPage />); });
    expect(screen.getByText(/ahmad@example.com/)).toBeInTheDocument();
  });
});
