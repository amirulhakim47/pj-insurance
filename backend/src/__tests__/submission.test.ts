import express from 'express';
import request from 'supertest';
import submissionRouter from '../routes/submission';

jest.mock('../services/allianz-api');

import { allianzApi } from '../services/allianz-api';

// Speed up retry delays for testing
jest.spyOn(global, 'setTimeout').mockImplementation((fn: () => void) => {
  fn();
  return 0 as unknown as NodeJS.Timeout;
});

const app = express();
app.use(express.json());
app.use('/api', submissionRouter);
app.use(
  (
    err: { response?: { status?: number; data?: unknown }; message?: string },
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    const status = err.response?.status || 500;
    res.status(status).json({ error: err.message || 'Internal server error' });
  },
);

const validBody = {
  salesChannel: 'PTR',
  contract: { contractNumber: 'CNAZ00004272328', emarketingConsentInd: 'Y' as const },
  person: {
    identityType: 'NRIC',
    identityNumber: '841103011116',
    fullName: 'AHMAD BIN IBRAHIM',
    email: 'ahmad@example.com',
    mobilePrefix: '6012',
    mobileNumber: '3456789',
    addressLine1: '123 JALAN TEST',
    postcode: '50000',
    city: 'KL',
    state: '14',
    nationality: 'MAL',
    gender: 'M',
    maritalStatus: '1',
  },
  payment: {
    paymentMode: '08',
    bankCode: 'FPX',
    merchantTransNo: 'TXN-001',
    paymentAmount: 1086.50,
  },
};

describe('POST /api/submission', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Re-mock setTimeout (clearAllMocks resets spies)
    jest.spyOn(global, 'setTimeout').mockImplementation((fn: () => void) => {
      fn();
      return 0 as unknown as NodeJS.Timeout;
    });
  });

  it('returns 400 when contract number is missing', async () => {
    const body = { ...validBody, contract: {} };
    const res = await request(app).post('/api/submission').send(body);
    expect(res.status).toBe(400);
    expect(res.body.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 when person is missing', async () => {
    const body = { ...validBody, person: undefined };
    const res = await request(app).post('/api/submission').send(body);
    expect(res.status).toBe(400);
    expect(res.body.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 when payment is missing', async () => {
    const body = { ...validBody, payment: undefined };
    const res = await request(app).post('/api/submission').send(body);
    expect(res.status).toBe(400);
    expect(res.body.code).toBe('VALIDATION_ERROR');
  });

  it('returns successful response on first attempt', async () => {
    const mockResponse = { status: 'success', policyNumber: 'POL-001' };
    (allianzApi.submitTransaction as jest.Mock).mockResolvedValue(mockResponse);

    const res = await request(app).post('/api/submission').send(validBody);

    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockResponse);
    expect(allianzApi.submitTransaction).toHaveBeenCalledTimes(1);
  });

  it('retries on 500 and succeeds on second attempt', async () => {
    const mockResponse = { status: 'success', policyNumber: 'POL-001' };
    (allianzApi.submitTransaction as jest.Mock)
      .mockRejectedValueOnce({ response: { status: 500 }, message: 'Server Error' })
      .mockResolvedValue(mockResponse);

    const res = await request(app).post('/api/submission').send(validBody);

    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockResponse);
    expect(allianzApi.submitTransaction).toHaveBeenCalledTimes(2);
  });

  it('retries on 500 and succeeds on third attempt', async () => {
    const mockResponse = { status: 'success', policyNumber: 'POL-001' };
    (allianzApi.submitTransaction as jest.Mock)
      .mockRejectedValueOnce({ response: { status: 500 }, message: 'Server Error' })
      .mockRejectedValueOnce({ response: { status: 500 }, message: 'Server Error' })
      .mockResolvedValue(mockResponse);

    const res = await request(app).post('/api/submission').send(validBody);

    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockResponse);
    expect(allianzApi.submitTransaction).toHaveBeenCalledTimes(3);
  });

  it('fails after MAX_RETRIES attempts (3 x 500)', async () => {
    (allianzApi.submitTransaction as jest.Mock).mockRejectedValue({
      response: { status: 500 },
      message: 'Server Error',
    });

    const res = await request(app).post('/api/submission').send(validBody);

    expect(res.status).toBe(500);
    expect(allianzApi.submitTransaction).toHaveBeenCalledTimes(3);
  });

  it('does not retry on non-500 errors (e.g. 400)', async () => {
    (allianzApi.submitTransaction as jest.Mock).mockRejectedValue({
      response: { status: 400 },
      message: 'Bad Request',
    });

    const res = await request(app).post('/api/submission').send(validBody);

    expect(res.status).toBe(400);
    expect(allianzApi.submitTransaction).toHaveBeenCalledTimes(1);
  });

  it('does not retry on network errors without response', async () => {
    (allianzApi.submitTransaction as jest.Mock).mockRejectedValue(
      new Error('ECONNREFUSED'),
    );

    const res = await request(app).post('/api/submission').send(validBody);

    expect(res.status).toBe(500);
    expect(allianzApi.submitTransaction).toHaveBeenCalledTimes(1);
  });

  it('passes emarketingConsentInd to the API', async () => {
    const mockResponse = { status: 'success' };
    (allianzApi.submitTransaction as jest.Mock).mockResolvedValue(mockResponse);

    await request(app).post('/api/submission').send(validBody);

    expect(allianzApi.submitTransaction).toHaveBeenCalledWith(
      expect.objectContaining({
        contract: expect.objectContaining({ emarketingConsentInd: 'Y' }),
      }),
    );
  });
});
