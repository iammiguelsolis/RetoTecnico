import { useEffect, useState, useCallback } from 'react';
import type { IExpense, CreateExpenseDTO } from '../../core/types';
import { expenseService } from '../../core/services';
import { Button } from '../../core/components/atoms';
import { ExpenseTable, ExpenseForm } from '../components/organisms';
import { MonthFilter } from '../components/molecules';
import './GastosPage.css';

export const GastosPage = () => {
  const [expenses, setExpenses] = useState<IExpense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState<IExpense | null>(null);

  const now = new Date();
  const [filterYear, setFilterYear] = useState(now.getFullYear());
  const [filterMonth, setFilterMonth] = useState(now.getMonth() + 1);
  const [isFiltering, setIsFiltering] = useState(false);

  const loadExpenses = useCallback(async () => {
    try { setIsLoading(true); setError(null); const data = await expenseService.getAll(); setExpenses(data); }
    catch { setError('Error al cargar los gastos. Verifica que el servidor esté activo.'); }
    finally { setIsLoading(false); }
  }, []);

  const loadExpensesByMonth = useCallback(async (year: number, month: number) => {
    try { setIsLoading(true); setError(null); const data = await expenseService.getByMonth(year, month); setExpenses(data); }
    catch { setError('Error al filtrar gastos.'); }
    finally { setIsLoading(false); }
  }, []);

  useEffect(() => { loadExpenses(); }, [loadExpenses]);

  const handleCreate = async (data: CreateExpenseDTO) => {
    try { setIsSubmitting(true); const n = await expenseService.create(data); setExpenses((p) => [n, ...p]); setShowForm(false); setExpenseToEdit(null); }
    catch { setError('Error al crear el gasto.'); }
    finally { setIsSubmitting(false); }
  };

  const handleUpdate = async (data: CreateExpenseDTO) => {
    if (!expenseToEdit) return;
    try { setIsSubmitting(true); const u = await expenseService.update(expenseToEdit.id, data); setExpenses((p) => p.map((e) => (e.id === u.id ? u : e))); setShowForm(false); setExpenseToEdit(null); }
    catch { setError('Error al actualizar el gasto.'); }
    finally { setIsSubmitting(false); }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Estás seguro de eliminar este gasto?')) return;
    try { await expenseService.delete(id); setExpenses((p) => p.filter((e) => e.id !== id)); }
    catch { setError('Error al eliminar el gasto.'); }
  };

  const openCreateForm = () => { setExpenseToEdit(null); setShowForm(true); };
  const openEditForm = (expense: IExpense) => { setExpenseToEdit(expense); setShowForm(true); };
  const closeForm = () => { setShowForm(false); setExpenseToEdit(null); };
  const applyFilter = () => { setIsFiltering(true); loadExpensesByMonth(filterYear, filterMonth); };
  const clearFilter = () => { setIsFiltering(false); loadExpenses(); };

  const totalIncome = expenses.filter(e => e.type === 'INCOME').reduce((s, e) => s + e.amount, 0);
  const totalExpenses = expenses.filter(e => e.type === 'EXPENSE').reduce((s, e) => s + e.amount, 0);
  const balance = totalIncome - totalExpenses;

  return (
    <div className="gastos-page">
      <header className="gastos-header">
        <div className="gastos-header__info">
          <h1>Mis Gastos</h1>
          <p>Gestiona y controla tus gastos personales</p>
        </div>
        <Button variant="primary" size="md" onClick={openCreateForm}>
          Nuevo
        </Button>
      </header>

      <div className="gastos-stats">
        <div className="stat-card">
          <div className="stat-card__icon stat-card__icon--sage">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="stat-card__label">Ingresos</p>
            <p className="stat-card__value" style={{ color: 'var(--success)' }}>
              {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'USD' }).format(totalIncome)}
            </p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card__icon stat-card__icon--coral">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
            </svg>
          </div>
          <div>
            <p className="stat-card__label">Gastos</p>
            <p className="stat-card__value" style={{ color: 'var(--primary)' }}>
              {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'USD' }).format(totalExpenses)}
            </p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card__icon stat-card__icon--navy">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
          </div>
          <div>
            <p className="stat-card__label">Balance Neto</p>
            <p className={`stat-card__value ${balance >= 0 ? 'text-success' : 'text-danger'}`} style={{ color: balance >= 0 ? 'var(--success)' : 'var(--danger)' }}>
              {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'USD' }).format(balance)}
            </p>
          </div>
        </div>
      </div>

      <div className="gastos-toolbar">
        <MonthFilter year={filterYear} month={filterMonth} onYearChange={setFilterYear} onMonthChange={setFilterMonth} onClear={clearFilter} isFiltering={isFiltering} />
        <Button variant="secondary" size="sm" onClick={applyFilter}>
          <svg style={{ width: 14, height: 14 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          Filtrar
        </Button>
      </div>

      {error ? (
        <div className="gastos-alert" role="alert">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
          {error}
          <button className="gastos-alert__retry" onClick={isFiltering ? applyFilter : loadExpenses}>Reintentar</button>
        </div>
      ) : null}

      <ExpenseTable expenses={expenses} isLoading={isLoading} onEdit={openEditForm} onDelete={handleDelete} />

      {showForm ? (
        <ExpenseForm expenseToEdit={expenseToEdit} onSubmit={expenseToEdit ? handleUpdate : handleCreate} onCancel={closeForm} isSubmitting={isSubmitting} />
      ) : null}
    </div>
  );
};
