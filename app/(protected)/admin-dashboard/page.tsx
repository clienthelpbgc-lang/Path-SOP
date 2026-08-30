import { AdminDashboardOverview } from "@/components/dashboard/admin/admin-dashboard-overview";
import { requireRole } from "@/lib/session";

export default async function AdminDashboardPage() {
  await requireRole("ADMIN");

  return <AdminDashboardOverview />;
}
