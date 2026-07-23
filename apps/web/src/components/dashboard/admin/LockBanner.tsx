import { useState } from 'react';
import { Button } from '@ahlipanggilan/ui';

interface LockBannerProps {
  /** `'locked'` = warning banner (someone else is editing), `'lockLost'` = danger banner (lock hijacked) */
  type: 'locked' | 'lockLost';
  /** Resource name shown in the banner text, e.g. "Artikel", "Halaman", "FAQ" */
  resourceName: string;
  /** Email of the user holding the lock (only for type='locked') */
  lockedByEmail?: string;
  /** Called when user clicks "Ambil Alih" */
  onTakeover?: () => void;
  /** Called when user clicks back/close button */
  onBack?: () => void;
  /** Label for the back/close button — defaults to "Kembali" for full, "Tutup" for compact */
  backLabel?: string;
  /** Compact mode (for modals / FaqFormModal) */
  compact?: boolean;
}

const LOCK_ICON = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="mt-0.5 shrink-0 text-warning-600"
  >
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const LOCK_LOST_ICON = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="mt-0.5 shrink-0 text-danger-600"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="15" y1="9" x2="9" y2="15" />
    <line x1="9" y1="9" x2="15" y2="15" />
  </svg>
);

/**
 * Shared lock-status banner used by ArticleEditor, PageEditor, and FaqFormModal.
 *
 * Two variants:
 * 1. **Locked** — warning-yellow banner: "{resourceName} sedang diedit oleh {email}"
 *    with "Ambil Alih" and "Kembali/Tutup" buttons.
 * 2. **Lock lost** — danger-red banner: "Kunci telah diambil alih oleh pengguna lain"
 *    (read-only warning, no actions).
 */
export function LockBanner({
  type,
  resourceName,
  lockedByEmail,
  onTakeover,
  onBack,
  backLabel,
  compact = false,
}: LockBannerProps) {
  // Local loading state to prevent duplicate takeover clicks
  const [takeoverLoading, setTakeoverLoading] = useState(false);
  if (type === 'lockLost') {
    return (
      <div
        data-testid="lock-banner-lost"
        className={`rounded-lg border border-danger-200 bg-danger-50 ${compact ? 'p-3' : 'mb-6 px-4 py-3'}`}
      >
        <div className={`flex items-start ${compact ? 'gap-2' : 'gap-3'}`}>
          {compact ? (
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
              className="mt-0.5 shrink-0 text-danger-600"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          ) : (
            LOCK_LOST_ICON
          )}
          <div>
            <p className={`font-medium text-danger-800 ${compact ? 'text-xs' : 'text-sm'}`}>
              Kunci telah diambil alih oleh pengguna lain
            </p>
            {compact ? (
              <p className="mt-0.5 text-xs text-danger-600">
                Salin perubahan Anda dan mulai ulang.
              </p>
            ) : (
              <p className="mt-0.5 text-xs text-danger-600">
                Perubahan Anda mungkin tidak dapat disimpan. Salin perubahan Anda dan mulai ulang.
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // type === 'locked'
  const btnLabel = backLabel ?? (compact ? 'Tutup' : 'Kembali');
  const icon = compact ? (
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
      className="mt-0.5 shrink-0 text-warning-600"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  ) : (
    LOCK_ICON
  );

  return (
    <div
      data-testid="lock-banner"
      className={`rounded-lg border border-warning-200 bg-warning-50 ${compact ? 'p-3' : 'mb-6 px-4 py-3'}`}
    >
      <div className={`flex items-start justify-between ${compact ? 'gap-3' : 'gap-4'}`}>
        <div className={`flex items-start ${compact ? 'gap-2' : 'gap-3'}`}>
          {icon}
          <div>
            <p className={`font-medium text-warning-800 ${compact ? 'text-xs' : 'text-sm'}`}>
              {resourceName} sedang diedit oleh{' '}
              <span className="font-semibold">{lockedByEmail ?? 'Unknown'}</span>
            </p>
            {compact ? (
              <p className="mt-0.5 text-xs text-warning-600">Anda hanya dapat melihat.</p>
            ) : (
              <p className="mt-0.5 text-xs text-warning-600">
                Anda hanya dapat melihat, tidak dapat menyimpan perubahan hingga pengguna
                menyelesaikan pengeditannya.
              </p>
            )}
          </div>
        </div>
        <div className={`flex shrink-0 ${compact ? 'gap-1' : 'gap-2'}`}>
          {onTakeover && (
            <Button
              size="sm"
              variant="secondary"
              disabled={takeoverLoading}
              onClick={() => {
                setTakeoverLoading(true);
                onTakeover();
              }}
            >
              {takeoverLoading ? 'Mengambil alih...' : 'Ambil Alih'}
            </Button>
          )}
          {onBack && (
            <Button size="sm" variant="ghost" onClick={onBack}>
              {btnLabel}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
