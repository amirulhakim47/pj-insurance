import {
  extractAllianzErrors,
  mapVehicleDetailsError,
  maskPlate,
} from '@/lib/server/allianz-errors';

describe('allianz-errors', () => {
  it('extracts errors array from Allianz payload', () => {
    expect(extractAllianzErrors({ errors: ['Data not found.'] })).toEqual(['Data not found.']);
  });

  it('maps vehicle not found to plate-specific message and guidance', () => {
    const { code, userMessage } = mapVehicleDetailsError(['Vehicle data not found'], 'VAP 2104');
    expect(code).toBe('VEHICLE_LOOKUP_NOT_FOUND');
    expect(userMessage).toContain('Vehicle data for VAP2104 not found');
    expect(userMessage).toContain('does not match the vehicle');
  });

  it('masks plate numbers for logs', () => {
    expect(maskPlate('VAP2104')).toBe('VA***04');
  });
});
