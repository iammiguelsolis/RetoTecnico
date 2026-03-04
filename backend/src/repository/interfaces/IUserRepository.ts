import { IUser, RegisterDTO } from '../../models/User';

export interface IUserRepository {
  findById(id: string): Promise<IUser | null>;
  findByEmail(email: string): Promise<IUser | null>;
  create(data: RegisterDTO, passwordHash: string): Promise<IUser>;
  updateBudget(userId: string, monthlyBudget: number): Promise<void>;
}
