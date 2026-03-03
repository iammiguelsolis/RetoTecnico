/**
 * Modelo de Usuario (User)
 */

export type PriorityLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface IUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  monthlyBudget: number;
  createdAt: string;
  updatedAt: string;
}

/** Datos visibles del usuario (sin password) */
export type UserProfile = Omit<IUser, 'passwordHash'>;

/** DTO para registro */
export interface RegisterDTO {
  name: string;
  email: string;
  password: string;
}

/** DTO para login */
export interface LoginDTO {
  email: string;
  password: string;
}

/** Respuesta de autenticación */
export interface AuthResponse {
  user: UserProfile;
  token: string;
}
