/**
 * Webhook Retry Function
 * 
 * Handles retrying failed outgoing webhooks with exponential backoff.
 * Maximum 3 retries.
 */
import { inngest } from "./client";
import { db } from "@/db";
import { webhooks, webhookDeliveries } from "@/db/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";
import { getErrorMessage } from '@/lib/error-utils';


// Type for the webhook event payload
interface WebhookRetryEvent {
    data: {
        webhookId: string;
        eventType: string;
        payload: Record<string, unknown>;
        attempt: number;
    };
}

export const webhookRetry = inngest.createFunction(
    {
        id: "webhook-retry",
        retries: 3,
    },
    { event: "webhook/send" },
    async ({ event, step }) => {
        const { webhookId, eventType, payload, attempt = 1 } = event.data as WebhookRetryEvent["data"];

        // Step 1: Get webhook details
        const webhook = await step.run("get-webhook", async () => {
            return db.query.webhooks.findFirst({
                where: eq(webhooks.id, webhookId),
            });
        });

        if (!webhook || !webhook.isActive) {
            return { success: false, reason: "Webhook not found or inactive" };
        }

        // Step 2: Create signature
        const timestamp = Date.now();
        const signatureData = `${timestamp}.${JSON.stringify(payload)}`;
        const signature = crypto
            .createHmac("sha256", webhook.secret)
            .update(signatureData)
            .digest("hex");

        // Step 3: Send webhook with retry logic
        const result = await step.run("send-webhook", async () => {
            const startTime = Date.now();
            try {
                const response = await fetch(webhook.url, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "X-Webhook-Event": eventType,
                        "X-Webhook-Timestamp": timestamp.toString(),
                        "X-Webhook-Signature": signature,
                        "X-Webhook-Attempt": attempt.toString(),
                    },
                    body: JSON.stringify(payload),
                });

                const responseBody = await response.text();
                const duration = Date.now() - startTime;

                // Log delivery
                await db.insert(webhookDeliveries).values({
                    webhookId: webhook.id,
                    eventId: crypto.randomUUID(),
                    eventType,
                    requestBody: payload,
                    responseStatus: response.status,
                    responseBody: responseBody.substring(0, 1000),
                    duration,
                    success: response.ok,
                });

                return {
                    success: response.ok,
                    status: response.status,
                    duration,
                };
            } catch (error: unknown) {
                const errorMessage = error instanceof Error ? getErrorMessage(error) : "Unknown error";
                const duration = Date.now() - startTime;

                // Log failed delivery
                await db.insert(webhookDeliveries).values({
                    webhookId: webhook.id,
                    eventId: crypto.randomUUID(),
                    eventType,
                    requestBody: payload,
                    responseStatus: 0,
                    responseBody: errorMessage,
                    duration,
                    success: false,
                });

                throw error; // Re-throw to trigger Inngest retry
            }
        });

        return result;
    }
);
