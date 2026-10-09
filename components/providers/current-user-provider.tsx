"use client";

import { createContext, useContext } from "react";

import type { User } from "@/features/user/types";

// Only the fields client components actually need -- keeps the serialized
// props crossing the server/client boundary small.
export type SessionUser = Pick<User, "id" | "name" | "email">;

const CurrentUserContext = createContext<SessionUser | null>(null);

export function CurrentUserProvider({
  user,
  children,
}: {
  user: SessionUser;
  children: React.ReactNode;
}) {
  return (
    <CurrentUserContext.Provider value={user}>
      {children}
    </CurrentUserContext.Provider>
  );
}

// The signed-in tenant user. Provided by AppShell, so it's available to every
// client component rendered under the (protected) layout.
export function useCurrentUser(): SessionUser {
  const user = useContext(CurrentUserContext);

  if (!user) {
    throw new Error("useCurrentUser must be used within a CurrentUserProvider.");
  }

  return user;
}
