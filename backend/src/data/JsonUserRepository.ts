import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { IUser, RegisterDTO } from '../models/User';
import { IUserRepository } from '../repository/interfaces/IUserRepository';

/**
 * JsonUserRepository
 *
 * Persistencia de usuarios en archivo JSON local.
 */
export class JsonUserRepository implements IUserRepository {
  private readonly filePath: string;

  constructor(filePath?: string) {
    this.filePath = filePath ?? path.join(__dirname, '..', '..', 'data', 'users.json');
  }

  private async readFile(): Promise<IUser[]> {
    try {
      const data = await fs.readFile(this.filePath, 'utf-8');
      return JSON.parse(data) as IUser[];
    } catch (error: unknown) {
      if (error instanceof Error && 'code' in error && (error as NodeJS.ErrnoException).code === 'ENOENT') {
        const dir = path.dirname(this.filePath);
        await fs.mkdir(dir, { recursive: true });
        await fs.writeFile(this.filePath, JSON.stringify([], null, 2), 'utf-8');
        return [];
      }
      throw error;
    }
  }

  private async writeFile(users: IUser[]): Promise<void> {
    const dir = path.dirname(this.filePath);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(this.filePath, JSON.stringify(users, null, 2), 'utf-8');
  }

  async findById(id: string): Promise<IUser | null> {
    const users = await this.readFile();
    return users.find((u) => u.id === id) ?? null;
  }

  async findByEmail(email: string): Promise<IUser | null> {
    const users = await this.readFile();
    return users.find((u) => u.email === email) ?? null;
  }

  async create(data: RegisterDTO, passwordHash: string): Promise<IUser> {
    const users = await this.readFile();
    const now = new Date().toISOString();
    const newUser: IUser = {
      id: crypto.randomUUID(),
      name: data.name,
      email: data.email,
      passwordHash,
      monthlyBudget: 5000,
      createdAt: now,
      updatedAt: now,
    };
    users.push(newUser);
    await this.writeFile(users);
    return newUser;
  }

  async updateBudget(userId: string, monthlyBudget: number): Promise<void> {
    const users = await this.readFile();
    const index = users.findIndex((u) => u.id === userId);
    if (index !== -1) {
      users[index] = { ...users[index]!, monthlyBudget, updatedAt: new Date().toISOString() };
      await this.writeFile(users);
    }
  }
}
