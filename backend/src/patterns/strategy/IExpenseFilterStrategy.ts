import { IExpense } from '../../models/Expense';

export interface IExpenseFilterStrategy {
  execute(expenses: IExpense[]): IExpense[];
}
