import { renderToBuffer } from "@react-pdf/renderer";

import type { ReportData } from "../types/report-data.type";
import { ReportDocument } from "./report-document";

export async function renderReportPdf(data: ReportData): Promise<Buffer> {
  return renderToBuffer(ReportDocument({ data }));
}
