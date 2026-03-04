import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Si es un error operacional conocido (AppError)
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      status: 'error',
      statusCode: err.statusCode,
      message: err.message,
    });
    return;
  }

  // Error inesperado (bug, error del sistema, etc.)
  console.error('[ERROR INESPERADO]:', err);

  res.status(500).json({
    status: 'error',
    statusCode: 500,
    message: 'Error interno del servidor',
  });
};
