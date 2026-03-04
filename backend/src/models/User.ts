export type PriorityLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface IUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  monthlyBudget: number;
  createdAt: string;
  updatedAt: string;
}

export type UserProfile = Omit<IUser, 'passwordHash'>;

export interface RegisterDTO {
  name: string;
  email: string;
  password: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: UserProfile;
  token: string;
}
