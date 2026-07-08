import { type InputHTMLAttributes } from 'react';
import { cn } from '../utils/cn.ts';

export interface TimePickerProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
}

/**
 * Time picker input.
 *
 * @example
 * <TimePicker label="Jam" value={time} onChange={setTime} />
 */
export function TimePicker({ label, error, className, id: externalId, ...props }: TimePickerProps) {
  const inputId = externalId ?? label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-body-sm font-medium text-text-primary">
          {label}
        </label>
      )}
      <input
        id={inputId}
        type="time"
        className={cn(
          'h-10 w-full rounded-lg border bg-bg-surface px-3 text-body text-text-primary outline-none transition-colors duration-150 focus:border-primary-500 focus:ring-1 focus:ring-primary-500',
          error ? 'border-danger-500' : 'border-border-default',
          className,
        )}
        {...props}
      />
      {error && <span className="text-caption text-danger-500">{error}</span>}
    </div>
  );
}
