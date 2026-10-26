import {
  BLOCKED_VEHICLE_LOOKUP_KEY,
  BLOCKED_VEHICLE_LOOKUP_TTL_MS,
  COMPLETED_JOURNEY_KEY,
  INSURANCE_FORM_DATA_KEY,
  INSURANCE_FORM_DRAFT_KEY,
  clearCompletedJourney,
  findBlockedVehicleLookup,
  getCompletedJourney,
  markJourneyCompleted,
  rememberBlockedVehicleLookup,
  restoreInsuranceFormDraftFromSubmitted,
  startNewJourneyAfterPayment,
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

  describe('completed journey lock', () => {
    it('is not set for a fresh session', () => {
      expect(getCompletedJourney()).toBeNull();
    });

    it('records the paid contract and timestamp', () => {
      markJourneyCompleted('CNAZ00005349366', 5_000);
      expect(getCompletedJourney()).toEqual({ contractNumber: 'CNAZ00005349366', completedAt: 5_000 });
    });

    it('is cleared when a new journey starts', () => {
      markJourneyCompleted('CNAZ00005349366', 5_000);
      clearCompletedJourney();
      expect(getCompletedJourney()).toBeNull();
      expect(store[COMPLETED_JOURNEY_KEY]).toBeUndefined();
    });

    it('drops the paid quotation and policy token when a new journey starts', () => {
      markJourneyCompleted('CNAZ00005349366', 5_000);
      store.allianz_quotation = '{"contract":{"contractNumber":"CNAZ00005349366"}}';
      store.policyAccessToken = 'token';
      store.allianz_customerDetails = '{}';
      store[BLOCKED_VEHICLE_LOOKUP_KEY] = '{}';

      startNewJourneyAfterPayment();

      expect(getCompletedJourney()).toBeNull();
      expect(store.allianz_quotation).toBeUndefined();
      expect(store.policyAccessToken).toBeUndefined();
      expect(store.allianz_customerDetails).toBeUndefined();
      expect(store[BLOCKED_VEHICLE_LOOKUP_KEY]).toBe('{}');
    });

    it('leaves an unpaid journey untouched when starting again', () => {
      store.allianz_quotation = '{}';
      startNewJourneyAfterPayment();
      expect(store.allianz_quotation).toBe('{}');
    });

    it('still locks when stored data is corrupt', () => {
      store[COMPLETED_JOURNEY_KEY] = '{not json';
      expect(getCompletedJourney()).toEqual({ contractNumber: '', completedAt: 0 });
    });
  });
});
