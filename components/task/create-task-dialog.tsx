"use client";

import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import { Loader2, Plus, Users, X } from "lucide-react";
import type { z } from "zod";

import { useCreateTask } from "@/features/task/hooks";
import { deleteUploadedTaskAttachmentRequest } from "@/features/task/hooks/task.api";
import type { RepeatUnit } from "@/features/task/constants/repeat-unit.constant";
import type { TaskTemplate } from "@/features/task/types";
import { createTaskFormSchema } from "@/features/task/validators";
import { AssigneeCombobox } from "@/components/team/assignee-combobox";
import {
  TaskAttachmentsField,
  type AttachmentItem,
} from "@/components/task/task-attachments-field";
import { WatchersCombobox } from "@/components/task/watchers-combobox";
import { WEIGHTAGE_OPTIONS } from "@/components/task/task-form-constants";
import {
  ReminderFieldset,
  type ReminderDraft,
} from "@/components/task/reminder-fieldset";
import { TaskRepeatFieldset } from "@/components/task/task-repeat-fieldset";
import { Button } from "@/components/ui/button";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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

type FormInput = z.input<typeof createTaskFormSchema>;
type FormOutput = z.output<typeof createTaskFormSchema>;

function endOfToday(): Date {
  const date = new Date();
  date.setHours(23, 59, 0, 0);
  return date;
}

function defaultValues(template?: TaskTemplate | null): FormInput {
  return {
    title: template?.title ?? "",
    description: template?.description ?? "",
    assignedTo: template?.defaultAssignee ?? "",
    // Templates allow a weightage of 0, tasks don't -- clamp so a prefilled
    // form doesn't fail validation before the user has touched anything.
    weightage: Math.max(1, template?.weightage ?? 1),
    startAt: new Date(),
    dueAt: endOfToday(),
    isRepeating: template?.isRepeating ?? false,
    repeatUnit: template?.isRepeating
      ? (template?.repeatUnit ?? undefined)
      : undefined,
    repeatInterval: template?.repeatInterval ?? 1,
    repeatDaysOfWeek: template?.repeatDaysOfWeek ?? [],
    repeatEndsAt: undefined,
    checklistItems:
      template?.checklist
        .slice()
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((item) => ({ text: item.text })) ?? [],
    watcherIds: template?.defaultWatchers ?? [],
  };
}

