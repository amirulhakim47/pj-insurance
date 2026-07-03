import { render, screen, act } from '@testing-library/react';

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
  usePathname: () => '/thank-you',
}));

import ThankYouPage from '@/app/thank-you/page';

const mockQuotation = {
  contract: { contractNumber: 'CNAZ00004272328' },
  premium: {
    premiumDueRounded: 1086.50,
  },
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
};

describe('ThankYouPage', () => {
  let sessionData: Record<string, string>;

  beforeEach(() => {
    jest.clearAllMocks();
    sessionData = {
      allianz_quotation: JSON.stringify(mockQuotation),
      allianz_vehicleDetails: JSON.stringify(mockVehicleDetails),
      insuranceFormData: JSON.stringify(mockFormData),
    };
    (window.sessionStorage.getItem as jest.Mock).mockImplementation(
      (key: string) => sessionData[key] || null,
    );
  });

  it('renders payment successful message', async () => {
    await act(async () => { render(<ThankYouPage />); });
    expect(screen.getByText('Payment Successful!')).toBeInTheDocument();
  });

  it('displays policy summary with contract number', async () => {
    await act(async () => { render(<ThankYouPage />); });
    expect(screen.getByText('Policy Summary')).toBeInTheDocument();
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

  it('displays Free Look Period disclosure', async () => {
    await act(async () => { render(<ThankYouPage />); });
    expect(screen.getByText('Free Look Period')).toBeInTheDocument();
    expect(
      screen.getByText(/eligible for free-look for 15 days/i),
    ).toBeInTheDocument();
  });

  it('displays Refund Policy disclosure', async () => {
    await act(async () => { render(<ThankYouPage />); });
    expect(screen.getByText('Refund Policy')).toBeInTheDocument();
    expect(
      screen.getByText(/entitled to a premium refund upon cancellation/i),
    ).toBeInTheDocument();
  });

  it('has link to Allianz policy wording in refund section', async () => {
    await act(async () => { render(<ThankYouPage />); });
    const allianzLink = screen.getByRole('link', { name: /Allianz Malaysia/i });
    expect(allianzLink).toHaveAttribute(
      'href',
      'https://www.allianz.com.my/motor-comprehensive-insurance',
    );
  });

  it('displays download buttons', async () => {
    await act(async () => { render(<ThankYouPage />); });
    expect(screen.getByText(/Download Policy Schedule/i)).toBeInTheDocument();
    expect(screen.getByText(/Download Receipt/i)).toBeInTheDocument();
  });

  it('has a Return to Home button', async () => {
    await act(async () => { render(<ThankYouPage />); });
    expect(screen.getByRole('button', { name: /Return to Home/i })).toBeInTheDocument();
  });

  it('mentions email notification to user', async () => {
    await act(async () => { render(<ThankYouPage />); });
    expect(screen.getByText(/ahmad@example.com/)).toBeInTheDocument();
  });

  it('shows insurer name as Allianz', async () => {
    await act(async () => { render(<ThankYouPage />); });
    expect(screen.getByText('Allianz General Insurance')).toBeInTheDocument();
  });

  it('shows coverage period', async () => {
    await act(async () => { render(<ThankYouPage />); });
    expect(screen.getByText(/2026-08-30 to 2027-08-29/)).toBeInTheDocument();
  });
});
