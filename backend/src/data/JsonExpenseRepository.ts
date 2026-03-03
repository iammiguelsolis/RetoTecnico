import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { IExpense, CreateExpenseDTO, UpdateExpenseDTO, PriorityLevel } from '../models/Expense';
import { IExpenseRepository } from '../repository/interfaces/IExpenseRepository';

/**
 * JsonExpenseRepository — v2
 *
 * Persistencia en archivo JSON local.
 * Actualizado para soportar userId, priorityLevel y reminderDate.
 * ⚠️ ESTE ARCHIVO NO DEBE SER ELIMINADO.
 */
export class JsonExpenseRepository implements IExpenseRepository {
  private readonly filePath: string;

  constructor(filePath?: string) {
    this.filePath = filePath ?? path.join(__dirname, '..', '..', 'data', 'expenses.json');
  }

  private async readFile(): Promise<IExpense[]> {
    try {
      const data = await fs.readFile(this.filePath, 'utf-8');
      return JSON.parse(data) as IExpense[];
    } catch (error: unknown) {
      if (error instanceof Error && 'code' in error && (error as NodeJS.ErrnoException).code === 'ENOENT') {
        await this.ensureDirectoryExists();
        await fs.writeFile(this.filePath, JSON.stringify([], null, 2), 'utf-8');
        return [];
      }
      throw error;
    }
  }

  private async writeFile(expenses: IExpense[]): Promise<void> {
    await this.ensureDirectoryExists();
    await fs.writeFile(this.filePath, JSON.stringify(expenses, null, 2), 'utf-8');
  }

  private async ensureDirectoryExists(): Promise<void> {
    const dir = path.dirname(this.filePath);
    await fs.mkdir(dir, { recursive: true });
  }

  /**
   * Auto-calcula prioridad basada en monto si no se especifica.
   */
  private autoPriority(amount: number): PriorityLevel {
    if (amount >= 500) return 'HIGH';
    if (amount >= 100) return 'MEDIUM';
    return 'LOW';
  }

  // ──────────────────────────────────────────────
  // Implementación de IExpenseRepository
  // ──────────────────────────────────────────────

  async findAll(userId: string): Promise<IExpense[]> {
    const expenses = await this.readFile();
    return expenses.filter((e) => e.userId === userId);
  }

  async findById(id: string): Promise<IExpense | null> {
    const expenses = await this.readFile();
    return expenses.find((e) => e.id === id) ?? null;
  }

  async findByMonth(userId: string, year: number, month: number): Promise<IExpense[]> {
    const expenses = await this.readFile();
    return expenses.filter((e) => {
      if (e.userId !== userId) return false;
      const d = new Date(e.date);
      return d.getFullYear() === year && d.getMonth() + 1 === month;
    });
  }

  async create(userId: string, data: CreateExpenseDTO): Promise<IExpense> {
    const expenses = await this.readFile();
    const now = new Date().toISOString();

    const newExpense: IExpense = {
      id: crypto.randomUUID(),
      userId,
      title: data.title,
      reason: data.reason,
      date: data.date,
      amount: data.amount,
      type: data.type,
      priorityLevel: data.priorityLevel ?? this.autoPriority(data.amount),
      reminderDate: data.reminderDate ?? null,
      isRecurring: data.isRecurring ?? false,
      frequency: data.frequency ?? null,
      interval: data.interval ?? 1,
      createdAt: now,
      updatedAt: now,
    };

    expenses.push(newExpense);
    await this.writeFile(expenses);
    return newExpense;
  }

  async update(id: string, data: UpdateExpenseDTO): Promise<IExpense | null> {
    const expenses = await this.readFile();
    const index = expenses.findIndex((e) => e.id === id);
    if (index === -1) return null;

    const existing = expenses[index]!;
    const updatedExpense: IExpense = {
      ...existing,
      ...(data.title !== undefined && { title: data.title }),
      ...(data.reason !== undefined && { reason: data.reason }),
      ...(data.date !== undefined && { date: data.date }),
      ...(data.amount !== undefined && { amount: data.amount }),
      ...(data.type !== undefined && { type: data.type }),
      ...(data.priorityLevel !== undefined && { priorityLevel: data.priorityLevel }),
      ...(data.reminderDate !== undefined && { reminderDate: data.reminderDate }),
      ...(data.isRecurring !== undefined && { isRecurring: data.isRecurring }),
      ...(data.frequency !== undefined && { frequency: data.frequency }),
      ...(data.interval !== undefined && { interval: data.interval }),
      updatedAt: new Date().toISOString(),
    };

    expenses[index] = updatedExpense;
    await this.writeFile(expenses);
    return updatedExpense;
  }

  async delete(id: string): Promise<boolean> {
    const expenses = await this.readFile();
    const filtered = expenses.filter((e) => e.id !== id);
    if (filtered.length === expenses.length) return false;
    await this.writeFile(filtered);
    return true;
  }
}
