import { Request, Response, NextFunction } from 'express';

export interface HttpError extends Error {
  statusCode?: number;
}

export function errorHandler(
  err: HttpError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const status = err.statusCode ?? 500;
  const message = err.message ?? 'Internal server error';
  res.status(status).json({ error: 'Error', message });
}
