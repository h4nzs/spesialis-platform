import { type InputHTMLAttributes, useId } from 'react';
import { cn } from '../utils/cn.ts';

const trackBase =
  'relative inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-150 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 disabled:cursor-not-allowed disabled:opacity-50';

const thumbBase =
  'pointer-events-none inline-block rounded-full bg-white shadow-sm ring-0 transition-transform duration-150 ease-out';

const sizes = {
  sm: { track: 'h-5 w-9', thumb: 'h-4 w-4' },
  md: { track: 'h-6 w-11', thumb: 'h-5 w-5' },
} as const;

export interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  /** Accessible label rendered next to the switch. */
  label?: string;
  size?: keyof typeof sizes;
}

/**
 * Switch toggle input.
 *
 * Accessible by default: uses `role="switch"`, `aria-checked`,
 * keyboard navigation, and focus-visible ring.
 *
 * @example
 * <Switch label="Tersedia" checked={available} onChange={setAvailable} />
 * <Switch size="sm" />
 */
export function Switch({
  label,
  size = 'md',
  checked,
  onChange,
  disabled,
  className,
  id: externalId,
  ...props
}: SwitchProps) {
  const internalId = useId();
  const id = externalId ?? internalId;
  const s = sizes[size];

  return (
    <label
      htmlFor={id}
      className={cn(
        'inline-flex items-center gap-3',
        disabled ? 'cursor-not-allowed' : 'cursor-pointer',
        className,
      )}
    >
      {label && (
        <span className="text-body-sm font-medium text-text-primary select-none">{label}</span>
      )}
      <span className={cn(trackBase, s.track, checked ? 'bg-primary-500' : 'bg-neutral-300')}>
        <input
          id={id}
          type="checkbox"
          role="switch"
          aria-checked={checked}
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className="peer sr-only"
          {...props}
        />
        <span
          aria-hidden="true"
          className={cn(thumbBase, s.thumb, checked ? 'translate-x-full' : 'translate-x-0')}
        />
      </span>
    </label>
  );
}
