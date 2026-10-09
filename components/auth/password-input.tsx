"use client";

import { useState, type ComponentProps } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type PasswordInputProps = Omit<ComponentProps<typeof Input>, "type"> & {
  // Leading lock icon, used on the full-page auth forms.
  withIcon?: boolean;
};

// Password field with a show/hide toggle, shared by login, reset and change
// password forms.
export function PasswordInput({
  withIcon = false,
  className,
  ...props
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      {withIcon && (
        <Lock className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      )}
      <Input
        {...props}
        type={visible ? "text" : "password"}
        className={cn("pr-9", withIcon && "pl-9", className)}
      />
      <button
        type="button"
        onClick={() => setVisible((value) => !value)}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
        aria-label={visible ? "Hide password" : "Show password"}
        tabIndex={-1}
      >
        {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  );
}
