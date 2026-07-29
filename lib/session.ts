import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";

import { db } from "@/db";
import { companies } from "@/features/company/schema";
import type { UserRole } from "@/features/user/constants/role.constant";
import { users } from "@/features/user/schema";
import type { User } from "@/features/user/types";
import { AuthError } from "@/lib/errors";
import { createClient } from "@/utils/supabase/server";

export type CurrentUser = User & {
  company: {
    id: string;
    name: string;
    logo: string | null;
  };
};

// Memoized per request: repeated calls within the same render pass (e.g.
// layout + page both calling getCurrentUser) reuse one result instead of
// re-hitting Supabase Auth and the DB each time.
export const getCurrentUser = cache(async (): Promise<CurrentUser> => {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user: authUser },
    error,
  } = await supabase.auth.getUser();

  if (error || !authUser) {
    throw new AuthError("Please login first.");
  }

  const [row] = await db
    .select({
      user: users,
      company: {
        id: companies.id,
        name: companies.name,
        logo: companies.logo,
      },
    })
    .from(users)
    .innerJoin(companies, eq(users.companyId, companies.id))
    .where(eq(users.id, authUser.id))
    .limit(1);

  if (!row) {
    throw new AuthError("Your account could not be found.");
  }

  return { ...row.user, company: row.company };
});

export async function getCurrentCompanyId(): Promise<string> {
  const user = await getCurrentUser();

  return user.companyId;
}

// Call from page components (or Server Actions/Route Handlers) that must be
// restricted to a role, rather than from a shared layout: layouts don't
// re-render on every client-side navigation, so a check placed there can be
// skipped by the router cache. See the Next.js authentication guide's
// "Layouts and auth checks" section.
export async function requireRole(
  ...roles: UserRole[]
): Promise<CurrentUser> {
  const user = await getCurrentUser();

  if (!roles.includes(user.role)) {
    redirect("/");
  }

  return user;
}
