import { IExpense, CreateExpenseDTO, UpdateExpenseDTO } from '../models/Expense';
import { IExpenseRepository } from '../repository/interfaces/IExpenseRepository';
import { NotFoundError } from '../errors/NotFoundError';
import { ExpenseSubject } from '../patterns/observer/ExpenseSubject';

/**
 * Servicio de lógica de negocio para gastos.
 * Cada método recibe userId para aislar los datos por usuario.
 */
export class ExpenseService {
  constructor(
    private readonly expenseRepository: IExpenseRepository,
    private readonly expenseSubject: ExpenseSubject
  ) { }

  async getAllExpenses(userId: string): Promise<IExpense[]> {
    return this.expenseRepository.findAll(userId);
  }

  async getExpensesByMonth(userId: string, year: number, month: number): Promise<IExpense[]> {
    return this.expenseRepository.findByMonth(userId, year, month);
  }

  async createExpense(userId: string, data: CreateExpenseDTO): Promise<IExpense> {
    const expense = await this.expenseRepository.create(userId, data);

    // Notificar observers (ej. alerta de alta prioridad)
    this.expenseSubject.notify(expense);

    return expense;
  }

  async updateExpense(id: string, data: UpdateExpenseDTO): Promise<IExpense> {
    const updated = await this.expenseRepository.update(id, data);
    if (!updated) throw new NotFoundError(`Gasto con ID "${id}" no encontrado`);
    return updated;
  }

  async deleteExpense(id: string): Promise<void> {
    const deleted = await this.expenseRepository.delete(id);
    if (!deleted) throw new NotFoundError(`Gasto con ID "${id}" no encontrado`);
  }
}
