import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import FaqFormModal from './FaqFormModal';

const { mockGet, mockPost, mockPatch } = vi.hoisted(() => ({
  mockGet: vi.fn(),
  mockPost: vi.fn(),
  mockPatch: vi.fn(),
}));

vi.mock('@ahlipanggilan/shared', () => ({
  createBrowserClient: () => ({
    get: mockGet,
    post: mockPost,
    patch: mockPatch,
    delete: vi.fn(),
  }),
  parseApiError: (err: unknown, fallback?: string) => {
    if (err instanceof Error) return { fieldErrors: {}, generalError: err.message };
    return { fieldErrors: {}, generalError: fallback ?? 'Terjadi kesalahan' };
  },
  SCHEMA_TEMPLATES: [],
}));

vi.mock('@ahlipanggilan/ui', () => ({
  Modal: ({
    children,
    open,
    title,
  }: {
    children: React.ReactNode;
    open: boolean;
    title: string;
  }) =>
    open ? (
      <div data-testid="modal">
        <h2>{title}</h2>
        {children}
      </div>
    ) : null,
  Button: ({
    children,
    onClick,
    type,
    disabled,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    type?: 'button' | 'submit' | 'reset';
    disabled?: boolean;
  }) => (
    <button type={type ?? 'button'} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
  Input: ({
    label,
    value,
    onChange,
    required,
    type,
    min,
  }: {
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    required?: boolean;
    type?: string;
    min?: number;
  }) => (
    <div>
      <label htmlFor={label}>{label}</label>
      <input
        id={label}
        type={type ?? 'text'}
        value={value}
        onChange={onChange}
        required={required}
        min={min}
        data-testid={`input-${label}`}
      />
    </div>
  ),
  Select: ({
    label,
    value,
    onChange,
    options,
  }: {
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    options: { value: string; label: string }[];
  }) => (
    <div>
      <label>{label}</label>
      <select value={value} onChange={onChange} data-testid={`select-${label}`}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  ),
  TableSkeleton: () => <div data-testid="table-skeleton" />,
  Card: ({ children, ..._props }: { children: React.ReactNode; [key: string]: unknown }) => (
    <div>{children}</div>
  ),
  Grid: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Badge: ({ children, ..._props }: { children: React.ReactNode; [key: string]: unknown }) => (
    <span>{children}</span>
  ),
  CSVExportButton: ({ onClick }: { onClick?: () => void }) => (
    <button type="button" onClick={onClick}>
      Export CSV
    </button>
  ),
  EmptyState: ({
    title,
    children,
    ..._props
  }: {
    title?: string;
    children?: React.ReactNode;
    [key: string]: unknown;
  }) => <div>{title ?? children}</div>,
  Pagination: ({ ..._props }: { [key: string]: unknown }) => <div />,
  ConfirmDialog: ({ ..._props }: { [key: string]: unknown }) => null,
  Spinner: () => <div aria-hidden="true" />,
}));

vi.mock('@ahlipanggilan/ui/editor', () => ({
  RichTextEditor: ({ value, onChange }: { value?: string; onChange?: (html: string) => void }) => (
    <textarea
      data-testid="richtexteditor"
      value={value ?? ''}
      onChange={(e) => onChange?.(e.target.value)}
    />
  ),
}));

const onClose = vi.fn();
const onSaved = vi.fn();

function renderModal(overrides: Partial<{ open: boolean; editingId: string | null }> = {}) {
  return render(
    <FaqFormModal
      open={overrides.open ?? true}
      onClose={onClose}
      editingId={overrides.editingId ?? null}
      onSaved={onSaved}
    />,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('FaqFormModal', () => {
  // ─── Create Mode ─────────────────────────────────────────────

  describe('create mode', () => {
    beforeEach(() => {
      mockGet.mockResolvedValue([]);
    });

    it('renders nothing when closed', () => {
      renderModal({ open: false });
      expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
    });

    it('renders create modal with correct title', () => {
      renderModal();
      expect(screen.getByTestId('modal')).toBeInTheDocument();
      expect(screen.getByText('Tambah FAQ')).toBeInTheDocument();
    });

    it('renders all required form fields', () => {
      renderModal();
      expect(screen.getByTestId('input-Pertanyaan')).toBeInTheDocument();
      expect(screen.getByTestId('richtexteditor')).toBeInTheDocument();
      expect(screen.getByTestId('select-Kategori Layanan')).toBeInTheDocument();
      expect(screen.getByTestId('input-Urutan Tampil')).toBeInTheDocument();
      expect(screen.getByTestId('select-Status')).toBeInTheDocument();
    });

    it('shows validation error on empty submit', async () => {
      renderModal();

      const form = screen.getByTestId('modal').querySelector('form');
      fireEvent.submit(form!);

      expect(screen.getByText('Pertanyaan dan jawaban wajib diisi')).toBeInTheDocument();
    });

    it('allows typing into answer via RichTextEditor', async () => {
      const user = userEvent.setup();
      renderModal();

      const questionInput = screen.getByTestId('input-Pertanyaan');
      const rte = screen.getByTestId('richtexteditor');

      await user.type(questionInput, 'Test Question');
      await user.type(rte, 'Test Answer');

      expect(questionInput).toHaveValue('Test Question');
      expect(rte).toHaveValue('Test Answer');
    });

    it('calls POST API and fires callbacks on valid submit', async () => {
      const user = userEvent.setup();
      mockPost.mockResolvedValue(undefined);
      renderModal();

      const questionInput = screen.getByTestId('input-Pertanyaan');
      const rte = screen.getByTestId('richtexteditor');
      await user.type(questionInput, 'Test Q?');
      await user.type(rte, 'Test A.');

      await user.click(screen.getByText('Buat'));

      await waitFor(() => {
        expect(mockPost).toHaveBeenCalledWith('/api/v1/admin/faq', {
          body: expect.objectContaining({
            question: 'Test Q?',
            answer: 'Test A.',
            isActive: 'true',
          }),
        });
      });

      expect(onClose).toHaveBeenCalledOnce();
      expect(onSaved).toHaveBeenCalledOnce();
    });

    it('shows error message on API failure', async () => {
      const user = userEvent.setup();
      mockPost.mockRejectedValue(new Error('API Error'));
      renderModal();

      const questionInput = screen.getByTestId('input-Pertanyaan');
      const rte = screen.getByTestId('richtexteditor');
      await user.type(questionInput, 'Test Q?');
      await user.type(rte, 'Test A.');

      await user.click(screen.getByText('Buat'));

      await waitFor(() => {
        expect(screen.getByText('API Error')).toBeInTheDocument();
      });
    });

    it('calls onClose when Batal is clicked', async () => {
      const user = userEvent.setup();
      renderModal();

      await user.click(screen.getByText('Batal'));
      expect(onClose).toHaveBeenCalledOnce();
    });

    it('defaults to active status', () => {
      renderModal();
      const select = screen.getByTestId('select-Status') as HTMLSelectElement;
      expect(select.value).toBe('true');
    });
  });

  // ─── Edit Mode ───────────────────────────────────────────────

  describe('edit mode', () => {
    const faqDetail = {
      question: 'What is this?',
      answer: '<p>This is an answer</p>',
      category: 'General',
      displayOrder: 1,
      isActive: 'true',
    };

    beforeEach(() => {
      // mockGet is called twice on mount: first for categories, then for FAQ detail
      mockGet.mockReset();
    });

    it('renders edit modal with correct title', () => {
      mockGet.mockResolvedValueOnce([]).mockResolvedValueOnce(faqDetail);
      renderModal({ editingId: 'f1' });

      expect(screen.getByText('Edit FAQ')).toBeInTheDocument();
    });

    it('fetches and pre-fills form on mount', async () => {
      mockGet.mockResolvedValueOnce([]).mockResolvedValueOnce(faqDetail);
      renderModal({ editingId: 'f1' });

      await waitFor(() => {
        expect(mockGet).toHaveBeenCalledWith('/api/v1/admin/faq/f1');
      });

      const questionInput = screen.getByTestId('input-Pertanyaan') as HTMLInputElement;
      await waitFor(() => {
        expect(questionInput.value).toBe('What is this?');
      });

      const rte = screen.getByTestId('richtexteditor') as HTMLTextAreaElement;
      expect(rte.value).toBe('<p>This is an answer</p>');
    });

    it('shows error when detail fetch fails', async () => {
      mockGet.mockResolvedValueOnce([]).mockRejectedValueOnce(new Error('Not found'));
      renderModal({ editingId: 'f1' });

      await waitFor(() => {
        expect(screen.getByText('Gagal memuat detail FAQ')).toBeInTheDocument();
      });
    });

    it('calls PATCH API on edit submit', async () => {
      const user = userEvent.setup();
      mockGet.mockResolvedValueOnce([]).mockResolvedValueOnce(faqDetail);
      mockPatch.mockResolvedValue(undefined);
      renderModal({ editingId: 'f1' });

      await waitFor(() => {
        expect(screen.getByText('Simpan')).toBeInTheDocument();
      });

      const questionInput = screen.getByTestId('input-Pertanyaan');
      await user.clear(questionInput);
      await user.type(questionInput, 'Updated Question');

      await user.click(screen.getByText('Simpan'));

      await waitFor(() => {
        expect(mockPatch).toHaveBeenCalledWith('/api/v1/admin/faq/f1', {
          body: expect.objectContaining({
            question: 'Updated Question',
            isActive: 'true',
          }),
        });
      });

      expect(onClose).toHaveBeenCalledOnce();
      expect(onSaved).toHaveBeenCalledOnce();
    });

    it('pre-fills display order and category', async () => {
      mockGet
        .mockResolvedValueOnce([{ slug: 'General', name: 'General' }])
        .mockResolvedValueOnce(faqDetail);
      renderModal({ editingId: 'f1' });

      const categorySelect = screen.getByTestId('select-Kategori Layanan') as HTMLSelectElement;
      const orderInput = screen.getByTestId('input-Urutan Tampil') as HTMLInputElement;

      await waitFor(() => {
        expect(categorySelect.value).toBe('General');
        expect(orderInput.value).toBe('1');
      });
    });
  });
});
