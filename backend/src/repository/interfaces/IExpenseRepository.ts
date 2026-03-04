import { IExpense, CreateExpenseDTO, UpdateExpenseDTO } from '../../models/Expense';

export interface IExpenseRepository {
  findAll(userId: string): Promise<IExpense[]>;
  findById(id: string): Promise<IExpense | null>;
  findByMonth(userId: string, year: number, month: number): Promise<IExpense[]>;
  create(userId: string, data: CreateExpenseDTO): Promise<IExpense>;
  update(id: string, data: UpdateExpenseDTO): Promise<IExpense | null>;
  delete(id: string): Promise<boolean>;
}
