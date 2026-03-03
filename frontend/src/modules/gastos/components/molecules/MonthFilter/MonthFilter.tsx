import './MonthFilter.css';

interface MonthFilterProps {
  year: number;
  month: number;
  onYearChange: (year: number) => void;
  onMonthChange: (month: number) => void;
  onClear: () => void;
  isFiltering: boolean;
}

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

export const MonthFilter = ({
  year,
  month,
  onYearChange,
  onMonthChange,
  onClear,
  isFiltering,
}: MonthFilterProps) => {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);

  return (
    <div className="month-filter">
      <div className="month-filter__fields">
        <div className="month-filter__field">
          <label className="month-filter__label">Año</label>
          <select
            className="month-filter__select"
            value={year}
            onChange={(e) => onYearChange(Number(e.target.value))}
          >
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        <div className="month-filter__field">
          <label className="month-filter__label">Mes</label>
          <select
            className="month-filter__select"
            value={month}
            onChange={(e) => onMonthChange(Number(e.target.value))}
          >
            {MONTHS.map((name, i) => (
              <option key={i + 1} value={i + 1}>{name}</option>
            ))}
          </select>
        </div>
      </div>

      {isFiltering ? (
        <button className="month-filter__clear" onClick={onClear}>
          Quitar filtro
        </button>
      ) : null}
    </div>
  );
};
