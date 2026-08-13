import path from "node:path";
import ExcelJS from "exceljs";

import { logger } from "../logger";
import { ApiError } from "../ApiError";
import { resolveUploadedFilePath } from "../resolveUploadedFile";
import { wrapHtmlDocument } from "../utils/htmlDocument";
import { escapeHtml } from "../utils/htmlEscape";
import type { HtmlRendererService } from "./htmlRenderer.service";
import type { DownloadService } from "./download.service";
import type { ExcelToPdfBody } from "../validators/excelToPdf.validator";
import type { ProcessedFileDto } from "../api-types";

const EXTRA_CSS = `
  section.sheet { margin-bottom: 2em; }
  section.sheet.page-break { page-break-before: always; }
  section.sheet h2 { font-size: 14pt; }
  table.sheet-table td, table.sheet-table th { font-size: 9.5pt; white-space: pre-wrap; }
`;

export class ExcelToPdfService {
  constructor(
    private readonly htmlRenderer: HtmlRendererService,
    private readonly downloadService: DownloadService
  ) {}

  async convert(body: ExcelToPdfBody): Promise<ProcessedFileDto> {
    if (path.extname(body.fileId).toLowerCase() !== ".xlsx") {
      throw ApiError.badRequest("The selected file is not an Excel (.xlsx) spreadsheet.");
    }

    const inputPath = await resolveUploadedFilePath(body.fileId);

    const workbook = new ExcelJS.Workbook();
    try {
      await workbook.xlsx.readFile(inputPath);
    } catch (err) {
      const reason = err instanceof Error ? err.message : String(err);
      throw ApiError.badRequest(`This spreadsheet couldn't be read: ${reason}`);
    }

    if (workbook.worksheets.length === 0) {
      throw ApiError.badRequest("This spreadsheet has no sheets to convert.");
    }

    const sheetsHtml = workbook.worksheets.map((sheet, i) => this.renderSheet(sheet, i > 0)).join("\n");

    const pdfBytes = await this.htmlRenderer.renderToPdf(wrapHtmlDocument(sheetsHtml, EXTRA_CSS), {
      format: "A4",
      landscape: true,
    });

    const result = await this.downloadService.save({
      tool: "excel-to-pdf",
      outputName: "Converted Spreadsheet.pdf",
      bytes: pdfBytes,
    });

    void this.downloadService.deleteQuietly([inputPath], (filePath, err) => {
      logger.warn({ filePath, err }, "Failed to delete a temporary upload after Excel to PDF conversion");
    });

    return result;
  }

  private renderSheet(sheet: ExcelJS.Worksheet, pageBreakBefore: boolean): string {
    const rows: string[] = [];

    sheet.eachRow({ includeEmpty: true }, (row) => {
      const cells: string[] = [];
      row.eachCell({ includeEmpty: true }, (cell) => {
        cells.push(`<td>${escapeHtml(this.cellText(cell))}</td>`);
      });
      rows.push(`<tr>${cells.join("")}</tr>`);
    });

    return `<section class="sheet${pageBreakBefore ? " page-break" : ""}">
      <h2>${escapeHtml(sheet.name)}</h2>
      <table class="sheet-table">${rows.join("")}</table>
    </section>`;
  }

  private cellText(cell: ExcelJS.Cell): string {
    const value = cell.value;
    if (value instanceof Date) return value.toLocaleDateString();
    return cell.text ?? "";
  }
}
