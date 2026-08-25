-- Postgres Row-Level Security as a defense-in-depth backstop for
-- multi-tenant scoping. Application code already filters every query by
-- companyId; this makes the database enforce the same boundary
-- independently, so a future service function that forgets a companyId
-- filter fails closed instead of leaking cross-tenant data.
--
-- Trust anchor: the app sets exactly one session variable per request,
-- app.user_id (the Supabase-authenticated user's id -- never a
-- client-supplied companyId). current_company_id() derives the caller's
-- company from it. It's SECURITY DEFINER so it can read `users` without
-- tripping that table's own RLS policy (avoids the bootstrapping problem of
-- needing to know your company to read the row that tells you your
-- company).
CREATE FUNCTION current_company_id() RETURNS uuid
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT company_id FROM users WHERE id = current_setting('app.user_id', true)::uuid
$$;
--> statement-breakpoint
REVOKE ALL ON FUNCTION current_company_id() FROM PUBLIC;
--> statement-breakpoint

-- Restricted role for all normal per-request work (everything except
-- company CRUD and the cross-tenant recurring-tasks cron job, which stay on
-- the existing DATABASE_URL role -- see db/index.ts and
-- db/tenant-context.ts). No BYPASSRLS, so policies below always apply to it.
--
-- LOGIN is enabled but no password is set here on purpose -- run this
-- separately, outside of any committed migration:
--   ALTER ROLE app_tenant WITH PASSWORD '<strong random value>';
-- then build TENANT_DATABASE_URL from it (same host as DATABASE_URL, user
-- app_tenant) and set it in .env / Vercel project env vars.
CREATE ROLE app_tenant LOGIN;
--> statement-breakpoint
GRANT USAGE ON SCHEMA public TO app_tenant;
--> statement-breakpoint
GRANT EXECUTE ON FUNCTION current_company_id() TO app_tenant;
--> statement-breakpoint

-- companies is the tenant root: app_tenant may read a company (needed by
-- getCurrentUser's users/companies join) but never write one -- company
-- mutations only ever happen through the systemDb/company-service path.
GRANT SELECT ON companies TO app_tenant;
--> statement-breakpoint
GRANT SELECT, INSERT, UPDATE, DELETE ON
  users, tasks, task_templates, kras,
  task_checklist_items, task_attachments, task_reminders, task_watchers
TO app_tenant;
--> statement-breakpoint

ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY tenant_isolation ON companies FOR SELECT
  USING (id = current_company_id());
--> statement-breakpoint

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY tenant_isolation ON users FOR ALL
  USING (company_id = current_company_id())
  WITH CHECK (company_id = current_company_id());
--> statement-breakpoint

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY tenant_isolation ON tasks FOR ALL
  USING (company_id = current_company_id())
  WITH CHECK (company_id = current_company_id());
--> statement-breakpoint

ALTER TABLE task_templates ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY tenant_isolation ON task_templates FOR ALL
  USING (company_id = current_company_id())
  WITH CHECK (company_id = current_company_id());
--> statement-breakpoint

ALTER TABLE kras ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY tenant_isolation ON kras FOR ALL
  USING (company_id = current_company_id())
  WITH CHECK (company_id = current_company_id());
--> statement-breakpoint

-- No direct company_id column -- scoped via the parent task's company.
ALTER TABLE task_checklist_items ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY tenant_isolation ON task_checklist_items FOR ALL
  USING (EXISTS (
    SELECT 1 FROM tasks t
    WHERE t.id = task_checklist_items.task_id AND t.company_id = current_company_id()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM tasks t
    WHERE t.id = task_checklist_items.task_id AND t.company_id = current_company_id()
  ));
--> statement-breakpoint

ALTER TABLE task_attachments ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY tenant_isolation ON task_attachments FOR ALL
  USING (EXISTS (
    SELECT 1 FROM tasks t
    WHERE t.id = task_attachments.task_id AND t.company_id = current_company_id()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM tasks t
    WHERE t.id = task_attachments.task_id AND t.company_id = current_company_id()
  ));
--> statement-breakpoint

ALTER TABLE task_reminders ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY tenant_isolation ON task_reminders FOR ALL
  USING (EXISTS (
    SELECT 1 FROM tasks t
    WHERE t.id = task_reminders.task_id AND t.company_id = current_company_id()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM tasks t
    WHERE t.id = task_reminders.task_id AND t.company_id = current_company_id()
  ));
--> statement-breakpoint

ALTER TABLE task_watchers ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY tenant_isolation ON task_watchers FOR ALL
  USING (EXISTS (
    SELECT 1 FROM tasks t
    WHERE t.id = task_watchers.task_id AND t.company_id = current_company_id()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM tasks t
    WHERE t.id = task_watchers.task_id AND t.company_id = current_company_id()
  ));
