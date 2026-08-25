"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import { FileIcon, Loader2, Plus, Users, X } from "lucide-react";
import type { z } from "zod";

import {
  useCreateTaskAttachment,
  useCreateTaskChecklistItem,
  useCreateTaskWatcher,
  useDeleteTaskAttachment,
  useDeleteTaskChecklistItem,
  useDeleteTaskWatcher,
  useTask,
  useUpdateTask,
  useUpdateTaskChecklistItem,
} from "@/features/task/hooks";
import { deleteUploadedTaskAttachmentRequest } from "@/features/task/hooks/task.api";
import type { RepeatUnit } from "@/features/task/constants/repeat-unit.constant";
import type { Task, TaskWithRelations } from "@/features/task/types";
import { editTaskFormSchema } from "@/features/task/validators";
import { AssigneeCombobox } from "@/components/team/assignee-combobox";
import {
  TaskAttachmentsField,
  type AttachmentItem,
} from "@/components/task/task-attachments-field";
import { WEIGHTAGE_OPTIONS } from "@/components/task/task-form-constants";
import { TaskRepeatFieldset } from "@/components/task/task-repeat-fieldset";
import { WatchersCombobox } from "@/components/task/watchers-combobox";
import { Button } from "@/components/ui/button";
import { DateTimePicker } from "@/components/ui/date-time-picker";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { formatFileSize } from "@/lib/format-file-size";

type FormInput = z.input<typeof editTaskFormSchema>;
type FormOutput = z.output<typeof editTaskFormSchema>;

function defaultValues(task: TaskWithRelations): FormInput {
  return {
    title: task.title,
    description: task.description ?? "",
    assignedTo: task.assignedTo,
    weightage: task.weightage,
    startAt: new Date(task.startAt as unknown as string),
    dueAt: new Date(task.dueAt as unknown as string),
    isRepeating: task.isRepeating,
    repeatUnit: task.repeatUnit ?? undefined,
    repeatInterval: task.repeatInterval ?? undefined,
    repeatDaysOfWeek: task.repeatDaysOfWeek ?? [],
    repeatEndsAt: task.repeatEndsAt
      ? new Date(task.repeatEndsAt as unknown as string)
      : undefined,
    checklistItems: task.checklistItems
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((item) => ({ itemId: item.id, text: item.text })),
    watcherIds: task.watchers.map((watcher) => watcher.userId),
  };
}

type EditTaskDialogProps = {
  task: Task | null;
  onOpenChange: (open: boolean) => void;
};

export function EditTaskDialog({ task, onOpenChange }: EditTaskDialogProps) {
  const { data: fullTask, isLoading } = useTask(task?.id ?? "");

  return (
    <Dialog open={task !== null} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Edit task</DialogTitle>
          <DialogDescription>
            Update the details of this task.
          </DialogDescription>
        </DialogHeader>

        {isLoading || !fullTask ? (
          <div className="flex flex-col gap-3 py-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="h-8 w-full animate-pulse rounded bg-muted"
              />
            ))}
          </div>
        ) : (
          <EditTaskForm task={fullTask} onOpenChange={onOpenChange} />
        )}
      </DialogContent>
    </Dialog>
  );
}

type EditTaskFormProps = {
  task: TaskWithRelations;
  onOpenChange: (open: boolean) => void;
};

