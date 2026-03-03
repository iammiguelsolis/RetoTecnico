/**
 * Tipos compartidos para la entidad Gasto (Expense) — v2.
 * Incluye priorityLevel (semáforo) y reminderDate.
 */

export type PriorityLevel = 'LOW' | 'MEDIUM' | 'HIGH';
export type TransactionType = 'INCOME' | 'EXPENSE';
export type RecurrenceFrequency = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';

export interface IExpense {
  id: string;
  userId: string;
  title: string;
  reason: string;
  date: string;
  amount: number;
  type: TransactionType;
  priorityLevel: PriorityLevel;
  reminderDate: string | null;
  isRecurring: boolean;
  frequency: RecurrenceFrequency | null;
  interval: number;
  createdAt: string;
  updatedAt: string;
}

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

export type UpdateExpenseDTO = Partial<CreateExpenseDTO>;

export interface ApiResponse<T> {
  status: 'success' | 'error';
  data?: T;
  count?: number;
  message?: string;
  filter?: Record<string, unknown>;
}
