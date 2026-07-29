import type { CurrentUser } from "@/lib/session";
import { Header } from "@/components/layout/header";
import { SidebarContent } from "@/components/layout/sidebar-content";

export function AppShell({
  user,
  children,
}: {
  user: CurrentUser;
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <aside className="hidden w-64 shrink-0 border-r border-sidebar-border lg:block">
        <SidebarContent user={user} />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <Header user={user} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
