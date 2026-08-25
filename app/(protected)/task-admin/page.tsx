import { requireRole } from "@/lib/session";
import { CreateTaskDialog } from "@/components/task/create-task-dialog";
import { TaskList } from "@/components/task/table/task-list";

export default async function TaskAdminPage() {
  const user = await requireRole("ADMIN");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">
          Task Admin
        </h2>
        <CreateTaskDialog />
      </div>

      <TaskList currentUserId={user.id} scope="all" />
    </div>
  );
}
