// src/types/index.ts
export type Role = 'OWNER' | 'ADMIN' | 'MEMBER';
export type PlanType = 'FREE' | 'PRO' | 'ENTERPRISE';

export interface UserJwtPayload {
  userId: string;
  teamId: string;
  role: Role;
  iat?: number;
  exp?: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}