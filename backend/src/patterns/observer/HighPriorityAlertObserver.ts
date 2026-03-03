import { IExpense } from '../../models/Expense';
import { IExpenseObserver } from './ExpenseSubject';

export class HighPriorityAlertObserver implements IExpenseObserver {
  update(expense: IExpense): void {
    if (expense.priorityLevel === 'HIGH') {
      // En un entorno de producción, esto enviaría un Email, SMS, o notificación PUSH
      console.log(`\n🚨 [ALERTA EVENTO] Nuevo gasto altísimo detectado:`);
      console.log(`   Motivo: ${expense.title} | Monto: S/${expense.amount}`);
      console.log(`   Se ha disparado el flujo de advertencia de presupuesto.\n`);
    }
  }
}
