// Global error handler middleware
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../exceptions/AppError';

export const errorMiddleware = (err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ message: err.message });
  }
  return res.status(500).json({ message: 'Internal server error' });
};
