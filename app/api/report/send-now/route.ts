import { z } from "zod";

import { REPORT_TYPES } from "@/features/report/constants/report-type.constant";
import { sendCompanyAdminReport } from "@/features/report/service";
import { ForbiddenError, ValidationError } from "@/lib/errors";
import { routeHandler } from "@/lib/route-helpers/route-handler";
import { getCurrentUser } from "@/lib/session";

const sendReportSchema = z.object({
  type: z.enum(REPORT_TYPES, { error: "Invalid report type." }),
});

// Lets an admin trigger their own company's scheduled report immediately
// (e.g. to preview it, or send it outside its normal day) -- reuses the same
// sendCompanyAdminReport scheduler function the cron job calls, just scoped
// to the requesting admin's own company instead of every tenant.
export const POST = routeHandler(async (request) => {
  const currentUser = await getCurrentUser();

  if (currentUser.role !== "ADMIN") {
    throw new ForbiddenError("Only admins can send reports.");
  }

  const body = await request.json();
  const result = sendReportSchema.safeParse(body);

  if (!result.success) {
    throw new ValidationError(
      "Invalid report type.",
      z.flattenError(result.error).fieldErrors,
    );
  }

  return sendCompanyAdminReport(currentUser.companyId, result.data.type);
});
