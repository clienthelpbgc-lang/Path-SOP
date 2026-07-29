import { getCurrentUser } from "@/lib/session";
import { DailyTasksTable } from "@/components/daily-tasks/daily-tasks-table";
import { CreateDailyTaskModal } from "@/components/daily-tasks/create-daily-task-modal";

export default async function DailyTasksPage() {
  const user = await getCurrentUser();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between gap-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">
          Daily Tasks
        </h2>
        <p className="text-sm text-muted-foreground">
          Track and update your daily work items.
        </p>
      </div>
 {user.role === "ADMIN" && <CreateDailyTaskModal />}
      </div>

      <DailyTasksTable currentUserId={user.id} />
    </div>
  );
}
