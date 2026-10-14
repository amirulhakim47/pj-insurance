import {
  extractAllianzErrors,
  findEmptyRequestFields,
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

  it('maps ISM NCD confirmation rejection to a dedicated code with the raw message', () => {
    const ismMessage =
      'NCD confirmation is unavailable as confirmation has already been taken earlier. If this is not a duplicate confirmation request, the confirmation has already been taken by another insurance/Takaful company .';
    const { code, userMessage } = mapVehicleDetailsError([ismMessage], 'BRX 1261');
    expect(code).toBe('NCD_CONFIRMATION_UNAVAILABLE');
    expect(userMessage).toBe(ismMessage);
  });

  it('finds empty request fields by path without exposing values', () => {
    expect(
      findEmptyRequestFields({
        ReferenceNo: 'CNAZ1',
        Policy: {
          Client: { IdentificationNumber: '900101015555', Age: '' },
          RiskList: [{ Vehicle: { AvCode: '', Seat: 5, Model: undefined } }],
        },
      }),
    ).toEqual(['Policy.Client.Age', 'Policy.RiskList[0].Vehicle.AvCode', 'Policy.RiskList[0].Vehicle.Model']);
  });

  it('masks plate numbers for logs', () => {
    expect(maskPlate('VAP2104')).toBe('VA***04');
  });
});
