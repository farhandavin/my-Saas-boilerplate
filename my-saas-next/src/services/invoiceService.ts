
import { db } from '@/db';
import { invoices } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { PrivacyService } from './privacyService';
import { Logger } from '@/lib/logger';
import {
  CreateInvoiceSchema,
  UpdateInvoiceSchema,
  type CreateInvoiceInput,
  type UpdateInvoiceInput
} from '@/schemas/invoice';

const log = Logger.scope('InvoiceService');

export class InvoiceService {
  /**
   * Create a new invoice with Zod validation
   */
  static async createInvoice(input: CreateInvoiceInput) {
    // Validate input
    const validated = CreateInvoiceSchema.parse(input);

    let description = validated.description;
    let customerName = validated.customerName;

    // Apply PII Masking
    if (description) {
      const { maskedContent } = await PrivacyService.maskContent(validated.teamId, description);
      description = maskedContent;
    }

    if (customerName) {
      const { maskedContent } = await PrivacyService.maskContent(validated.teamId, customerName);
      customerName = maskedContent;
    }

    const [invoice] = await db.insert(invoices).values({
      id: uuidv4(),
      teamId: validated.teamId,
      amount: validated.amount,
      status: 'unpaid',
      dueDate: validated.dueDate,
      description: description,
      customerName: customerName,
    }).returning();

    log.info('Invoice created', { invoiceId: invoice.id, teamId: validated.teamId, amount: validated.amount });
    return invoice;
  }

  static async getInvoices(teamId: string) {
    return await db.select()
      .from(invoices)
      .where(eq(invoices.teamId, teamId))
      .orderBy(desc(invoices.createdAt));
  }

  static async getInvoiceById(id: string, teamId: string) {
    const [invoice] = await db.select()
      .from(invoices)
      .where(and(eq(invoices.id, id), eq(invoices.teamId, teamId)));
    return invoice;
  }

  /**
   * Update invoice with Zod validation
   */
  static async updateInvoice(id: string, teamId: string, input: UpdateInvoiceInput) {
    const validated = UpdateInvoiceSchema.parse(input);

    const [invoice] = await db.update(invoices)
      .set({
        ...validated,
      })
      .where(and(eq(invoices.id, id), eq(invoices.teamId, teamId)))
      .returning();

    if (invoice) {
      log.info('Invoice updated', { invoiceId: id, teamId });
    }
    return invoice;
  }

  static async deleteInvoice(id: string, teamId: string) {
    const [deleted] = await db.delete(invoices)
      .where(and(eq(invoices.id, id), eq(invoices.teamId, teamId)))
      .returning();
    return deleted;
  }
}
