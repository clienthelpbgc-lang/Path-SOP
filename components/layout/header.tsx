"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Building2, Menu } from "lucide-react";

import type { CurrentUser } from "@/lib/session";
import { Button } from "@/components/ui/button";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { getPageTitle } from "@/components/layout/nav-config";
import { SidebarContent } from "@/components/layout/sidebar-content";

export function Header({ user }: { user: CurrentUser }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const title = getPageTitle(pathname);

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b border-border bg-background/95 px-4 backdrop-blur supports-backdrop-filter:bg-background/75 sm:px-6">
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger
          render={<Button variant="ghost" size="icon" className="lg:hidden" />}
        >
          <Menu className="size-5" />
          <span className="sr-only">Open menu</span>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0 sm:max-w-64">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SidebarContent user={user} onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      <h1 className="text-sm font-semibold tracking-tight text-foreground">
        {title}
      </h1>

      <div className="ml-auto flex items-center gap-2 lg:hidden">
        <Avatar size="sm" className="rounded-md after:rounded-md">
          <AvatarImage
            src={user.company.logo ?? undefined}
            alt={user.company.name}
            className="rounded-md object-contain"
          />
          <AvatarFallback className="rounded-md">
            <Building2 className="size-3.5" />
          </AvatarFallback>
        </Avatar>
        <span className="max-w-32 truncate text-xs font-medium text-muted-foreground">
          {user.company.name}
        </span>
      </div>
    </header>
  );
}
