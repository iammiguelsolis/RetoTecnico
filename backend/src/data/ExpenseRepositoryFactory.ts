import { IExpenseRepository } from '../repository/interfaces/IExpenseRepository';
import { IUserRepository } from '../repository/interfaces/IUserRepository';
import { JsonExpenseRepository } from './JsonExpenseRepository';
import { MySqlExpenseRepository } from './MySqlExpenseRepository';
import { JsonUserRepository } from './JsonUserRepository';
import { MySqlUserRepository } from './MySqlUserRepository';

type StorageType = 'json' | 'mysql';

/**
 * RepositoryFactory
 *
 * Patrón Factory que instancia los repositorios correctos
 * basándose en la variable de entorno STORAGE_TYPE.
 *
 * ⚠️ AMBAS implementaciones (JSON y MySQL) se mantienen siempre.
 * Cambiar entre ellas es cuestión de modificar .env.
 */
export class RepositoryFactory {
  private static getStorageType(): StorageType {
    return (process.env['STORAGE_TYPE'] ?? 'json') as StorageType;
  }

  static createExpenseRepository(): IExpenseRepository {
    const type = this.getStorageType();
    switch (type) {
      case 'json':
        console.log('📁 Gastos: Archivo JSON local');
        return new JsonExpenseRepository();
      case 'mysql':
        console.log('🗄️  Gastos: MySQL');
        return new MySqlExpenseRepository();
      default:
        throw new Error(`STORAGE_TYPE "${type}" no soportado`);
    }
  }

  static createUserRepository(): IUserRepository {
    const type = this.getStorageType();
    switch (type) {
      case 'json':
        console.log('📁 Usuarios: Archivo JSON local');
        return new JsonUserRepository();
      case 'mysql':
        console.log('🗄️  Usuarios: MySQL');
        return new MySqlUserRepository();
      default:
        throw new Error(`STORAGE_TYPE "${type}" no soportado`);
    }
  }
}
