import { getCurrentUser } from "@/lib/session";
import { TaskList } from "@/components/task/table/task-list";

export default async function TasksPage() {
  const user = await getCurrentUser();

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-2xl font-semibold tracking-tight text-foreground">
        My Task
      </h2>

      <TaskList currentUserId={user.id} />
    </div>
  );
}
