import mysql, { Pool, RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import crypto from 'crypto';
import { IUser, RegisterDTO } from '../models/User';
import { IUserRepository } from '../repository/interfaces/IUserRepository';

interface UserRow extends RowDataPacket {
  id: string; name: string; email: string;
  password_hash: string; monthly_budget: number;
  created_at: Date; updated_at: Date;
}

export class MySqlUserRepository implements IUserRepository {
  private readonly pool: Pool;
  private initialized = false;

  constructor(pool?: Pool) {
    this.pool = pool ?? mysql.createPool({
      host: process.env['MYSQL_HOST'] ?? 'localhost',
      port: Number(process.env['MYSQL_PORT'] ?? 3306),
      user: process.env['MYSQL_USER'] ?? 'root',
      password: process.env['MYSQL_PASSWORD'] ?? '',
      database: process.env['MYSQL_DATABASE'] ?? 'gestion_gastos_db',
      waitForConnections: true, connectionLimit: 10, queueLimit: 0,
    });
  }

  private async ensureTable(): Promise<void> {
    if (this.initialized) return;
    await this.pool.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id              VARCHAR(36)   NOT NULL PRIMARY KEY,
        name            VARCHAR(100)  NOT NULL,
        email           VARCHAR(255)  NOT NULL UNIQUE,
        password_hash   VARCHAR(255)  NOT NULL,
        monthly_budget  DECIMAL(12,2) NOT NULL DEFAULT 5000.00,
        created_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_users_email (email)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    this.initialized = true;
    console.log('Tabla "users" verificada/creada');
  }

  private mapRow(row: UserRow): IUser {
    return {
      id: row.id, name: row.name, email: row.email,
      passwordHash: row.password_hash,
      monthlyBudget: Number(row.monthly_budget),
      createdAt: new Date(row.created_at).toISOString(),
      updatedAt: new Date(row.updated_at).toISOString(),
    };
  }

  async findById(id: string): Promise<IUser | null> {
    await this.ensureTable();
    const [rows] = await this.pool.execute<UserRow[]>('SELECT * FROM users WHERE id = ?', [id]);
    return rows[0] ? this.mapRow(rows[0]) : null;
  }

  async findByEmail(email: string): Promise<IUser | null> {
    await this.ensureTable();
    const [rows] = await this.pool.execute<UserRow[]>('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0] ? this.mapRow(rows[0]) : null;
  }

  async create(data: RegisterDTO, passwordHash: string): Promise<IUser> {
    await this.ensureTable();
    const id = crypto.randomUUID();
    const now = new Date();
    await this.pool.execute<ResultSetHeader>(
      'INSERT INTO users (id, name, email, password_hash, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
      [id, data.name, data.email, passwordHash, now, now]
    );
    return (await this.findById(id))!;
  }

  async updateBudget(userId: string, monthlyBudget: number): Promise<void> {
    await this.ensureTable();
    await this.pool.execute<ResultSetHeader>(
      'UPDATE users SET monthly_budget = ? WHERE id = ?', [monthlyBudget, userId]
    );
  }
}
