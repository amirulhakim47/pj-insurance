import { render, screen, act } from '@testing-library/react';

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
  usePathname: () => '/customer-details',
}));

import CustomerDetailsPage from '@/app/customer-details/page';

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
  vehicleEngineCC: '1498',
  yearOfManufacture: '2022',
  ncdPercentage: 55,
  polEffectiveDate: '2026-08-30',
  polExpiryDate: '2027-08-29',
};

describe('CustomerDetailsPage', () => {
  let sessionData: Record<string, string>;

  beforeEach(() => {
    jest.clearAllMocks();
    sessionData = {
      insuranceFormData: JSON.stringify(mockFormData),
      allianz_quotation: JSON.stringify(mockQuotation),
      allianz_vehicleDetails: JSON.stringify(mockVehicleDetails),
    };
    (window.sessionStorage.getItem as jest.Mock).mockImplementation(
      (key: string) => sessionData[key] || null,
    );
    (window.sessionStorage.setItem as jest.Mock).mockImplementation(
      (key: string, value: string) => { sessionData[key] = value; },
    );
  });

  it('renders the page with all form sections', async () => {
    await act(async () => { render(<CustomerDetailsPage />); });
    expect(screen.getByText('Policyholder Details')).toBeInTheDocument();
    expect(screen.getByText('Personal Information')).toBeInTheDocument();
    expect(screen.getByText('Contact Information')).toBeInTheDocument();
    expect(screen.getByText('Address')).toBeInTheDocument();
  });

  it('pre-fills full name from form data', async () => {
    await act(async () => { render(<CustomerDetailsPage />); });
    const nameField = screen.getByDisplayValue('AHMAD BIN IBRAHIM');
    expect(nameField).toBeInTheDocument();
  });

  it('pre-fills email from form data', async () => {
    await act(async () => { render(<CustomerDetailsPage />); });
    const emailField = screen.getByDisplayValue('ahmad@example.com');
    expect(emailField).toBeInTheDocument();
  });

  it('pre-fills postcode from form data', async () => {
    await act(async () => { render(<CustomerDetailsPage />); });
    const postcodeField = screen.getByDisplayValue('50000');
    expect(postcodeField).toBeInTheDocument();
  });

  it('derives DOB from NRIC (841103 = 1984-11-03)', async () => {
    await act(async () => { render(<CustomerDetailsPage />); });
    const dobField = screen.getByDisplayValue('1984-11-03');
    expect(dobField).toBeInTheDocument();
  });

  it('derives gender from NRIC (last digit 6 = Female)', async () => {
    await act(async () => { render(<CustomerDetailsPage />); });
    const genderSelect = screen.getByDisplayValue('Female');
    expect(genderSelect).toBeInTheDocument();
  });

  it('shows vehicle summary card', async () => {
    await act(async () => { render(<CustomerDetailsPage />); });
    expect(screen.getByText(/VAP2104/)).toBeInTheDocument();
    expect(screen.getByText(/PERODUA/)).toBeInTheDocument();
  });

  it('has a back button', async () => {
    await act(async () => { render(<CustomerDetailsPage />); });
    expect(screen.getByRole('button', { name: /Back/i })).toBeInTheDocument();
  });

  it('has a proceed to payment button', async () => {
    await act(async () => { render(<CustomerDetailsPage />); });
    expect(screen.getByRole('button', { name: /Proceed to Payment/i })).toBeInTheDocument();
  });

  it('redirects to /results if no form data in session', async () => {
    (window.sessionStorage.getItem as jest.Mock).mockReturnValue(null);
    await act(async () => { render(<CustomerDetailsPage />); });
    expect(mockPush).toHaveBeenCalledWith('/results');
  });

  it('displays marital status selector', async () => {
    await act(async () => { render(<CustomerDetailsPage />); });
    expect(screen.getByText(/Marital/i)).toBeInTheDocument();
  });

  it('displays mobile number field', async () => {
    await act(async () => { render(<CustomerDetailsPage />); });
    expect(screen.getByText(/Mobile/i)).toBeInTheDocument();
  });
});
