import { inngest } from "./client";
import { webhookRetry } from "./webhook-retry";
import { auditLogCleanup } from "./audit-cleanup";
import { sendEmail, sendBatchEmail } from "./email-queue";
import { webhookDeliveryCleanup } from "./webhook-cleanup";

// Keep helloWorld for testing connectivity
export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event, step }) => {
    await step.sleep("wait-a-moment", "1s");
    return { event, body: "Hello, World!" };
  },
);

// Export all functions
export { webhookRetry, auditLogCleanup, sendEmail, sendBatchEmail, webhookDeliveryCleanup };

// All functions array for route registration
export const allFunctions = [
  helloWorld,
  webhookRetry,
  auditLogCleanup,
  sendEmail,
  sendBatchEmail,
  webhookDeliveryCleanup,
];
