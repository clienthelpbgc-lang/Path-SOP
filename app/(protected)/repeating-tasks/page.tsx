import { requireRole } from "@/lib/session";
import { TaskList } from "@/components/task/table/task-list";

export default async function RepeatingTasksPage() {
  const user = await requireRole("ADMIN");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">
          Repeating Tasks
        </h2>
      </div>
      <TaskList currentUserId={user.id} scope="all" onlyRepeating />
    </div>
  );
}
