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
 * Instancia los repositorios correctos segun la variable de entorno STORAGE_TYPE.
 * Ambas implementaciones (JSON y MySQL).
 * Para cambiar entre ellas basta con modificar el valor en .env.
 */
export class RepositoryFactory {
  private static getStorageType(): StorageType {
    return (process.env['STORAGE_TYPE'] ?? 'json') as StorageType;
  }

  static createExpenseRepository(): IExpenseRepository {
    const type = this.getStorageType();
    switch (type) {
      case 'json':
        console.log('Gastos: archivo JSON local');
        return new JsonExpenseRepository();
      case 'mysql':
        console.log('Gastos: MySQL');
        return new MySqlExpenseRepository();
      default:
        throw new Error(`STORAGE_TYPE "${type}" no soportado`);
    }
  }

  static createUserRepository(): IUserRepository {
    const type = this.getStorageType();
    switch (type) {
      case 'json':
        console.log('Usuarios: archivo JSON local');
        return new JsonUserRepository();
      case 'mysql':
        console.log('Usuarios: MySQL');
        return new MySqlUserRepository();
      default:
        throw new Error(`STORAGE_TYPE "${type}" no soportado`);
    }
  }
}
