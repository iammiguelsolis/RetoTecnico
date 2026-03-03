import bcrypt from 'bcrypt';
import { sign, SignOptions } from 'jsonwebtoken';
import { IUserRepository } from '../repository/interfaces/IUserRepository';
import { RegisterDTO, LoginDTO, UserProfile, AuthResponse } from '../models/User';
import { AppError } from '../errors';

const SALT_ROUNDS = 12;

/**
 * AuthService — Lógica de negocio para autenticación.
 * Hashea passwords con bcrypt, genera JWT.
 */
export class AuthService {
  constructor(private readonly userRepository: IUserRepository) { }

  async register(data: RegisterDTO): Promise<AuthResponse> {
    const existing = await this.userRepository.findByEmail(data.email);
    if (existing) throw new AppError('El correo ya está registrado', 409);

    const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);
    const user = await this.userRepository.create(data, passwordHash);
    const token = this.generateToken(user.id, user.email);

    return { user: this.toProfile(user), token };
  }

  async login(data: LoginDTO): Promise<AuthResponse> {
    const user = await this.userRepository.findByEmail(data.email);
    if (!user) throw new AppError('Credenciales inválidas', 401);

    const isValid = await bcrypt.compare(data.password, user.passwordHash);
    if (!isValid) throw new AppError('Credenciales inválidas', 401);

    const token = this.generateToken(user.id, user.email);
    return { user: this.toProfile(user), token };
  }

  async getProfile(userId: string): Promise<UserProfile> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new AppError('Usuario no encontrado', 404);
    return this.toProfile(user);
  }

  async updateBudget(userId: string, monthlyBudget: number): Promise<UserProfile> {
    await this.userRepository.updateBudget(userId, monthlyBudget);
    return this.getProfile(userId);
  }

  private generateToken(userId: string, email: string): string {
    const secret = process.env['JWT_SECRET'] ?? 'default_secret';
    const expiresIn = (process.env['JWT_EXPIRES_IN'] ?? '7d') as string;
    const options: SignOptions = { expiresIn: expiresIn as any };
    return sign({ userId, email }, secret, options);
  }

  private toProfile(user: { id: string; name: string; email: string; monthlyBudget: number; createdAt: string; updatedAt: string }): UserProfile {
    return { id: user.id, name: user.name, email: user.email, monthlyBudget: user.monthlyBudget, createdAt: user.createdAt, updatedAt: user.updatedAt };
  }
}
