import { resolveNvicCode } from '@/lib/payment-after-success';
import type { NvicItem, VehicleDetailsResponse } from '@/types/allianz';

const nvic = (code: string, recommendInd?: string): NvicItem => ({
  nvic: code,
  vehicleMarketValue: 40000,
  vehicleVariant: `${code} VARIANT`,
  recommendInd,
});

const vehicleWith = (nvicList: NvicItem[]) => ({ nvicList }) as VehicleDetailsResponse;

describe('resolveNvicCode', () => {
  it('uses the stored customer selection first', () => {
    const vehicle = vehicleWith([nvic('AAA11A', 'Y')]);
    expect(resolveNvicCode(nvic('SEL22B'), vehicle)).toBe('SEL22B');
  });

  it('falls back to the recommended variant when nothing was stored', () => {
    const vehicle = vehicleWith([nvic('AAA11A'), nvic('REC33C', 'Y')]);
    expect(resolveNvicCode(null, vehicle)).toBe('REC33C');
  });

  it('falls back to the only variant when none is recommended', () => {
    expect(resolveNvicCode(null, vehicleWith([nvic('ONE44D')]))).toBe('ONE44D');
  });

  it('returns an empty string when no NVIC is available', () => {
    expect(resolveNvicCode(null, vehicleWith([]))).toBe('');
    expect(resolveNvicCode(null, null)).toBe('');
  });
});

describe('submitAllianzAfterPayment nvicCode', () => {
  const submitTransaction = jest.fn();

  beforeEach(() => {
    jest.resetModules();
    submitTransaction.mockReset().mockResolvedValue({ Status: 'Success' });
    jest.doMock('@/lib/allianz-api', () => ({ submitTransaction }));
    const store: Record<string, string> = {};
    (sessionStorage.getItem as jest.Mock).mockImplementation((k: string) => store[k] ?? null);
    (sessionStorage.setItem as jest.Mock).mockImplementation((k: string, v: string) => {
      store[k] = v;
    });
    sessionStorage.setItem(
      'insuranceFormData',
      JSON.stringify({
        fullName: 'Test User',
        nric: '631210-10-6235',
        phoneNumber: '0123456789',
        email: 'test@example.com',
        postcode: '50450',
        identityType: 'NRIC',
        customerType: 'individual',
      }),
    );
    sessionStorage.setItem(
      'allianz_quotation',
      JSON.stringify({ contract: { contractNumber: 'CNAZ00000000001' }, premium: { premiumDueRounded: 690.4 } }),
    );
    sessionStorage.setItem(
      'allianz_vehicleDetails',
      JSON.stringify({ vehicleEngineCC: '1497', yearOfManufacture: '2014', seatingCapacity: 5, nvicList: [nvic('REC33C', 'Y')] }),
    );
  });

  it('sends the recommended NVIC when the user never clicked a variant (allianz_selectedNvic unset)', async () => {
    const { submitAllianzAfterPayment } = await import('@/lib/payment-after-success');
    await submitAllianzAfterPayment('ORDER-1', 'pi_123', 'Stripe');
    expect(submitTransaction).toHaveBeenCalledTimes(1);
    expect(submitTransaction.mock.calls[0][0].vehicle.nvicCode).toBe('REC33C');
  });
});
