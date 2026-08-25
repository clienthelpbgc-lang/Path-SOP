import { AsyncLocalStorage } from "node:async_hooks";

import { rawTenantDb } from "@/db";

type TenantTransactionCallback = Parameters<typeof rawTenantDb.transaction>[0];
type TenantDb = Parameters<TenantTransactionCallback>[0];

const tenantContext = new AsyncLocalStorage<TenantDb>();

function getScopedDb(): TenantDb {
  const tx = tenantContext.getStore();

  if (!tx) {
    throw new Error(
      "Database accessed outside of a request-scoped transaction. Wrap the call site in runInTenantScope (routeHandler already does this for API routes).",
    );
  }

  return tx;
}

// Every feature service imports `db` from "@/db" and calls it exactly like
// the plain Drizzle client it used to be (db.select()..., db.insert()...,
// db.transaction()...). Under the hood, each property access resolves to
// whatever RLS-scoped transaction is active for the current request via
// AsyncLocalStorage, so services don't need to know about tenant scoping at
// all -- see db/index.ts and lib/route-helpers/route-handler.ts.
export const db = new Proxy({} as TenantDb, {
  get(_target, prop) {
    const target = getScopedDb();
    const value = Reflect.get(target as object, prop, target);

    return typeof value === "function" ? value.bind(target) : value;
  },
});

// Opens the RLS-enforced transaction a request runs in. Reentrant: if a
// scope is already active (the normal case -- routeHandler opens one before
// getCurrentUser() runs), nested calls just reuse it instead of nesting
// transactions, so getCurrentUser() can call this unconditionally whether
// it's invoked from a route handler or directly from a Server Component.
export async function runInTenantScope<T>(fn: () => Promise<T>): Promise<T> {
  const existing = tenantContext.getStore();

  if (existing) {
    return fn();
  }

  return rawTenantDb.transaction(async (tx) => {
    return tenantContext.run(tx as TenantDb, fn);
  });
}
