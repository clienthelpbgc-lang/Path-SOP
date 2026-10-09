"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { KeyRound, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { useChangePassword } from "@/features/auth/hooks/use-change-password";
import {
  changePasswordSchema,
  type ChangePasswordInput,
} from "@/features/auth/validation";
import { PasswordInput } from "@/components/auth/password-input";
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
import { Label } from "@/components/ui/label";
import { ApiClientError } from "@/lib/api-client";

const EMPTY_VALUES: ChangePasswordInput = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

type FieldName = keyof ChangePasswordInput;

const FIELDS: {
  name: FieldName;
  label: string;
  autoComplete: string;
  hint?: string;
}[] = [
  {
    name: "currentPassword",
    label: "Current password",
    autoComplete: "current-password",
  },
  {
    name: "newPassword",
    label: "New password",
    autoComplete: "new-password",
    hint: "At least 8 characters, including a letter and a number.",
  },
  {
    name: "confirmPassword",
    label: "Confirm new password",
    autoComplete: "new-password",
  },
];

// Pulls a field-level message out of a ValidationError's `details`
// (zod's flattened fieldErrors shape), if the server sent one.
function serverFieldError(error: ApiClientError, field: FieldName) {
  const details = error.details as Record<string, string[] | undefined> | undefined;
  return details?.[field]?.[0];
}

export function ChangePasswordDialog() {
  const [open, setOpen] = useState(false);
  const { mutate, isPending } = useChangePassword();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: EMPTY_VALUES,
  });

  function onOpenChange(nextOpen: boolean) {
    if (isPending) return;
    setOpen(nextOpen);
    // Never keep typed passwords around after the dialog closes.
    if (!nextOpen) reset(EMPTY_VALUES);
  }

  function onSubmit(values: ChangePasswordInput) {
    mutate(values, {
      onSuccess: () => {
        setOpen(false);
        reset(EMPTY_VALUES);
      },
      onError: (error) => {
        if (error instanceof ApiClientError) {
          let matchedField = false;

          for (const { name } of FIELDS) {
            const message = serverFieldError(error, name);
            if (message) {
              setError(name, { message }, { shouldFocus: !matchedField });
              matchedField = true;
            }
          }

          if (!matchedField) toast.error(error.message);
          return;
        }

        toast.error("Failed to change your password. Please try again.");
      },
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger render={<Button variant="outline" />}>
        <KeyRound />
        Change password
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Change password</DialogTitle>
          <DialogDescription>
            You&apos;ll stay signed in here; other devices will be signed out.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
          noValidate
        >
          {FIELDS.map(({ name, label, autoComplete, hint }) => {
            const id = `change-password-${name}`;
            const message = errors[name]?.message;

            return (
              <div key={name} className="flex flex-col gap-1.5">
                <Label htmlFor={id}>{label}</Label>
                <PasswordInput
                  id={id}
                  autoComplete={autoComplete}
                  aria-invalid={!!message}
                  {...register(name)}
                />
                {message ? (
                  <p className="text-xs text-destructive">{message}</p>
                ) : (
                  hint && (
                    <p className="text-xs text-muted-foreground">{hint}</p>
                  )
                )}
              </div>
            );
          })}

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
                  Updating...
                </>
              ) : (
                "Update password"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
