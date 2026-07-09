import { type InputHTMLAttributes } from 'react';
import { cn } from '../utils/cn.ts';

export interface SearchInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
  /**
   * If true, shows a clear (X) button when the input has a value.
   * Requires `onClear` to be provided.
   */
  clearable?: boolean;
  onClear?: () => void;
}

/**
 * Search input with magnifying glass icon.
 *
 * @example
 * <SearchInput placeholder="Cari layanan..." />
 * <SearchInput clearable onClear={() => setQuery('')} />
 */
export function SearchInput({
  label,
  error,
  clearable,
  onClear,
  className,
  id: externalId,
  value,
  ...props
}: SearchInputProps) {
  const inputId = externalId ?? label?.toLowerCase().replace(/\s+/g, '-');
  const errorId = error ? `${inputId}-error` : undefined;
  const hasValue = typeof value === 'string' && value.length > 0;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-body-sm font-medium text-text-primary">
          {label}
        </label>
      )}
      <div className="relative">
        {/* Search icon */}
        <div
          className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-text-muted"
          aria-hidden="true"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
        </div>

        <input
          id={inputId}
          type="search"
          value={value}
          aria-label={!label ? props.placeholder || 'Cari' : undefined}
          aria-invalid={error ? true : undefined}
          aria-describedby={errorId}
          className={cn(
            'h-10 w-full rounded-md border bg-bg-surface pl-10 pr-9 text-body text-text-primary outline-none transition-colors duration-150 placeholder:text-text-muted focus:border-primary-500 focus:ring-1 focus:ring-primary-500 [&::-webkit-search-cancel-button]:hidden',
            error ? 'border-danger-500' : 'border-border-default',
            className,
          )}
          {...props}
        />

        {/* Clear button */}
        {clearable && hasValue && (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-text-muted hover:text-text-primary transition-colors"
            aria-label="Hapus pencarian"
            tabIndex={-1}
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
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        )}
      </div>
      {error && (
        <span id={errorId} className="text-caption text-danger-500" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
