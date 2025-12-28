// src/types/index.ts
export type Role = 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';
export type PlanType = 'FREE' | 'PRO' | 'ENTERPRISE';
export type NotificationType = 'INFO' | 'WARNING' | 'SUCCESS' | 'UPSELL';

export interface UserJwtPayload {
  userId: string;
  teamId: string;
  role: Role;
  email?: string;
  iat?: number;
  exp?: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface TeamWithMemberCount {
  id: string;
  name: string;
  slug: string;
  tier: string;
  aiUsageCount: number;
  aiTokenLimit: number;
  _count: { members: number };
}

export interface PlanLimits {
  maxMembers: number;
  aiTokenLimit: number;
}

export const PLAN_LIMITS: Record<string, PlanLimits> = {
  FREE: { maxMembers: 2, aiTokenLimit: 500 },
  PRO: { maxMembers: 10, aiTokenLimit: 50000 },
  ENTERPRISE: { maxMembers: 100, aiTokenLimit: 500000 }
};