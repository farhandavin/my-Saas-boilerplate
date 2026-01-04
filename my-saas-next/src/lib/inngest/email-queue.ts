/**
 * Email Queue Function
 * 
 * Handles sending emails asynchronously via Inngest.
 * This ensures webhook handlers don't block on email sending.
 */
import { inngest } from "./client";
import { Resend } from "resend";
import { getErrorMessage } from '@/lib/error-utils';


const resend = new Resend(process.env.RESEND_API_KEY);

// Email event payload type
interface SendEmailEvent {
    data: {
        to: string | string[];
        subject: string;
        html: string;
        from?: string;
        replyTo?: string;
        teamId?: string;
    };
}

export const sendEmail = inngest.createFunction(
    {
        id: "send-email",
        retries: 3,
    },
    { event: "email/send" },
    async ({ event, step }) => {
        const {
            to,
            subject,
            html,
            from = process.env.RESEND_FROM_EMAIL || "noreply@example.com",
            replyTo
        } = event.data as SendEmailEvent["data"];

        // Validate input
        if (!to || !subject || !html) {
            return { success: false, error: "Missing required fields: to, subject, html" };
        }

        // Send email via Resend
        const result = await step.run("send-via-resend", async () => {
            const response = await resend.emails.send({
                from,
                to: Array.isArray(to) ? to : [to],
                subject,
                html,
                replyTo,
            });

            return response;
        });

        return {
            success: true,
            emailId: result.data?.id,
        };
    }
);

// Batch email function for sending to multiple recipients
export const sendBatchEmail = inngest.createFunction(
    {
        id: "send-batch-email",
        retries: 2,
    },
    { event: "email/send-batch" },
    async ({ event, step }) => {
        const { emails } = event.data as {
            emails: Array<{
                to: string;
                subject: string;
                html: string;
            }>;
        };

        if (!emails || emails.length === 0) {
            return { success: false, error: "No emails to send" };
        }

        // Process emails in parallel batches of 10
        const batchSize = 10;
        const results: Array<{ to: string; success: boolean; id?: string; error?: string }> = [];

        for (let i = 0; i < emails.length; i += batchSize) {
            const batch = emails.slice(i, i + batchSize);

            const batchResults = await step.run(`send-batch-${i}`, async () => {
                const promises = batch.map(async (email) => {
                    try {
                        const response = await resend.emails.send({
                            from: process.env.RESEND_FROM_EMAIL || "noreply@example.com",
                            to: email.to,
                            subject: email.subject,
                            html: email.html,
                        });
                        return { to: email.to, success: true, id: response.data?.id };
                    } catch (error: unknown) {
                        const errorMessage = error instanceof Error ? getErrorMessage(error) : "Unknown error";
                        return { to: email.to, success: false, error: errorMessage };
                    }
                });
                return Promise.all(promises);
            });

            results.push(...batchResults);
        }

        const successCount = results.filter(r => r.success).length;
        const failCount = results.filter(r => !r.success).length;

        return {
            success: failCount === 0,
            total: emails.length,
            sent: successCount,
            failed: failCount,
            results,
        };
    }
);
