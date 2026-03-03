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
  delete: jest.fn()
};

const mockSubject: jest.Mocked<ExpenseSubject> = {
  attach: jest.fn(),
  detach: jest.fn(),
  notify: jest.fn()
} as any;

const mockTrie: jest.Mocked<AutocompleteTrie> = {
  insert: jest.fn(),
  suggest: jest.fn()
} as any;

describe('ExpenseService', () => {
  let expenseService: ExpenseService;

  beforeEach(() => {
    jest.clearAllMocks();
    expenseService = new ExpenseService(mockRepository, mockSubject, mockTrie);
  });

  const mockExpense: IExpense = {
    id: 'exp-1',
    userId: 'user-1',
    title: 'Cena de negocios',
    amount: 150,
    date: new Date(),
    reason: 'Comida',
    type: 'EXPENSE',
    priorityLevel: 'HIGH'
  };

  it('createExpense should save the expense, notify observers, and update the Trie', async () => {
    const createDto: CreateExpenseDTO = {
      title: 'Cena de negocios',
      amount: 150,
      date: new Date().toISOString(),
      reason: 'Comida',
      type: 'EXPENSE',
      priorityLevel: 'HIGH'
    };

    mockRepository.create.mockResolvedValue(mockExpense);

    const result = await expenseService.createExpense('user-1', createDto);

    // Assertions
    expect(mockRepository.create).toHaveBeenCalledWith('user-1', createDto);
    expect(mockSubject.notify).toHaveBeenCalledWith(mockExpense);
    expect(mockTrie.insert).toHaveBeenCalledWith(mockExpense.title);
    expect(result).toEqual(mockExpense);
  });

  it('deleteExpense should call repository and throw NotFoundError if false', async () => {
    mockRepository.delete.mockResolvedValue(false);

    await expect(expenseService.deleteExpense('invalid-id'))
      .rejects
      .toThrow(NotFoundError);

    expect(mockRepository.delete).toHaveBeenCalledWith('invalid-id');
  });

  it('deleteExpense should resolve successfully if true', async () => {
    mockRepository.delete.mockResolvedValue(true);

    await expect(expenseService.deleteExpense('valid-id')).resolves.toBeUndefined();
    expect(mockRepository.delete).toHaveBeenCalledWith('valid-id');
  });
});
