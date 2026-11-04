/**
 * Client-side CSV export utility
 */

export interface CsvColumn<T> {
  header: string;
  accessor: (item: T) => string | number | boolean | null | undefined;
}

export function exportToCsv<T>(
  filename: string,
  rows: T[],
  columns: CsvColumn<T>[],
): void {
  if (!rows || rows.length === 0) {
    alert("No data available to export.");
    return;
  }

  const headers = columns
    .map((c) => `"${c.header.replace(/"/g, '""')}"`)
    .join(",");

  const body = rows
    .map((row) =>
      columns
        .map((col) => {
          const val = col.accessor(row);
          if (val === null || val === undefined) return '""';
          return `"${String(val).replace(/"/g, '""')}"`;
        })
        .join(","),
    )
    .join("\r\n");

  const csvContent = "\uFEFF" + headers + "\r\n" + body;
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    `${filename.replace(/\.csv$/, "")}_${Date.now()}.csv`,
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
