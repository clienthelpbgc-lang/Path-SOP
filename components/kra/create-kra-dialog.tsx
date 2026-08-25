"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, type DefaultValues } from "react-hook-form";
import { Loader2, Plus } from "lucide-react";
import type { z } from "zod";

import { useCreateKra } from "@/features/kra/hooks";
import type { KraTemplate } from "@/features/kra/types";
import {
  checkPeriodEndAfterStart,
  kraBaseSchema,
} from "@/features/kra/validators";
import { KRA_TYPE_LABELS, WEIGHTAGE_OPTIONS } from "@/components/kra/kra-form-constants";
import { AssigneeCombobox } from "@/components/team/assignee-combobox";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DatePicker } from "@/components/ui/date-picker";
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

// `status` is never a form field -- a KRA is always "assigned" at creation,
// so the base schema's default is left to apply untouched.
const createKraFormSchema = kraBaseSchema
  .omit({ status: true })
  .superRefine(checkPeriodEndAfterStart);

type FormInput = z.input<typeof createKraFormSchema>;
type FormOutput = z.output<typeof createKraFormSchema>;

// `type`/`periodStart`/`periodEnd` have no sensible default when there's no
// template -- the form starts with them unset (and the Select/DatePicker
// show their placeholder) until the admin picks values, so this is
// intentionally a partial, not a full `FormInput`. Period dates never come
// from a template (they're KRA-instance specific), so they stay unset even
// when prefilling.
function defaultValues(template?: KraTemplate | null): DefaultValues<FormInput> {
  return {
    title: template?.title ?? "",
    description: template?.description ?? "",
    type: template?.type,
    repeat: template?.repeat ?? false,
    assignedTo: template?.defaultAssignee ?? "",
    weightage: template?.weightage ?? 1,
    remarks: template?.remarks ?? "",
  };
}

type CreateKraDialogProps = {
  // When provided, the dialog is externally controlled (triggered from a
  // template's "Assign KRA" action) and its form is prefilled from the
  // template instead of rendering its own "Assign KRA" button.
  template?: KraTemplate | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function CreateKraDialog({
  template = null,
  open: openProp,
  onOpenChange: onOpenChangeProp,
}: CreateKraDialogProps = {}) {
  const isControlled = openProp !== undefined;
  const [internalOpen, setInternalOpen] = useState(false);
  const open = isControlled ? openProp : internalOpen;

  const { mutate, isPending } = useCreateKra();

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(createKraFormSchema),
    defaultValues: defaultValues(template),
  });

  function setOpen(nextOpen: boolean) {
    if (isControlled) {
      onOpenChangeProp?.(nextOpen);
    } else {
      setInternalOpen(nextOpen);
    }
  }

  function onOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);

    if (!nextOpen) {
      reset(defaultValues(template));
    }
  }

  function onSubmit(values: FormOutput) {
    mutate(
      {
        title: values.title,
        description: values.description ? values.description : undefined,
        // A KRA is always "assigned" when first created -- not a form field.
        status: "assigned",
        type: values.type,
        periodStart: values.periodStart,
        periodEnd: values.periodEnd,
        repeat: values.repeat,
        assignedTo: values.assignedTo,
        weightage: values.weightage,
        remarks: values.remarks ? values.remarks : undefined,
        templateId: template?.id,
      },
      {
        onSuccess: () => {
          setOpen(false);
          reset(defaultValues(template));
        },
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {!isControlled && (
        <DialogTrigger render={<Button />}>
          <Plus />
          Assign KRA
        </DialogTrigger>
      )}

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {template ? "Assign KRA from template" : "Assign KRA"}
          </DialogTitle>
          <DialogDescription>
            {template
              ? `Prefilled from the "${template.name}" template. Adjust anything before assigning.`
              : "Assign a key result area to a team member for a monthly or weekly period."}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
        >
          <div className="-mr-1 flex max-h-[65vh] flex-col gap-5 overflow-y-auto pr-1">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="e.g. Improve customer response time"
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
                placeholder="Add any context about this KRA"
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
                <Label htmlFor="type">Type</Label>
                <Controller
                  control={control}
                  name="type"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger
                        id="type"
                        aria-invalid={!!errors.type}
                        className="w-full"
                      >
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(KRA_TYPE_LABELS).map(
                          ([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ),
                        )}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.type && (
                  <p className="text-xs text-destructive">
                    {errors.type.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="periodStart">Period start</Label>
                <Controller
                  control={control}
                  name="periodStart"
                  render={({ field }) => (
                    <DatePicker
                      id="periodStart"
                      value={field.value as Date}
                      onChange={field.onChange}
                      aria-invalid={!!errors.periodStart}
                    />
                  )}
                />
                {errors.periodStart && (
                  <p className="text-xs text-destructive">
                    {errors.periodStart.message}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="periodEnd">Period end</Label>
                <Controller
                  control={control}
                  name="periodEnd"
                  render={({ field }) => (
                    <DatePicker
                      id="periodEnd"
                      value={field.value as Date}
                      onChange={field.onChange}
                      aria-invalid={!!errors.periodEnd}
                    />
                  )}
                />
                {errors.periodEnd && (
                  <p className="text-xs text-destructive">
                    {errors.periodEnd.message}
                  </p>
                )}
              </div>
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

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="remarks">
                Remarks{" "}
                <span className="font-normal text-muted-foreground">
                  (optional)
                </span>
              </Label>
              <Textarea
                id="remarks"
                placeholder="Add any remarks for the assignee"
                rows={2}
                aria-invalid={!!errors.remarks}
                {...register("remarks")}
              />
              {errors.remarks && (
                <p className="text-xs text-destructive">
                  {errors.remarks.message}
                </p>
              )}
            </div>

            <label className="group flex items-center gap-2.5 text-sm font-medium text-foreground">
              <Controller
                control={control}
                name="repeat"
                render={({ field }) => (
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={(checked) =>
                      field.onChange(checked === true)
                    }
                  />
                )}
              />
              Repeat every period
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
                  Assigning...
                </>
              ) : (
                "Assign KRA"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
