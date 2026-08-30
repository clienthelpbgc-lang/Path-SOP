import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { DashboardOverview } from "@/components/dashboard/dashboard-overview";
import { requireRole } from "@/lib/session";

type AdminUserDashboardPageProps = {
  params: Promise<{ userId: string }>;
};

// Same dashboard a team member sees for themselves, rendered here for the
// clicked user instead -- the API already enforces that only an admin (or
// the member themselves) can request another user's stats.
export default async function AdminUserDashboardPage({
  params,
}: AdminUserDashboardPageProps) {
  await requireRole("ADMIN");
  const { userId } = await params;

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/admin-dashboard"
        className="flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Admin Dashboard
      </Link>

      <DashboardOverview
        userId={userId}
        title="Member Overview"
        description="Tasks, KRAs, and performance for this team member."
      />
    </div>
  );
}
