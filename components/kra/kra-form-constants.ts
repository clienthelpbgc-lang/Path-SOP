import type { KraStatus } from "@/features/kra/constants/kra-status.constant";
import type { KraType } from "@/features/kra/constants/kra-type.constant";

// Shared by the "New KRA" and "Edit KRA" forms.
export const KRA_TYPE_LABELS: Record<KraType, string> = {
  monthly: "Monthly",
  weekly: "Weekly",
};

// Only used by the "Edit KRA" form -- status isn't set at creation time.
export const KRA_STATUS_LABELS: Record<KraStatus, string> = {
  assigned: "Assigned",
  completed: "Completed",
  not_completed: "Not completed",
};

export const WEIGHTAGE_OPTIONS = Array.from({ length: 10 }, (_, index) => index + 1);
