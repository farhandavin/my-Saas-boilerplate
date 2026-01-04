// src/types/index.ts
export type Role = 'OWNER' | 'ADMIN' | 'MANAGER' | 'STAFF';
export type PlanType = 'FREE' | 'PRO' | 'ENTERPRISE';
export type NotificationType = 'INFO' | 'WARNING' | 'SUCCESS' | 'UPSELL';

// Role metadata for UI display
export const ROLE_INFO: Record<Role, { label: string; description: string; icon: string }> = {
  OWNER: {
    label: 'Owner',
    description: 'Full team ownership: Billing, Deletion, Transfer, All Permissions',
    icon: '👑'
  },
  ADMIN: {
    label: 'Admin',
    description: 'Full access: Billing, Team Settings, Full Analytics, User Management',
    icon: '⚙️'
  },
  MANAGER: {
    label: 'Manager',
    description: 'Operational management: Reports, Staff Management, Limited Config',
    icon: '🔧'
  },
  STAFF: {
    label: 'Staff',
    description: 'Daily execution: Data entry, AI Chat, Basic Features',
    icon: '👤'
  }
};

export interface UserJwtPayload {
  userId: string;
  teamId: string;
  role: Role;
  isSuperAdmin?: boolean;
  email?: string;
  iat?: number;
  exp?: number;
}

export interface ApiResponse<T = unknown> {
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

export const WEBHOOK_EVENTS = [
  { value: 'invoice.paid', label: 'Invoice Paid' },
  { value: 'member.joined', label: 'Member Joined' },
  { value: 'anomaly.detected', label: 'Anomaly Detected' },
  { value: 'document.validated', label: 'Document Validated' },
] as const;

export type WebhookEvent = typeof WEBHOOK_EVENTS[number]['value'];

// Webhook typed payload
export interface WebhookPayload<T = Record<string, unknown>> {
  eventType: WebhookEvent;
  timestamp: string;
  data: T;
}

// Webhook record from database
export interface WebhookRecord {
  id: string;
  teamId: string | null;
  url: string;
  events: string[];
  isActive: boolean | null;
  secret: string;
  createdAt: Date | null;
}

// Branding settings (matches schema.ts JSONB type)
export interface BrandingSettings {
  primaryColor?: string;
  accentColor?: string;
  logoUrl?: string;
  faviconUrl?: string;
  companyName?: string;
  customDomain?: string;
}

// SMTP settings (matches schema.ts JSONB type)
export interface SmtpSettings {
  host: string;
  port: number;
  user: string;
  pass: string;
  fromEmail: string;
  fromName: string;
}

// Route context for Next.js API routes
export interface RouteContext<TParams = Record<string, string>> {
  params: TParams | Promise<TParams>;
}

// Auth context for protected routes
export interface AuthContext<TParams = Record<string, string>> {
  user: UserJwtPayload;
  params: TParams;
}

// Team context for team-scoped routes
export interface TeamContext<TParams = Record<string, string>> {
  user: UserJwtPayload;
  team: TeamMemberWithTeam;
  params: TParams;
}

// Team member with team relation
export interface TeamMemberWithTeam {
  id: string;
  userId: string | null;
  teamId: string | null;
  role: string | null;
  joinedAt: Date | null;
  team: {
    id: string;
    name: string;
    slug: string;
    tier: string | null;
  } | null;
}
