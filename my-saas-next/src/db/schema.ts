
import { pgTable, text, timestamp, boolean, uuid, integer, jsonb, json, pgEnum, customType, index, unique } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const userRoleEnum = pgEnum('user_role', ['admin', 'manager', 'staff']);

// Users Table
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name'),
  email: text('email').notNull().unique(),
  password: text('password'),
  provider: text('provider'), // google, credentials
  image: text('image'),
  phone: text('phone'),
  bio: text('bio'),
  language: text('language').default('en'),
  timezone: text('timezone').default('UTC'),
  twoFactorEnabled: boolean('two_factor_enabled').default(false),
  isSuperAdmin: boolean('is_super_admin').default(false), // Global SaaS Owner
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Teams Table
export const teams = pgTable('teams', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),

  // Workspace Identity
  displayId: text('display_id'),
  logoUrl: text('logo_url'),
  supportEmail: text('support_email'),
  industry: text('industry'),

  // Regional & Compliance
  dataRegion: text('data_region').default('id'),
  currency: text('currency').default('IDR'),
  timezone: text('timezone').default('asia_jakarta'),
  language: text('language').default('en'),

  // Security Settings
  ssoEnabled: boolean('sso_enabled').default(false),
  ssoProvider: text('sso_provider'),
  passwordRotationDays: integer('password_rotation_days').default(90),
  sessionTimeoutMinutes: integer('session_timeout_minutes').default(30),

  // Subscription & Billing
  tier: text('tier').default('FREE'), // FREE, PRO, ENTERPRISE
  subscriptionStatus: text('subscription_status').default('active'),
  aiTokenLimit: integer('ai_token_limit').default(1000),
  aiUsageCount: integer('ai_usage_count').default(0),

  // Stripe Integration
  stripeCustomerId: text('stripe_customer_id'),
  stripeSubscriptionId: text('stripe_subscription_id'),
  stripeCurrentPeriodEnd: timestamp('stripe_current_period_end'),

  // Hybrid Multi-Tenancy
  dedicatedDatabaseUrl: text('dedicated_database_url'), // Enterprise-only: separate DB
  tenancyMode: text('tenancy_mode').default('shared'), // shared, dedicated
  migrationStatus: text('migration_status'), // PENDING, IN_PROGRESS, COMPLETED

  // White-Labeling & Customization
  branding: jsonb('branding').$type<{
    primaryColor?: string;
    accentColor?: string;
    logoUrl?: string;
    faviconUrl?: string;
    companyName?: string;
    customDomain?: string;
  }>(),

  smtpSettings: jsonb('smtp_settings').$type<{
    host: string;
    port: number;
    user: string;
    pass: string;
    fromEmail: string;
    fromName: string;
  }>(),

  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  stripeCustomerIdx: index('teams_stripe_customer_idx').on(table.stripeCustomerId),
}));

