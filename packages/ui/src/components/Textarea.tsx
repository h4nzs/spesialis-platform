import type { TextareaHTMLAttributes } from 'react';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({ label, error, className = '', id, ...props }: TextareaProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
  const errorId = error ? `${inputId}-error` : undefined;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-text-primary">
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        aria-label={!label ? props.placeholder || undefined : undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={errorId}
        className={`w-full rounded-md border px-3 py-2 text-sm text-text-primary placeholder:text-text-muted bg-bg-surface outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary resize-y min-h-[80px] ${error ? 'border-danger-500' : 'border-border-default'} ${className}`}
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
