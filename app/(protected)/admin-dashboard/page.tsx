import { AdminDashboardOverview } from "@/components/dashboard/admin/admin-dashboard-overview";
import { requireRole } from "@/lib/session";

export default async function AdminDashboardPage() {
  await requireRole("ADMIN");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">
          Admin Dashboard
        </h2>
        <p className="text-sm text-muted-foreground">
          Company-wide task health and team workload.
        </p>
      </div>

      <AdminDashboardOverview />
    </div>
  );
}
