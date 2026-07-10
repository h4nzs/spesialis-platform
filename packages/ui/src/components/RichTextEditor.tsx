import { useCallback, useEffect, type ReactNode } from 'react';
import { useEditor, EditorContent, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import ImageExtension from '@tiptap/extension-image';
import LinkExtension from '@tiptap/extension-link';
import PlaceholderExtension from '@tiptap/extension-placeholder';

// ── Toolbar button icons (inline SVG for zero dependency) ────────

function BoldIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
      <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
    </svg>
  );
}

function ItalicIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="19" x2="10" y1="4" y2="4" />
      <line x1="14" x2="5" y1="20" y2="20" />
      <line x1="15" x2="9" y1="4" y2="20" />
    </svg>
  );
}

function StrikeIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 4H9a3 3 0 0 0-2.83 4" />
      <path d="M14 12a4 4 0 0 1 0 8H6" />
      <line x1="4" x2="20" y1="12" y2="12" />
    </svg>
  );
}

function HeadingIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 4v16" />
      <path d="M18 4v16" />
      <path d="M6 12h12" />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="8" x2="21" y1="6" y2="6" />
      <line x1="8" x2="21" y1="12" y2="12" />
      <line x1="8" x2="21" y1="18" y2="18" />
      <line x1="3" x2="3.01" y1="6" y2="6" />
      <line x1="3" x2="3.01" y1="12" y2="12" />
      <line x1="3" x2="3.01" y1="18" y2="18" />
    </svg>
  );
}

function OrderedListIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="10" x2="21" y1="6" y2="6" />
      <line x1="10" x2="21" y1="12" y2="12" />
      <line x1="10" x2="21" y1="18" y2="18" />
      <path d="M4 6h1v4" />
      <path d="M4 10h2" />
      <path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

function ImageIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  );
}

function QuoteIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" />
      <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z" />
    </svg>
  );
}

function UndoIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 7v6h6" />
      <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
    </svg>
  );
}

function RedoIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 7v6h-6" />
      <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13" />
    </svg>
  );
}

// ── Toolbar button component ─────────────────────────────────────

interface ToolbarButtonProps {
  onClick: () => void;
  isActive?: boolean;
  title: string;
  children: ReactNode;
}

function ToolbarButton({ onClick, isActive, title, children }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={title}
      aria-pressed={isActive}
      className={`flex h-8 w-8 items-center justify-center rounded-md text-sm transition-colors ${
        isActive
          ? 'bg-primary/10 text-primary'
          : 'text-text-muted hover:bg-neutral-100 hover:text-text-primary'
      }`}
    >
      {children}
    </button>
  );
}

// ── Divider ──────────────────────────────────────────────────────

function ToolbarDivider() {
  return <div className="mx-0.5 h-5 w-px bg-border-default" />;
}

// ── Props ────────────────────────────────────────────────────────

export interface RichTextEditorProps {
  /** Initial/controlled HTML content */
  value?: string;
  /** Called when content changes — returns HTML string */
  onChange?: (html: string) => void;
  /** Placeholder text when empty */
  placeholder?: string;
  /** Min height in pixels */
  minHeight?: number;
  /** Label shown above the editor */
  label?: string;
  /** Error message shown below */
  error?: string;
  /** Disable editing */
  disabled?: boolean;
  /** ID for the label association */
  id?: string;
  /**
   * Custom handler for image insertion.
   * Receives a callback to insert the image URL once selected.
   * Useful for integrating with MediaBrowser component.
   * Falls back to URL prompt if not provided.
   */
  onImageUpload?: (insertImage: (url: string) => void) => void;
}

// ── Component ────────────────────────────────────────────────────

