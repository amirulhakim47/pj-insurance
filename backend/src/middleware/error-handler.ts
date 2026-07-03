import type { Request, Response, NextFunction } from 'express';
import axios from 'axios';

export interface ApiError {
  status: number;
  code: string;
  message: string;
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (axios.isAxiosError(err)) {
    const status = err.response?.status ?? 502;
    const body = err.response?.data as
      | { errorCode?: string; errorMessage?: string }
      | undefined;

    res.status(status).json({
      status,
      code: body?.errorCode ?? 'ALLIANZ_ERROR',
      message: body?.errorMessage ?? err.message,
    });
    return;
  }

  if (err instanceof Error) {
    console.error('[Error]', err.message);
    res.status(500).json({
      status: 500,
      code: 'INTERNAL_ERROR',
      message: err.message,
    });
    return;
  }

  res.status(500).json({
    status: 500,
    code: 'UNKNOWN_ERROR',
    message: 'An unexpected error occurred',
  });
}
