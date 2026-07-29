import { CalendarClock, CalendarRange, ListChecks } from "lucide-react";

import { requireRole } from "@/lib/session";
import { PagePlaceholder } from "@/components/layout/page-placeholder";
import { TaskAdminDailyTasks } from "@/components/daily-tasks/task-admin-daily-tasks";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

export default async function TaskAdminPage() {
  const user = await requireRole("ADMIN");

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">
          Task Admin
        </h2>
        <p className="text-sm text-muted-foreground">
          Review submissions awaiting your approval.
        </p>
      </div>

      <Tabs defaultValue="daily-tasks">
        <TabsList variant="line" className="w-full justify-start gap-6">
          <TabsTrigger value="daily-tasks">
            <ListChecks />
            Daily Tasks
          </TabsTrigger>
          <TabsTrigger value="weekly-kras">
            <CalendarRange />
            Weekly KRA&apos;s
          </TabsTrigger>
          <TabsTrigger value="monthly-kras">
            <CalendarClock />
            Monthly KRA&apos;s
          </TabsTrigger>
        </TabsList>

        <TabsContent value="daily-tasks" className="mt-2">
          <TaskAdminDailyTasks currentUserId={user.id} />
        </TabsContent>

        <TabsContent value="weekly-kras" className="mt-2">
          <PagePlaceholder
            icon={CalendarRange}
            title="No weekly KRA's awaiting approval"
            description="Weekly KRA submissions will show up here."
          />
        </TabsContent>

        <TabsContent value="monthly-kras" className="mt-2">
          <PagePlaceholder
            icon={CalendarClock}
            title="No monthly KRA's awaiting approval"
            description="Monthly KRA submissions will show up here."
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
