import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/AuthService';
import { registerSchema, loginSchema, updateBudgetSchema } from '../schemas/authSchema';
import { AppError } from '../errors';

export class AuthController {
  constructor(private readonly authService: AuthService) { }

  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validation = registerSchema.safeParse(req.body);
      if (!validation.success) throw new AppError(`Datos inválidos: ${validation.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ')}`, 400);

      const result = await this.authService.register(validation.data);
      res.status(201).json({ status: 'success', data: result });
    } catch (error) { next(error); }
  };

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validation = loginSchema.safeParse(req.body);
      if (!validation.success) throw new AppError(`Datos inválidos: ${validation.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ')}`, 400);

      const result = await this.authService.login(validation.data);
      res.status(200).json({ status: 'success', data: result });
    } catch (error) { next(error); }
  };

  getProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const profile = await this.authService.getProfile(req.user!.userId);
      res.status(200).json({ status: 'success', data: profile });
    } catch (error) { next(error); }
  };

  updateBudget = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validation = updateBudgetSchema.safeParse(req.body);
      if (!validation.success) throw new AppError('Presupuesto inválido', 400);

      const profile = await this.authService.updateBudget(req.user!.userId, validation.data.monthlyBudget);
      res.status(200).json({ status: 'success', data: profile });
    } catch (error) { next(error); }
  };
}
