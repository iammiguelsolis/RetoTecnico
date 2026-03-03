import { z } from 'zod';

export const createExpenseSchema = z.object({
  title: z.string({ required_error: 'El título es obligatorio' }).min(1).max(100).trim(),
  reason: z.string({ required_error: 'El motivo es obligatorio' }).min(1).max(255).trim(),
  date: z.string({ required_error: 'La fecha es obligatoria' }).refine((val) => !isNaN(Date.parse(val)), { message: 'Fecha inválida' }),
  amount: z.number({ required_error: 'El monto es obligatorio' }).positive('Mayor a 0'),
  type: z.enum(['INCOME', 'EXPENSE'], { required_error: 'El tipo es obligatorio' }),
  priorityLevel: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  reminderDate: z.string().nullable().optional(),
  isRecurring: z.boolean().optional().default(false),
  frequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY']).nullable().optional(),
  interval: z.number().int().min(1).optional().default(1),
});

export const updateExpenseSchema = createExpenseSchema.partial();

export const filterByMonthSchema = z.object({
  year: z.coerce.number().int().min(2000).max(2100),
  month: z.coerce.number().int().min(1).max(12),
});
