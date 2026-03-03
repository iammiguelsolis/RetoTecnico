import { useState, useEffect } from 'react';
import type { IExpense, CreateExpenseDTO, PriorityLevel, TransactionType, RecurrenceFrequency } from '../../../../core/types';
import { ExpenseFormInput } from '../../../../core/components/molecules';
import { Button } from '../../../../core/components/atoms';
import './ExpenseForm.css';

interface ExpenseFormProps {
  expenseToEdit?: IExpense | null;
  onSubmit: (data: CreateExpenseDTO) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

interface FormErrors {
  title?: string;
  reason?: string;
  date?: string;
  amount?: string;
}

export const ExpenseForm = ({
  expenseToEdit,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: ExpenseFormProps) => {
  const isEditing = !!expenseToEdit;

  const [title, setTitle] = useState('');
  const [reason, setReason] = useState('');
  const [date, setDate] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>('EXPENSE');
  const [priorityLevel, setPriorityLevel] = useState<PriorityLevel | ''>('');
  const [reminderDate, setReminderDate] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [frequency, setFrequency] = useState<RecurrenceFrequency | ''>('');
  const [interval, setIntervalVal] = useState('1');
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (expenseToEdit) {
      setTitle(expenseToEdit.title);
      setReason(expenseToEdit.reason);
      setDate(expenseToEdit.date.slice(0, 10));
      setAmount(String(expenseToEdit.amount));
      setType(expenseToEdit.type || 'EXPENSE');
      setPriorityLevel(expenseToEdit.priorityLevel);
      setReminderDate(expenseToEdit.reminderDate?.slice(0, 10) ?? '');
      setIsRecurring(expenseToEdit.isRecurring || false);
      setFrequency(expenseToEdit.frequency ?? '');
      setIntervalVal(String(expenseToEdit.interval || 1));
      setErrors({});
    } else {
      resetForm();
    }
  }, [expenseToEdit]);

  const resetForm = () => {
    setTitle(''); setReason(''); setDate(''); setAmount(''); setType('EXPENSE');
    setPriorityLevel(''); setReminderDate(''); setIsRecurring(false);
    setFrequency(''); setIntervalVal('1'); setErrors({});
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!title.trim()) newErrors.title = 'El título es obligatorio';
    else if (title.trim().length > 100) newErrors.title = 'Máximo 100 caracteres';
    if (!reason.trim()) newErrors.reason = 'El motivo es obligatorio';
    else if (reason.trim().length > 255) newErrors.reason = 'Máximo 255 caracteres';
    if (!date) newErrors.date = 'La fecha es obligatoria';
    const parsedAmount = parseFloat(amount);
    if (!amount) newErrors.amount = 'El monto es obligatorio';
    else if (isNaN(parsedAmount)) newErrors.amount = 'Número inválido';
    else if (parsedAmount <= 0) newErrors.amount = 'Mayor a 0';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const expenseData: CreateExpenseDTO = {
      title: title.trim(),
      reason: reason.trim(),
      date: new Date(date).toISOString(),
      amount: parseFloat(amount),
      type,
      ...(priorityLevel && { priorityLevel: priorityLevel as PriorityLevel }),
      ...(reminderDate && { reminderDate: new Date(reminderDate).toISOString() }),
      isRecurring,
      ...(isRecurring && frequency && { frequency: frequency as RecurrenceFrequency }),
      ...(isRecurring && { interval: parseInt(interval) || 1 }),
    };

    await onSubmit(expenseData);
  };

  return (
    <div className="expense-form__overlay" onClick={onCancel}>
      <form
        className="expense-form"
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        noValidate
      >
        <header className="expense-form__header">
          <h2 className="expense-form__title">
            {isEditing ? 'Editar gasto' : 'Nuevo gasto'}
          </h2>
          <button type="button" className="expense-form__close" onClick={onCancel} aria-label="Cerrar">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        <div className="expense-form__body">
          <div className="expense-form__type-toggle">
            <button
              type="button"
              className={`type-btn ${type === 'EXPENSE' ? 'type-btn--active type-btn--expense' : ''}`}
              onClick={() => setType('EXPENSE')}
            >
              Gasto
            </button>
            <button
              type="button"
              className={`type-btn ${type === 'INCOME' ? 'type-btn--active type-btn--income' : ''}`}
              onClick={() => setType('INCOME')}
            >
              Ingreso
            </button>
          </div>

          <ExpenseFormInput label="Título" placeholder="Ej: Almuerzo de oficina" value={title} onChange={(e) => setTitle(e.target.value)} error={errors.title} autoFocus />
          <ExpenseFormInput label="Motivo" placeholder="Ej: Comida del equipo" value={reason} onChange={(e) => setReason(e.target.value)} error={errors.reason} />

          <div className="expense-form__row">
            <ExpenseFormInput label="Fecha" type="date" value={date} onChange={(e) => setDate(e.target.value)} error={errors.date} />
            <ExpenseFormInput label="Monto (USD)" type="number" placeholder="0.00" min="0" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} error={errors.amount} />
          </div>

          <div className="expense-form__recurring">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
              />
              <span>Es una transacción recurrente</span>
            </label>

            {isRecurring && (
              <div className="expense-form__row mt-2">
                <div className="expense-form__group">
                  <label className="expense-form__label">Frecuencia</label>
                  <select className="expense-form__select" value={frequency} onChange={(e) => setFrequency(e.target.value as RecurrenceFrequency)}>
                    <option value="">Seleccionar...</option>
                    <option value="DAILY">Diario</option>
                    <option value="WEEKLY">Semanal</option>
                    <option value="MONTHLY">Mensual</option>
                    <option value="YEARLY">Anual</option>
                  </select>
                </div>
                <div className="expense-form__group">
                  <label className="expense-form__label">Cada cuánto (Int.)</label>
                  <input className="expense-form__input" type="number" min="1" value={interval} onChange={(e) => setIntervalVal(e.target.value)} />
                </div>
              </div>
            )}
          </div>

          <div className="expense-form__row">
            <div className="expense-form__group">
              <label className="expense-form__label">Prioridad</label>
              <select className="expense-form__select" value={priorityLevel} onChange={(e) => setPriorityLevel(e.target.value as PriorityLevel | '')}>
                <option value="">Auto (por monto)</option>
                <option value="LOW">Bajo</option>
                <option value="MEDIUM">Medio</option>
                <option value="HIGH">Alto</option>
              </select>
            </div>
            <div className="expense-form__group">
              <label className="expense-form__label">Recordatorio</label>
              <input className="expense-form__input" type="date" value={reminderDate} onChange={(e) => setReminderDate(e.target.value)} />
            </div>
          </div>
        </div>

        <footer className="expense-form__footer">
          <Button type="button" variant="secondary" onClick={onCancel}>Cancelar</Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            {isEditing ? 'Guardar cambios' : `Agregar ${type === 'INCOME' ? 'ingreso' : 'gasto'}`}
          </Button>
        </footer>
      </form>
    </div>
  );
};
