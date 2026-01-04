import { z } from 'zod';

/**
 * Strong Password Schema
 * Enforces enterprise-grade password policy:
 * - Minimum 12 characters
 * - At least 1 uppercase letter
 * - At least 1 lowercase letter
 * - At least 1 number
 * - At least 1 special character
 */
export const passwordSchema = z
    .string()
    .min(12, 'Password must be at least 12 characters long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character (!@#$%^&*)')
    .refine(
        (password) => {
            // Check against common weak passwords
            const weakPasswords = [
                'password123!',
                'Password123!',
                'Admin123456!',
                'Welcome123!',
                'Qwerty123456!',
            ];
            return !weakPasswords.includes(password);
        },
        { message: 'Password is too common. Please choose a stronger password.' }
    );

/**
 * Auth Schemas
 */
export const signupSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: passwordSchema,
});

export const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
});

export const resetPasswordSchema = z.object({
    token: z.string().min(1, 'Reset token is required'),
    newPassword: passwordSchema,
});

export const forgotPasswordSchema = z.object({
    email: z.string().email('Invalid email address'),
});

export const changePasswordSchema = z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: passwordSchema,
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
