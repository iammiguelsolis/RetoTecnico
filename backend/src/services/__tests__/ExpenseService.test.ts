import { ExpenseService } from '../ExpenseService';
import { IExpenseRepository } from '../../repository/interfaces/IExpenseRepository';
import { ExpenseSubject } from '../../patterns/observer/ExpenseSubject';
import { AutocompleteTrie } from '../../structures/Trie';
import { IExpense, CreateExpenseDTO } from '../../models/Expense';
import { NotFoundError } from '../../errors/NotFoundError';

// Mocks

const mockRepository: jest.Mocked<IExpenseRepository> = {
  findAll: jest.fn(),
  findByMonth: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

const mockSubject: jest.Mocked<ExpenseSubject> = {
  attach: jest.fn(),
  detach: jest.fn(),
  notify: jest.fn(),
} as any;

const mockTrie: jest.Mocked<AutocompleteTrie> = {
  insert: jest.fn(),
  suggest: jest.fn(),
} as any;

// Fixture de prueba

const mockExpense: IExpense = {
  id: 'exp-1',
  userId: 'user-1',
  title: 'Cena de negocios',
  amount: 150,
  date: '2026-03-01T10:00:00.000Z',
  reason: 'Comida',
  type: 'EXPENSE',
  priorityLevel: 'HIGH',
  reminderDate: null,
  isRecurring: false,
  frequency: null,
  interval: 0,
  createdAt: '2026-03-01T10:00:00.000Z',
  updatedAt: '2026-03-01T10:00:00.000Z',
};

describe('ExpenseService', () => {
  let expenseService: ExpenseService;

  beforeEach(() => {
    jest.clearAllMocks();
    expenseService = new ExpenseService(mockRepository, mockSubject, mockTrie);
  });

  describe('createExpense', () => {
    it('should persist the expense, notify observers and update the Trie', async () => {
      const dto: CreateExpenseDTO = {
        title: 'Cena de negocios',
        amount: 150,
        date: '2026-03-01T10:00:00.000Z',
        reason: 'Comida',
        type: 'EXPENSE',
        priorityLevel: 'HIGH',
      };

      mockRepository.create.mockResolvedValue(mockExpense);

      const result = await expenseService.createExpense('user-1', dto);

      expect(mockRepository.create).toHaveBeenCalledWith('user-1', dto);
      expect(mockSubject.notify).toHaveBeenCalledWith(mockExpense);
      expect(mockTrie.insert).toHaveBeenCalledWith(mockExpense.title);
      expect(result).toEqual(mockExpense);
    });
  });

  describe('deleteExpense', () => {
    it('should resolve when the expense exists', async () => {
      mockRepository.delete.mockResolvedValue(true);

      await expect(expenseService.deleteExpense('exp-1')).resolves.toBeUndefined();
      expect(mockRepository.delete).toHaveBeenCalledWith('exp-1');
    });

    it('should throw NotFoundError when the expense does not exist', async () => {
      mockRepository.delete.mockResolvedValue(false);

      await expect(expenseService.deleteExpense('non-existent'))
        .rejects
        .toThrow(NotFoundError);

      expect(mockRepository.delete).toHaveBeenCalledWith('non-existent');
    });
  });

  describe('updateExpense', () => {
    it('should return the updated expense when it exists', async () => {
      const updated: IExpense = { ...mockExpense, amount: 200 };
      mockRepository.update.mockResolvedValue(updated);

      const result = await expenseService.updateExpense('exp-1', { amount: 200 });

      expect(mockRepository.update).toHaveBeenCalledWith('exp-1', { amount: 200 });
      expect(result).toEqual(updated);
    });

    it('should throw NotFoundError when the expense does not exist', async () => {
      mockRepository.update.mockResolvedValue(null);

      await expect(expenseService.updateExpense('non-existent', { amount: 200 }))
        .rejects
        .toThrow(NotFoundError);

      expect(mockRepository.update).toHaveBeenCalledWith('non-existent', { amount: 200 });
    });
  });

  describe('getAllExpenses', () => {
    it('should return all expenses for the given user', async () => {
      const list: IExpense[] = [mockExpense, { ...mockExpense, id: 'exp-2', title: 'Transporte' }];
      mockRepository.findAll.mockResolvedValue(list);

      const result = await expenseService.getAllExpenses('user-1');

      expect(mockRepository.findAll).toHaveBeenCalledWith('user-1');
      expect(result).toHaveLength(2);
      expect(result).toEqual(list);
    });

    it('should return an empty array when the user has no expenses', async () => {
      mockRepository.findAll.mockResolvedValue([]);

      const result = await expenseService.getAllExpenses('user-1');

      expect(result).toEqual([]);
      expect(mockRepository.findAll).toHaveBeenCalledWith('user-1');
    });
  });

  describe('getExpensesByMonth', () => {
    it('should return expenses matching the given year and month', async () => {
      const marchExpense: IExpense = { ...mockExpense, date: '2026-03-15T10:00:00.000Z' };
      mockRepository.findByMonth.mockResolvedValue([marchExpense]);

      const result = await expenseService.getExpensesByMonth('user-1', 2026, 3);

      expect(mockRepository.findByMonth).toHaveBeenCalledWith('user-1', 2026, 3);
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(marchExpense);
    });

    it('should return an empty array when no expenses match the month', async () => {
      mockRepository.findByMonth.mockResolvedValue([]);

      const result = await expenseService.getExpensesByMonth('user-1', 2024, 1);

      expect(result).toEqual([]);
      expect(mockRepository.findByMonth).toHaveBeenCalledWith('user-1', 2024, 1);
    });
  });
});
