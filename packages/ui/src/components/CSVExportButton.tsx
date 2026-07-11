import { downloadCSV } from '@ahlipanggilan/shared';

/**
 * Column definition for CSVExportButton.
 *
 * @typeParam T - Shape of each data item.
 */
export interface CSVExportColumn<T = Record<string, unknown>> {
  /** Key to extract the value from each data item. */
  key: keyof T & string;
  /** Column header label shown in the CSV file. */
  label: string;
  /**
   * Optional formatter for the cell value.
   * Receives the raw value and the full item. Return a string.
   * Defaults to `String(value ?? '')`.
   */
  format?: (value: unknown, item: T) => string;
}

export interface CSVExportButtonProps<T = Record<string, unknown>> {
  /** Data array to export. The button is **hidden** when this is empty. */
  data: T[];
  /** Column definitions — each `key` is extracted from each item, each `label` becomes a CSV header. */
  columns: CSVExportColumn<T>[];
  /** Output filename (e.g. `'users-export.csv'`). */
  filename: string;
  /** Disable the button (e.g. while a server-side export is in progress). */
  disabled?: boolean;
  /** Show loading text instead of "Export CSV". */
  loading?: boolean;
  /** Label shown while loading. Defaults to "Mengexport...". */
  loadingLabel?: string;
  /**
   * Full override for the click handler.
   * When provided, the default export logic (building headers/rows + calling `downloadCSV`) is skipped.
   * Useful for server-side export flows (e.g. `AdminBookings`).
   */
  onClick?: () => void;
  /**
   * Custom export function.
   * Receives the computed headers, rows, and filename.
   * Defaults to `downloadCSV` from `@ahlipanggilan/shared`.
   */
  onExport?: (headers: string[], rows: string[][], filename: string) => void;
}

/**
 * Reusable CSV export button that replaces the duplicated
 * button + download-icon + `handleExportCSV` pattern found across 8+ dashboard components.
 *
 * - **Hidden** when `data` is empty (prevents exporting empty files).
 * - Click builds CSV headers/rows from `columns` × `data` and calls `downloadCSV` (or `onExport`).
 * - Pass `onClick` to fully override the export logic (e.g. server-side streaming).
 *
 * @example
 * ```tsx
 * <CSVExportButton
 *   data={users}
 *   columns={[
 *     { key: 'email', label: 'Email' },
 *     { key: 'role', label: 'Role', format: (v) => ROLE_LABELS[v as string] ?? String(v) },
 *     { key: 'createdAt', label: 'Dibuat', format: (v) => new Date(v as string).toLocaleDateString('id-ID') },
 *   ]}
 *   filename="users-export.csv"
 * />
 * ```
 */
export function CSVExportButton<T extends Record<string, unknown>>({
  data,
  columns,
  filename,
  disabled = false,
  loading = false,
  loadingLabel = 'Mengexport...',
  onClick,
  onExport,
}: CSVExportButtonProps<T>) {
  if (data.length === 0) return null;

  const handleClick = () => {
    if (onClick) {
      onClick();
      return;
    }

    const headers = columns.map((c) => c.label);
    const rows = data.map((item) =>
      columns.map((col) => {
        const value = item[col.key];
        return col.format ? col.format(value, item) : String(value ?? '');
      }),
    );

    const exportFn = onExport ?? downloadCSV;
    exportFn(headers, rows, filename);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className="inline-flex items-center gap-1.5 rounded-lg border border-border-default bg-bg-surface px-3 py-1.5 text-body-sm font-medium text-text-primary shadow-xs transition-all duration-150 ease-out hover:bg-neutral-100 hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="shrink-0"
        aria-hidden="true"
      >
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
      {loading ? loadingLabel : 'Export CSV'}
    </button>
  );
}
