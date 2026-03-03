import { IExpense } from '../../models/Expense';
import { IExpenseFilterStrategy } from './IExpenseFilterStrategy';

export class ExpenseFilterContext {
  private strategy?: IExpenseFilterStrategy;

  constructor(strategy?: IExpenseFilterStrategy) {
    if (strategy) this.strategy = strategy;
  }

  setStrategy(strategy: IExpenseFilterStrategy) {
    this.strategy = strategy;
  }

  filter(expenses: IExpense[]): IExpense[] {
    if (!this.strategy) return expenses;
    return this.strategy.execute(expenses);
  }
}
