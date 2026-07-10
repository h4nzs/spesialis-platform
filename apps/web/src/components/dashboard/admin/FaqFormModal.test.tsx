import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import FaqFormModal from './FaqFormModal';

const { mockGet, mockPost, mockPatch } = vi.hoisted(() => ({
  mockGet: vi.fn(),
  mockPost: vi.fn(),
  mockPatch: vi.fn(),
}));

vi.mock('@specialist/shared', () => ({
  createBrowserClient: () => ({
    get: mockGet,
    post: mockPost,
    patch: mockPatch,
    delete: vi.fn(),
  }),
}));

vi.mock('@specialist/ui', () => ({
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
      expect(screen.getByTestId('input-Kategori')).toBeInTheDocument();
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

    it('renders edit modal with correct title', () => {
      mockGet.mockResolvedValue(faqDetail);
      renderModal({ editingId: 'f1' });

      expect(screen.getByText('Edit FAQ')).toBeInTheDocument();
    });

    it('fetches and pre-fills form on mount', async () => {
      mockGet.mockResolvedValue(faqDetail);
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
      mockGet.mockRejectedValue(new Error('Not found'));
      renderModal({ editingId: 'f1' });

      await waitFor(() => {
        expect(screen.getByText('Gagal memuat detail FAQ')).toBeInTheDocument();
      });
    });

    it('calls PATCH API on edit submit', async () => {
      const user = userEvent.setup();
      mockGet.mockResolvedValue(faqDetail);
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
      mockGet.mockResolvedValue(faqDetail);
      renderModal({ editingId: 'f1' });

      const categoryInput = screen.getByTestId('input-Kategori') as HTMLInputElement;
      const orderInput = screen.getByTestId('input-Urutan Tampil') as HTMLInputElement;

      await waitFor(() => {
        expect(categoryInput.value).toBe('General');
        expect(orderInput.value).toBe('1');
      });
    });
  });
});
