"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import type { z } from "zod";

import { useUpdateKra } from "@/features/kra/hooks";
import type { Kra } from "@/features/kra/types";
import {
  checkPeriodEndAfterStart,
  kraBaseSchema,
} from "@/features/kra/validators";
import {
  KRA_STATUS_LABELS,
  KRA_TYPE_LABELS,
  WEIGHTAGE_OPTIONS,
} from "@/components/kra/kra-form-constants";
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

// `assignedTo`/`assignedBy` are deliberately absent -- fixed at creation,
// not editable here (mirrors `updateKraSchema` on the server).
const editKraFormSchema = kraBaseSchema
  .omit({ assignedTo: true })
  .superRefine(checkPeriodEndAfterStart);

type FormInput = z.input<typeof editKraFormSchema>;
type FormOutput = z.output<typeof editKraFormSchema>;

function defaultValues(kra: Kra): FormInput {
  return {
    title: kra.title,
    description: kra.description ?? "",
    status: kra.status,
    type: kra.type,
    periodStart: new Date(kra.periodStart as unknown as string),
    periodEnd: new Date(kra.periodEnd as unknown as string),
    repeat: kra.repeat,
    weightage: kra.weightage,
    remarks: kra.remarks ?? "",
  };
}

type EditKraDialogProps = {
  kra: Kra | null;
  onOpenChange: (open: boolean) => void;
};

export function EditKraDialog({ kra, onOpenChange }: EditKraDialogProps) {
  return (
    <Dialog open={kra !== null} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit KRA</DialogTitle>
          <DialogDescription>Update the details of this KRA.</DialogDescription>
        </DialogHeader>

        {kra && (
          <EditKraForm
            key={kra.id}
            kra={kra}
            onOpenChange={onOpenChange}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

type EditKraFormProps = {
  kra: Kra;
  onOpenChange: (open: boolean) => void;
};

function EditKraForm({ kra, onOpenChange }: EditKraFormProps) {
  const { mutate, isPending } = useUpdateKra();

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(editKraFormSchema),
    defaultValues: defaultValues(kra),
  });

  function onSubmit(values: FormOutput) {
    mutate(
      {
        id: kra.id,
        input: {
          title: values.title,
          description: values.description ? values.description : undefined,
          status: values.status,
          type: values.type,
          periodStart: values.periodStart,
          periodEnd: values.periodEnd,
          repeat: values.repeat,
          weightage: values.weightage,
          remarks: values.remarks ? values.remarks : undefined,
        },
      },
      {
        onSuccess: () => onOpenChange(false),
      },
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="-mr-1 flex max-h-[65vh] flex-col gap-5 overflow-y-auto pr-1">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="edit-kra-title">Title</Label>
          <Input
            id="edit-kra-title"
            placeholder="e.g. Improve customer response time"
            aria-invalid={!!errors.title}
            {...register("title")}
          />
          {errors.title && (
            <p className="text-xs text-destructive">{errors.title.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="edit-kra-description">
            Description{" "}
            <span className="font-normal text-muted-foreground">
              (optional)
            </span>
          </Label>
          <Textarea
            id="edit-kra-description"
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
            <Label htmlFor="edit-kra-status">Status</Label>
            <Controller
              control={control}
              name="status"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger
                    id="edit-kra-status"
                    aria-invalid={!!errors.status}
                    className="w-full"
                  >
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(KRA_STATUS_LABELS).map(
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
            {errors.status && (
              <p className="text-xs text-destructive">
                {errors.status.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit-kra-type">Type</Label>
            <Controller
              control={control}
              name="type"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger
                    id="edit-kra-type"
                    aria-invalid={!!errors.type}
                    className="w-full"
                  >
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(KRA_TYPE_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.type && (
              <p className="text-xs text-destructive">{errors.type.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit-kra-periodStart">Period start</Label>
            <Controller
              control={control}
              name="periodStart"
              render={({ field }) => (
                <DatePicker
                  id="edit-kra-periodStart"
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
            <Label htmlFor="edit-kra-periodEnd">Period end</Label>
            <Controller
              control={control}
              name="periodEnd"
              render={({ field }) => (
                <DatePicker
                  id="edit-kra-periodEnd"
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
          <Label htmlFor="edit-kra-weightage">Weightage</Label>
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
                  id="edit-kra-weightage"
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
          <Label htmlFor="edit-kra-remarks">
            Remarks{" "}
            <span className="font-normal text-muted-foreground">
              (optional)
            </span>
          </Label>
          <Textarea
            id="edit-kra-remarks"
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
                onCheckedChange={(checked) => field.onChange(checked === true)}
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
