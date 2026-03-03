import { IExpenseRepository } from '../../repository/interfaces/IExpenseRepository';
import { IExpense, CreateExpenseDTO, UpdateExpenseDTO } from '../../models/Expense';

/**
 * Patrón Proxy / Decorator:
 * Intercepta llamadas al repositorio base para cachear resultados (O(1)) o invalidar.
 */
export class CacheExpenseProxy implements IExpenseRepository {
  // Caché en memoria: Llave = "userId-year-month", Valor = IExpense[]
  private monthCache: Map<string, IExpense[]> = new Map();

  constructor(private readonly baseRepository: IExpenseRepository) { }

  async findByMonth(userId: string, year: number, month: number): Promise<IExpense[]> {
    const cacheKey = `${userId}-${year}-${month}`;

    // 1. Verificamos el Hash Map (Proxy Intercept)
    if (this.monthCache.has(cacheKey)) {
      console.log(`⚡ [CACHE HIT] Datos O(1) cargados para ${cacheKey}`);
      return this.monthCache.get(cacheKey)!;
    }

    // 2. Fallback al repositorio base (MySQL / JSON)
    console.log(`⏳ [CACHE MISS] Consultando base de datos para ${cacheKey}`);
    const data = await this.baseRepository.findByMonth(userId, year, month);

    // 3. Guardamos en el Map para futuras peticiones
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
    // Si borramos un gasto, necesitamos limpiar la caché del usuario.
    // Como el ID de gasto no incluye el userID, por simplicidad en el Proxy 
    // invalidamos la caché completa, o mejor aún, leemos el gasto primero:
    const existing = await this.baseRepository.findById(id);
    if (existing) {
      this.invalidateCache(existing.userId);
    }
    return this.baseRepository.delete(id);
  }

  // Operaciones directas (podrían cachearse también si se quisiera)
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
        console.log(`🗑️ [CACHE INVAL] Llave eliminada: ${key}`);
      }
    }
  }
}
