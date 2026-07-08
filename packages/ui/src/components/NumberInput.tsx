import { type InputHTMLAttributes } from 'react';
import { cn } from '../utils/cn.ts';

export interface NumberInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
}

/**
 * Number input with min/max/step support.
 *
 * @example
 * <NumberInput label="Jumlah" min={0} max={100} step={1} value={qty} onChange={setQty} />
 */
export function NumberInput({
  label,
  error,
  className,
  id: externalId,
  ...props
}: NumberInputProps) {
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
        type="number"
        className={cn(
          'h-10 w-full rounded-lg border bg-bg-surface px-3 text-body text-text-primary outline-none transition-colors duration-150 placeholder:text-text-muted focus:border-primary-500 focus:ring-1 focus:ring-primary-500 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none',
          error ? 'border-danger-500' : 'border-border-default',
          className,
        )}
        {...props}
      />
      {error && <span className="text-caption text-danger-500">{error}</span>}
    </div>
  );
}
