import {
  Gauge,
  LayoutDashboard,
  LayoutTemplate,
  ListTodo,
  Mail,
  ShieldCheck,
  Target,
  UserCircle,
  Users,
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
  {
    title: "Admin Dashboard",
    href: "/admin-dashboard",
    icon: Gauge,
    roles: ["ADMIN"],
  },
  { title: "Reports", href: "/reports", icon: Mail, roles: ["ADMIN"] },
  { title: "My Task", href: "/tasks", icon: ListTodo },
  { title: "Task Admin", href: "/task-admin", icon: ShieldCheck, roles: ["ADMIN"] },
  { title: "My KRA", href: "/kra", icon: Target },
  { title: "KRA Admin", href: "/kra-admin", icon: ShieldCheck, roles: ["ADMIN"] },
  { title: "Templates", href: "/templates", icon: LayoutTemplate },
  { title: "Team Members", href: "/team-members", icon: Users },
  { title: "Profile", href: "/profile", icon: UserCircle },
];

export function getNavItems(role: UserRole): NavItem[] {
  return NAV_ITEMS.filter((item) => !item.roles || item.roles.includes(role));
}

export function getPageTitle(pathname: string): string {
  if (pathname === "/") return "Dashboard";

  const match = NAV_ITEMS.find(
    (item) =>
      item.href !== "/" &&
      (pathname === item.href || pathname.startsWith(`${item.href}/`)),
  );

  return match?.title ?? "Path SOP";
}
