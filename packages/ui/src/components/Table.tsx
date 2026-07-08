import type { ReactNode } from 'react';

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => ReactNode;
  className?: string;
}

export interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  emptyMessage?: string;
  /** If provided, overrides emptyMessage — passes full control of empty-state rendering. */
  emptyState?: ReactNode;
  /** Icon SVG string used inside the default empty-state container. */
  emptyIcon?: string;
}

export const DEFAULT_EMPTY_ICON =
  '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M13.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>';

export function Table<T>({
  columns,
  data,
  keyExtractor,
  emptyMessage = 'Tidak ada data',
  emptyState,
  emptyIcon,
}: TableProps<T>) {
  if (data.length === 0) {
    if (emptyState) return <>{emptyState}</>;
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-surface px-6 py-12 text-center">
        <div
          className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 text-text-muted"
          aria-hidden="true"
          dangerouslySetInnerHTML={{ __html: emptyIcon ?? DEFAULT_EMPTY_ICON }}
        />
        <p className="text-body text-text-muted">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-background">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`px-4 py-3 text-left font-medium text-text-muted ${col.className ?? ''}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr
              key={keyExtractor(item)}
              className="border-b border-border last:border-b-0 hover:bg-background/50"
            >
              {columns.map((col) => (
                <td key={col.key} className={`px-4 py-3 text-text ${col.className ?? ''}`}>
                  {col.render
                    ? col.render(item)
                    : String((item as Record<string, unknown>)[col.key] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
