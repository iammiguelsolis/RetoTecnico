import { IExpenseObserver } from './ExpenseSubject';
import { IExpense } from '../../models/Expense';

export class WhatsAppObserver implements IExpenseObserver {
  update(expense: IExpense): void {
    console.log(`📱 WhatsApp enviado: GASTOO → ${expense.title} S/${expense.amount}`);
  }
}
