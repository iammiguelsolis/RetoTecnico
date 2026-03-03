import { FilterByMonthStrategy } from '../FilterByMonthStrategy';
import { IExpense } from '../../../models/Expense';

describe('FilterByMonthStrategy', () => {
  const mockExpenses: IExpense[] = [
    {
      id: '1',
      userId: 'user1',
      title: 'Enero 2024',
      amount: 100,
      date: new Date('2024-01-15T12:00:00Z'),
      reason: 'test',
      type: 'EXPENSE',
      priorityLevel: 'LOW'
    },
    {
      id: '2',
      userId: 'user1',
      title: 'Febrero 2024',
      amount: 200,
      date: new Date('2024-02-10T12:00:00Z'),
      reason: 'test',
      type: 'EXPENSE',
      priorityLevel: 'MEDIUM'
    },
    {
      id: '3',
      userId: 'user1',
      title: 'Diciembre 2023',
      amount: 300,
      date: new Date('2023-12-05T12:00:00Z'),
      reason: 'test',
      type: 'EXPENSE',
      priorityLevel: 'HIGH'
    }
  ];

  it('should filter expenses correctly for January 2024', () => {
    const strategy = new FilterByMonthStrategy(2024, 1);
    const result = strategy.execute(mockExpenses);

    expect(result.length).toBe(1);
    expect(result[0].title).toBe('Enero 2024');
  });

  it('should filter expenses correctly for December 2023', () => {
    const strategy = new FilterByMonthStrategy(2023, 12);
    const result = strategy.execute(mockExpenses);

    expect(result.length).toBe(1);
    expect(result[0].title).toBe('Diciembre 2023');
  });

  it('should return empty array when no expenses match the month and year', () => {
    const strategy = new FilterByMonthStrategy(2024, 6);
    const result = strategy.execute(mockExpenses);

    expect(result.length).toBe(0);
  });
});
