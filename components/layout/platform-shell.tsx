"use client";

import { LogOut, ShieldCheck } from "lucide-react";

import { logout } from "@/features/auth/actions";
import type { PlatformAdmin } from "@/features/platform-admin/types";
import { Button } from "@/components/ui/button";

export function PlatformShell({
  admin,
  children,
}: {
  admin: PlatformAdmin;
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-background/95 px-4 backdrop-blur supports-backdrop-filter:bg-background/75 sm:px-6">
        <ShieldCheck className="size-5 text-primary" />
        <h1 className="text-sm font-semibold tracking-tight text-foreground">
          Platform Admin
        </h1>

        <div className="ml-auto flex items-center gap-3">
          <span className="hidden text-sm text-muted-foreground sm:inline">
            {admin.name}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => logout()}
          >
            <LogOut />
            Log out
          </Button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
