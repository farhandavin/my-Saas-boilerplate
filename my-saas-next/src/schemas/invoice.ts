// src/schemas/invoice.ts
// Zod validation schemas for Invoice operations

import { z } from 'zod';

// Invoice status enum
export const InvoiceStatusSchema = z.enum(['unpaid', 'paid', 'void', 'past_due']);
export type InvoiceStatus = z.infer<typeof InvoiceStatusSchema>;

// Create invoice input
export const CreateInvoiceSchema = z.object({
    teamId: z.string().uuid('Invalid team ID'),
    amount: z.number()
        .positive('Amount must be positive')
        .int('Amount must be in cents (integer)'),
    customerName: z.string().min(1, 'Customer name is required').max(100),
    description: z.string().max(500).optional(),
    dueDate: z.coerce.date().optional(),
});

export type CreateInvoiceInput = z.infer<typeof CreateInvoiceSchema>;

// Update invoice input
export const UpdateInvoiceSchema = z.object({
    amount: z.number().positive().int().optional(),
    customerName: z.string().min(1).max(100).optional(),
    description: z.string().max(500).optional(),
    dueDate: z.coerce.date().optional(),
    status: InvoiceStatusSchema.optional(),
});

export type UpdateInvoiceInput = z.infer<typeof UpdateInvoiceSchema>;

// Mark as paid input
export const MarkAsPaidSchema = z.object({
    invoiceId: z.string().uuid('Invalid invoice ID'),
    paidAt: z.coerce.date().optional().default(() => new Date()),
});

export type MarkAsPaidInput = z.infer<typeof MarkAsPaidSchema>;
