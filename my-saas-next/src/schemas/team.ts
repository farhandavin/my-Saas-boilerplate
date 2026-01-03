// src/schemas/team.ts
// Zod validation schemas for Team operations

import { z } from 'zod';

// Plan tier enum
export const PlanTierSchema = z.enum(['FREE', 'PRO', 'ENTERPRISE']);
export type PlanTier = z.infer<typeof PlanTierSchema>;

// Subscription status enum
export const SubscriptionStatusSchema = z.enum(['active', 'past_due', 'unpaid', 'canceled']);
export type SubscriptionStatus = z.infer<typeof SubscriptionStatusSchema>;

// Branding settings schema
export const BrandingSchema = z.object({
    primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color').optional(),
    accentColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color').optional(),
    logoUrl: z.string().url().optional(),
    faviconUrl: z.string().url().optional(),
    companyName: z.string().max(100).optional(),
    customDomain: z.string().max(253).optional(),
}).optional();

export type Branding = z.infer<typeof BrandingSchema>;

// SMTP settings schema
export const SmtpSettingsSchema = z.object({
    host: z.string().min(1, 'SMTP host is required'),
    port: z.number().int().min(1).max(65535),
    user: z.string().min(1, 'SMTP user is required'),
    pass: z.string().min(1, 'SMTP password is required'),
    fromEmail: z.string().email('Invalid from email'),
    fromName: z.string().min(1).max(100),
}).optional();

export type SmtpSettings = z.infer<typeof SmtpSettingsSchema>;

// Create team input
export const CreateTeamSchema = z.object({
    name: z.string()
        .min(2, 'Team name must be at least 2 characters')
        .max(50, 'Team name must be less than 50 characters'),
    slug: z.string()
        .min(2, 'Slug must be at least 2 characters')
        .max(50)
        .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
    industry: z.string().max(50).optional(),
    timezone: z.string().max(50).default('UTC'),
    currency: z.string().length(3).default('USD'),
    language: z.string().length(2).default('en'),
});

export type CreateTeamInput = z.infer<typeof CreateTeamSchema>;

// Update team input
export const UpdateTeamSchema = z.object({
    name: z.string().min(2).max(50).optional(),
    displayId: z.string().max(20).optional(),
    logoUrl: z.string().url().optional(),
    supportEmail: z.string().email().optional(),
    industry: z.string().max(50).optional(),
    timezone: z.string().max(50).optional(),
    currency: z.string().length(3).optional(),
    language: z.string().length(2).optional(),
    branding: BrandingSchema,
    smtpSettings: SmtpSettingsSchema,
});

export type UpdateTeamInput = z.infer<typeof UpdateTeamSchema>;

// Team security settings
export const TeamSecuritySchema = z.object({
    ssoEnabled: z.boolean().optional(),
    ssoProvider: z.string().max(50).optional(),
    passwordRotationDays: z.number().int().min(0).max(365).optional(),
    sessionTimeoutMinutes: z.number().int().min(5).max(1440).optional(),
});

export type TeamSecurityInput = z.infer<typeof TeamSecuritySchema>;
