import type { InputHTMLAttributes } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className = '', id, ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
  const errorId = error ? `${inputId}-error` : undefined;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-text-primary">
          {label}
        </label>
      )}
      <input
        id={inputId}
        aria-label={!label ? props.placeholder || undefined : undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={errorId}
        className={`w-full rounded-md border px-3 py-2 text-sm text-text-primary placeholder:text-text-muted bg-bg-surface outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary ${error ? 'border-danger-500' : 'border-border-default'} ${className}`}
        {...props}
      />
      {error && (
        <span id={errorId} className="text-xs text-danger-500" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
