import {
  DASHBOARD_PERIOD_KEYS,
  type DashboardPeriodKey,
} from "@/features/dashboard/service";
import { BadRequestError } from "@/lib/errors";

export function parsePeriodKey(value: string | null): DashboardPeriodKey {
  if (value && (DASHBOARD_PERIOD_KEYS as readonly string[]).includes(value)) {
    return value as DashboardPeriodKey;
  }

  throw new BadRequestError(
    `Invalid period. Expected one of: ${DASHBOARD_PERIOD_KEYS.join(", ")}.`,
  );
}
