import { CheckCircle2, CircleDashed, XCircle } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import type { KraStatus } from "@/features/kra/constants/kra-status.constant";
import { KRA_STATUS_LABELS } from "@/components/kra/kra-form-constants";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export const KRA_STATUS_ICONS: Record<KraStatus, LucideIcon> = {
  assigned: CircleDashed,
  completed: CheckCircle2,
  not_completed: XCircle,
};

export const KRA_STATUS_BADGE_CLASSES: Record<KraStatus, string> = {
  assigned:
    "bg-blue-500/10 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400",
  completed:
    "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400",
  not_completed:
    "bg-red-500/10 text-red-600 dark:bg-red-500/15 dark:text-red-400",
};

export function KraStatusBadge({
  status,
  className,
}: {
  status: KraStatus;
  className?: string;
}) {
  const Icon = KRA_STATUS_ICONS[status];

  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1 border-transparent",
        KRA_STATUS_BADGE_CLASSES[status],
        className,
      )}
    >
      <Icon className="size-3" />
      {KRA_STATUS_LABELS[status]}
    </Badge>
  );
}
