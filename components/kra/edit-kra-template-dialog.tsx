"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import type { z } from "zod";

import { useUpdateKraTemplate } from "@/features/kra/hooks";
import type { KraTemplate } from "@/features/kra/types";
import { createKraTemplateSchema } from "@/features/kra/validators";
import { KRA_TYPE_LABELS, WEIGHTAGE_OPTIONS } from "@/components/kra/kra-form-constants";
import { AssigneeCombobox } from "@/components/team/assignee-combobox";
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

// `sourceKraId` is deliberately absent -- fixed at creation, not editable
// here (mirrors the KRA templates being derived once from a source KRA).
const editKraTemplateFormSchema = createKraTemplateSchema.omit({
  sourceKraId: true,
});

type FormInput = z.input<typeof editKraTemplateFormSchema>;
type FormOutput = z.output<typeof editKraTemplateFormSchema>;

function defaultValues(template: KraTemplate): FormInput {
  return {
    name: template.name,
    title: template.title,
    description: template.description ?? "",
    type: template.type,
    weightage: template.weightage,
    remarks: template.remarks ?? "",
    repeat: template.repeat,
    defaultAssignee: template.defaultAssignee ?? "",
    isActive: template.isActive,
  };
}

type EditKraTemplateDialogProps = {
  template: KraTemplate | null;
  onOpenChange: (open: boolean) => void;
};

export function EditKraTemplateDialog({
  template,
  onOpenChange,
}: EditKraTemplateDialogProps) {
  return (
    <Dialog open={template !== null} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit template</DialogTitle>
          <DialogDescription>
            Update what KRAs assigned from this template start with.
          </DialogDescription>
        </DialogHeader>

        {template && (
          <EditKraTemplateForm template={template} onOpenChange={onOpenChange} />
        )}
      </DialogContent>
    </Dialog>
  );
}

type EditKraTemplateFormProps = {
  template: KraTemplate;
  onOpenChange: (open: boolean) => void;
};

function EditKraTemplateForm({
  template,
  onOpenChange,
}: EditKraTemplateFormProps) {
  const { mutate, isPending } = useUpdateKraTemplate();

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(editKraTemplateFormSchema),
    defaultValues: defaultValues(template),
  });

  function onSubmit(values: FormOutput) {
    mutate(
      {
        id: template.id,
        input: {
          name: values.name,
          title: values.title,
          description: values.description ? values.description : undefined,
          type: values.type,
          weightage: values.weightage,
          remarks: values.remarks ? values.remarks : undefined,
          repeat: values.repeat,
          // `defaultAssignee` can't be explicitly cleared through this PATCH
          // (an omitted key means "leave as-is", matching every other
          // optional field in the update APIs) -- only reassigned.
          defaultAssignee: values.defaultAssignee || undefined,
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
          <Label htmlFor="kra-template-name">Template name</Label>
          <Input
            id="kra-template-name"
            placeholder="e.g. Monthly customer response time"
            aria-invalid={!!errors.name}
            {...register("name")}
          />
          {errors.name && (
            <p className="text-xs text-destructive">{errors.name.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="kra-template-title">KRA title</Label>
          <Input
            id="kra-template-title"
            placeholder="e.g. Improve customer response time"
            aria-invalid={!!errors.title}
            {...register("title")}
          />
          {errors.title && (
            <p className="text-xs text-destructive">{errors.title.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="kra-template-description">
            Description{" "}
            <span className="font-normal text-muted-foreground">
              (optional)
            </span>
          </Label>
          <Textarea
            id="kra-template-description"
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
            <Label htmlFor="kra-template-type">Type</Label>
            <Controller
              control={control}
              name="type"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger
                    id="kra-template-type"
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
            <Label htmlFor="kra-template-weightage">Weightage</Label>
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
                    id="kra-template-weightage"
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
          <Label htmlFor="kra-template-defaultAssignee">
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
                id="kra-template-defaultAssignee"
                value={field.value ?? ""}
                onValueChange={field.onChange}
              />
            )}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="kra-template-remarks">
            Remarks{" "}
            <span className="font-normal text-muted-foreground">
              (optional)
            </span>
          </Label>
          <Textarea
            id="kra-template-remarks"
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
