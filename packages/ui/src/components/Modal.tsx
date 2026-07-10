import { type ReactNode, useRef, useEffect, useId, useCallback } from 'react';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

const MODAL_WIDTH: Record<ModalSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-6xl',
};

export interface ModalProps {
  /** Whether the modal is visible. */
  open: boolean;
  /** Called when the modal should close (backdrop click, Escape, close button). */
  onClose: () => void;
  /** Modal title. When provided, aria-labelledby is set on the dialog. */
  title?: string;
  /** Modal body content. Referenced via aria-describedby for screen readers. */
  children: ReactNode;
  /** Optional footer area, typically action buttons. */
  footer?: ReactNode;
  /** Modal width variant. Defaults to 'md' (max-w-lg). */
  size?: ModalSize;
}

/** CSS selector for focusable elements inside the modal. */
const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Accessible modal dialog with focus trap, ARIA attributes, and keyboard support.
 *
 * - Traps focus within the modal while open (Tab / Shift+Tab cycle).
 * - Restores focus to the previously focused element on close.
 * - Closes on Escape key, backdrop click, or close button.
 * - Associates title via aria-labelledby and content via aria-describedby.
 *
 * @example
 * <Modal open={show} onClose={() => setShow(false)} title="Edit Item">
 *   <p>Modal body content here.</p>
 *   <button>Simpan</button>
 * </Modal>
 */
export function Modal({ open, onClose, title, children, footer, size = 'md' }: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const descriptionId = useId();

  /** Trap Tab and Shift+Tab within the modal and close on Escape. */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      if (e.key === 'Tab' && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
        if (focusable.length === 0) return;

        const first = focusable[0]!;
        const last = focusable[focusable.length - 1]!;

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    },
    [onClose],
  );

  useEffect(() => {
    if (open) {
      // Remember the previously focused element so we can restore it on close
      previousFocusRef.current = document.activeElement as HTMLElement;

      // Move focus into the modal (first focusable element)
      if (dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
        if (focusable.length > 0) {
          focusable[0]!.focus();
        }
      }

      // Prevent body scroll while modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      // Restore focus when the modal closes
      previousFocusRef.current?.focus();
      previousFocusRef.current = null;

      // Restore body scroll
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />

      {/* Dialog */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={descriptionId}
        className={`relative z-10 w-full max-h-[85vh] overflow-y-auto rounded-2xl border border-border-default bg-bg-surface p-6 shadow-lg ${MODAL_WIDTH[size]} mx-auto`}
        onKeyDown={handleKeyDown}
      >
        {title && (
          <div className="mb-4 flex items-center justify-between">
            <h2 id={titleId} className="text-lg font-semibold text-text-primary">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="cursor-pointer text-text-muted hover:text-text-primary"
              aria-label="Tutup"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        )}
        <div id={descriptionId}>{children}</div>
        {footer && <div className="mt-6 flex justify-end gap-3">{footer}</div>}
      </div>
    </div>
  );
}