function EditTaskForm({ task, onOpenChange }: EditTaskFormProps) {
  const [attachmentItems, setAttachmentItems] = useState<AttachmentItem[]>(
    [],
  );
  const [removedAttachmentIds, setRemovedAttachmentIds] = useState<
    Set<string>
  >(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { mutateAsync: updateTask } = useUpdateTask();
  const { mutateAsync: createChecklistItem } = useCreateTaskChecklistItem();
  const { mutateAsync: updateChecklistItem } = useUpdateTaskChecklistItem();
  const { mutateAsync: deleteChecklistItem } = useDeleteTaskChecklistItem();
  const { mutateAsync: createWatcher } = useCreateTaskWatcher();
  const { mutateAsync: deleteWatcher } = useDeleteTaskWatcher();
  const { mutateAsync: createAttachment } = useCreateTaskAttachment();
  const { mutateAsync: deleteAttachment } = useDeleteTaskAttachment();

  const {
    control,
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(editTaskFormSchema),
    defaultValues: defaultValues(task),
  });

  const assignedTo = useWatch({ control, name: "assignedTo" });
  const isRepeating = useWatch({ control, name: "isRepeating" });
  const repeatUnit = useWatch({ control, name: "repeatUnit" });
  const repeatInterval = useWatch({ control, name: "repeatInterval" });
  const repeatDaysOfWeek = useWatch({ control, name: "repeatDaysOfWeek" });
  const repeatEndsAt = useWatch({ control, name: "repeatEndsAt" });

  const {
    fields: checklistFields,
    append: appendChecklistItem,
    remove: removeChecklistItem,
    insert: insertChecklistItem,
  } = useFieldArray({ control, name: "checklistItems" });

  const checklistInputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const pendingFocusIndexRef = useRef<number | null>(null);

  useEffect(() => {
    const index = pendingFocusIndexRef.current;
    if (index !== null) {
      checklistInputsRef.current[index]?.focus();
      pendingFocusIndexRef.current = null;
    }
  }, [checklistFields.length]);

  function handleChecklistKeyDown(
    event: KeyboardEvent<HTMLInputElement>,
    index: number,
  ) {
    if (event.key === "Enter") {
      event.preventDefault();
      pendingFocusIndexRef.current = index + 1;
      insertChecklistItem(index + 1, { text: "" });
    } else if (
      event.key === "Backspace" &&
      event.currentTarget.value === "" &&
      checklistFields.length > 1
    ) {
      event.preventDefault();
      pendingFocusIndexRef.current = Math.max(index - 1, 0);
      removeChecklistItem(index);
    }
  }

  function handleOpenChange(nextOpen: boolean) {
    onOpenChange(nextOpen);

    if (!nextOpen) {
      for (const item of attachmentItems) {
        if (item.status === "done" && item.fileKey) {
          deleteUploadedTaskAttachmentRequest(item.fileKey).catch(() => {});
        }
      }
      setAttachmentItems([]);
      setRemovedAttachmentIds(new Set());
    }
  }

  const isUploadingAttachments = attachmentItems.some(
    (item) => item.status === "uploading",
  );

  async function onSubmit(values: FormOutput) {
    if (isUploadingAttachments) return;

    setIsSubmitting(true);

    try {
      await updateTask({
        id: task.id,
        input: {
          title: values.title,
          description: values.description ? values.description : undefined,
          assignedTo: values.assignedTo,
          weightage: values.weightage,
          startAt: values.startAt,
          dueAt: values.dueAt,
          isRepeating: values.isRepeating,
          repeatUnit: values.isRepeating ? values.repeatUnit : undefined,
          repeatInterval: values.isRepeating
            ? values.repeatInterval
            : undefined,
          repeatDaysOfWeek:
            values.isRepeating && values.repeatUnit === "week"
              ? values.repeatDaysOfWeek
              : undefined,
          repeatEndsAt: values.isRepeating ? values.repeatEndsAt : undefined,
        },
      });

      const keptItemIds = new Set(
        values.checklistItems
          .map((item) => item.itemId)
          .filter((itemId): itemId is string => !!itemId),
      );

      for (const original of task.checklistItems) {
        if (!keptItemIds.has(original.id)) {
          await deleteChecklistItem({ taskId: task.id, itemId: original.id });
        }
      }

      for (const [index, item] of values.checklistItems.entries()) {
        const text = item.text.trim();
        if (!text) continue;

        if (item.itemId) {
          const original = task.checklistItems.find(
            (candidate) => candidate.id === item.itemId,
          );
          if (
            original &&
            (original.text !== text || original.sortOrder !== index)
          ) {
            await updateChecklistItem({
              taskId: task.id,
              itemId: item.itemId,
              input: { text, sortOrder: index },
            });
          }
        } else {
          await createChecklistItem({
            taskId: task.id,
            input: { text, sortOrder: index },
          });
        }
      }

      const originalWatcherIds = new Set(
        task.watchers.map((watcher) => watcher.userId),
      );
      const nextWatcherIds = new Set(values.watcherIds);

      for (const watcher of task.watchers) {
        if (!nextWatcherIds.has(watcher.userId)) {
          await deleteWatcher({ taskId: task.id, watcherId: watcher.userId });
        }
      }

      for (const userId of values.watcherIds) {
        if (!originalWatcherIds.has(userId)) {
          await createWatcher({ taskId: task.id, userId });
        }
      }

      for (const attachmentId of removedAttachmentIds) {
        await deleteAttachment({ taskId: task.id, attachmentId });
      }

      const doneAttachments = attachmentItems.filter(
        (item) => item.status === "done" && item.fileKey,
      );

      for (const item of doneAttachments) {
        await createAttachment({
          taskId: task.id,
          input: {
            context: "initial",
            fileKey: item.fileKey!,
            fileName: item.file.name,
            mimeType: item.mimeType,
            sizeBytes: item.sizeBytes,
          },
        });
      }

      setAttachmentItems([]);
      setRemovedAttachmentIds(new Set());
      handleOpenChange(false);
    } catch {
      // Errors are already surfaced via the mutations' own toasts.
    } finally {
      setIsSubmitting(false);
    }
  }

  const remainingAttachments = task.attachments.filter(
    (attachment) => !removedAttachmentIds.has(attachment.id),
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="-mr-1 flex max-h-[65vh] flex-col gap-5 overflow-y-auto pr-1">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="edit-title">Title</Label>
          <Input
            id="edit-title"
            placeholder="e.g. Follow up with client on invoice"
            aria-invalid={!!errors.title}
            {...register("title")}
          />
          {errors.title && (
            <p className="text-xs text-destructive">{errors.title.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="edit-description">
            Description{" "}
            <span className="font-normal text-muted-foreground">
              (optional)
            </span>
          </Label>
          <Textarea
            id="edit-description"
            placeholder="Add any context or instructions for this task"
            rows={3}
            aria-invalid={!!errors.description}
            {...register("description")}
          />
          {errors.description && (
            <p className="text-xs text-destructive">
              {errors.description.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label>
            Checklist{" "}
            <span className="font-normal text-muted-foreground">
              (optional)
            </span>
          </Label>
          <div className="flex flex-col gap-1.5">
            {checklistFields.map((field, index) => {
              const { ref, ...inputProps } = register(
                `checklistItems.${index}.text` as const,
              );

              return (
                <div key={field.id} className="flex items-center gap-1.5">
                  <Input
                    {...inputProps}
                    ref={(el) => {
                      ref(el);
                      checklistInputsRef.current[index] = el;
                    }}
                    placeholder="Checklist item"
                    onKeyDown={(event) =>
                      handleChecklistKeyDown(event, index)
                    }
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    aria-label="Remove checklist item"
                    onClick={() => removeChecklistItem(index)}
                  >
                    <X />
                  </Button>
                </div>
              );
            })}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="self-start"
            onClick={() => {
              pendingFocusIndexRef.current = checklistFields.length;
              appendChecklistItem({ text: "" });
            }}
          >
            <Plus />
            Add checklist item
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit-startAt">Start date &amp; time</Label>
            <Controller
              control={control}
              name="startAt"
              render={({ field }) => (
                <DateTimePicker
                  id="edit-startAt"
                  value={field.value as Date}
                  onChange={field.onChange}
                  aria-invalid={!!errors.startAt}
                />
              )}
            />
            {errors.startAt && (
              <p className="text-xs text-destructive">
                {errors.startAt.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit-dueAt">Due date &amp; time</Label>
            <Controller
              control={control}
              name="dueAt"
              render={({ field }) => (
                <DateTimePicker
                  id="edit-dueAt"
                  value={field.value as Date}
                  onChange={field.onChange}
                  aria-invalid={!!errors.dueAt}
                />
              )}
            />
            {errors.dueAt && (
              <p className="text-xs text-destructive">
                {errors.dueAt.message}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit-assignedTo">Assignee</Label>
            <Controller
              control={control}
              name="assignedTo"
              render={({ field }) => (
                <AssigneeCombobox
                  id="edit-assignedTo"
                  value={field.value}
                  onValueChange={field.onChange}
                  aria-invalid={!!errors.assignedTo}
                />
              )}
            />
            {errors.assignedTo && (
              <p className="text-xs text-destructive">
                {errors.assignedTo.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit-weightage">Weightage</Label>
            <Controller
              control={control}
              name="weightage"
              render={({ field }) => (
                <Select
                  value={
                    field.value !== undefined && field.value !== null
                      ? String(field.value)
                      : undefined
                  }
                  onValueChange={(value) => field.onChange(Number(value))}
                >
                  <SelectTrigger
                    id="edit-weightage"
                    aria-invalid={!!errors.weightage}
                    className="w-full"
                  >
                    <SelectValue placeholder="Select weightage" />
                  </SelectTrigger>
                  <SelectContent>
                    {WEIGHTAGE_OPTIONS.map((value) => (
                      <SelectItem key={value} value={String(value)}>
                        {value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.weightage && (
              <p className="text-xs text-destructive">
                {errors.weightage.message}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label
            htmlFor="edit-watcherIds"
            className="flex items-center gap-1.5"
          >
            <Users className="size-3.5 text-muted-foreground" />
            In the loop{" "}
            <span className="font-normal text-muted-foreground">
              (optional)
            </span>
          </Label>
          <Controller
            control={control}
            name="watcherIds"
            render={({ field }) => (
              <WatchersCombobox
                value={field.value}
                onValueChange={field.onChange}
                excludeUserId={assignedTo || undefined}
              />
            )}
          />
        </div>

        <TaskRepeatFieldset
          isRepeating={isRepeating}
          onIsRepeatingChange={(value) => setValue("isRepeating", value)}
          repeatUnit={repeatUnit as RepeatUnit | undefined}
          onRepeatUnitChange={(value) => setValue("repeatUnit", value)}
          repeatInterval={repeatInterval as number | undefined}
          onRepeatIntervalChange={(value) =>
            setValue("repeatInterval", value)
          }
          repeatDaysOfWeek={repeatDaysOfWeek}
          onRepeatDaysOfWeekChange={(value) =>
            setValue("repeatDaysOfWeek", value)
          }
          repeatEndsAt={repeatEndsAt as Date | undefined}
          onRepeatEndsAtChange={(value) => setValue("repeatEndsAt", value)}
          errors={{
            repeatUnit: errors.repeatUnit?.message,
            repeatInterval: errors.repeatInterval?.message,
            repeatDaysOfWeek: errors.repeatDaysOfWeek?.message,
            repeatEndsAt: errors.repeatEndsAt?.message,
          }}
        />

        <div className="flex flex-col gap-1.5">
          <Label>
            Attachments{" "}
            <span className="font-normal text-muted-foreground">
              (optional)
            </span>
          </Label>

          {remainingAttachments.length > 0 && (
            <ul className="flex flex-col gap-1.5">
              {remainingAttachments.map((attachment) => (
                <li
                  key={attachment.id}
                  className="flex items-center gap-2.5 rounded-lg border border-border bg-muted/40 py-1.5 pr-1.5 pl-2"
                >
                  <FileIcon className="size-4 shrink-0 text-muted-foreground" />
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-sm font-medium text-foreground">
                      {attachment.fileName}
                    </span>
                    {attachment.sizeBytes !== null && (
                      <span className="truncate text-xs text-muted-foreground">
                        {formatFileSize(attachment.sizeBytes)}
                      </span>
                    )}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    aria-label={`Remove ${attachment.fileName}`}
                    onClick={() =>
                      setRemovedAttachmentIds(
                        (prev) => new Set(prev).add(attachment.id),
                      )
                    }
                  >
                    <X />
                  </Button>
                </li>
              ))}
            </ul>
          )}

          <TaskAttachmentsField
            items={attachmentItems}
            onItemsChange={setAttachmentItems}
          />
        </div>
      </div>

      <DialogFooter className="mt-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => handleOpenChange(false)}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting || isUploadingAttachments}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="animate-spin" />
              Saving...
            </>
          ) : (
            "Save changes"
          )}
        </Button>
      </DialogFooter>
    </form>
  );
}
