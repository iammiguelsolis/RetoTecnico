/**
 * Modelo de Gasto (Expense) — Versión 2
 *
 * Nuevos campos:
 * - userId: vincula al dueño
 * - priorityLevel: escala semáforo (LOW/MEDIUM/HIGH)
 * - reminderDate: recordatorio opcional
 */

export type PriorityLevel = 'LOW' | 'MEDIUM' | 'HIGH';
export type TransactionType = 'INCOME' | 'EXPENSE';
export type RecurrenceFrequency = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';

export interface IExpense {
  id: string;
  userId: string;
  title: string;
  reason: string;
  date: string;              // ISO 8601
  amount: number;
  type: TransactionType;
  priorityLevel: PriorityLevel;
  reminderDate: string | null; // ISO 8601 o null
  isRecurring: boolean;
  frequency: RecurrenceFrequency | null;
  interval: number;
  createdAt: string;         // ISO 8601
  updatedAt: string;         // ISO 8601
}

/** DTO para crear un nuevo gasto */
export interface CreateExpenseDTO {
  title: string;
  reason: string;
  date: string;
  amount: number;
  type: TransactionType;
  priorityLevel?: PriorityLevel;
  reminderDate?: string | null;
  isRecurring?: boolean;
  frequency?: RecurrenceFrequency | null;
  interval?: number;
}

/** DTO para actualizar un gasto existente */
export type UpdateExpenseDTO = Partial<CreateExpenseDTO>;
