import type { InputHTMLAttributes } from 'react';
import './ExpenseFormInput.css';

interface ExpenseFormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
}

export const ExpenseFormInput = ({
  label,
  error,
  helperText,
  id,
  className = '',
  ...inputProps
}: ExpenseFormInputProps) => {
  const inputId = id || `input-${label.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div className={`form-input ${error ? 'form-input--error' : ''} ${className}`}>
      <label htmlFor={inputId} className="form-input__label">
        {label}
      </label>
      <input
        id={inputId}
        className="form-input__field"
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : undefined}
        {...inputProps}
      />
      {error ? (
        <span id={`${inputId}-error`} className="form-input__error" role="alert">
          {error}
        </span>
      ) : helperText ? (
        <span className="form-input__helper">{helperText}</span>
      ) : null}
    </div>
  );
};
