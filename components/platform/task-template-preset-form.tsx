"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import { Loader2, Plus, X } from "lucide-react";
import type { z } from "zod";

import {
  useCreateTaskTemplatePreset,
  useUpdateTaskTemplatePreset,
} from "@/features/task/hooks";
import type { RepeatUnit } from "@/features/task/constants/repeat-unit.constant";
import type { TaskTemplatePreset } from "@/features/task/types";
import { taskTemplatePresetFormSchema } from "@/features/task/validators";
import { WEIGHTAGE_OPTIONS } from "@/components/task/task-form-constants";
import {
  ReminderFieldset,
  type ReminderDraft,
} from "@/components/task/reminder-fieldset";
import { TaskRepeatFieldset } from "@/components/task/task-repeat-fieldset";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DialogFooter } from "@/components/ui/dialog";
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

type FormInput = z.input<typeof taskTemplatePresetFormSchema>;
type FormOutput = z.output<typeof taskTemplatePresetFormSchema>;

function defaultValues(preset: TaskTemplatePreset | null): FormInput {
  return {
    name: preset?.name ?? "",
    title: preset?.title ?? "",
    description: preset?.description ?? "",
    weightage: preset?.weightage ?? 0,
    isActive: preset?.isActive ?? true,
    isRepeating: preset?.isRepeating ?? false,
    repeatUnit: preset?.repeatUnit ?? undefined,
    repeatInterval: preset?.repeatInterval ?? 1,
    repeatDaysOfWeek: preset?.repeatDaysOfWeek ?? [],
    checklistItems: preset
      ? preset.checklist
          .slice()
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((item) => ({ text: item.text }))
      : [{ text: "" }],
  };
}

type TaskTemplatePresetFormProps = {
  // Same form covers create (null) and edit (a preset) -- a preset has no
  // source task/KRA to copy from, so unlike a company's own templates the
  // full field set is always entered directly.
  preset: TaskTemplatePreset | null;
  onSuccess: () => void;
  onCancel: () => void;
};

export function TaskTemplatePresetForm({
  preset,
  onSuccess,
  onCancel,
}: TaskTemplatePresetFormProps) {
  const { mutate: createPreset, isPending: isCreating } =
    useCreateTaskTemplatePreset();
  const { mutate: updatePreset, isPending: isUpdating } =
    useUpdateTaskTemplatePreset();
  const isPending = isCreating || isUpdating;

  const [reminders, setReminders] = useState<ReminderDraft[]>(
    preset?.reminders ?? [],
  );

  const {
    control,
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(taskTemplatePresetFormSchema),
    defaultValues: defaultValues(preset),
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

    const fields = {
      name: values.name,
      title: values.title,
      description: values.description ? values.description : undefined,
      weightage: values.weightage,
      checklist,
      reminders,
      isRepeating: values.isRepeating,
      repeatUnit: values.isRepeating ? values.repeatUnit : undefined,
      repeatInterval: values.isRepeating ? values.repeatInterval : undefined,
      repeatDaysOfWeek:
        values.isRepeating && values.repeatUnit === "week"
          ? values.repeatDaysOfWeek
          : undefined,
      isActive: values.isActive,
    };

    if (preset) {
      updatePreset({ id: preset.id, input: fields }, { onSuccess });
    } else {
      createPreset(fields, { onSuccess });
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="-mr-1 flex max-h-[65vh] flex-col gap-5 overflow-y-auto pr-1">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="preset-name">Preset name</Label>
          <Input
            id="preset-name"
            placeholder="e.g. Weekly client follow-up"
            aria-invalid={!!errors.name}
            {...register("name")}
          />
          {errors.name && (
            <p className="text-xs text-destructive">{errors.name.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="preset-title">Task title</Label>
          <Input
            id="preset-title"
            placeholder="e.g. Follow up with client on invoice"
            aria-invalid={!!errors.title}
            {...register("title")}
          />
          {errors.title && (
            <p className="text-xs text-destructive">{errors.title.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="preset-description">
            Description{" "}
            <span className="font-normal text-muted-foreground">
              (optional)
            </span>
          </Label>
          <Textarea
            id="preset-description"
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

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="preset-weightage">Weightage</Label>
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
                  id="preset-weightage"
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
          onClick={onCancel}
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
            "Save preset"
          )}
        </Button>
      </DialogFooter>
    </form>
  );
}
