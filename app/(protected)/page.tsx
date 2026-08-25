import { DashboardOverview } from "@/components/dashboard/dashboard-overview";
import { ReportDownloadButtons } from "@/components/dashboard/report-download-buttons";
import { getCurrentUser } from "@/lib/session";

const Home = async () => {
  const user = await getCurrentUser();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            Welcome back, {user.name.split(" ")[0]}
          </h2>
          <p className="text-sm text-muted-foreground">
            Here&apos;s what&apos;s happening at {user.company.name} today.
          </p>
        </div>
        <ReportDownloadButtons />
      </div>

      <DashboardOverview currentUserId={user.id} />
    </div>
  );
};

export default Home;
