import { IExpenseObserver } from './ExpenseSubject';
import { IExpense } from '../../models/Expense';

export class WhatsAppObserver implements IExpenseObserver {
  update(expense: IExpense): void {
    if (expense.priorityLevel === 'HIGH') {
      console.log(`📱 WhatsApp enviado: Gasto alto → ${expense.title} S/${expense.amount}`);
    }
  }
}
