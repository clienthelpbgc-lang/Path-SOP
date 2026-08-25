import type { UserRole } from "@/features/user/constants/role.constant";

import type { DashboardOverview } from "./dashboard-overview.type";

export interface AdminUserOverviewMember {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
}

export interface AdminUserOverview extends DashboardOverview {
  user: AdminUserOverviewMember;
}
