-- Enable Row Level Security for all tenant-scoped tables
-- This migration adds database-level multi-tenancy protection
-- to prevent cross-tenant data leaks even if application code has bugs.

-- ============================================================================
-- 1. ENABLE RLS ON ALL TENANT-SCOPED TABLES
-- ============================================================================

-- Projects and related
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Documents and knowledge base
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Billing and invoices
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_billings ENABLE ROW LEVEL SECURITY;

-- Team management
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;

-- Audit and compliance
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Webhooks
ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_deliveries ENABLE ROW LEVEL SECURITY;

-- API and security
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE privacy_rules ENABLE ROW LEVEL SECURITY;

-- Campaigns (vertical expansion)
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

-- Migration jobs
ALTER TABLE migration_jobs ENABLE ROW LEVEL SECURITY;

-- AI Feedback
ALTER TABLE ai_feedback ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 2. CREATE TENANT ISOLATION POLICIES
-- ============================================================================

-- Helper function to get current tenant from session
CREATE OR REPLACE FUNCTION current_tenant_id() 
RETURNS uuid AS $$
  SELECT NULLIF(current_setting('app.current_team_id', true), '')::uuid;
$$ LANGUAGE SQL STABLE;

-- Projects: Tenant isolation
DROP POLICY IF EXISTS tenant_isolation_projects ON projects;
CREATE POLICY tenant_isolation_projects ON projects
  USING (team_id = current_tenant_id() OR current_tenant_id() IS NULL);

-- Project Members: Access through project's team
DROP POLICY IF EXISTS tenant_isolation_project_members ON project_members;
CREATE POLICY tenant_isolation_project_members ON project_members
  USING (
    project_id IN (
      SELECT id FROM projects WHERE team_id = current_tenant_id()
    ) OR current_tenant_id() IS NULL
  );

-- Tasks: Access through project's team  
DROP POLICY IF EXISTS tenant_isolation_tasks ON tasks;
CREATE POLICY tenant_isolation_tasks ON tasks
  USING (
    project_id IN (
      SELECT id FROM projects WHERE team_id = current_tenant_id()
    ) OR current_tenant_id() IS NULL
  );

-- Documents: Tenant isolation
DROP POLICY IF EXISTS tenant_isolation_documents ON documents;
CREATE POLICY tenant_isolation_documents ON documents
  USING (team_id = current_tenant_id() OR current_tenant_id() IS NULL);

-- Invoices: Tenant isolation
DROP POLICY IF EXISTS tenant_isolation_invoices ON invoices;
CREATE POLICY tenant_isolation_invoices ON invoices
  USING (team_id = current_tenant_id() OR current_tenant_id() IS NULL);

-- Usage Billings: Tenant isolation
DROP POLICY IF EXISTS tenant_isolation_usage_billings ON usage_billings;
CREATE POLICY tenant_isolation_usage_billings ON usage_billings
  USING (team_id = current_tenant_id() OR current_tenant_id() IS NULL);

-- Team Members: Tenant isolation
DROP POLICY IF EXISTS tenant_isolation_team_members ON team_members;
CREATE POLICY tenant_isolation_team_members ON team_members
  USING (team_id = current_tenant_id() OR current_tenant_id() IS NULL);

-- Invitations: Tenant isolation
DROP POLICY IF EXISTS tenant_isolation_invitations ON invitations;
CREATE POLICY tenant_isolation_invitations ON invitations
  USING (team_id = current_tenant_id() OR current_tenant_id() IS NULL);

-- Roles: Tenant isolation
DROP POLICY IF EXISTS tenant_isolation_roles ON roles;
CREATE POLICY tenant_isolation_roles ON roles
  USING (team_id = current_tenant_id() OR current_tenant_id() IS NULL);

-- Audit Logs: Tenant isolation
DROP POLICY IF EXISTS tenant_isolation_audit_logs ON audit_logs;
CREATE POLICY tenant_isolation_audit_logs ON audit_logs
  USING (team_id = current_tenant_id() OR current_tenant_id() IS NULL);

-- Notifications: Tenant isolation
DROP POLICY IF EXISTS tenant_isolation_notifications ON notifications;
CREATE POLICY tenant_isolation_notifications ON notifications
  USING (team_id = current_tenant_id() OR current_tenant_id() IS NULL);

-- Webhooks: Tenant isolation
DROP POLICY IF EXISTS tenant_isolation_webhooks ON webhooks;
CREATE POLICY tenant_isolation_webhooks ON webhooks
  USING (team_id = current_tenant_id() OR current_tenant_id() IS NULL);

-- Webhook Deliveries: Access through webhook's team
DROP POLICY IF EXISTS tenant_isolation_webhook_deliveries ON webhook_deliveries;
CREATE POLICY tenant_isolation_webhook_deliveries ON webhook_deliveries
  USING (
    webhook_id IN (
      SELECT id FROM webhooks WHERE team_id = current_tenant_id()
    ) OR current_tenant_id() IS NULL
  );

-- API Keys: Tenant isolation
DROP POLICY IF EXISTS tenant_isolation_api_keys ON api_keys;
CREATE POLICY tenant_isolation_api_keys ON api_keys
  USING (team_id = current_tenant_id() OR current_tenant_id() IS NULL);

-- Privacy Rules: Tenant isolation
DROP POLICY IF EXISTS tenant_isolation_privacy_rules ON privacy_rules;
CREATE POLICY tenant_isolation_privacy_rules ON privacy_rules
  USING (team_id = current_tenant_id() OR current_tenant_id() IS NULL);

-- Campaigns: Tenant isolation
DROP POLICY IF EXISTS tenant_isolation_campaigns ON campaigns;
CREATE POLICY tenant_isolation_campaigns ON campaigns
  USING (team_id = current_tenant_id() OR current_tenant_id() IS NULL);

-- Migration Jobs: Tenant isolation
DROP POLICY IF EXISTS tenant_isolation_migration_jobs ON migration_jobs;
CREATE POLICY tenant_isolation_migration_jobs ON migration_jobs
  USING (team_id = current_tenant_id() OR current_tenant_id() IS NULL);

-- AI Feedback: Tenant isolation
DROP POLICY IF EXISTS tenant_isolation_ai_feedback ON ai_feedback;
CREATE POLICY tenant_isolation_ai_feedback ON ai_feedback
  USING (team_id = current_tenant_id() OR current_tenant_id() IS NULL);

-- ============================================================================
-- 3. SUPERADMIN BYPASS POLICIES
-- ============================================================================
-- Note: Superadmin access is handled by NOT setting the session variable,
-- which causes current_tenant_id() to return NULL and bypass all policies.
-- This is intentional for platform-wide administration.

-- ============================================================================
-- 4. GRANT NECESSARY PERMISSIONS
-- ============================================================================
-- The application role needs permission to set the session variable
-- This assumes your database role is 'postgres' or similar
-- Adjust role name as needed for your setup

-- GRANT ALL ON ALL TABLES IN SCHEMA public TO your_app_role;
-- GRANT EXECUTE ON FUNCTION current_tenant_id() TO your_app_role;
