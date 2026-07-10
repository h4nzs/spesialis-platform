import { useState, useEffect, useMemo, useCallback } from 'react';
import { Input } from './Input.tsx';
import { Textarea } from './Textarea.tsx';
import { Select } from './Select.tsx';
import { Button } from './Button.tsx';
import { cn } from '../utils/cn.ts';
import { SCHEMA_TEMPLATES, getSchemaTemplate } from '@specialist/shared';
import type { SchemaTemplateType, SchemaField } from '@specialist/shared';

// ── Types ──────────────────────────────────────────────────────

export interface SchemaBuilderProps {
  /** Initial JSON-LD value for editing */
  value?: Record<string, unknown> | null;
  /** Called when the generated JSON-LD changes */
  onChange?: (schema: Record<string, unknown> | null) => void;
  className?: string;
}

const TEMPLATE_OPTIONS = [
  { value: '', label: '— Pilih template —' },
  ...SCHEMA_TEMPLATES.map((t) => ({ value: t.type, label: t.label })),
];

const ICON_SVGS: Record<string, string> = {
  fileText:
    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>',
  helpCircle:
    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>',
  wrench:
    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>',
  building:
    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/></svg>',
  home: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
};

// ── Try to detect schema type from existing JSON-LD ────────────
function detectType(value: Record<string, unknown> | null | undefined): SchemaTemplateType | '' {
  if (!value) return '';
  const type = value['@type'];
  if (typeof type === 'string' && SCHEMA_TEMPLATES.some((t) => t.type === type)) {
    return type as SchemaTemplateType;
  }
  return '';
}

// ── Extract values from existing JSON-LD ───────────────────────
function extractValues(
  type: SchemaTemplateType,
  json: Record<string, unknown>,
): Record<string, string> {
  const values: Record<string, string> = {};
  const template = getSchemaTemplate(type);
  if (!template) return values;

  for (const field of template.fields) {
    if (type === 'FAQ') {
      const match = field.key.match(/question(\d+)/);
      if (match) {
        const idx = parseInt(match[1]!, 10);
        const mainEntity = json.mainEntity as Array<Record<string, unknown>> | undefined;
        const question = mainEntity?.[idx - 1];
        if (question) {
          if (field.key.startsWith('question')) {
            values[field.key] = String(question.name ?? '');
          } else {
            const answer = question.acceptedAnswer as Record<string, unknown> | undefined;
            values[field.key] = String(answer?.text ?? '');
          }
        }
      }
    } else if (type === 'BreadcrumbList') {
      const match = field.key.match(/item(\d+)(Name|Url)/);
      if (match) {
        const idx = parseInt(match[1]!, 10);
        const items = json.itemListElement as Array<Record<string, unknown>> | undefined;
        const item = items?.find((i) => i.position === idx) ?? items?.[idx - 1];
        if (item) {
          if (field.key.endsWith('Name')) values[field.key] = String(item.name ?? '');
          if (field.key.endsWith('Url')) values[field.key] = String(item.item ?? '');
        }
      }
    } else if (type === 'Organization') {
      const match = field.key.match(/sameAs(\d+)/);
      if (match) {
        const idx = parseInt(match[1]!, 10);
        const sameAs = json.sameAs as string[] | undefined;
        values[field.key] = sameAs?.[idx - 1] ?? '';
      } else {
        values[field.key] = extractSimpleValue(json, field.key);
      }
    } else {
      values[field.key] = extractSimpleValue(json, field.key);
    }
  }
  return values;
}

function extractSimpleValue(json: Record<string, unknown>, key: string): string {
  // Handle nested paths like publisher.name → json.publisher?.name
  if (key === 'publisherName') {
    const publisher = json.publisher as Record<string, unknown> | undefined;
    return String(publisher?.name ?? '');
  }
  if (key === 'publisherLogo') {
    const publisher = json.publisher as Record<string, unknown> | undefined;
    const logo = publisher?.logo as Record<string, unknown> | undefined;
    return String((logo as Record<string, unknown> | undefined)?.url ?? '');
  }
  if (key === 'authorName') {
    const author = json.author as Record<string, unknown> | undefined;
    return String(author?.name ?? '');
  }
  if (key === 'imageUrl' || key === 'image') {
    const image = json.image as Record<string, unknown> | string | undefined;
    if (typeof image === 'string') return image;
    return String((image as Record<string, unknown> | undefined)?.url ?? '');
  }
  if (key === 'providerName') {
    const provider = json.provider as Record<string, unknown> | undefined;
    return String(provider?.name ?? '');
  }
  const val = json[key];
  return val !== undefined && val !== null ? String(val) : '';
}

// ── Component ──────────────────────────────────────────────────

