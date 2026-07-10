/**
 * Check if a contract end date is within 30 days from now.
 */
export function isExpiringSoon(endDate: string | null): boolean {
  if (!endDate) return false;
  try {
    const end = new Date(endDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    return diff > 0 && diff < 30 * 24 * 60 * 60 * 1000;
  } catch {
    return false;
  }
}

/**
 * Format a contract date range for display.
 * Supports open-ended ranges (null end date → "seterusnya").
 *
 * @example
 *   formatDateRange('2026-01-01', '2026-12-31') // '1 Jan 2026 — 31 Des 2026'
 *   formatDateRange('2026-01-01', null)          // '1 Jan 2026 — seterusnya'
 */
export function formatDateRange(start: string, end: string | null): string {
  try {
    const s = new Date(start).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
    if (!end) return `${s} — seterusnya`;
    const e = new Date(end).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
    return `${s} — ${e}`;
  } catch {
    return `${start} — ${end ?? '-'}`;
  }
}

/**
 * Get badge variant and Indonesia label for a contract status.
 */
export function getContractStatusBadge(status: string): {
  variant: 'success' | 'warning' | 'danger' | 'default' | 'info';
  label: string;
} {
  const s = status.toLowerCase();
  if (s === 'active') return { variant: 'success', label: 'Aktif' };
  if (s === 'draft') return { variant: 'default', label: 'Draft' };
  if (s === 'expired') return { variant: 'danger', label: 'Kadaluarsa' };
  if (s === 'terminated') return { variant: 'warning', label: 'Dihentikan' };
  return { variant: 'info', label: status };
}

/**
 * Contract status options for the status change modal.
 */
export const CONTRACT_STATUS_CHANGE_OPTIONS = [
  { value: 'Draft', label: 'Draft' },
  { value: 'Active', label: 'Aktif' },
  { value: 'Expired', label: 'Kadaluarsa' },
  { value: 'Terminated', label: 'Dihentikan' },
];
