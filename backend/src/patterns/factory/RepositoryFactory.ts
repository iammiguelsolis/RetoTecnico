import { IExpenseRepository } from '../../repository/interfaces/IExpenseRepository';
import { MySqlExpenseRepository } from '../../data/MySqlExpenseRepository';
import { JsonExpenseRepository } from '../../data/JsonExpenseRepository';
import { CacheExpenseProxy } from '../proxy/CacheExpenseProxy';

export class RepositoryFactory {
  private static instance: IExpenseRepository | null = null;

  public static getExpenseRepository(): IExpenseRepository {
    if (!this.instance) {
      const dbType = process.env['DB_TYPE'] || 'mysql';

      let baseRepository: IExpenseRepository;

      if (dbType.toLowerCase() === 'mysql') {
        baseRepository = new MySqlExpenseRepository();
        console.log('🏭 [Factory] Instanciado MySqlExpenseRepository');
      } else {
        baseRepository = new JsonExpenseRepository();
        console.log('🏭 [Factory] Instanciado JsonExpenseRepository');
      }

      // Envolvemos el repositorio base con el Proxy de Caché
      this.instance = new CacheExpenseProxy(baseRepository);
      console.log('🛡️  [Proxy] Caché activada sobre el repositorio base');
    }

    return this.instance;
  }
}
