import { getAccessToken } from './allianz-auth';
import {
  AllianzApiError,
  extractAllianzErrors,
  mapVehicleDetailsError,
} from './allianz-errors';
import { logAllianz } from './allianz-log';

function getBaseUrl(): string {
  const base =
    process.env.ALLIANZ_BASE_URL ?? 'https://asia-uat-malaysia.apis.allianz.com';
  return `${base}/v1/openapi/mci`;
}

export function getAllianzApiHost(): string {
  const base =
    process.env.ALLIANZ_BASE_URL ?? 'https://asia-uat-malaysia.apis.allianz.com';
  try {
    return new URL(base).host;
  } catch {
    return base;
  }
}

function generateRequestId(): string {
  return crypto.randomUUID();
}

function shouldLogResponseBody(): boolean {
  return (
    process.env.NODE_ENV !== 'production' ||
    process.env.ALLIANZ_LOG_RESPONSES === 'true'
  );
}

async function parseJsonBody(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text.trim()) return {};
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return { message: text.slice(0, 500) };
  }
}

function plateFromRequestBody(body: unknown): string | undefined {
  if (!body || typeof body !== 'object') return undefined;
  const id = (body as { vehicleLicenseId?: unknown }).vehicleLicenseId;
  return typeof id === 'string' && id.trim() ? id : undefined;
}

function throwForBusinessErrors(
  path: string,
  requestId: string,
  httpStatus: number,
  data: unknown,
  requestBody?: unknown,
): void {
  const allianzErrors = extractAllianzErrors(data);
  if (allianzErrors.length === 0) return;

  const plate = path === '/vehicleDetails' ? plateFromRequestBody(requestBody) : undefined;
  const mapped =
    path === '/vehicleDetails'
      ? mapVehicleDetailsError(allianzErrors, plate)
      : {
          code: 'ALLIANZ_BUSINESS_ERROR' as const,
          userMessage: allianzErrors.join('; '),
        };

  throw new AllianzApiError({
    status: httpStatus === 200 ? 422 : httpStatus,
    code: mapped.code,
    requestId,
    allianzErrors,
    userMessage: mapped.userMessage,
    cause: allianzErrors.join('; '),
  });
}

async function allianzFetch<T>(
  path: string,
  options: { method?: string; body?: unknown; params?: Record<string, string> } = {},
): Promise<T> {
  const token = await getAccessToken();
  const requestId = generateRequestId();
  const method = options.method ?? 'GET';
  const started = Date.now();

  let url = `${getBaseUrl()}${path}`;
  if (options.params) {
    const qs = new URLSearchParams(options.params).toString();
    if (qs) url += `?${qs}`;
  }

  logAllianz('info', 'request_start', {
    method,
    path,
    requestId,
    apiHost: getAllianzApiHost(),
  });

  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
    'X-Request-ID': requestId,
  };

  const fetchOptions: RequestInit = { method, headers };
  if (options.body) {
    fetchOptions.body = JSON.stringify(options.body);
  }

  const response = await fetch(url, fetchOptions);
  const data = await parseJsonBody(response);
  const durationMs = Date.now() - started;

  if (!response.ok) {
    const allianzErrors = extractAllianzErrors(data);
    logAllianz('error', 'http_error', {
      method,
      path,
      requestId,
      httpStatus: response.status,
      durationMs,
      allianzErrors,
      ...(shouldLogResponseBody() ? { body: data } : {}),
    });

    if (allianzErrors.length > 0) {
      throwForBusinessErrors(path, requestId, response.status, data, options.body);
    }

    throw new AllianzApiError({
      status: response.status,
      code: 'ALLIANZ_HTTP_ERROR',
      requestId,
      allianzErrors: allianzErrors.length ? allianzErrors : [response.statusText],
      userMessage: 'Unable to reach Allianz services. Please try again shortly.',
      cause: `HTTP ${response.status}`,
    });
  }

  try {
    throwForBusinessErrors(path, requestId, response.status, data, options.body);
  } catch (err) {
    if (err instanceof AllianzApiError) {
      logAllianz('warn', 'business_error', {
        method,
        path,
        requestId,
        httpStatus: response.status,
        durationMs,
        code: err.code,
        allianzErrors: err.allianzErrors,
        ...(shouldLogResponseBody() ? { body: data } : {}),
      });
    }
    throw err;
  }

  logAllianz('info', 'request_success', {
    method,
    path,
    requestId,
    httpStatus: response.status,
    durationMs,
  });

  if (shouldLogResponseBody()) {
    logAllianz('info', 'response_body', { requestId, path, body: data });
  }

  return data as T;
}

export async function getVehicleDetails(body: unknown) {
  return allianzFetch('/vehicleDetails', { method: 'POST', body });
}

export async function getNcdDetails(body: unknown) {
  return allianzFetch('/ncdDetails', { method: 'POST', body });
}

export async function checkUBB(body: unknown) {
  return allianzFetch('/checkUBB', { method: 'POST', body });
}

export async function generateQuote(body: unknown) {
  return allianzFetch('/quote', { method: 'POST', body });
}

export async function updateQuote(body: unknown) {
  return allianzFetch('/quote', { method: 'PUT', body });
}

export async function submitTransaction(body: unknown) {
  return allianzFetch('/submission', { method: 'POST', body });
}

export async function getAllianzMakeList(params?: Record<string, string>) {
  return allianzFetch('/lov/allianzMake', { params });
}

export async function getAllianzModelList(params: Record<string, string>) {
  return allianzFetch('/lov/allianzModel', { params });
}

export async function getAllianzVariantList(params: Record<string, string>) {
  return allianzFetch('/lov/allianzVariant', { params });
}

export async function getAVMakeList(params: Record<string, string>) {
  return allianzFetch('/lov/avMake', { params });
}

export async function getAVModelList(params: Record<string, string>) {
  return allianzFetch('/lov/avModel', { params });
}

export async function getAVVariantList(params: Record<string, string>) {
  return allianzFetch('/lov/avVariant', { params });
}
