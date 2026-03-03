import { z } from 'zod';

/**
 * Esquemas de validación para Autenticación (Zod)
 */
export const registerSchema = z.object({
  name: z
    .string({ required_error: 'El nombre es obligatorio' })
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre es demasiado largo')
    .trim(),
  email: z
    .string({ required_error: 'El email es obligatorio' })
    .email('Formato de email inválido')
    .max(255, 'El email es demasiado largo')
    .trim()
    .toLowerCase(),
  password: z
    .string({ required_error: 'La contraseña es obligatoria' })
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .max(100, 'La contraseña es demasiado larga'),
});

export const loginSchema = z.object({
  email: z
    .string({ required_error: 'El email es obligatorio' })
    .email('Formato de email inválido')
    .trim()
    .toLowerCase(),
  password: z
    .string({ required_error: 'La contraseña es obligatoria' })
    .min(1, 'La contraseña no puede estar vacía'),
});

export const updateBudgetSchema = z.object({
  monthlyBudget: z
    .number({ required_error: 'El presupuesto es obligatorio' })
    .positive('El presupuesto debe ser un monto mayor a 0'),
});