export function SchemaBuilder({ value, onChange, className }: SchemaBuilderProps) {
  const initialType = detectType(value);
  const initialValues = initialType ? extractValues(initialType, value ?? {}) : {};

  const [selectedType, setSelectedType] = useState<SchemaTemplateType | ''>(initialType);
  const [fieldValues, setFieldValues] = useState<Record<string, string>>(initialValues);
  const [copied, setCopied] = useState(false);

  const template = selectedType ? getSchemaTemplate(selectedType) : undefined;

  // ── Generate JSON-LD ───────────────────────────────────────
  const generatedJson = useMemo(() => {
    if (!template || !selectedType) return null;
    return template.toJsonLD(fieldValues);
  }, [template, selectedType, fieldValues]);

  // ── Notify parent on change ────────────────────────────────
  useEffect(() => {
    if (onChange) onChange(generatedJson);
  }, [generatedJson, onChange]);

  // ── Template change handler ─────────────────────────────────
  const selectTemplate = useCallback((type: SchemaTemplateType | '') => {
    setSelectedType(type);
    setFieldValues({});
  }, []);

  const handleTypeChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      selectTemplate(e.target.value as SchemaTemplateType | '');
    },
    [selectTemplate],
  );

  // ── Field change handler ────────────────────────────────────
  const handleFieldChange = useCallback((key: string, value: string) => {
    setFieldValues((prev) => ({ ...prev, [key]: value }));
  }, []);

  // ── Copy to clipboard ──────────────────────────────────────
  const handleCopy = useCallback(async () => {
    if (!generatedJson) return;
    try {
      await navigator.clipboard.writeText(JSON.stringify(generatedJson, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API not available
    }
  }, [generatedJson]);

  // ── Clear ───────────────────────────────────────────────────
  const handleClear = useCallback(() => {
    setSelectedType('');
    setFieldValues({});
  }, []);

  // ── Render field by type ────────────────────────────────────
  function renderField(field: SchemaField) {
    const value = fieldValues[field.key] ?? '';
    const commonProps = {
      key: field.key,
      label: field.label,
      value,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        handleFieldChange(field.key, e.target.value),
      placeholder: field.placeholder,
      hint: field.hint,
    };

    if (field.type === 'textarea') {
      return (
        <div key={field.key} className="space-y-1">
          <span className="text-sm font-medium text-text-primary">
            {field.label}
            {field.required && <span className="ml-0.5 text-danger-500">*</span>}
          </span>
          <Textarea
            value={value}
            onChange={(e) => handleFieldChange(field.key, e.target.value)}
            placeholder={field.placeholder}
            rows={2}
          />
          {field.hint && <p className="text-xs text-text-muted">{field.hint}</p>}
        </div>
      );
    }

    return (
      <div key={field.key} className="space-y-1">
        <span className="text-sm font-medium text-text-primary">
          {field.label}
          {field.required && <span className="ml-0.5 text-danger-500">*</span>}
        </span>
        <Input
          value={value}
          onChange={(e) => handleFieldChange(field.key, e.target.value)}
          placeholder={field.placeholder}
          type={field.type === 'url' ? 'url' : 'text'}
        />
        {field.hint && <p className="text-xs text-text-muted">{field.hint}</p>}
      </div>
    );
  }

  return (
    <div
      className={cn('rounded-lg border border-border-default', className)}
      data-testid="schema-builder"
    >
      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 border-b border-border-default px-4 py-3">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-text-muted shrink-0"
        >
          <path d="M12 2v4" />
          <path d="m16.2 7.8 2.9-2.9" />
          <path d="M18 12h4" />
          <path d="m16.2 16.2 2.9 2.9" />
          <path d="M12 18v4" />
          <path d="m4.9 4.9 2.9 2.9" />
          <path d="M2 12h4" />
          <path d="m4.9 19.1 2.9-2.9" />
        </svg>
        <span className="text-sm font-semibold text-text-primary">Schema Markup</span>
        {selectedType && (
          <button
            type="button"
            onClick={handleClear}
            className="ml-auto text-xs text-text-muted hover:text-danger-500 transition-colors"
          >
            Hapus
          </button>
        )}
      </div>

      <div className="space-y-4 p-4">
        {/* ── Template selector ──────────────────────────────────── */}
        <Select
          data-testid="schema-template-select"
          label="Template"
          value={selectedType}
          onChange={handleTypeChange}
          options={TEMPLATE_OPTIONS}
        />

        {!selectedType && (
          <div className="space-y-2">
            <p className="text-xs text-text-muted">
              Pilih template untuk mulai membuat markup schema:
            </p>
            <div className="grid grid-cols-2 gap-2">
              {SCHEMA_TEMPLATES.map((t) => (
                <button
                  key={t.type}
                  type="button"
                  onClick={() => selectTemplate(t.type)}
                  className="flex items-center gap-2 rounded-md border border-border-default bg-bg-surface px-3 py-2.5 text-left text-sm text-text-primary transition-colors hover:border-primary hover:bg-primary/5"
                >
                  <span
                    className="shrink-0 text-text-muted"
                    dangerouslySetInnerHTML={{ __html: ICON_SVGS[t.icon] ?? '' }}
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{t.label}</p>
                    <p className="text-xs text-text-muted truncate">{t.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Field inputs ───────────────────────────────────────── */}
        {template && <div className="space-y-3">{template.fields.map(renderField)}</div>}

        {/* ── JSON Preview ───────────────────────────────────────── */}
        {generatedJson && (
          <div className="space-y-2" data-testid="schema-preview-section">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-text-muted">Preview JSON-LD</span>
              <Button size="sm" variant="ghost" onClick={handleCopy} data-testid="schema-copy">
                {copied ? 'Tersalin!' : 'Salin'}
              </Button>
            </div>
            <pre
              data-testid="schema-preview"
              className="max-h-48 overflow-auto rounded-md border border-border-default bg-neutral-50 p-3 text-[11px] text-text-secondary font-mono leading-relaxed"
            >
              {JSON.stringify(generatedJson, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
