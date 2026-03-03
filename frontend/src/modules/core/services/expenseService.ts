import axios from 'axios';
import type {
  IExpense,
  CreateExpenseDTO,
  UpdateExpenseDTO,
  ApiResponse,
} from '../types';
import { authService } from './authService';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: { 'Content-Type': 'application/json' },
});

// Interceptor: agrega JWT a cada request automáticamente
apiClient.interceptors.request.use((config) => {
  const token = authService.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * expenseService — con JWT automático vía interceptor.
 */
export const expenseService = {
  async getAll(): Promise<IExpense[]> {
    const { data } = await apiClient.get<ApiResponse<IExpense[]>>('/expenses');
    return data.data ?? [];
  },

  async getByMonth(year: number, month: number): Promise<IExpense[]> {
    const { data } = await apiClient.get<ApiResponse<IExpense[]>>(
      `/expenses/month/${year}/${month}`
    );
    return data.data ?? [];
  },

  async create(expense: CreateExpenseDTO): Promise<IExpense> {
    const { data } = await apiClient.post<ApiResponse<IExpense>>('/expenses', expense);
    return data.data!;
  },

  async update(id: string, expense: UpdateExpenseDTO): Promise<IExpense> {
    const { data } = await apiClient.put<ApiResponse<IExpense>>(`/expenses/${id}`, expense);
    return data.data!;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/expenses/${id}`);
  },
};
