import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "@/db/schema";

const connectionString = process.env.DATABASE_URL;
const tenantConnectionString = process.env.TENANT_DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set.");
}

if (!tenantConnectionString) {
  throw new Error("TENANT_DATABASE_URL environment variable is not set.");
}

// Dev-mode hot reload re-evaluates this module on every change without
// tearing down the previous postgres client, which leaks a connection each
// time. Caching the clients on `globalThis` survives the reload so we reuse
// the same connections instead of piling up new ones.
declare global {
  var __dbClient: postgres.Sql | undefined;
  var __tenantDbClient: postgres.Sql | undefined;
}

const client =
  globalThis.__dbClient ?? postgres(connectionString, { prepare: false });
const tenantClient =
  globalThis.__tenantDbClient ??
  postgres(tenantConnectionString, { prepare: false });

if (process.env.NODE_ENV !== "production") {
  globalThis.__dbClient = client;
  globalThis.__tenantDbClient = tenantClient;
}

// Connects as the privileged role from DATABASE_URL, which is NOT subject to
// Row-Level Security. Reserved for the handful of code paths that are
// legitimately cross-tenant and have no single-company session to scope to
// (company CRUD, the recurring-tasks cron job) -- see db/tenant-context.ts
// for the RLS-enforced client every other service should use.
export const systemDb = drizzle(client, { schema });

// Connects as the restricted `app_tenant` role, which RLS policies apply to.
// Not exported directly -- db/tenant-context.ts wraps this in a
// transaction-scoped proxy (the `db` that every feature service imports).
export const rawTenantDb = drizzle(tenantClient, { schema });

// Re-exported so every existing `import { db } from "@/db"` across the
// feature services keeps working unchanged and transparently becomes
// RLS-scoped. See db/tenant-context.ts for how it's wired up.
export { db } from "@/db/tenant-context";
