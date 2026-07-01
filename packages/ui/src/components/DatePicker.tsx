import type { InputHTMLAttributes } from 'react';

export interface DatePickerProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
}

export function DatePicker({ label, error, className = '', id, ...props }: DatePickerProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-text">
          {label}
        </label>
      )}
      <input
        id={inputId}
        type="date"
        className={`w-full rounded-md border px-3 py-2 text-sm text-text placeholder:text-text-muted bg-surface outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary ${error ? 'border-danger' : 'border-border'} ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-danger">{error}</span>}
    </div>
  );
}
