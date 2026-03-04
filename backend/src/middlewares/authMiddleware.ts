import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../errors';

interface JwtPayload { userId: string; email: string; }

declare global {
  namespace Express {
    interface Request { user?: JwtPayload; }
  }
}

export const authMiddleware = (req: Request, _res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Token de autenticación requerido', 401);
    }

    const token = authHeader.split(' ')[1]!;
    const secret = process.env['JWT_SECRET'] ?? 'default_secret';
    const decoded = jwt.verify(token, secret) as JwtPayload;
    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof AppError) next(error);
    else next(new AppError('Token inválido o expirado', 401));
  }
};
