"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import { Loader2, Plus, Users, X } from "lucide-react";
import type { z } from "zod";

import { useUpdateTaskTemplate } from "@/features/task/hooks";
import type { RepeatUnit } from "@/features/task/constants/repeat-unit.constant";
import type { TaskTemplate } from "@/features/task/types";
import { editTaskTemplateFormSchema } from "@/features/task/validators";
import { AssigneeCombobox } from "@/components/team/assignee-combobox";
import { WatchersCombobox } from "@/components/task/watchers-combobox";
import { WEIGHTAGE_OPTIONS } from "@/components/task/task-form-constants";
import {
  ReminderFieldset,
  type ReminderDraft,
} from "@/components/task/reminder-fieldset";
import { TaskRepeatFieldset } from "@/components/task/task-repeat-fieldset";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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

type FormInput = z.input<typeof editTaskTemplateFormSchema>;
type FormOutput = z.output<typeof editTaskTemplateFormSchema>;

function defaultValues(template: TaskTemplate): FormInput {
  return {
    name: template.name,
    title: template.title,
    description: template.description ?? "",
    weightage: template.weightage,
    defaultAssignee: template.defaultAssignee ?? "",
    isActive: template.isActive,
    isRepeating: template.isRepeating,
    repeatUnit: template.repeatUnit ?? undefined,
    repeatInterval: template.repeatInterval ?? 1,
    repeatDaysOfWeek: template.repeatDaysOfWeek ?? [],
    checklistItems: template.checklist
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((item) => ({ text: item.text })),
    watcherIds: template.defaultWatchers,
  };
}

type EditTaskTemplateDialogProps = {
  template: TaskTemplate | null;
  onOpenChange: (open: boolean) => void;
};

export function EditTaskTemplateDialog({
  template,
  onOpenChange,
}: EditTaskTemplateDialogProps) {
  return (
    <Dialog open={template !== null} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Edit template</DialogTitle>
          <DialogDescription>
            Update what tasks created from this template start with.
          </DialogDescription>
        </DialogHeader>

        {template && (
          <EditTaskTemplateForm
            template={template}
            onOpenChange={onOpenChange}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

type EditTaskTemplateFormProps = {
  template: TaskTemplate;
  onOpenChange: (open: boolean) => void;
};

function EditTaskTemplateForm({
  template,
  onOpenChange,
}: EditTaskTemplateFormProps) {
  const { mutate, isPending } = useUpdateTaskTemplate();
  const [reminders, setReminders] = useState<ReminderDraft[]>(
    template.reminders,
  );

  const {
    control,
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(editTaskTemplateFormSchema),
    defaultValues: defaultValues(template),
  });

  const isRepeating = useWatch({ control, name: "isRepeating" });
  const repeatUnit = useWatch({ control, name: "repeatUnit" });
  const repeatInterval = useWatch({ control, name: "repeatInterval" });
  const repeatDaysOfWeek = useWatch({ control, name: "repeatDaysOfWeek" });
  const isActive = useWatch({ control, name: "isActive" });

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

  function onSubmit(values: FormOutput) {
    const checklist = values.checklistItems
      .map((item) => item.text.trim())
      .filter((text) => text.length > 0)
      .map((text, index) => ({ text, sortOrder: index }));

    mutate(
      {
        id: template.id,
        input: {
          name: values.name,
          title: values.title,
          description: values.description ? values.description : undefined,
          weightage: values.weightage,
          checklist,
          reminders,
          // `defaultAssignee` can't be explicitly cleared through this PATCH
          // (an omitted key means "leave as-is", matching every other
          // optional field in the update APIs) -- only reassigned.
          defaultAssignee: values.defaultAssignee || undefined,
          defaultWatchers: values.watcherIds,
          isRepeating: values.isRepeating,
          repeatUnit: values.isRepeating ? values.repeatUnit : undefined,
          repeatInterval: values.isRepeating
            ? values.repeatInterval
            : undefined,
          repeatDaysOfWeek:
            values.isRepeating && values.repeatUnit === "week"
              ? values.repeatDaysOfWeek
              : undefined,
          isActive: values.isActive,
        },
      },
      { onSuccess: () => onOpenChange(false) },
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="-mr-1 flex max-h-[65vh] flex-col gap-5 overflow-y-auto pr-1">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="template-name">Template name</Label>
          <Input
            id="template-name"
            placeholder="e.g. Weekly client follow-up"
            aria-invalid={!!errors.name}
            {...register("name")}
          />
          {errors.name && (
            <p className="text-xs text-destructive">{errors.name.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="template-title">Task title</Label>
          <Input
            id="template-title"
            placeholder="e.g. Follow up with client on invoice"
            aria-invalid={!!errors.title}
            {...register("title")}
          />
          {errors.title && (
            <p className="text-xs text-destructive">{errors.title.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="template-description">
            Description{" "}
            <span className="font-normal text-muted-foreground">
              (optional)
            </span>
          </Label>
          <Textarea
            id="template-description"
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
                    onKeyDown={(event) => handleChecklistKeyDown(event, index)}
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
            <Label htmlFor="template-defaultAssignee">
              Default assignee{" "}
              <span className="font-normal text-muted-foreground">
                (optional)
              </span>
            </Label>
            <Controller
              control={control}
              name="defaultAssignee"
              render={({ field }) => (
                <AssigneeCombobox
                  id="template-defaultAssignee"
                  value={field.value ?? ""}
                  onValueChange={field.onChange}
                />
              )}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="template-weightage">Weightage</Label>
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
                    id="template-weightage"
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
            htmlFor="template-watcherIds"
            className="flex items-center gap-1.5"
          >
            <Users className="size-3.5 text-muted-foreground" />
            Default watchers{" "}
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
          onRepeatIntervalChange={(value) => setValue("repeatInterval", value)}
          repeatDaysOfWeek={repeatDaysOfWeek}
          onRepeatDaysOfWeekChange={(value) =>
            setValue("repeatDaysOfWeek", value)
          }
          errors={{
            repeatUnit: errors.repeatUnit?.message,
            repeatInterval: errors.repeatInterval?.message,
            repeatDaysOfWeek: errors.repeatDaysOfWeek?.message,
          }}
        />

        <ReminderFieldset reminders={reminders} onChange={setReminders} />

        <label className="group flex items-center gap-2.5 text-sm font-medium text-foreground">
          <Checkbox
            checked={isActive}
            onCheckedChange={(checked) => setValue("isActive", checked === true)}
          />
          Active
        </label>
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
        <Button type="submit" disabled={isPending}>
          {isPending ? (
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
