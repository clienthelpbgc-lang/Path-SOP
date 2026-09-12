"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import type { z } from "zod";

import {
  useCreateKraTemplatePreset,
  useUpdateKraTemplatePreset,
} from "@/features/kra/hooks";
import type { KraTemplatePreset } from "@/features/kra/types";
import { createKraTemplatePresetSchema } from "@/features/kra/validators";
import { KRA_TYPE_LABELS, WEIGHTAGE_OPTIONS } from "@/components/kra/kra-form-constants";
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

type FormInput = z.input<typeof createKraTemplatePresetSchema>;
type FormOutput = z.output<typeof createKraTemplatePresetSchema>;

function defaultValues(preset: KraTemplatePreset | null): FormInput {
  return {
    name: preset?.name ?? "",
    title: preset?.title ?? "",
    description: preset?.description ?? "",
    type: preset?.type ?? "monthly",
    weightage: preset?.weightage ?? 1,
    remarks: preset?.remarks ?? "",
    repeat: preset?.repeat ?? false,
    isActive: preset?.isActive ?? true,
  };
}

type KraTemplatePresetFormProps = {
  // Same form covers create (null) and edit (a preset) -- a preset has no
  // source KRA to copy from, so unlike a company's own templates the full
  // field set is always entered directly.
  preset: KraTemplatePreset | null;
  onSuccess: () => void;
  onCancel: () => void;
};

export function KraTemplatePresetForm({
  preset,
  onSuccess,
  onCancel,
}: KraTemplatePresetFormProps) {
  const { mutate: createPreset, isPending: isCreating } =
    useCreateKraTemplatePreset();
  const { mutate: updatePreset, isPending: isUpdating } =
    useUpdateKraTemplatePreset();
  const isPending = isCreating || isUpdating;

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(createKraTemplatePresetSchema),
    defaultValues: defaultValues(preset),
  });

  function onSubmit(values: FormOutput) {
    const fields = {
      name: values.name,
      title: values.title,
      description: values.description ? values.description : undefined,
      type: values.type,
      weightage: values.weightage,
      remarks: values.remarks ? values.remarks : undefined,
      repeat: values.repeat,
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
          <Label htmlFor="kra-preset-name">Preset name</Label>
          <Input
            id="kra-preset-name"
            placeholder="e.g. Monthly customer response time"
            aria-invalid={!!errors.name}
            {...register("name")}
          />
          {errors.name && (
            <p className="text-xs text-destructive">{errors.name.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="kra-preset-title">KRA title</Label>
          <Input
            id="kra-preset-title"
            placeholder="e.g. Improve customer response time"
            aria-invalid={!!errors.title}
            {...register("title")}
          />
          {errors.title && (
            <p className="text-xs text-destructive">{errors.title.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="kra-preset-description">
            Description{" "}
            <span className="font-normal text-muted-foreground">
              (optional)
            </span>
          </Label>
          <Textarea
            id="kra-preset-description"
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
            <Label htmlFor="kra-preset-type">Type</Label>
            <Controller
              control={control}
              name="type"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger
                    id="kra-preset-type"
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

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="kra-preset-weightage">Weightage</Label>
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
                    id="kra-preset-weightage"
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
          <Label htmlFor="kra-preset-remarks">
            Remarks{" "}
            <span className="font-normal text-muted-foreground">
              (optional)
            </span>
          </Label>
          <Textarea
            id="kra-preset-remarks"
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

        <div className="flex flex-col gap-3">
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

          <label className="group flex items-center gap-2.5 text-sm font-medium text-foreground">
            <Controller
              control={control}
              name="isActive"
              render={({ field }) => (
                <Checkbox
                  checked={field.value}
                  onCheckedChange={(checked) =>
                    field.onChange(checked === true)
                  }
                />
              )}
            />
            Active
          </label>
        </div>
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
