import { IExpenseRepository } from '../../repository/interfaces/IExpenseRepository';
import { IExpense, CreateExpenseDTO, UpdateExpenseDTO } from '../../models/Expense';

/**
 * Proxy que envuelve el repositorio base para cachear resultados en memoria.
 * Las operaciones de escritura invalidan la cache del usuario afectado.
 */
export class CacheExpenseProxy implements IExpenseRepository {
  // Cache en memoria: clave = "userId-year-month"
  private monthCache: Map<string, IExpense[]> = new Map();

  constructor(private readonly baseRepository: IExpenseRepository) { }

  async findByMonth(userId: string, year: number, month: number): Promise<IExpense[]> {
    const cacheKey = `${userId}-${year}-${month}`;

    // Si hay datos en cache, retornarlos directamente
    if (this.monthCache.has(cacheKey)) {
      return this.monthCache.get(cacheKey)!;
    }

    // Consultar el repositorio base y guardar el resultado en cache
    const data = await this.baseRepository.findByMonth(userId, year, month);
    this.monthCache.set(cacheKey, data);
    return data;
  }

  // Operaciones de escritura invalidan la caché para ese usuario
  async create(userId: string, data: CreateExpenseDTO): Promise<IExpense> {
    const result = await this.baseRepository.create(userId, data);
    this.invalidateCache(userId);
    return result;
  }

  async update(id: string, data: UpdateExpenseDTO): Promise<IExpense | null> {
    const result = await this.baseRepository.update(id, data);
    if (result) this.invalidateCache(result.userId);
    return result;
  }

  async delete(id: string): Promise<boolean> {
    // Obtener el gasto antes de eliminar para saber a qué usuario invalida
    const existing = await this.baseRepository.findById(id);
    if (existing) {
      this.invalidateCache(existing.userId);
    }
    return this.baseRepository.delete(id);
  }

  async findAll(userId: string): Promise<IExpense[]> {
    return this.baseRepository.findAll(userId);
  }

  async findById(id: string): Promise<IExpense | null> {
    return this.baseRepository.findById(id);
  }

  private invalidateCache(userId: string) {
    for (const key of this.monthCache.keys()) {
      if (key.startsWith(userId)) {
        this.monthCache.delete(key);
      }
    }
  }
}
