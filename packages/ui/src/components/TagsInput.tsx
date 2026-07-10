import { useState, useCallback, type KeyboardEvent } from 'react';
import { cn } from '../utils/cn.ts';

export interface TagsInputProps {
  /** Array of tag strings */
  value?: string[];
  /** Called when tags change — returns the updated array */
  onChange?: (tags: string[]) => void;
  /** Label shown above the input */
  label?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Error message */
  error?: string;
  /** Disable interactions */
  disabled?: boolean;
  /** Max number of tags */
  maxTags?: number;
  /** Suggestions for autocomplete */
  suggestions?: string[];
  /** ID for label association */
  id?: string;
}

export function TagsInput({
  value = [],
  onChange,
  label,
  placeholder = 'Ketik tag lalu tekan Enter...',
  error,
  disabled = false,
  maxTags = 20,
  suggestions = [],
  id,
}: TagsInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const tags = value;

  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
  const errorId = error ? `${inputId}-error` : undefined;

  // ── Add tag ────────────────────────────────────────────────────
  const addTag = useCallback(
    (tag: string) => {
      const trimmed = tag.trim().toLowerCase();
      if (!trimmed) return;
      if (tags.length >= maxTags) return;
      if (tags.includes(trimmed)) return; // no duplicates

      onChange?.([...tags, trimmed]);
      setInputValue('');
      setShowSuggestions(false);
    },
    [tags, maxTags, onChange],
  );

  // ── Remove tag ─────────────────────────────────────────────────
  const removeTag = useCallback(
    (index: number) => {
      const next = tags.filter((_, i) => i !== index);
      onChange?.(next);
    },
    [tags, onChange],
  );

  // ── Keyboard handler ───────────────────────────────────────────
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        addTag(inputValue);
      } else if (e.key === 'Backspace' && inputValue === '' && tags.length > 0) {
        removeTag(tags.length - 1);
      } else if (e.key === 'Escape') {
        setShowSuggestions(false);
      }
    },
    [inputValue, tags, addTag, removeTag],
  );

  // ── Filter suggestions ─────────────────────────────────────────
  const filteredSuggestions = inputValue.trim()
    ? suggestions.filter(
        (s) =>
          s.toLowerCase().includes(inputValue.toLowerCase()) && !tags.includes(s.toLowerCase()),
      )
    : [];

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-text-primary">
          {label}
        </label>
      )}

      <div
        className={cn(
          'flex min-h-[42px] flex-wrap items-center gap-1.5 rounded-md border bg-bg-surface px-3 py-1.5 transition-colors focus-within:border-primary focus-within:ring-1 focus-within:ring-primary',
          error ? 'border-danger-500' : 'border-border-default',
          disabled ? 'cursor-not-allowed opacity-50' : '',
        )}
      >
        {/* Tag chips */}
        {tags.map((tag, i) => (
          <span
            key={`${tag}-${i}`}
            className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
          >
            {tag}
            {!disabled && (
              <button
                type="button"
                onClick={() => removeTag(i)}
                className="inline-flex items-center justify-center rounded-sm p-0.5 text-primary/70 hover:bg-primary/20 hover:text-primary transition-colors"
                aria-label={`Hapus tag ${tag}`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </span>
        ))}

        {/* Text input */}
        <input
          id={inputId}
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setShowSuggestions(true);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => {
            // Delay hiding to allow suggestion clicks
            setTimeout(() => setShowSuggestions(false), 200);
          }}
          placeholder={tags.length === 0 ? placeholder : ''}
          disabled={disabled || tags.length >= maxTags}
          aria-label={label ?? 'Tags'}
          aria-invalid={error ? true : undefined}
          aria-describedby={errorId}
          className="min-w-[80px] flex-1 bg-transparent py-0.5 text-sm text-text-primary outline-none placeholder:text-text-muted"
        />
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className="z-10 rounded-md border border-border-default bg-bg-surface shadow-sm">
          {filteredSuggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault(); // Prevent blur
                addTag(suggestion);
              }}
              className="flex w-full cursor-pointer items-center px-3 py-1.5 text-sm text-text-primary hover:bg-neutral-100 transition-colors"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      {/* Helper text */}
      <div className="flex items-center justify-between">
        <div>
          {error && (
            <span id={errorId} className="text-xs text-danger-500" role="alert">
              {error}
            </span>
          )}
        </div>
        <span className="text-[10px] text-text-muted">
          {tags.length}/{maxTags}
        </span>
      </div>
    </div>
  );
}
