import { IUser, RegisterDTO } from '../../models/User';

/**
 * IUserRepository — Contrato de persistencia para usuarios.
 */
export interface IUserRepository {
  findById(id: string): Promise<IUser | null>;
  findByEmail(email: string): Promise<IUser | null>;
  create(data: RegisterDTO, passwordHash: string): Promise<IUser>;
  updateBudget(userId: string, monthlyBudget: number): Promise<void>;
}
