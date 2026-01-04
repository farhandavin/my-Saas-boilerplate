
import { db } from '@/db';
import { webhooks, webhookDeliveries } from '@/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import crypto from 'crypto';
import type { WebhookPayload, WebhookRecord } from '@/types';
import { inngest } from '@/lib/inngest/client';
import { getErrorMessage } from '@/lib/error-utils';


export const WebhookService = {
  /**
   * Trigger webhooks for a specific event
   */
  async trigger<T = Record<string, unknown>>(teamId: string, event: string, payload: WebhookPayload<T>) {
    // Array contains check for strings... Drizzle PostgreSQL uses arrayContains
    // Need to verify 'events' is array type in schema. Yes strict `text[]`.
    // In Drizzle ORM query builder: sql`...` or arrayContains (if specific helper exists) or manual filter.
    // .findMany({ where: (t) => and(eq(t.teamId, teamId), sql`${event} = ANY(${t.events})`) })

    // Easier way with raw sql or just fetching active and filtering in code if list is small.
    // For now, let's use SQL filter.

    const relevantWebhooks = await db.query.webhooks.findMany({
      where: (w, { and, eq, sql }) => and(
        eq(w.teamId, teamId),
        eq(w.isActive, true),
        sql`${w.events} @> ${JSON.stringify([event])}::jsonb` // Postgres JSONB containment check
      )
    });

    if (relevantWebhooks.length === 0) return;

    // Queue webhooks via Inngest for reliable delivery with retries
    // This is non-blocking and handles failures gracefully
    await Promise.all(
      relevantWebhooks.map(webhook =>
        inngest.send({
          name: "webhook/send",
          data: {
            webhookId: webhook.id,
            eventType: event,
            payload,
            attempt: 1,
          },
        })
      )
    );
  },

  /**
   * Send a single webhook with signature
   */
  async sendWebhook<T = Record<string, unknown>>(webhook: WebhookRecord, event: string, payload: WebhookPayload<T>) {
    const timestamp = Date.now();
    const signature = this.signPayload(payload, webhook.secret, timestamp);

    try {
      const response = await fetch(webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Event': event,
          'X-Webhook-Timestamp': timestamp.toString(),
          'X-Webhook-Signature': signature
        },
        body: JSON.stringify(payload)
      });

      const responseBody = await response.text();

      await db.insert(webhookDeliveries).values({
        webhookId: webhook.id,
        // eventId: crypto.randomUUID(), // Assume default in DB or generate
        eventId: crypto.randomUUID(),
        eventType: event,
        requestBody: JSON.stringify(payload),
        success: response.ok,
        responseStatus: response.status,
        responseBody: responseBody.substring(0, 1000)
      });

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? getErrorMessage(error) : 'Unknown error';
      await db.insert(webhookDeliveries).values({
        webhookId: webhook.id,
        eventId: crypto.randomUUID(),
        eventType: event,
        requestBody: JSON.stringify(payload),
        success: false,
        responseStatus: 0,
        responseBody: errorMessage
      });
    }
  },

  /**
   * Create HMAC signature
   */
  signPayload<T = Record<string, unknown>>(payload: WebhookPayload<T>, secret: string, timestamp: number): string {
    const data = `${timestamp}.${JSON.stringify(payload)}`;
    return crypto.createHmac('sha256', secret).update(data).digest('hex');
  },

  /**
   * Create a new webhook
   */
  async create(teamId: string, data: { url: string; events: string[] }) {
    const secret = 'whsec_' + crypto.randomBytes(24).toString('hex');

    const [webhook] = await db.insert(webhooks).values({
      teamId,
      url: data.url,
      events: sql`${JSON.stringify(data.events)}::jsonb`,
      secret,
      isActive: true
    }).returning();

    return webhook;
  },

  /**
   * Update a webhook
   */
  async update(teamId: string, webhookId: string, data: Partial<{ url: string; events: string[]; isActive: boolean }>) {
    const [updated] = await db.update(webhooks)
      .set(data)
      .where(and(eq(webhooks.id, webhookId), eq(webhooks.teamId, teamId)))
      .returning();
    return updated;
  },

  /**
   * Delete a webhook
   */
  async delete(teamId: string, webhookId: string) {
    return db.delete(webhooks).where(
      and(eq(webhooks.id, webhookId), eq(webhooks.teamId, teamId))
    );
  },

  /**
   * List webhooks
   */
  async list(teamId: string) {
    return db.query.webhooks.findMany({
      where: eq(webhooks.teamId, teamId),
      orderBy: (w, { desc }) => [desc(w.createdAt)]
    });
  },

  /**
   * Get delivery history
   */
  async getDeliveries(webhookId: string, limit = 10) {
    return db.query.webhookDeliveries.findMany({
      where: eq(webhookDeliveries.webhookId, webhookId),
      orderBy: (wd, { desc }) => [desc(wd.deliveredAt)],
      limit
    });
  }
};
