import { type InputHTMLAttributes } from 'react';
import { cn } from '../utils/cn.ts';

export interface PhoneInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
}

/**
 * Phone input with static +62 prefix.
 *
 * @example
 * <PhoneInput label="No. HP" value={phone} onChange={setPhone} />
 */
export function PhoneInput({ label, error, className, id: externalId, ...props }: PhoneInputProps) {
  const inputId = externalId ?? label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-body-sm font-medium text-text-primary">
          {label}
        </label>
      )}
      <div className="relative">
        {/* Prefix */}
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <span className="text-body text-text-muted select-none">+62</span>
        </div>
        <input
          id={inputId}
          type="tel"
          inputMode="numeric"
          className={cn(
            'h-10 w-full rounded-lg border bg-bg-surface pl-12 pr-3 text-body text-text-primary outline-none transition-colors duration-150 placeholder:text-text-muted focus:border-primary-500 focus:ring-1 focus:ring-primary-500',
            error ? 'border-danger-500' : 'border-border-default',
            className,
          )}
          autoComplete="tel-national"
          placeholder="81234567890"
          {...props}
        />
      </div>
      {error && <span className="text-caption text-danger-500">{error}</span>}
    </div>
  );
}
