CREATE TABLE "api_keys" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"prefix" text NOT NULL,
	"keyHash" text NOT NULL,
	"lastUsedAt" timestamp,
	"teamId" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "api_keys_keyHash_unique" UNIQUE("keyHash")
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"teamId" text NOT NULL,
	"userId" text NOT NULL,
	"action" text NOT NULL,
	"resource" text,
	"details" text,
	"metadata" json,
	"ipAddress" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "documents" (
	"id" text PRIMARY KEY NOT NULL,
	"teamId" text NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"embedding" vector(768),
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invitations" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"role" text DEFAULT 'MEMBER',
	"token" text NOT NULL,
	"expires" timestamp NOT NULL,
	"teamId" text NOT NULL,
	CONSTRAINT "invitations_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "invoices" (
	"id" text PRIMARY KEY NOT NULL,
	"teamId" text NOT NULL,
	"clientId" text,
	"clientName" text NOT NULL,
	"amount" integer NOT NULL,
	"dueDate" timestamp NOT NULL,
	"status" text DEFAULT 'UNPAID',
	"items" json,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "migration_jobs" (
	"id" text PRIMARY KEY NOT NULL,
	"teamId" text NOT NULL,
	"status" text DEFAULT 'PENDING',
	"sourceUrl" text,
	"targetUrl" text,
	"logs" json,
	"error" text,
	"startedAt" timestamp,
	"completedAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"teamId" text NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"type" text DEFAULT 'INFO',
	"isRead" boolean DEFAULT false,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "onboarding_progress" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"currentStep" integer DEFAULT 1,
	"completedSteps" json DEFAULT '[]'::json,
	"completedAt" timestamp,
	"skipped" boolean DEFAULT false,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "onboarding_progress_userId_unique" UNIQUE("userId")
);
--> statement-breakpoint
CREATE TABLE "password_reset_tokens" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"token" text NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"used" boolean DEFAULT false,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "password_reset_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "system_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"level" text NOT NULL,
	"source" text NOT NULL,
	"message" text NOT NULL,
	"metadata" json,
	"teamId" text,
	"userId" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "team_members" (
	"id" text PRIMARY KEY NOT NULL,
	"role" text DEFAULT 'MEMBER',
	"userId" text NOT NULL,
	"teamId" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "teams" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"stripeCustomerId" text,
	"stripeSubscriptionId" text,
	"subscriptionStatus" text DEFAULT 'active',
	"tier" text DEFAULT 'FREE',
	"databaseUrl" text,
	"aiUsageCount" integer DEFAULT 0,
	"aiTokenLimit" integer DEFAULT 1000,
	"migrationStatus" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "teams_slug_unique" UNIQUE("slug"),
	CONSTRAINT "teams_stripeCustomerId_unique" UNIQUE("stripeCustomerId")
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" text PRIMARY KEY NOT NULL,
	"teamId" text NOT NULL,
	"date" timestamp NOT NULL,
	"amount" integer NOT NULL,
	"type" text NOT NULL,
	"category" text NOT NULL,
	"description" text,
	"status" text DEFAULT 'COMPLETED',
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "usage_billings" (
	"id" text PRIMARY KEY NOT NULL,
	"teamId" text NOT NULL,
	"billingPeriod" text NOT NULL,
	"tokenUsage" integer DEFAULT 0,
	"tokenLimit" integer NOT NULL,
	"overageTokens" integer DEFAULT 0,
	"baseAmount" integer NOT NULL,
	"usageAmount" integer DEFAULT 0,
	"totalAmount" integer NOT NULL,
	"status" text DEFAULT 'PENDING',
	"paidAt" timestamp,
	"metadata" json,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"name" text,
	"image" text,
	"password" text,
	"provider" text DEFAULT 'email',
	"providerId" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "webhook_deliveries" (
	"id" text PRIMARY KEY NOT NULL,
	"webhookId" text NOT NULL,
	"eventId" text NOT NULL,
	"eventType" text NOT NULL,
	"payload" json NOT NULL,
	"status" text NOT NULL,
	"responseCode" integer,
	"responseBody" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "webhooks" (
	"id" text PRIMARY KEY NOT NULL,
	"teamId" text NOT NULL,
	"url" text NOT NULL,
	"events" text[],
	"secret" text NOT NULL,
	"active" boolean DEFAULT true,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_teamId_teams_id_fk" FOREIGN KEY ("teamId") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_teamId_teams_id_fk" FOREIGN KEY ("teamId") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_teamId_teams_id_fk" FOREIGN KEY ("teamId") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_teamId_teams_id_fk" FOREIGN KEY ("teamId") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_teamId_teams_id_fk" FOREIGN KEY ("teamId") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_teamId_teams_id_fk" FOREIGN KEY ("teamId") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "onboarding_progress" ADD CONSTRAINT "onboarding_progress_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_teamId_teams_id_fk" FOREIGN KEY ("teamId") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_teamId_teams_id_fk" FOREIGN KEY ("teamId") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "usage_billings" ADD CONSTRAINT "usage_billings_teamId_teams_id_fk" FOREIGN KEY ("teamId") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "webhook_deliveries" ADD CONSTRAINT "webhook_deliveries_webhookId_webhooks_id_fk" FOREIGN KEY ("webhookId") REFERENCES "public"."webhooks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "webhooks" ADD CONSTRAINT "webhooks_teamId_teams_id_fk" FOREIGN KEY ("teamId") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "Invitation_teamId_email_key" ON "invitations" USING btree ("teamId","email");--> statement-breakpoint
CREATE INDEX "Invoice_teamId_idx" ON "invoices" USING btree ("teamId");--> statement-breakpoint
CREATE INDEX "Invoice_status_idx" ON "invoices" USING btree ("status");--> statement-breakpoint
CREATE INDEX "Invoice_dueDate_idx" ON "invoices" USING btree ("dueDate");--> statement-breakpoint
CREATE INDEX "MigrationJob_status_idx" ON "migration_jobs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "MigrationJob_teamId_idx" ON "migration_jobs" USING btree ("teamId");--> statement-breakpoint
CREATE INDEX "PasswordResetToken_token_idx" ON "password_reset_tokens" USING btree ("token");--> statement-breakpoint
CREATE INDEX "PasswordResetToken_userId_idx" ON "password_reset_tokens" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "SystemLog_level_idx" ON "system_logs" USING btree ("level");--> statement-breakpoint
CREATE INDEX "SystemLog_source_idx" ON "system_logs" USING btree ("source");--> statement-breakpoint
CREATE INDEX "SystemLog_createdAt_idx" ON "system_logs" USING btree ("createdAt");--> statement-breakpoint
CREATE UNIQUE INDEX "TeamMember_userId_teamId_key" ON "team_members" USING btree ("userId","teamId");--> statement-breakpoint
CREATE INDEX "TeamMember_userId_idx" ON "team_members" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "TeamMember_teamId_idx" ON "team_members" USING btree ("teamId");--> statement-breakpoint
CREATE INDEX "Transaction_teamId_idx" ON "transactions" USING btree ("teamId");--> statement-breakpoint
CREATE INDEX "Transaction_date_idx" ON "transactions" USING btree ("date");--> statement-breakpoint
CREATE INDEX "Transaction_type_idx" ON "transactions" USING btree ("type");--> statement-breakpoint
CREATE UNIQUE INDEX "UsageBilling_teamId_billingPeriod_key" ON "usage_billings" USING btree ("teamId","billingPeriod");--> statement-breakpoint
CREATE INDEX "UsageBilling_teamId_idx" ON "usage_billings" USING btree ("teamId");--> statement-breakpoint
CREATE INDEX "UsageBilling_billingPeriod_idx" ON "usage_billings" USING btree ("billingPeriod");--> statement-breakpoint
CREATE INDEX "UsageBilling_status_idx" ON "usage_billings" USING btree ("status");