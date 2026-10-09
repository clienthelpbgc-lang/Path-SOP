import type { CurrentUser } from "@/lib/session";
import { Header } from "@/components/layout/header";
import { SidebarContent } from "@/components/layout/sidebar-content";
import { CurrentUserProvider } from "@/components/providers/current-user-provider";

export function AppShell({
  user,
  children,
}: {
  user: CurrentUser;
  children: React.ReactNode;
}) {
  return (
    <CurrentUserProvider
      user={{ id: user.id, name: user.name, email: user.email }}
    >
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
    </CurrentUserProvider>
  );
}
