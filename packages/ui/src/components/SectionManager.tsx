import { useCallback, useId } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '../utils/cn.ts';

// ── Types ────────────────────────────────────────────────────────

export interface HomepageSection {
  id: string;
  sectionType: string;
  title: string | null;
  content: string | null;
  imageMediaId: string | null;
  sortOrder: number;
  isActive: boolean;
}

const SECTION_TYPE_LABELS: Record<string, string> = {
  hero: 'Hero',
  services: 'Services',
  'why-us': 'Why Us',
  stats: 'Statistics',
  testimonials: 'Testimonials',
  cta: 'CTA',
  faq: 'FAQ',
};

const SECTION_TYPE_ICONS: Record<string, string> = {
  hero: '\u{1F3E0}',
  services: '\u{1F527}',
  'why-us': '\u{2B50}',
  stats: '\u{1F4CA}',
  testimonials: '\u{1F4AC}',
  cta: '\u{1F3AF}',
  faq: '\u{2753}',
};

export interface SectionManagerProps {
  sections: HomepageSection[];
  onReorder: (items: Array<{ id: string; sortOrder: number }>) => void;
  onToggleActive: (id: string, isActive: boolean) => void;
  onEdit: (section: HomepageSection) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
  disabled?: boolean;
}

// ── Sortable Section Card ────────────────────────────────────────

function SortableSectionCard({
  section,
  onToggleActive,
  onEdit,
  onDelete,
  disabled = false,
}: {
  section: HomepageSection;
  onToggleActive: (id: string, isActive: boolean) => void;
  onEdit: (section: HomepageSection) => void;
  onDelete: (id: string) => void;
  disabled?: boolean;
}) {
  const descId = useId();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: section.id,
    disabled,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const label = SECTION_TYPE_LABELS[section.sectionType] ?? section.sectionType;
  const icon = SECTION_TYPE_ICONS[section.sectionType] ?? '\u{1F4C4}';

  return (
    <div
      ref={setNodeRef}
      style={style}
      role="listitem"
      aria-roledescription="sortable section"
      aria-describedby={descId}
      className={cn(
        'flex items-center gap-3 rounded-lg border bg-bg-surface px-4 py-3 transition-shadow',
        isDragging ? 'z-50 shadow-lg border-primary' : 'border-border-default shadow-xs',
        !section.isActive && 'opacity-60',
      )}
    >
      <span id={descId} className="hidden">
        {label} section at position {section.sortOrder}
      </span>

      {/* Drag handle */}
      <button
        type="button"
        className={cn(
          'flex cursor-grab items-center justify-center rounded-md p-1 text-text-muted hover:bg-neutral-100 hover:text-text-primary touch-none',
          disabled && 'cursor-not-allowed',
        )}
        {...attributes}
        {...listeners}
        aria-label={`Drag to reorder ${label}`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <line x1="8" y1="6" x2="16" y2="6" />
          <line x1="8" y1="12" x2="16" y2="12" />
          <line x1="8" y1="18" x2="16" y2="18" />
        </svg>
      </button>

      {/* Type icon + info */}
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <span className="text-lg" aria-hidden="true">
          {icon}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-text-primary">{section.title || label}</p>
          <p className="truncate text-xs text-text-muted">
            {label} \u00B7 Order {section.sortOrder}
          </p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex shrink-0 items-center gap-1">
        <button
          type="button"
          onClick={() => onToggleActive(section.id, !section.isActive)}
          disabled={disabled}
          className={cn(
            'flex cursor-pointer items-center justify-center rounded-md p-1.5 transition-colors',
            section.isActive
              ? 'text-success-500 hover:bg-success-500/10'
              : 'text-text-muted hover:bg-neutral-100',
          )}
          aria-label={section.isActive ? 'Nonaktifkan section' : 'Aktifkan section'}
          title={section.isActive ? 'Aktif' : 'Nonaktif'}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            {section.isActive ? (
              <>
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </>
            ) : (
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
            )}
          </svg>
        </button>

        <button
          type="button"
          onClick={() => onEdit(section)}
          disabled={disabled}
          className="flex cursor-pointer items-center justify-center rounded-md p-1.5 text-text-muted hover:bg-neutral-100 hover:text-text-primary transition-colors"
          aria-label={`Edit ${label}`}
          title="Edit"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </button>

        <button
          type="button"
          onClick={() => onDelete(section.id)}
          disabled={disabled}
          className="flex cursor-pointer items-center justify-center rounded-md p-1.5 text-text-muted hover:bg-danger-500/10 hover:text-danger-500 transition-colors"
          aria-label={`Hapus ${label}`}
          title="Hapus"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// ── SectionManager Component ─────────────────────────────────────

export function SectionManager({
  sections = [],
  onReorder,
  onToggleActive,
  onEdit,
  onDelete,
  onAdd,
  disabled = false,
}: SectionManagerProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIndex = sections.findIndex((s) => s.id === active.id);
      const newIndex = sections.findIndex((s) => s.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return;

      const reordered = arrayMove(sections, oldIndex, newIndex);
      const items = reordered.map((section, i) => ({
        id: section.id,
        sortOrder: i,
      }));
      onReorder(items);
    },
    [sections, onReorder],
  );

  const sectionIds = sections.map((s) => s.id);

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-text-primary">Homepage Sections</h3>
          <p className="text-xs text-text-muted">
            Drag to reorder \u00B7 {sections.length} section{sections.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          type="button"
          onClick={onAdd}
          disabled={disabled}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-primary-hover disabled:opacity-50"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Section
        </button>
      </div>

      {/* Sortable list */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={sectionIds} strategy={verticalListSortingStrategy}>
          <div
            role="list"
            aria-roledescription="sortable list"
            aria-label="Homepage sections"
            className="space-y-2"
          >
            {sections.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border-default py-10 text-center">
                <p className="text-sm text-text-muted">Belum ada section</p>
                <button
                  type="button"
                  onClick={onAdd}
                  className="mt-2 text-sm font-medium text-primary hover:text-primary-hover cursor-pointer"
                >
                  Tambah section pertama
                </button>
              </div>
            ) : (
              sections.map((section) => (
                <SortableSectionCard
                  key={section.id}
                  section={section}
                  onToggleActive={onToggleActive}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  disabled={disabled}
                />
              ))
            )}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
