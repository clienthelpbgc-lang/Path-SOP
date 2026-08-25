import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { AdminUserOverview } from "@/components/dashboard/admin/admin-user-overview";
import { requireRole } from "@/lib/session";

type AdminUserDashboardPageProps = {
  params: Promise<{ userId: string }>;
};

export default async function AdminUserDashboardPage({
  params,
}: AdminUserDashboardPageProps) {
  await requireRole("ADMIN");
  const { userId } = await params;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <Link
          href="/admin-dashboard"
          className="flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Admin Dashboard
        </Link>
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">
          Member Overview
        </h2>
        <p className="text-sm text-muted-foreground">
          Tasks, KRAs, and performance for this team member.
        </p>
      </div>

      <AdminUserOverview userId={userId} />
    </div>
  );
}
