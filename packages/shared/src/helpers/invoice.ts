/**
 * Get badge variant and Indonesia label for an invoice status.
 */
export function getInvoiceBadge(status: string): {
  variant: 'success' | 'warning' | 'danger' | 'default' | 'info';
  label: string;
} {
  const s = status.toLowerCase();
  if (s === 'paid') return { variant: 'success', label: 'Lunas' };
  if (s === 'issued') return { variant: 'warning', label: 'Diterbitkan' };
  if (s === 'overdue') return { variant: 'danger', label: 'Jatuh Tempo' };
  if (s === 'draft') return { variant: 'default', label: 'Draft' };
  if (s === 'cancelled') return { variant: 'info', label: 'Dibatalkan' };
  return { variant: 'info', label: status };
}

/**
 * Status options for the invoice status change modal.
 */
export const INVOICE_STATUS_CHANGE_OPTIONS = [
  { value: 'Draft', label: 'Draft' },
  { value: 'Issued', label: 'Diterbitkan' },
  { value: 'Paid', label: 'Lunas' },
  { value: 'Overdue', label: 'Jatuh Tempo' },
  { value: 'Cancelled', label: 'Dibatalkan' },
];
