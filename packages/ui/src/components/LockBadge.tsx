export interface LockBadgeProps {
  /** Email of the user holding the lock */
  lockedByEmail: string;
}

const LOCK_SVG = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

/**
 * Lock status badge for table list pages.
 *
 * Shows a lock icon + locker's email in warning text.
 * Pass `{locked: true, lockedByEmail: '...'}` from a lock entry.
 *
 * @example
 * ```tsx
 * columns: [
 *   {
 *     key: 'lock',
 *     header: 'Dikunci',
 *     render: (item) => {
 *       const lockInfo = lockMap[item.id];
 *       if (!lockInfo?.locked) return <span className="text-text-muted">-</span>;
 *       return <LockBadge lockedByEmail={lockInfo.lockedByEmail} />;
 *     },
 *   },
 * ]
 * ```
 */
export function LockBadge({ lockedByEmail }: LockBadgeProps) {
  return (
    <span
      data-testid="lock-badge"
      className="inline-flex items-center gap-1 text-xs text-warning-700"
      title={`Diedit oleh ${lockedByEmail}`}
    >
      {LOCK_SVG}
      {lockedByEmail}
    </span>
  );
}
