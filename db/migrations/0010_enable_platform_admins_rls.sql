-- Supabase grants anon/authenticated full CRUD on every new public-schema
-- table by default (see the other migrations' tenant_isolation policies,
-- which are what actually close that off for tenant tables -- RLS applies
-- per-role regardless of an explicit GRANT). platform_admins got no such
-- policy when it was created, so until this migration it was reachable by
-- ANY authenticated Supabase user (every tenant user across every company,
-- since they all share this project's Auth) directly through Supabase's
-- PostgREST API, bypassing this app's own DATABASE_URL/TENANT_DATABASE_URL
-- connections entirely -- not just app_tenant, which never had a GRANT here
-- (see features/platform-admin/schema.ts).
--
-- Enable RLS with zero policies: this denies ALL access (select/insert/
-- update/delete) to every role except the table owner and roles with
-- BYPASSRLS, neither of which anon/authenticated/app_tenant are. systemDb
-- (db/index.ts) connects as the table owner, so it's unaffected -- it's the
-- only intended reader/writer of this table.
ALTER TABLE platform_admins ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
REVOKE ALL ON TABLE platform_admins FROM anon, authenticated;
