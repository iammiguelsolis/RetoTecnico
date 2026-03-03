import axios from 'axios';
import type {
  IUser,
  AuthResponse,
  LoginCredentials,
  RegisterCredentials,
  ApiResponse,
} from '../types';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: { 'Content-Type': 'application/json' },
});

const TOKEN_KEY = 'expense_tracker_token';
const USER_KEY = 'expense_tracker_user';

/**
 * authService — Servicio de autenticación.
 * Maneja login, registro, token en localStorage, y headers JWT.
 */
export const authService = {
  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const { data } = await apiClient.post<ApiResponse<AuthResponse>>('/auth/register', credentials);
    const auth = data.data!;
    this.saveSession(auth);
    return auth;
  },

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const { data } = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', credentials);
    const auth = data.data!;
    this.saveSession(auth);
    return auth;
  },

  async getProfile(): Promise<IUser> {
    const { data } = await apiClient.get<ApiResponse<IUser>>('/auth/me', {
      headers: { Authorization: `Bearer ${this.getToken()}` },
    });
    return data.data!;
  },

  saveSession(auth: AuthResponse): void {
    localStorage.setItem(TOKEN_KEY, auth.token);
    localStorage.setItem(USER_KEY, JSON.stringify(auth.user));
  },

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  getUser(): IUser | null {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) as IUser : null;
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },
};