export function RichTextEditor({
  value = '',
  onChange,
  placeholder = 'Tulis konten di sini...',
  minHeight = 300,
  label,
  error,
  disabled = false,
  id,
  onImageUpload,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        },
        link: false,
      }),
      ImageExtension.configure({
        inline: false,
        allowBase64: false,
      }),
      LinkExtension.configure({
        openOnClick: true,
        HTMLAttributes: {
          class: 'text-primary underline hover:text-primary-hover transition-colors',
        },
      }),
      PlaceholderExtension.configure({
        placeholder,
      }),
    ],
    content: value,
    editable: !disabled,
    onUpdate: ({ editor: ed }) => {
      const html = ed.getHTML();
      onChange?.(html === '<p></p>' ? '' : html);
    },
    editorProps: {
      attributes: {
        class:
          'prose prose-sm max-w-none focus:outline-none min-h-[200px] px-4 py-3 text-text-primary leading-relaxed',
      },
    },
  });

  // ── Image insertion handler ────────────────────────────────────
  // If onImageUpload prop is provided (e.g., connected to MediaBrowser),
  // it receives a callback to insert the chosen image URL.
  // Falls back to a simple URL prompt.
  const handleImageInsert = useCallback(() => {
    if (!editor) return;

    const insertImage = (url: string) => {
      editor.chain().focus().setImage({ src: url }).run();
    };

    if (onImageUpload) {
      onImageUpload(insertImage);
    } else {
      const url = window.prompt('Masukkan URL gambar:');
      if (url) insertImage(url);
    }
  }, [editor, onImageUpload]);

  // ── Link prompt handler ────────────────────────────────────────
  const handleLinkInsert = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes('link').href as string | undefined;
    const url = window.prompt('Masukkan URL link:', previousUrl ?? '');
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  // ── Sync external value changes ────────────────────────────────
  // When the parent re-renders with new content (e.g., loading an
  // existing article for editing), push the value into the editor.
  // Only updates when value differs from current HTML to avoid loops.
  useEffect(() => {
    if (editor && value !== undefined && editor.getHTML() !== value) {
      editor.commands.setContent(value);
    }
  }, [editor, value]);

  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
  const errorId = error ? `${inputId}-error` : undefined;

  // ── Empty state when there's no editor ─────────────────────────
  if (!editor) {
    return (
      <div className="flex flex-col gap-1.5">
        {label && <label className="text-sm font-medium text-text-primary">{label}</label>}
        <div
          className="flex items-center justify-center rounded-md border border-border-default bg-bg-surface text-sm text-text-muted"
          style={{ minHeight }}
        >
          Memuat editor...
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-text-primary">
          {label}
        </label>
      )}

      <div
        className={`overflow-hidden rounded-md border bg-bg-surface transition-colors focus-within:border-primary focus-within:ring-1 focus-within:ring-primary ${
          error ? 'border-danger-500' : 'border-border-default'
        }`}
      >
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-0.5 border-b border-border-default px-2 py-1.5">
          {/* Text style */}
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive('bold')}
            title="Tebal (Ctrl+B)"
          >
            <BoldIcon />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive('italic')}
            title="Miring (Ctrl+I)"
          >
            <ItalicIcon />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            isActive={editor.isActive('strike')}
            title="Coret"
          >
            <StrikeIcon />
          </ToolbarButton>

          <ToolbarDivider />

          {/* Heading */}
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            isActive={editor.isActive('heading', { level: 2 })}
            title="Heading 2"
          >
            <span className="text-xs font-bold">H2</span>
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            isActive={editor.isActive('heading', { level: 3 })}
            title="Heading 3"
          >
            <span className="text-xs font-bold">H3</span>
          </ToolbarButton>

          <ToolbarDivider />

          {/* Lists */}
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive('bulletList')}
            title="Daftar (bullet)"
          >
            <ListIcon />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive('orderedList')}
            title="Daftar (nomor)"
          >
            <OrderedListIcon />
          </ToolbarButton>

          <ToolbarDivider />

          {/* Blockquote */}
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            isActive={editor.isActive('blockquote')}
            title="Kutipan"
          >
            <QuoteIcon />
          </ToolbarButton>

          <div className="ml-auto flex items-center gap-0.5">
            {/* Link */}
            <ToolbarButton
              onClick={handleLinkInsert}
              isActive={editor.isActive('link')}
              title="Tambah link"
            >
              <LinkIcon />
            </ToolbarButton>

            {/* Image */}
            <ToolbarButton onClick={handleImageInsert} title="Tambah gambar">
              <ImageIcon />
            </ToolbarButton>

            <ToolbarDivider />

            {/* Undo / Redo */}
            <ToolbarButton
              onClick={() => editor.chain().focus().undo().run()}
              title="Undo (Ctrl+Z)"
            >
              <UndoIcon />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().redo().run()}
              title="Redo (Ctrl+Shift+Z)"
            >
              <RedoIcon />
            </ToolbarButton>
          </div>
        </div>

        {/* Editor content */}
        <div style={{ minHeight }}>
          <EditorContent editor={editor} />
        </div>
      </div>

      {error && (
        <span id={errorId} className="text-xs text-danger-500" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
