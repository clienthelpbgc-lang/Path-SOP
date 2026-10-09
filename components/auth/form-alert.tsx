import { cn } from "@/lib/utils";

type FormAlertProps = {
  tone: "error" | "success";
  children: React.ReactNode;
};

export function FormAlert({ tone, children }: FormAlertProps) {
  return (
    <p
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "rounded-lg border px-3 py-2 text-sm",
        tone === "error"
          ? "border-destructive/20 bg-destructive/10 text-destructive"
          : "border-emerald-600/20 bg-emerald-600/10 text-emerald-700 dark:text-emerald-400",
      )}
    >
      {children}
    </p>
  );
}
