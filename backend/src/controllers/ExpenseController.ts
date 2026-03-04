import { Request, Response, NextFunction } from 'express';
import { ExpenseService } from '../services/ExpenseService';
import { createExpenseSchema, updateExpenseSchema, filterByMonthSchema } from '../schemas/expenseSchema';
import { AppError } from '../errors';
import { ExpenseFilterContext } from '../patterns/strategy/ExpenseFilterContext';
import { FilterByMonthStrategy } from '../patterns/strategy/FilterByMonthStrategy';

export class ExpenseController {
  constructor(
    private readonly expenseService: ExpenseService,
    private readonly filterContext: ExpenseFilterContext
  ) { }

  getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const expenses = await this.expenseService.getAllExpenses(userId);
      res.status(200).json({ status: 'success', data: expenses, count: expenses.length });
    } catch (error) { next(error); }
  };

  getByMonth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const validation = filterByMonthSchema.safeParse(req.params);
      if (!validation.success) throw new AppError('Parámetros inválidos', 400);

      const { year, month } = validation.data;
      const expenses = await this.expenseService.getExpensesByMonth(userId, year, month);

      // Usar Strategy Pattern opcionalmente para double-check en memoria o reportes combinados
      this.filterContext.setStrategy(new FilterByMonthStrategy(year, month));
      const filteredInMemory = this.filterContext.filter(expenses);

      res.status(200).json({ status: 'success', data: filteredInMemory, count: filteredInMemory.length, filter: { year, month } });
    } catch (error) { next(error); }
  };


  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const validation = createExpenseSchema.safeParse(req.body);
      if (!validation.success) throw new AppError(`Datos inválidos: ${validation.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ')}`, 400);

      const expense = await this.expenseService.createExpense(userId, validation.data);
      res.status(201).json({ status: 'success', data: expense });
    } catch (error) { next(error); }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params['id'] as string;
      if (!id) throw new AppError('ID obligatorio', 400);

      const validation = updateExpenseSchema.safeParse(req.body);
      if (!validation.success) throw new AppError('Datos inválidos', 400);

      const expense = await this.expenseService.updateExpense(id, validation.data);
      res.status(200).json({ status: 'success', data: expense });
    } catch (error) { next(error); }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params['id'] as string;
      if (!id) throw new AppError('ID obligatorio', 400);

      await this.expenseService.deleteExpense(id);
      res.status(200).json({ status: 'success', message: `Gasto "${id}" eliminado` });
    } catch (error) { next(error); }
  };
}
