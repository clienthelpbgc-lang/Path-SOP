"use client";

import { useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";

import { useCreateTaskTemplate, useTask } from "@/features/task/hooks";
import type { Task } from "@/features/task/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type CreateTaskTemplateDialogProps = {
  task: Task | null;
  onOpenChange: (open: boolean) => void;
};

// Fetches the task's full relations (checklist, reminders, watchers) so the
// template is a genuine copy, not just the title/weightage visible in the
// row -- the list query backing the table doesn't include those relations.
export function CreateTaskTemplateDialog({
  task,
  onOpenChange,
}: CreateTaskTemplateDialogProps) {
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { data: fullTask, isLoading } = useTask(task?.id ?? "");
  const { mutate, isPending } = useCreateTaskTemplate();

  function handleOpenChange(nextOpen: boolean) {
    onOpenChange(nextOpen);
    if (!nextOpen) {
      setName("");
      setError(null);
    }
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const trimmedName = name.trim();
    if (trimmedName.length < 2) {
      setError("Template name must be at least 2 characters long.");
      return;
    }
    if (!task || !fullTask) return;

    mutate(
      {
        name: trimmedName,
        sourceTaskId: task.id,
        title: fullTask.title,
        description: fullTask.description ?? undefined,
        weightage: fullTask.weightage,
        checklist: fullTask.checklistItems.map((item, index) => ({
          text: item.text,
          sortOrder: index,
        })),
        reminders: fullTask.reminders.map((reminder) => ({
          channel: reminder.channel,
          anchor: reminder.anchor,
          offsetMinutes: reminder.offsetMinutes,
        })),
        defaultAssignee: fullTask.assignedTo,
        defaultWatchers: fullTask.watchers.map((watcher) => watcher.userId),
        isRepeating: fullTask.isRepeating,
        repeatUnit: fullTask.isRepeating
          ? (fullTask.repeatUnit ?? undefined)
          : undefined,
        repeatInterval: fullTask.isRepeating
          ? (fullTask.repeatInterval ?? undefined)
          : undefined,
        repeatDaysOfWeek:
          fullTask.isRepeating && fullTask.repeatUnit === "week"
            ? (fullTask.repeatDaysOfWeek ?? undefined)
            : undefined,
        isActive: true,
      },
      { onSuccess: () => handleOpenChange(false) },
    );
  }

  return (
    <Dialog open={task !== null} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create template</DialogTitle>
          <DialogDescription>
            Save &quot;{task?.title}&quot; as a reusable template, including
            its checklist and reminders.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="templateName">Template name</Label>
            <Input
              id="templateName"
              placeholder="e.g. Weekly client follow-up"
              value={name}
              onChange={(event) => setName(event.target.value)}
              aria-invalid={!!error}
            />
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>

          <DialogFooter className="mt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending || isLoading || !fullTask}
            >
              {isPending ? (
                <>
                  <Loader2 className="animate-spin" />
                  Creating...
                </>
              ) : (
                "Create template"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
