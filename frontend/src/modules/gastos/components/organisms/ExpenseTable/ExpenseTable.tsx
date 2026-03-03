import type { IExpense } from '../../../../core/types';
import './ExpenseTable.css';

interface ExpenseTableProps {
  expenses: IExpense[];
  isLoading?: boolean;
  onEdit?: (expense: IExpense) => void;
  onDelete?: (id: string) => void;
}

export const ExpenseTable = ({
  expenses,
  isLoading = false,
  onEdit,
  onDelete,
}: ExpenseTableProps) => {
  const formatDate = (isoDate: string) =>
    new Date(isoDate).toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' });

  const formatAmount = (amount: number) =>
    new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'USD' }).format(amount);

  const getPriorityClass = (p: string) => {
    switch (p) {
      case 'HIGH': return 'priority-badge--high';
      case 'MEDIUM': return 'priority-badge--medium';
      case 'LOW': return 'priority-badge--low';
      default: return '';
    }
  };

  const getPriorityLabel = (p: string) => {
    switch (p) {
      case 'HIGH': return 'Alto';
      case 'MEDIUM': return 'Medio';
      case 'LOW': return 'Bajo';
      default: return '—';
    }
  };

  const isReminderSoon = (d: string | null) => {
    if (!d) return false;
    const diff = new Date(d).getTime() - Date.now();
    return diff > 0 && diff < 3 * 24 * 60 * 60 * 1000;
  };

  if (isLoading) {
    return (
      <div className="table-state">
        <div className="table-state__spinner" />
        <p className="table-state__desc">Cargando gastos...</p>
      </div>
    );
  }

  if (expenses.length === 0) {
    return (
      <div className="table-state">
        <div className="table-state__icon">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
        </div>
        <p className="table-state__title">Sin gastos registrados</p>
        <p className="table-state__desc">Agrega tu primer gasto para comenzar</p>
      </div>
    );
  }

  return (
    <div className="expense-table-container">
      <table className="expense-table">
        <thead>
          <tr>
            <th>Tipo</th>
            <th>Prioridad</th>
            <th>Título</th>
            <th>Motivo</th>
            <th>Fecha</th>
            <th className="th--right">Monto</th>
            <th className="th--center">
              <svg style={{ width: 14, height: 14, display: 'inline' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
              </svg>
            </th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((expense) => (
            <tr key={expense.id}>
              <td>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span
                    className={`priority-badge ${expense.type === 'INCOME' ? 'priority-badge--low' : ''}`}
                    style={{ padding: '4px', borderRadius: '4px' }}
                    title={expense.type === 'INCOME' ? 'Ingreso' : 'Gasto'}
                  >
                    {expense.type === 'INCOME' ? (
                      <svg style={{ width: 16, height: 16 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" />
                      </svg>
                    ) : (
                      <svg style={{ width: 16, height: 16 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
                      </svg>
                    )}
                  </span>
                  {expense.isRecurring && (
                    <span title={`Recurrente: Cada ${expense.interval} ${expense.frequency}`} style={{ color: 'var(--text-muted)' }}>
                      <svg style={{ width: 14, height: 14 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                      </svg>
                    </span>
                  )}
                </div>
              </td>
              <td>
                <span className={`priority-badge ${getPriorityClass(expense.priorityLevel)}`}>
                  <span className="priority-badge__dot" />
                  {getPriorityLabel(expense.priorityLevel)}
                </span>
              </td>
              <td className="expense-table__title">{expense.title}</td>
              <td className="expense-table__reason">{expense.reason}</td>
              <td className="expense-table__date">{formatDate(expense.date)}</td>
              <td className={`expense-table__amount ${expense.type === 'INCOME' ? 'text-success' : ''}`} style={{ color: expense.type === 'INCOME' ? 'var(--success)' : 'var(--primary)' }}>
                {expense.type === 'INCOME' ? '+' : '-'}{formatAmount(expense.amount)}
              </td>
              <td className="expense-table__reminder">
                {expense.reminderDate ? (
                  <span className={`reminder-icon ${isReminderSoon(expense.reminderDate) ? 'reminder-icon--active' : ''}`} title={`Recordatorio: ${formatDate(expense.reminderDate)}`}>
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                    </svg>
                  </span>
                ) : (
                  <span className="reminder-dash">—</span>
                )}
              </td>
              <td className="expense-table__actions">
                <div className="expense-table__actions-group">
                  {onEdit ? (
                    <button className="action-btn action-btn--edit" onClick={() => onEdit(expense)} title="Editar">
                      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                      </svg>
                    </button>
                  ) : null}
                  {onDelete ? (
                    <button className="action-btn action-btn--delete" onClick={() => onDelete(expense.id)} title="Eliminar">
                      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                    </button>
                  ) : null}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
