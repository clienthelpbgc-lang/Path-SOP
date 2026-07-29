"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Loader2, Pencil } from "lucide-react";
import { z } from "zod";

import { useUpdateDailyTask } from "@/features/daily-task/hooks";
import { useUsers } from "@/features/user/hooks";
import type { User } from "@/features/user/types";
import type { DailyTask } from "@/features/daily-task/types";
import { createDailyTaskSchema } from "@/features/daily-task/validation";
import {
  TASK_PRIORITIES,
  TASK_PRIORITY_LABELS,
} from "@/features/daily-task/constants/priority.constant";
import { cn } from "@/lib/utils";
import { useDebouncedValue } from "@/hooks/use-debounced-value";

import { Button } from "@/components/ui/button";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";

const editDailyTaskFormSchema = createDailyTaskSchema
  .pick({
    title: true,
    description: true,
    assignedTo: true,
    priority: true,
  })
  .extend({
    description: z
      .string()
      .trim()
      .max(2000, "Description must not exceed 2000 characters.")
      .optional(),
  });

type FormInput = z.input<typeof editDailyTaskFormSchema>;
type FormOutput = z.output<typeof editDailyTaskFormSchema>;

export function EditDailyTaskDialog({ task }: { task: DailyTask }) {
  const [open, setOpen] = useState(false);
  const { mutate, isPending } = useUpdateDailyTask();

  const [assigneeSearch, setAssigneeSearch] = useState("");
  const debouncedAssigneeSearch = useDebouncedValue(assigneeSearch, 300);
  const usersQuery = useUsers({
    isActive: "true",
    limit: 20,
    search: debouncedAssigneeSearch || undefined,
  });
  const users = usersQuery.data?.data ?? [];

  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const defaultValues: FormInput = {
    title: task.title,
    description: task.description ?? "",
    assignedTo: task.assignedTo,
    priority: task.priority as FormInput["priority"],
  };

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(editDailyTaskFormSchema),
    defaultValues,
  });

  function onOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (nextOpen) {
      reset(defaultValues);
      setSelectedUser(null);
      setAssigneeSearch("");
    }
  }

  function onSubmit(values: FormOutput) {
    mutate(
      {
        id: task.id,
        data: {
          ...values,
          description: values.description ? values.description : undefined,
        },
      },
      { onSuccess: () => setOpen(false) },
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger render={<Button variant="ghost" size="icon-sm" />}>
        <Pencil />
        <span className="sr-only">Edit task</span>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit daily task</DialogTitle>
          <DialogDescription>
            Only pending tasks can be edited.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit-title">Title</Label>
            <Input
              id="edit-title"
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
            <Label htmlFor="edit-description">
              Description{" "}
              <span className="font-normal text-muted-foreground">
                (optional)
              </span>
            </Label>
            <Textarea
              id="edit-description"
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
            <Label id="edit-priority-label">Priority</Label>
            <Controller
              control={control}
              name="priority"
              render={({ field }) => (
                <div
                  role="radiogroup"
                  aria-labelledby="edit-priority-label"
                  aria-invalid={!!errors.priority}
                  className="grid grid-cols-4 gap-2"
                >
                  {TASK_PRIORITIES.map((priority) => {
                    const selected = field.value === priority;

                    return (
                      <button
                        key={priority}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        onClick={() => field.onChange(priority)}
                        className={cn(
                          "flex h-10 items-center justify-center rounded-lg border text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                          selected
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-input bg-transparent text-foreground hover:bg-muted",
                        )}
                      >
                        {TASK_PRIORITY_LABELS[priority]}
                      </button>
                    );
                  })}
                </div>
              )}
            />
            {errors.priority && (
              <p className="text-xs text-destructive">
                {errors.priority.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit-assignedTo">Assign to</Label>
            <Controller
              control={control}
              name="assignedTo"
              render={({ field }) => (
                <Combobox
                  items={users.map((user) => user.id)}
                  filter={null}
                  value={field.value || null}
                  onValueChange={(id: string | null) => {
                    field.onChange(id ?? "");
                    setSelectedUser(
                      users.find((user) => user.id === id) ?? null,
                    );
                  }}
                  onInputValueChange={setAssigneeSearch}
                  itemToStringLabel={(id: string) =>
                    selectedUser?.id === id
                      ? selectedUser.name
                      : (users.find((user) => user.id === id)?.name ?? "")
                  }
                >
                  <ComboboxInput
                    id="edit-assignedTo"
                    placeholder="Search team members..."
                    aria-invalid={!!errors.assignedTo}
                  />
                  <ComboboxContent>
                    <ComboboxList>
                      {users.map((user) => (
                        <ComboboxItem key={user.id} value={user.id}>
                          <span className="flex flex-col">
                            <span>{user.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {user.email}
                            </span>
                          </span>
                        </ComboboxItem>
                      ))}
                    </ComboboxList>
                    <ComboboxEmpty>
                      {usersQuery.isFetching
                        ? "Searching..."
                        : "No team members found."}
                    </ComboboxEmpty>
                  </ComboboxContent>
                </Combobox>
              )}
            />
            {errors.assignedTo && (
              <p className="text-xs text-destructive">
                {errors.assignedTo.message}
              </p>
            )}
          </div>

          <DialogFooter className="mt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
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
      </DialogContent>
    </Dialog>
  );
}
