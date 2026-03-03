import { IExpense, PriorityLevel } from '../../models/Expense';
import { IExpenseFilterStrategy } from './IExpenseFilterStrategy';

export class FilterByPriorityStrategy implements IExpenseFilterStrategy {
  constructor(private priority: PriorityLevel) { }

  execute(expenses: IExpense[]): IExpense[] {
    return expenses.filter(e => e.priorityLevel === this.priority);
  }
}
