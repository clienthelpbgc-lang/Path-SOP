import { pgEnum } from "drizzle-orm/pg-core";

import { KRA_STATUSES } from "@/features/kra/constants/kra-status.constant";
import { KRA_TYPES } from "@/features/kra/constants/kra-type.constant";

export const kraStatusEnum = pgEnum("kra_status", KRA_STATUSES);

export const kraTypeEnum = pgEnum("kra_type", KRA_TYPES);
