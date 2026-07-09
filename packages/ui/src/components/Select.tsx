import type { SelectHTMLAttributes } from 'react';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  label?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
}

export function Select({
  label,
  error,
  options,
  placeholder,
  className = '',
  id,
  ...props
}: SelectProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
  const errorId = error ? `${inputId}-error` : undefined;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-text-primary">
          {label}
        </label>
      )}
      <select
        id={inputId}
        aria-label={!label ? placeholder || undefined : undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={errorId}
        className={`w-full rounded-md border px-3 py-2 text-sm text-text-primary bg-bg-surface outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary ${error ? 'border-danger-500' : 'border-border-default'} ${className}`}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <span id={errorId} className="text-xs text-danger-500" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
