/**
 * Tipos de autenticación para el frontend
 */
export interface IUser {
  id: string;
  name: string;
  email: string;
  monthlyBudget: number;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: IUser;
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}
