import { IExpense } from '../../models/Expense';

export interface IExpenseObserver {
  update(expense: IExpense): void;
}

export class ExpenseSubject {
  private observers: IExpenseObserver[] = [];

  attach(observer: IExpenseObserver): void {
    const isExist = this.observers.includes(observer);
    if (!isExist) {
      this.observers.push(observer);
    }
  }

  detach(observer: IExpenseObserver): void {
    const observerIndex = this.observers.indexOf(observer);
    if (observerIndex !== -1) {
      this.observers.splice(observerIndex, 1);
    }
  }

  notify(expense: IExpense): void {
    for (const observer of this.observers) {
      observer.update(expense);
    }
  }
}