// Roles Table (Dynamic RBAC)
export const roles = pgTable('roles', {
  id: uuid('id').defaultRandom().primaryKey(),
  teamId: uuid('team_id').references(() => teams.id, { onDelete: 'cascade' }),
  name: text('name').notNull(), // e.g., "Auditor", "Marketing"
  permissions: jsonb('permissions').default([]), // List of permission strings: "view:audit_logs", "edit:settings"
  isSystem: boolean('is_system').default(false), // If true, cannot be deleted (e.g. Admin)
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Team Members Table
export const teamMembers = pgTable('team_members', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  teamId: uuid('team_id').references(() => teams.id, { onDelete: 'cascade' }),
  role: text('role').default('staff'), // stored as string for simplicity, or reference roles table
  joinedAt: timestamp('joined_at').defaultNow(),
}, (table) => ({
  // Indexes for team membership queries
  userIdIdx: index('team_members_user_id_idx').on(table.userId),
  teamIdIdx: index('team_members_team_id_idx').on(table.teamId),
  userTeamUnique: unique('team_members_user_team_unique').on(table.userId, table.teamId),
}));

// Invitations Table
export const invitations = pgTable('invitations', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').notNull(),
  role: text('role').default('STAFF'),
  token: text('token').notNull().unique(),
  expires: timestamp('expires').notNull(),
  teamId: uuid('team_id').references(() => teams.id, { onDelete: 'cascade' }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const invitationsRelations = relations(invitations, ({ one }) => ({
  team: one(teams, {
    fields: [invitations.teamId],
    references: [teams.id],
  }),
}));

// Onboarding Progress Table
export const onboardingProgress = pgTable('onboarding_progress', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull().unique(),
  currentStep: integer('current_step').default(1),
  completedSteps: jsonb('completed_steps').default([]),
  completedAt: timestamp('completed_at'),
  skipped: boolean('skipped').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Notifications Table
export const notifications = pgTable('notifications', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  teamId: uuid('team_id').references(() => teams.id, { onDelete: 'cascade' }).notNull(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  type: text('type').default('INFO'),
  isRead: boolean('is_read').default(false),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  // Indexes for notification queries
  userIdIdx: index('notifications_user_id_idx').on(table.userId),
  teamIdReadIdx: index('notifications_team_read_idx').on(table.teamId, table.isRead),
}));

// Audit Logs Table
export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  teamId: uuid('team_id').references(() => teams.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  action: text('action').notNull(),
  entity: text('entity').notNull(),
  details: text('details'),
  ipAddress: text('ip_address'),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  teamIdIdx: index('audit_logs_team_id_idx').on(table.teamId),
}));

// Webhooks Table
export const webhooks = pgTable('webhooks', {
  id: uuid('id').defaultRandom().primaryKey(),
  teamId: uuid('team_id').references(() => teams.id, { onDelete: 'cascade' }),
  url: text('url').notNull(),
  events: jsonb('events').notNull(),
  isActive: boolean('is_active').default(true),
  secret: text('secret').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Webhook Deliveries Table
export const webhookDeliveries = pgTable('webhook_deliveries', {
  id: uuid('id').defaultRandom().primaryKey(),
  webhookId: uuid('webhook_id').references(() => webhooks.id, { onDelete: 'cascade' }),
  eventId: text('event_id'),
  eventType: text('event_type'),
  requestBody: jsonb('request_body'),
  responseStatus: integer('response_status'),
  responseBody: text('response_body'),
  duration: integer('duration'),
  success: boolean('success').default(false),
  deliveredAt: timestamp('delivered_at').defaultNow(),
}, (table) => ({
  eventIdIdx: index('webhook_deliveries_event_id_idx').on(table.eventId),
  // UNIQUE constraint for atomic idempotency (prevents duplicate Stripe webhook processing)
  eventIdUnique: unique('webhook_deliveries_event_id_unique').on(table.eventId),
}));

// API Keys Table
export const apiKeys = pgTable('api_keys', {
  id: uuid('id').defaultRandom().primaryKey(),
  teamId: uuid('team_id').references(() => teams.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  prefix: text('prefix').notNull(),
  keyHash: text('key_hash').notNull(),
  lastUsedAt: timestamp('last_used_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const projects = pgTable('projects', {
  id: uuid('id').defaultRandom().primaryKey(),
  teamId: uuid('team_id').notNull().references(() => teams.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  status: text('status').default('active').notNull(), // active, completed, archived
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  // Index for multi-tenancy queries (WHERE teamId = ?)
  teamIdIdx: index('projects_team_id_idx').on(table.teamId),
  teamStatusIdx: index('projects_team_status_idx').on(table.teamId, table.status),
}));

// Documents Table (Knowledge Base)
export const documents = pgTable('documents', {
  id: uuid('id').defaultRandom().primaryKey(),
  teamId: uuid('team_id').references(() => teams.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  content: text('content'), // Extracted text content
  fileUrl: text('file_url'),
  fileType: text('file_type'), // pdf, docx, txt
  size: integer('size'),
  embedding: customType<{ data: number[] }>({
    dataType: () => 'vector(768)'
  })('embedding'), // Google Gemini dims
  uploadedBy: uuid('uploaded_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
});

// Project Members Table
export const projectMembers = pgTable('project_members', {
  id: uuid('id').defaultRandom().primaryKey(),
  projectId: uuid('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  role: text('role').default('editor'), // viewer, editor, owner
  joinedAt: timestamp('joined_at').defaultNow(),
});

// Tasks Table
export const tasks = pgTable('tasks', {
  id: uuid('id').defaultRandom().primaryKey(),
  projectId: uuid('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  status: text('status').default('todo').notNull(), // todo, in_progress, done
  priority: text('priority').default('medium'), // low, medium, high
  assigneeId: uuid('assignee_id').references(() => users.id, { onDelete: 'set null' }),
  dueDate: timestamp('due_date'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  // Indexes for common query patterns
  projectIdIdx: index('tasks_project_id_idx').on(table.projectId),
  assigneeIdIdx: index('tasks_assignee_id_idx').on(table.assigneeId),
  projectStatusIdx: index('tasks_project_status_idx').on(table.projectId, table.status),
}));

export const projectMembersRelations = relations(projectMembers, ({ one }) => ({
  project: one(projects, {
    fields: [projectMembers.projectId],
    references: [projects.id],
  }),
  user: one(users, {
    fields: [projectMembers.userId],
    references: [users.id],
  }),
}));

export const tasksRelations = relations(tasks, ({ one }) => ({
  project: one(projects, {
    fields: [tasks.projectId],
    references: [projects.id],
  }),
  assignee: one(users, {
    fields: [tasks.assigneeId],
    references: [users.id],
  }),
}));

// Usage Billing Table
export const usageBillings = pgTable('usage_billings', {
  id: uuid('id').defaultRandom().primaryKey(),
  teamId: uuid('team_id').references(() => teams.id, { onDelete: 'cascade' }),
  periodStart: timestamp('period_start'),
  periodEnd: timestamp('period_end'),
  tokensUsed: integer('tokens_used').default(0),
  usageAmount: integer('usage_amount').default(0), // in cents
  totalAmount: integer('total_amount').default(0), // in cents
  status: text('status').default('open'), // open, billed
  createdAt: timestamp('created_at').defaultNow(),
});

// Invoices Table
export const invoices = pgTable('invoices', {
  id: uuid('id').defaultRandom().primaryKey(),
  teamId: uuid('team_id').references(() => teams.id, { onDelete: 'cascade' }),
  amount: integer('amount').notNull(), // in cents
  status: text('status').default('unpaid'), // unpaid, paid, void, past_due
  dueDate: timestamp('due_date'),
  description: text('description'),
  customerName: text('customer_name'),
  paidAt: timestamp('paid_at'),
  pdfUrl: text('pdf_url'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Privacy Rules Table
export const privacyRules = pgTable('privacy_rules', {
  id: uuid('id').defaultRandom().primaryKey(),
  teamId: uuid('team_id').references(() => teams.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  pattern: text('pattern').notNull(),
  maskingMethod: text('masking_method').default('redact'), // redact, hash, partial
  isEnabled: boolean('is_enabled').default(true),
  category: text('category').default('custom'), // PII, FINANCIAL, etc.
  createdAt: timestamp('created_at').defaultNow(),
});

// Migration Jobs Table
export const migrationJobs = pgTable('migration_jobs', {
  id: uuid('id').defaultRandom().primaryKey(),
  teamId: uuid('team_id').references(() => teams.id, { onDelete: 'cascade' }),
  targetUrl: text('target_url'),
  dbType: text('db_type').default('postgres'),
  status: text('status').default('PENDING'), // PENDING, IN_PROGRESS, COMPLETED, FAILED
  logs: json('logs').$type<Array<{ timestamp: string; level: string; message: string }>>().default([]),
  progress: integer('progress').default(0),
  tablesCount: integer('tables_count'),
  rowsCount: integer('rows_count'),
  startedAt: timestamp('started_at'),
  completedAt: timestamp('completed_at'),
  errorMessage: text('error_message'),
  createdAt: timestamp('created_at').defaultNow(),
});


// Relations
export const usersRelations = relations(users, ({ many }) => ({
  teamMembers: many(teamMembers),
}));

export const teamsRelations = relations(teams, ({ many }) => ({
  teamMembers: many(teamMembers),
  apiKeys: many(apiKeys),
  webhooks: many(webhooks),
  webhookDeliveries: many(webhookDeliveries),
  auditLogs: many(auditLogs),
  roles: many(roles),
  migrationJobs: many(migrationJobs),
  invitations: many(invitations),
}));

export const teamMembersRelations = relations(teamMembers, ({ one }) => ({
  user: one(users, {
    fields: [teamMembers.userId],
    references: [users.id],
  }),
  team: one(teams, {
    fields: [teamMembers.teamId],
    references: [teams.id],
  }),
}));
// Password Reset Tokens Table
export const passwordResetTokens = pgTable('password_reset_tokens', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  token: text('token').notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  used: boolean('used').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

export const passwordResetTokensRelations = relations(passwordResetTokens, ({ one }) => ({
  user: one(users, {
    fields: [passwordResetTokens.userId],
    references: [users.id],
  }),
}));

export const migrationJobsRelations = relations(migrationJobs, ({ one }) => ({
  team: one(teams, {
    fields: [migrationJobs.teamId],
    references: [teams.id],
  }),
}));

// System Logs Table
export const systemLogs = pgTable('system_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  level: text('level').notNull(), // ERROR, WARN, INFO, DEBUG
  source: text('source').notNull(), // API, DATABASE, etc.
  message: text('message').notNull(),
  metadata: jsonb('metadata'),
  teamId: uuid('team_id').references(() => teams.id, { onDelete: 'set null' }),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').defaultNow(),
});
// AI Feedback Table
export const aiFeedback = pgTable('ai_feedback', {
  id: uuid('id').defaultRandom().primaryKey(),
  teamId: uuid('team_id').references(() => teams.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  messageId: text('message_id').notNull(), // ID from Vercel AI SDK or generated
  rating: integer('rating').notNull(), // 1 (Up) or -1 (Down)
  comment: text('comment'), // Optional explanation
  createdAt: timestamp('created_at').defaultNow(),
});

export const aiFeedbackRelations = relations(aiFeedback, ({ one }) => ({
  user: one(users, {
    fields: [aiFeedback.userId],
    references: [users.id],
  }),
}));

// Campaigns Table (Vertical Expansion)
export const campaigns = pgTable('campaigns', {
  id: uuid('id').defaultRandom().primaryKey(),
  teamId: uuid('team_id').references(() => teams.id, { onDelete: 'cascade' }).notNull(),
  name: text('name').notNull(),
  description: text('description'),
  status: text('status').default('DRAFT').notNull(), // DRAFT, ACTIVE, PAUSED, COMPLETED
  budget: integer('budget').default(0), // in cents
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const campaignsRelations = relations(campaigns, ({ one }) => ({
  team: one(teams, {
    fields: [campaigns.teamId],
    references: [teams.id],
  }),
}));
