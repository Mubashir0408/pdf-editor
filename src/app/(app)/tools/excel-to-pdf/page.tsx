import type { Metadata } from "next";

import { buildPageMetadata } from "@/lib/seo";
import ExcelToPdfView from "./excel-to-pdf-view";

export const metadata: Metadata = buildPageMetadata({
  title: "Excel to PDF Converter Online Free",
  description:
    "Turn Excel spreadsheets (.xlsx) into clean, printable PDFs. Free online Excel to PDF converter.",
  path: "/tools/excel-to-pdf",
  keywords: ["excel to pdf", "xlsx to pdf", "convert excel to pdf online"],
});

export default function Page() {
  return <ExcelToPdfView />;
}
