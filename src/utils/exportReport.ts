/**
 * Unified CSV & Excel (.xlsx) Report Export Pipeline
 * Features:
 * - RFC 4180 quoting and CSV-injection mitigation
 * - UTF-8 BOM (\uFEFF) for Microsoft Excel compatibility
 * - Dynamic lazy-loading of exceljs to keep initial bundle size lean
 * - Dual-sheet Excel files (Data + Filters & Audit Metadata)
 * - Standardized naming: meal-tracker_<slug>_season-2026_<YYYY-MM-DD>.<ext>
 */

export interface ExportColumn<T> {
  header: string;
  key: string;
  width?: number;
  accessor: (row: T) => string | number | boolean | null | undefined;
}

/**
 * Escapes values against CSV formula injection (=, +, -, @, \t)
 */
export function sanitizeCsvCell(val: unknown): string {
  if (val === null || val === undefined) return "";
  const str = String(val);
  if (/^[=+\-@\t]/.test(str)) {
    return `'${str}`;
  }
  return str;
}

/**
 * Generates and triggers download for CSV with UTF-8 BOM
 */
export function exportReportToCsv<T>(
  slug: string,
  rows: T[],
  columns: ExportColumn<T>[],
): void {
  if (!rows || rows.length === 0) return;

  const todayStr = new Date().toISOString().split("T")[0];
  const filename = `meal-tracker_${slug}_season-2026_${todayStr}.csv`;

  const headerLine = columns
    .map((c) => `"${c.header.replace(/"/g, '""')}"`)
    .join(",");

  const rowLines = rows.map((row) =>
    columns
      .map((col) => {
        const raw = col.accessor(row);
        const sanitized = sanitizeCsvCell(raw);
        return `"${sanitized.replace(/"/g, '""')}"`;
      })
      .join(","),
  );

  const csvContent = "\uFEFF" + [headerLine, ...rowLines].join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  triggerBrowserDownload(blob, filename);
}

/**
 * Dynamically lazy-loads exceljs and generates a styled Excel (.xlsx) workbook
 */
export async function exportReportToExcel<T>(
  slug: string,
  sheetTitle: string,
  rows: T[],
  columns: ExportColumn<T>[],
  appliedFilters: Record<string, string | number | undefined | null>,
): Promise<void> {
  if (!rows || rows.length === 0) return;

  const todayStr = new Date().toISOString().split("T")[0];
  const filename = `meal-tracker_${slug}_season-2026_${todayStr}.xlsx`;

  // Dynamic import of exceljs
  const ExcelJS = await import("exceljs");
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Jeffs Group Meal Tracker";
  workbook.created = new Date();

  // Sheet 1: Main Data
  const worksheet = workbook.addWorksheet(sheetTitle.slice(0, 31), {
    views: [{ state: "frozen", ySplit: 1 }],
  });

  // Setup columns
  worksheet.columns = columns.map((col) => ({
    header: col.header,
    key: col.key,
    width: col.width || Math.max(col.header.length + 5, 14),
  }));

  // Style Header Row
  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: "FF111827" }, size: 11, name: "Inter" };
  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFF1F5F9" }, // Slate-100
  };
  headerRow.height = 24;
  headerRow.alignment = { vertical: "middle" };

  // Add Data Rows
  rows.forEach((row) => {
    const rowValues: Record<string, unknown> = {};
    columns.forEach((col) => {
      const val = col.accessor(row);
      rowValues[col.key] = val === null || val === undefined ? "" : val;
    });
    const addedRow = worksheet.addRow(rowValues);
    addedRow.font = { size: 10, name: "Inter" };
    addedRow.height = 20;
    addedRow.alignment = { vertical: "middle" };
  });

  // Sheet 2: Filters & Audit Trail
  const filterSheet = workbook.addWorksheet("Filters & Audit");
  filterSheet.columns = [
    { header: "Parameter", key: "param", width: 25 },
    { header: "Applied Value", key: "value", width: 45 },
  ];

  const filterHeaderRow = filterSheet.getRow(1);
  filterHeaderRow.font = { bold: true, color: { argb: "FF111827" }, size: 11, name: "Inter" };
  filterHeaderRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFF1F5F9" },
  };

  filterSheet.addRow({ param: "Report Dataset", value: sheetTitle });
  filterSheet.addRow({ param: "Total Exported Records", value: rows.length });
  filterSheet.addRow({ param: "Generated Timestamp (IST)", value: new Date().toISOString() });
  filterSheet.addRow({ param: "Tournament Season", value: "Season 2026" });

  Object.entries(appliedFilters).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== "") {
      filterSheet.addRow({ param: key, value: String(val) });
    }
  });

  // Generate buffer and trigger download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  triggerBrowserDownload(blob, filename);
}

function triggerBrowserDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.setAttribute("download", filename);
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

