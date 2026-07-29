"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Loader2, Plus } from "lucide-react";
import { z } from "zod";

import { useCreateDailyTask } from "@/features/daily-task/hooks";
import { useUsers } from "@/features/user/hooks";
import type { User } from "@/features/user/types";
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

const createDailyTaskFormSchema = createDailyTaskSchema
  .pick({
    title: true,
    description: true,
    assignedTo: true,
    priority: true,
  })
  .extend({
    // Relaxed vs. the base schema: an empty textarea submits "" rather than
    // undefined, and description is optional, so it shouldn't fail min-length.
    description: z
      .string()
      .trim()
      .max(2000, "Description must not exceed 2000 characters.")
      .optional(),
  });

type FormInput = z.input<typeof createDailyTaskFormSchema>;
type FormOutput = z.output<typeof createDailyTaskFormSchema>;

const defaultValues: FormInput = {
  title: "",
  description: "",
  assignedTo: "",
  priority: undefined as unknown as FormInput["priority"],
};

export function CreateDailyTaskModal() {
  const [open, setOpen] = useState(false);
  const { mutate, isPending } = useCreateDailyTask();

  const [assigneeSearch, setAssigneeSearch] = useState("");
  const debouncedAssigneeSearch = useDebouncedValue(assigneeSearch, 300);
  const usersQuery = useUsers({
    isActive: "true",
    limit: 20,
    search: debouncedAssigneeSearch || undefined,
  });
  const users = usersQuery.data?.data ?? [];

  // Remembers the currently selected assignee so the combobox can still show
  // their name once a subsequent search no longer includes them in `users`.
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(createDailyTaskFormSchema),
    defaultValues,
  });

  function onOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      reset(defaultValues);
      setAssigneeSearch("");
      setSelectedUser(null);
    }
  }

  function onSubmit(values: FormOutput) {
    mutate(
      {
        ...values,
        description: values.description ? values.description : undefined,
        dueDate: new Date(),
        status: "PENDING",
      },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger render={<Button />}>
        <Plus />
        Add Daily Task
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add daily task</DialogTitle>
          <DialogDescription>
            Assign a new task to a team member for today with a priority
            level.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
        >
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
            <Label id="priority-label">Priority</Label>
            <Controller
              control={control}
              name="priority"
              render={({ field }) => (
                <div
                  role="radiogroup"
                  aria-labelledby="priority-label"
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
            <p className="text-xs text-muted-foreground">
              P1 is the highest priority, P4 is the lowest.
            </p>
            {errors.priority && (
              <p className="text-xs text-destructive">
                {errors.priority.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="assignedTo">Assign to</Label>
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
                    id="assignedTo"
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
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
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