type CreateTaskDialogProps = {
  // When provided, the dialog is externally controlled (triggered from a
  // template's "Create task" action) and its form is prefilled from the
  // template instead of rendering its own "New Task" button.
  template?: TaskTemplate | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function CreateTaskDialog({
  template = null,
  open: openProp,
  onOpenChange: onOpenChangeProp,
}: CreateTaskDialogProps = {}) {
  const isControlled = openProp !== undefined;
  const [internalOpen, setInternalOpen] = useState(false);
  const open = isControlled ? openProp : internalOpen;

  const [attachmentItems, setAttachmentItems] = useState<AttachmentItem[]>(
    [],
  );
  const [reminders, setReminders] = useState<ReminderDraft[]>(
    template?.reminders ?? [],
  );
  const { mutate, isPending } = useCreateTask();

  const {
    control,
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, dirtyFields },
  } = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(createTaskFormSchema),
    defaultValues: defaultValues(template),
  });

  const assignedTo = useWatch({ control, name: "assignedTo" });
  const startAt = useWatch({ control, name: "startAt" });
  const dueAt = useWatch({ control, name: "dueAt" });
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

  function setOpen(nextOpen: boolean) {
    if (isControlled) {
      onOpenChangeProp?.(nextOpen);
    } else {
      setInternalOpen(nextOpen);
    }
  }

  // Files that finished uploading but were never attached to a created task
  // (dialog cancelled/closed before submit) would otherwise leak in storage.
  function onOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);

    if (!nextOpen) {
      reset(defaultValues(template));

      for (const item of attachmentItems) {
        if (item.status === "done" && item.fileKey) {
          deleteUploadedTaskAttachmentRequest(item.fileKey).catch(() => {});
        }
      }

      setAttachmentItems([]);
      setReminders(template?.reminders ?? []);
    }
  }

  function onSubmit(values: FormOutput) {
    if (attachmentItems.some((item) => item.status === "uploading")) {
      return;
    }

    const checklistItems = values.checklistItems
      .map((item) => item.text.trim())
      .filter((text) => text.length > 0)
      .map((text, index) => ({ text, sortOrder: index }));

    const attachments = attachmentItems
      .filter((item) => item.status === "done" && item.fileKey)
      .map((item) => ({
        context: "initial" as const,
        fileKey: item.fileKey!,
        fileName: item.file.name,
        mimeType: item.mimeType,
        sizeBytes: item.sizeBytes,
      }));

    mutate(
      {
        title: values.title,
        description: values.description ? values.description : undefined,
        assignedTo: values.assignedTo,
        weightage: values.weightage,
        startAt: values.startAt,
        dueAt: values.dueAt,
        isRepeating: values.isRepeating,
        repeatUnit: values.isRepeating ? values.repeatUnit : undefined,
        repeatInterval: values.isRepeating ? values.repeatInterval : undefined,
        repeatDaysOfWeek:
          values.isRepeating && values.repeatUnit === "week"
            ? values.repeatDaysOfWeek
            : undefined,
        repeatEndsAt: values.isRepeating ? values.repeatEndsAt : undefined,
        checklistItems,
        reminders,
        attachments,
        watcherIds: values.watcherIds,
        templateId: template?.id,
      },
      {
        onSuccess: () => {
          // Bypass onOpenChange's cleanup: these attachments are now
          // genuinely attached to the created task, not orphaned uploads.
          setOpen(false);
          reset(defaultValues(template));
          setAttachmentItems([]);
          setReminders(template?.reminders ?? []);
        },
      },
    );
  }

  const isUploadingAttachments = attachmentItems.some(
    (item) => item.status === "uploading",
  );

  // `startAt` defaults to the moment the dialog opened, which can go stale
  // by the time the user actually submits (filling out the rest of the
  // form takes a minute or two) and trip the "must not be in the past"
  // check below. If the user never touched the field, refresh it to the
  // actual current time right before validation runs instead of trusting
  // the frozen default.
  function handleFormSubmit(event: FormEvent<HTMLFormElement>) {
    if (!dirtyFields.startAt) {
      setValue("startAt", new Date());
    }

    return handleSubmit(onSubmit)(event);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {!isControlled && (
        <DialogTrigger render={<Button />}>
          <Plus />
          New Task
        </DialogTrigger>
      )}

      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {template ? "New task from template" : "New task"}
          </DialogTitle>
          <DialogDescription>
            {template
              ? `Prefilled from the "${template.name}" template. Adjust anything before creating.`
              : "Assign a new task to a team member with a due date."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleFormSubmit} className="flex flex-col gap-4">
          <div className="-mr-1 flex max-h-[65vh] flex-col gap-5 overflow-y-auto pr-1">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="e.g. Follow up with client on invoice"
                aria-invalid={!!errors.title}
                {...register("title")}
              />
              {errors.title && (
                <p className="text-xs text-destructive">
                  {errors.title.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="description">
                Description{" "}
                <span className="font-normal text-muted-foreground">
                  (optional)
                </span>
              </Label>
              <Textarea
                id="description"
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
                <Label htmlFor="startAt">Start date &amp; time</Label>
                <Controller
                  control={control}
                  name="startAt"
                  render={({ field }) => (
                    <DateTimePicker
                      id="startAt"
                      value={field.value as Date}
                      onChange={field.onChange}
                      aria-invalid={!!errors.startAt}
                      minDate={new Date()}
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
                <Label htmlFor="dueAt">Due date &amp; time</Label>
                <Controller
                  control={control}
                  name="dueAt"
                  render={({ field }) => (
                    <DateTimePicker
                      id="dueAt"
                      value={field.value as Date}
                      onChange={field.onChange}
                      aria-invalid={!!errors.dueAt}
                      minDate={startAt as Date}
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
                <Label htmlFor="assignedTo">Assignee</Label>
                <Controller
                  control={control}
                  name="assignedTo"
                  render={({ field }) => (
                    <AssigneeCombobox
                      id="assignedTo"
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
                <Label htmlFor="weightage">Weightage</Label>
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
                        id="weightage"
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
              <Label htmlFor="watcherIds" className="flex items-center gap-1.5">
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
              onRepeatEndsAtChange={(value) =>
                setValue("repeatEndsAt", value)
              }
              errors={{
                repeatUnit: errors.repeatUnit?.message,
                repeatInterval: errors.repeatInterval?.message,
                repeatDaysOfWeek: errors.repeatDaysOfWeek?.message,
                repeatEndsAt: errors.repeatEndsAt?.message,
              }}
            />

            <ReminderFieldset
              reminders={reminders}
              onChange={setReminders}
              startAt={startAt as Date}
              dueAt={dueAt as Date}
            />

            <div className="flex flex-col gap-1.5">
              <Label>
                Attachments{" "}
                <span className="font-normal text-muted-foreground">
                  (optional)
                </span>
              </Label>
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
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending || isUploadingAttachments}
            >
              {isPending ? (
                <>
                  <Loader2 className="animate-spin" />
                  Creating...
                </>
              ) : (
                "Create task"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
