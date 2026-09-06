import { AdminReportsOverview } from "@/components/report/admin-reports-overview";
import { requireRole } from "@/lib/session";

export default async function ReportsPage() {
  await requireRole("ADMIN");

  return <AdminReportsOverview />;
}
