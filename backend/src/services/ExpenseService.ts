import { IExpense, CreateExpenseDTO, UpdateExpenseDTO } from '../models/Expense';
import { IExpenseRepository } from '../repository/interfaces/IExpenseRepository';
import { NotFoundError } from '../errors/NotFoundError';
import { ExpenseSubject } from '../patterns/observer/ExpenseSubject';
import { AutocompleteTrie } from '../structures/Trie';

/**
 * ExpenseService — Lógica de negocio para gastos.
 * Todos los métodos reciben userId para aislamiento.
 */
export class ExpenseService {
  constructor(
    private readonly expenseRepository: IExpenseRepository,
    private readonly expenseSubject: ExpenseSubject,
    private readonly autocompleteTrie: AutocompleteTrie
  ) { }

  async getAllExpenses(userId: string): Promise<IExpense[]> {
    return this.expenseRepository.findAll(userId);
  }

  async getExpensesByMonth(userId: string, year: number, month: number): Promise<IExpense[]> {
    return this.expenseRepository.findByMonth(userId, year, month);
  }

  async createExpense(userId: string, data: CreateExpenseDTO): Promise<IExpense> {
    const expense = await this.expenseRepository.create(userId, data);

    // 🔔 Disparar evento Observer si es de alta prioridad u otros casos
    this.expenseSubject.notify(expense);

    // 🌳 Alimentar el Trie para sugerencias futuras
    this.autocompleteTrie.insert(expense.title);

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
