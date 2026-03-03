import mysql, { Pool, RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import crypto from 'crypto';
import { IExpense, CreateExpenseDTO, UpdateExpenseDTO, PriorityLevel } from '../models/Expense';
import { IExpenseRepository } from '../repository/interfaces/IExpenseRepository';

interface ExpenseRow extends RowDataPacket {
  id: string; user_id: string; title: string; reason: string;
  date: Date; amount: number; type: 'INCOME' | 'EXPENSE';
  priority_level: string; reminder_date: Date | null;
  is_recurring: number; frequency: string | null; interval_val: number;
  created_at: Date; updated_at: Date;
}

export class MySqlExpenseRepository implements IExpenseRepository {
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
      CREATE TABLE IF NOT EXISTS expenses (
        id              VARCHAR(36)    NOT NULL PRIMARY KEY,
        user_id         VARCHAR(36)    NOT NULL,
        title           VARCHAR(100)   NOT NULL,
        reason          VARCHAR(255)   NOT NULL,
        date            DATETIME       NOT NULL,
        amount          DECIMAL(12,2)  NOT NULL,
        type            ENUM('INCOME','EXPENSE') NOT NULL DEFAULT 'EXPENSE',
        priority_level  ENUM('LOW','MEDIUM','HIGH') NOT NULL DEFAULT 'LOW',
        reminder_date   DATETIME       NULL,
        is_recurring    BOOLEAN        NOT NULL DEFAULT FALSE,
        frequency       ENUM('DAILY','WEEKLY','MONTHLY','YEARLY') NULL,
        interval_val    INT            NOT NULL DEFAULT 1,
        created_at      DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at      DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_expenses_user (user_id),
        INDEX idx_expenses_date (date)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Migration for existing table
    const [cols] = await this.pool.execute<RowDataPacket[]>('SHOW COLUMNS FROM expenses');
    const colNames = cols.map((c: any) => c.Field);
    if (!colNames.includes('user_id')) {
      await this.pool.execute("ALTER TABLE expenses ADD COLUMN user_id VARCHAR(36) NOT NULL");
    }
    if (!colNames.includes('priority_level')) {
      await this.pool.execute("ALTER TABLE expenses ADD COLUMN priority_level ENUM('LOW','MEDIUM','HIGH') NOT NULL DEFAULT 'LOW'");
    }
    if (!colNames.includes('reminder_date')) {
      await this.pool.execute("ALTER TABLE expenses ADD COLUMN reminder_date DATETIME NULL");
    }
    if (!colNames.includes('type')) {
      await this.pool.execute("ALTER TABLE expenses ADD COLUMN type ENUM('INCOME','EXPENSE') NOT NULL DEFAULT 'EXPENSE'");
    }
    if (!colNames.includes('is_recurring')) {
      await this.pool.execute("ALTER TABLE expenses ADD COLUMN is_recurring BOOLEAN NOT NULL DEFAULT FALSE");
      await this.pool.execute("ALTER TABLE expenses ADD COLUMN frequency ENUM('DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY') NULL");
      await this.pool.execute("ALTER TABLE expenses ADD COLUMN interval_val INT NOT NULL DEFAULT 1");
    }
    if (!colNames.includes('created_at')) {
      await this.pool.execute("ALTER TABLE expenses ADD COLUMN created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP");
    }
    if (!colNames.includes('updated_at')) {
      await this.pool.execute("ALTER TABLE expenses ADD COLUMN updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");
    }
    this.initialized = true;
    console.log('✅ Tabla "expenses" verificada/creada en MySQL');
  }

  private autoPriority(amount: number): PriorityLevel {
    if (amount >= 500) return 'HIGH';
    if (amount >= 100) return 'MEDIUM';
    return 'LOW';
  }

  private mapRow(row: ExpenseRow): IExpense {
    return {
      id: row.id,
      userId: row.user_id,
      title: row.title,
      reason: row.reason,
      date: new Date(row.date).toISOString(),
      amount: Number(row.amount),
      type: row.type,
      priorityLevel: row.priority_level as PriorityLevel,
      reminderDate: row.reminder_date ? new Date(row.reminder_date).toISOString() : null,
      isRecurring: Boolean(row.is_recurring),
      frequency: row.frequency as any,
      interval: row.interval_val,
      createdAt: new Date(row.created_at).toISOString(),
      updatedAt: new Date(row.updated_at).toISOString(),
    };
  }

  async findAll(userId: string): Promise<IExpense[]> {
    await this.ensureTable();
    const [rows] = await this.pool.execute<ExpenseRow[]>(
      'SELECT * FROM expenses WHERE user_id = ? ORDER BY created_at DESC', [userId]
    );
    return rows.map((r) => this.mapRow(r));
  }

  async findById(id: string): Promise<IExpense | null> {
    await this.ensureTable();
    const [rows] = await this.pool.execute<ExpenseRow[]>('SELECT * FROM expenses WHERE id = ?', [id]);
    return rows[0] ? this.mapRow(rows[0]) : null;
  }

  async findByMonth(userId: string, year: number, month: number): Promise<IExpense[]> {
    await this.ensureTable();
    const [rows] = await this.pool.execute<ExpenseRow[]>(
      'SELECT * FROM expenses WHERE user_id = ? AND YEAR(date) = ? AND MONTH(date) = ? ORDER BY date DESC',
      [userId, year, month]
    );
    return rows.map((r) => this.mapRow(r));
  }

  async create(userId: string, data: CreateExpenseDTO): Promise<IExpense> {
    await this.ensureTable();
    const id = crypto.randomUUID();
    const now = new Date();
    const priority = data.priorityLevel ?? this.autoPriority(data.amount);
    const reminder = data.reminderDate ? new Date(data.reminderDate) : null;

    await this.pool.execute<ResultSetHeader>(
      'INSERT INTO expenses (id, user_id, title, reason, date, amount, type, priority_level, reminder_date, is_recurring, frequency, interval_val, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        id, userId, data.title, data.reason, new Date(data.date), data.amount,
        data.type, priority, reminder, data.isRecurring ?? false,
        data.frequency ?? null, data.interval ?? 1, now, now
      ]
    );
    return (await this.findById(id))!;
  }

  async update(id: string, data: UpdateExpenseDTO): Promise<IExpense | null> {
    await this.ensureTable();
    const existing = await this.findById(id);
    if (!existing) return null;

    const fields: string[] = [];
    const values: (string | number | Date | null)[] = [];

    if (data.title !== undefined) { fields.push('title = ?'); values.push(data.title); }
    if (data.reason !== undefined) { fields.push('reason = ?'); values.push(data.reason); }
    if (data.date !== undefined) { fields.push('date = ?'); values.push(new Date(data.date)); }
    if (data.amount !== undefined) { fields.push('amount = ?'); values.push(data.amount); }
    if (data.type !== undefined) { fields.push('type = ?'); values.push(data.type); }
    if (data.priorityLevel !== undefined) { fields.push('priority_level = ?'); values.push(data.priorityLevel); }
    if (data.reminderDate !== undefined) { fields.push('reminder_date = ?'); values.push(data.reminderDate ? new Date(data.reminderDate) : null); }
    if (data.isRecurring !== undefined) { fields.push('is_recurring = ?'); values.push(data.isRecurring ? 1 : 0); }
    if (data.frequency !== undefined) { fields.push('frequency = ?'); values.push(data.frequency); }
    if (data.interval !== undefined) { fields.push('interval_val = ?'); values.push(data.interval); }

    if (fields.length === 0) return existing;
    fields.push('updated_at = ?'); values.push(new Date()); values.push(id);

    await this.pool.execute<ResultSetHeader>(
      `UPDATE expenses SET ${fields.join(', ')} WHERE id = ?`, values
    );
    return this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    await this.ensureTable();
    const [result] = await this.pool.execute<ResultSetHeader>('DELETE FROM expenses WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
}
