import { type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../utils/cn.ts';

export interface ConfirmDialogProps {
  /** Whether the dialog is visible. */
  open: boolean;
  /** Dialog title. */
  title: string;
  /** Dialog body content. */
  children: ReactNode;
  /** Label for the confirm button. */
  confirmLabel?: string;
  /** Label for the cancel button. */
  cancelLabel?: string;
  /** Variant for the confirm button. */
  confirmVariant?: 'primary' | 'danger';
  /** Called when confirm is clicked. */
  onConfirm: () => void;
  /** Called when cancel or backdrop is clicked. */
  onCancel: () => void;
  /** Loading state for confirm action. */
  loading?: boolean;
}

/**
 * Confirmation dialog backed by a modal overlay.
 * Renders via portal (document.body) to avoid z-index / overflow parent issues.
 * Accessible: Escape to close, backdrop click to close, ARIA roles.
 *
 * @example
 * <ConfirmDialog
 *   open={showDelete}
 *   title="Hapus alamat?"
 *   onConfirm={handleDelete}
 *   onCancel={() => setShowDelete(false)}
 *   confirmVariant="danger"
 *   confirmLabel="Hapus"
 * >
 *   Alamat ini akan dihapus permanen.
 * </ConfirmDialog>
 */
export function ConfirmDialog({
  open,
  title,
  children,
  confirmLabel = 'Konfirmasi',
  cancelLabel = 'Batal',
  confirmVariant = 'primary',
  onConfirm,
  onCancel,
  loading,
}: ConfirmDialogProps) {
  if (!open) return null;

  const dialog = (
    <div
      className="fixed inset-0 z-modal flex items-center justify-center"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-bg-overlay" onClick={onCancel} />

      {/* Dialog */}
      <div
        className="relative z-10 mx-auto w-full max-w-md animate-scale-in rounded-2xl border border-border-default bg-bg-modal p-6 shadow-xl"
        onKeyDown={(e) => e.key === 'Escape' && onCancel()}
      >
        <h2 id="confirm-title" className="text-h5 text-text-primary">
          {title}
        </h2>
        <div className="mt-3 text-body text-text-secondary">{children}</div>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="inline-flex h-10 items-center justify-center rounded-md border border-border-default bg-bg-surface px-4 text-body-sm font-medium text-text-primary transition-colors hover:bg-neutral-100 disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={cn(
              'inline-flex h-10 items-center justify-center rounded-md px-4 text-body-sm font-semibold text-white shadow-xs transition-colors disabled:opacity-50',
              confirmVariant === 'danger'
                ? 'bg-danger-500 hover:bg-danger-600'
                : 'bg-primary-500 hover:bg-primary-600',
            )}
          >
            {loading ? 'Memproses...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(dialog, document.body);
}
