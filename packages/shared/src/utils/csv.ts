/**
 * Generate a CSV string from headers and rows.
 * - Adds BOM for Excel UTF-8 compatibility
 * - Properly quotes values containing commas, quotes, or newlines
 */
export function serializeCSV(headers: string[], rows: string[][]): string {
  const BOM = '\uFEFF';

  const quoteValue = (val: string): string => {
    if (val.includes(',') || val.includes('"') || val.includes('\n') || val.includes('\r')) {
      return `"${val.replace(/"/g, '""')}"`;
    }
    return val;
  };

  const headerLine = headers.map(quoteValue).join(',');
  const dataLines = rows.map((row) => row.map(quoteValue).join(','));

  return `${BOM}${headerLine}\n${dataLines.join('\n')}`;
}

/**
 * Trigger a browser file download from a Blob.
 *
 * Creates a temporary `<a>` element, triggers a click, and cleans up.
 * Safely no-ops in non-browser environments (SSR).
 *
 * @param blob - The file content as a Blob
 * @param filename - Output filename
 *
 * @example
 * ```ts
 * const blob = new Blob(['hello'], { type: 'text/plain' });
 * downloadBlob(blob, 'hello.txt');
 * ```
 */
export function downloadBlob(blob: Blob, filename: string): void {
  if (typeof document === 'undefined') {
    console.warn('[downloadBlob] browser-only');
    return;
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Download data as a CSV file in the browser.
 *
 * @param headers - Column headers (e.g. `['Bulan', 'Pesanan', 'Pendapatan']`)
 * @param rows - Data rows, each an array of string values
 * @param filename - Output filename (e.g. `'pendapatan-12bln.csv'`)
 *
 * @example
 * ```ts
 * downloadCSV(
 *   ['Bulan', 'Pesanan', 'Pendapatan'],
 *   [['Jan 2026', '15', '150000.00'], ['Feb 2026', '22', '220000.00']],
 *   'pendapatan-12bln.csv',
 * );
 * ```
 */
export function downloadCSV(headers: string[], rows: string[][], filename: string): void {
  if (typeof document === 'undefined') {
    console.warn('[CSV] downloadCSV is browser-only');
    return;
  }
  const csv = serializeCSV(headers, rows);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, filename);
}
