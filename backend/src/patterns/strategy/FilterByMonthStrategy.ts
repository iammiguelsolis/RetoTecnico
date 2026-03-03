import { IExpense } from '../../models/Expense';
import { IExpenseFilterStrategy } from './IExpenseFilterStrategy';

export class FilterByMonthStrategy implements IExpenseFilterStrategy {
  constructor(private year: number, private month: number) { }

  execute(expenses: IExpense[]): IExpense[] {
    return expenses.filter(e => {
      const d = new Date(e.date);
      return d.getFullYear() === this.year && (d.getMonth() + 1) === this.month;
    });
  }
}
