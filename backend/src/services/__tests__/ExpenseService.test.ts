import { ExpenseService } from '../ExpenseService';
import { IExpenseRepository } from '../../repository/interfaces/IExpenseRepository';
import { ExpenseSubject } from '../../patterns/observer/ExpenseSubject';
import { IExpense, CreateExpenseDTO } from '../../models/Expense';
import { NotFoundError } from '../../errors/NotFoundError';

// ─── MOCKS (Dobles de prueba) ──────────────────────────────────────
// Son objetos "de mentira" que reemplazan al repositorio real y al observer.
// jest.fn() crea funciones espía: no hacen nada, pero registran
// si fueron llamadas, con qué argumentos y cuántas veces.

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

// ─── FIXTURE (Dato de prueba reutilizable) ─────────────────────────
// Es un gasto inventado que usamos como respuesta predefinida de los mocks.
// Todos los tests comparten este mismo objeto para ser consistentes.

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

// ─── TESTS ─────────────────────────────────────────────────────────

describe('ExpenseService', () => {
  let expenseService: ExpenseService;

  // beforeEach: se ejecuta ANTES de cada test individual.
  // Limpia los espías y crea una instancia fresca del servicio
  // para que un test no contamine al siguiente.
  beforeEach(() => {
    jest.clearAllMocks();
    expenseService = new ExpenseService(mockRepository, mockSubject);
  });

  // ── Pruebas de CREAR gasto ──────────────────────────────────────
  describe('createExpense', () => {
    it('should persist the expense and notify observers', async () => {
      const dto: CreateExpenseDTO = {
        title: 'Cena de negocios',
        amount: 150,
        date: '2026-03-01T10:00:00.000Z',
        reason: 'Comida',
        type: 'EXPENSE',
        priorityLevel: 'HIGH',
      };

      // PREPARAR: le decimos al mock "cuando te llamen con .create(), devuelve mockExpense"
      mockRepository.create.mockResolvedValue(mockExpense);

      // EJECUTAR: llamamos al método real del servicio
      const result = await expenseService.createExpense('user-1', dto);

      // VERIFICAR: revisamos que todo pasó como esperábamos
      expect(mockRepository.create).toHaveBeenCalledWith('user-1', dto); // ¿Se guardó en la DB?
      expect(mockSubject.notify).toHaveBeenCalledWith(mockExpense);      // ¿Se avisó al Observer?
      expect(result).toEqual(mockExpense);                               // ¿Devolvió el gasto creado?
    });
  });

  // ── Pruebas de ELIMINAR gasto ───────────────────────────────────
  describe('deleteExpense', () => {
    // Caso feliz: el gasto existe y se borra sin problemas
    it('should resolve when the expense exists', async () => {
      mockRepository.delete.mockResolvedValue(true); // Simula: "sí, lo borré"

      await expect(expenseService.deleteExpense('exp-1')).resolves.toBeUndefined();
      expect(mockRepository.delete).toHaveBeenCalledWith('exp-1');
    });

    // Caso de error: el ID no existe, debe lanzar NotFoundError
    it('should throw NotFoundError when the expense does not exist', async () => {
      mockRepository.delete.mockResolvedValue(false); // Simula: "no encontré ese ID"

      await expect(expenseService.deleteExpense('non-existent'))
        .rejects
        .toThrow(NotFoundError); // Verificamos que SÍ lanza el error correcto

      expect(mockRepository.delete).toHaveBeenCalledWith('non-existent');
    });
  });

  // ── Pruebas de ACTUALIZAR gasto ─────────────────────────────────
  describe('updateExpense', () => {
    // Caso feliz: el gasto existe y se actualiza correctamente
    it('should return the updated expense when it exists', async () => {
      const updated: IExpense = { ...mockExpense, amount: 200 }; // Copia con monto cambiado
      mockRepository.update.mockResolvedValue(updated);

      const result = await expenseService.updateExpense('exp-1', { amount: 200 });

      expect(mockRepository.update).toHaveBeenCalledWith('exp-1', { amount: 200 });
      expect(result).toEqual(updated); // ¿Devolvió el gasto con el nuevo monto?
    });

    // Caso de error: el ID no existe
    it('should throw NotFoundError when the expense does not exist', async () => {
      mockRepository.update.mockResolvedValue(null); // Simula: "no encontré ese ID"

      await expect(expenseService.updateExpense('non-existent', { amount: 200 }))
        .rejects
        .toThrow(NotFoundError);

      expect(mockRepository.update).toHaveBeenCalledWith('non-existent', { amount: 200 });
    });
  });

  // ── Pruebas de LISTAR todos los gastos ──────────────────────────
  describe('getAllExpenses', () => {
    // Caso con datos: devuelve la lista completa del usuario
    it('should return all expenses for the given user', async () => {
      const list: IExpense[] = [mockExpense, { ...mockExpense, id: 'exp-2', title: 'Transporte' }];
      mockRepository.findAll.mockResolvedValue(list);

      const result = await expenseService.getAllExpenses('user-1');

      expect(mockRepository.findAll).toHaveBeenCalledWith('user-1');
      expect(result).toHaveLength(2);  // ¿Devolvió exactamente 2 gastos?
      expect(result).toEqual(list);
    });

    // Caso vacío: el usuario no tiene gastos, devuelve array vacío sin error
    it('should return an empty array when the user has no expenses', async () => {
      mockRepository.findAll.mockResolvedValue([]);

      const result = await expenseService.getAllExpenses('user-1');

      expect(result).toEqual([]);
      expect(mockRepository.findAll).toHaveBeenCalledWith('user-1');
    });
  });

  // ── Pruebas de FILTRAR gastos por mes ───────────────────────────
  describe('getExpensesByMonth', () => {
    // Caso con datos: devuelve solo los gastos de marzo 2026
    it('should return expenses matching the given year and month', async () => {
      const marchExpense: IExpense = { ...mockExpense, date: '2026-03-15T10:00:00.000Z' };
      mockRepository.findByMonth.mockResolvedValue([marchExpense]);

      const result = await expenseService.getExpensesByMonth('user-1', 2026, 3);

      expect(mockRepository.findByMonth).toHaveBeenCalledWith('user-1', 2026, 3);
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(marchExpense);
    });

    // Caso vacío: no hay gastos en enero 2024
    it('should return an empty array when no expenses match the month', async () => {
      mockRepository.findByMonth.mockResolvedValue([]);

      const result = await expenseService.getExpensesByMonth('user-1', 2024, 1);

      expect(result).toEqual([]);
      expect(mockRepository.findByMonth).toHaveBeenCalledWith('user-1', 2024, 1);
    });
  });
});
