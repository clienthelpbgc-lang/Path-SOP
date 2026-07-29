import {
  CalendarClock,
  CalendarRange,
  LayoutDashboard,
  ListChecks,
  ShieldCheck,
  UserCircle,
  type LucideIcon,
} from "lucide-react";

import type { UserRole } from "@/features/user/constants/role.constant";

export type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  roles?: UserRole[];
};

export const NAV_ITEMS: NavItem[] = [
  { title: "Dashboard", href: "/", icon: LayoutDashboard },
  { title: "Daily Tasks", href: "/daily-tasks", icon: ListChecks },
  { title: "Weekly KRA's", href: "/weekly-kras", icon: CalendarRange },
  { title: "Monthly KRA's", href: "/monthly-kras", icon: CalendarClock },
  { title: "Task Admin", href: "/task-admin", icon: ShieldCheck, roles: ["ADMIN"] },
  { title: "Profile", href: "/profile", icon: UserCircle },
];

export function getNavItems(role: UserRole): NavItem[] {
  return NAV_ITEMS.filter((item) => !item.roles || item.roles.includes(role));
}

export function getPageTitle(pathname: string): string {
  if (pathname === "/") return "Dashboard";

  const match = NAV_ITEMS.find(
    (item) => item.href !== "/" && pathname.startsWith(item.href),
  );

  return match?.title ?? "Path SOP";
}
