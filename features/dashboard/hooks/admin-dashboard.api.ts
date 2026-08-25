import type {
  AdminDashboardOverview,
  AdminUserOverview,
} from "@/features/dashboard/types";
import { apiFetch } from "@/lib/api-client";

const BASE_URL = "/api/admin-dashboard";

export function getAdminDashboardOverviewRequest() {
  return apiFetch<AdminDashboardOverview>(BASE_URL);
}

export function getAdminUserOverviewRequest(userId: string) {
  return apiFetch<AdminUserOverview>(`${BASE_URL}/users/${userId}`);
}
