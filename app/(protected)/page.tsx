import { ListChecks } from "lucide-react";

import { getCurrentUser } from "@/lib/session";
import { PagePlaceholder } from "@/components/layout/page-placeholder";
import { CreateDailyTaskModal } from "@/components/daily-tasks/create-daily-task-modal";

const Home = async () => {
  const user = await getCurrentUser();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            Welcome back, {user.name.split(" ")[0]}
          </h2>
          <p className="text-sm text-muted-foreground">
            Here&apos;s what&apos;s happening at {user.company.name} today.
          </p>
        </div>

        {user.role === "ADMIN" && <CreateDailyTaskModal />}
      </div>

      <PagePlaceholder
        icon={ListChecks}
        title="No activity to show yet"
        description="Your daily task summary and KRA progress will show up here once you start logging work."
      />
    </div>
  );
};

export default Home;
