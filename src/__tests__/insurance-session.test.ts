import {
  BLOCKED_VEHICLE_LOOKUP_KEY,
  BLOCKED_VEHICLE_LOOKUP_TTL_MS,
  INSURANCE_FORM_DATA_KEY,
  INSURANCE_FORM_DRAFT_KEY,
  findBlockedVehicleLookup,
  rememberBlockedVehicleLookup,
  restoreInsuranceFormDraftFromSubmitted,
  vehicleDetailsPagePath,
} from '@/lib/insurance-session';

describe('insurance-session', () => {
  const store: Record<string, string> = {};

  beforeEach(() => {
    Object.keys(store).forEach((k) => delete store[k]);
    jest.mocked(sessionStorage.getItem).mockImplementation((key) => store[key] ?? null);
    jest.mocked(sessionStorage.setItem).mockImplementation((key, value) => {
      store[key] = value;
    });
    jest.mocked(sessionStorage.removeItem).mockImplementation((key) => {
      delete store[key];
    });
  });

  it('restores draft from submitted form data', () => {
    const payload = JSON.stringify({ fullName: 'ALI', plateNumber: 'ABC1234' });
    sessionStorage.setItem(INSURANCE_FORM_DATA_KEY, payload);
    restoreInsuranceFormDraftFromSubmitted();
    expect(sessionStorage.getItem(INSURANCE_FORM_DRAFT_KEY)).toBe(payload);
  });

  it('builds quote path with optional demo query', () => {
    expect(vehicleDetailsPagePath()).toBe('/quote');
    expect(vehicleDetailsPagePath({ demo: true })).toBe('/quote?demo=true');
  });

  describe('blocked vehicle lookup', () => {
    const blocked = {
      plateNumber: 'brx 1261',
      identityNumber: '900101-01-5555',
      code: 'NCD_CONFIRMATION_UNAVAILABLE',
      message: 'Cannot quote',
      requestId: 'req-1',
    };

    it('matches the same plate and ID regardless of spacing, case and dashes', () => {
      rememberBlockedVehicleLookup(blocked, 1_000);
      const found = findBlockedVehicleLookup(
        { plateNumber: 'BRX1261', identityNumber: '900101015555' },
        2_000,
      );
      expect(found).toMatchObject({ code: blocked.code, message: blocked.message, requestId: 'req-1' });
    });

    it('does not match a corrected plate or ID', () => {
      rememberBlockedVehicleLookup(blocked, 1_000);
      expect(
        findBlockedVehicleLookup({ plateNumber: 'BRX1262', identityNumber: '900101015555' }, 2_000),
      ).toBeNull();
      expect(
        findBlockedVehicleLookup({ plateNumber: 'BRX1261', identityNumber: '900101015556' }, 2_000),
      ).toBeNull();
    });

    it('expires and clears after the TTL', () => {
      rememberBlockedVehicleLookup(blocked, 1_000);
      expect(
        findBlockedVehicleLookup(
          { plateNumber: 'BRX1261', identityNumber: '900101015555' },
          1_000 + BLOCKED_VEHICLE_LOOKUP_TTL_MS + 1,
        ),
      ).toBeNull();
      expect(store[BLOCKED_VEHICLE_LOOKUP_KEY]).toBeUndefined();
    });

    it('ignores corrupt stored data', () => {
      store[BLOCKED_VEHICLE_LOOKUP_KEY] = '{not json';
      expect(
        findBlockedVehicleLookup({ plateNumber: 'BRX1261', identityNumber: '900101015555' }, 1),
      ).toBeNull();
    });
  });
});
