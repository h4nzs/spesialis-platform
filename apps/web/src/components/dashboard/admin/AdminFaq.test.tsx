import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { AdminFaq } from './AdminFaq';

const { mockGet, mockPost, mockPatch, mockDelete } = vi.hoisted(() => ({
  mockGet: vi.fn(),
  mockPost: vi.fn(),
  mockPatch: vi.fn(),
  mockDelete: vi.fn(),
}));

vi.mock('@ahlipanggilan/shared', () => ({
  createBrowserClient: () => ({
    get: mockGet,
    post: mockPost,
    patch: mockPatch,
    delete: mockDelete,
  }),
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
  Table: ({
    data,
    emptyState,
    columns,
  }: {
    data: unknown[];
    emptyState?: React.ReactNode;
    columns: { key: string; header: string; render?: (item: unknown) => React.ReactNode }[];
  }) => (
    <div>
      {data.length === 0 && emptyState}
      {data.map((item, i) => (
        <div key={i} data-testid="faq-row">
          {columns.map((col) => (
            <span key={col.key}>
              {col.render
                ? col.render(item)
                : ((item as Record<string, unknown>)[col.key] as string)}
            </span>
          ))}
        </div>
      ))}
    </div>
  ),
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
  }: {
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    required?: boolean;
  }) => (
    <div>
      <label htmlFor={label}>{label}</label>
      <input
        id={label}
        value={value}
        onChange={onChange}
        required={required}
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
  Badge: ({ children, variant }: { children: React.ReactNode; variant?: string }) => (
    <span data-variant={variant}>{children}</span>
  ),
  EmptyState: ({ title, description }: { title?: string; description?: string }) => (
    <div>
      <p>{title}</p>
      {description && <p>{description}</p>}
    </div>
  ),
  TableSkeleton: () => <div data-testid="table-skeleton" />,
  Spinner: () => <div data-testid="spinner" />,
  RichTextEditor: ({
    label,
    value,
    onChange,
  }: {
    label?: string;
    value?: string;
    onChange?: (html: string) => void;
  }) => (
    <div>
      {label && <label>{label}</label>}
      <textarea
        data-testid={`rte-${label}`}
        value={value ?? ''}
        onChange={(e) => onChange?.(e.target.value)}
      />
    </div>
  ),
}));

// Mock the lazy-loaded FaqFormModal
vi.mock('./FaqFormModal', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { useState } = require('react');
  const ModalComponent = ({
    open,
    onClose,
    onSaved,
  }: {
    open: boolean;
    onClose: () => void;
    onSaved: () => void;
  }) => {
    const [question, setQuestion] = useState('');
    const [error, setError] = useState('');

    if (!open) return null;

    return (
      <div data-testid="modal">
        <h2>Tambah FAQ</h2>
        {error && <p className="text-sm text-danger-500">{error}</p>}
        <form
          onSubmit={(e: React.SyntheticEvent) => {
            e.preventDefault();
            if (!question) {
              setError('Pertanyaan dan jawaban wajib diisi');
              return;
            }
            onSaved();
            onClose();
          }}
        >
          <div>
            <label>Pertanyaan</label>
            <input
              data-testid="input-Pertanyaan"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
          </div>
          <div>
            <label>Jawaban</label>
            <textarea data-testid="rte-Jawaban" />
          </div>
          <button type="submit">Buat</button>
          <button type="button" onClick={onClose}>
            Batal
          </button>
        </form>
      </div>
    );
  };
  return { default: ModalComponent };
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe('AdminFaq', () => {
  it('shows loading state initially', () => {
    mockGet.mockImplementation(() => new Promise(() => {}));
    render(<AdminFaq />);
    expect(screen.queryByText('Tambah FAQ')).not.toBeInTheDocument();
  });

  it('shows FAQ list when loaded', async () => {
    mockGet.mockResolvedValue({
      data: [
        {
          id: 'f1',
          question: 'Apa itu Ahli Panggilan?',
          answer: 'Platform layanan jasa.',
          category: 'Umum',
          displayOrder: 1,
          isActive: 'true',
          updatedAt: '2026-01-15T00:00:00Z',
        },
      ],
    });
    render(<AdminFaq />);
    expect(await screen.findByText('Apa itu Ahli Panggilan?')).toBeInTheDocument();
    expect(screen.getByText('Tambah FAQ')).toBeInTheDocument();
  });

  it('shows empty state when no FAQ', async () => {
    mockGet.mockResolvedValue({ data: [] });
    render(<AdminFaq />);
    expect(await screen.findByText('Belum ada FAQ')).toBeInTheDocument();
  });

  it('opens create modal when clicking Tambah FAQ', async () => {
    const user = userEvent.setup();
    mockGet.mockResolvedValue({ data: [] });
    render(<AdminFaq />);
    expect(await screen.findByText('Tambah FAQ')).toBeInTheDocument();
    await user.click(screen.getByText('Tambah FAQ'));
    expect(await screen.findByTestId('modal')).toBeInTheDocument();
    expect(screen.getByText('Batal')).toBeInTheDocument();
  });

  it('shows validation error when submitting empty form', async () => {
    const user = userEvent.setup();
    mockGet.mockResolvedValue({ data: [] });
    render(<AdminFaq />);
    expect(await screen.findByText('Tambah FAQ')).toBeInTheDocument();
    await user.click(screen.getByText('Tambah FAQ'));
    await waitFor(() => {
      expect(screen.getByTestId('modal')).toBeInTheDocument();
    });
    const form = screen.getByTestId('modal').querySelector('form');
    fireEvent.submit(form!);
    await waitFor(() => {
      expect(screen.getByText('Pertanyaan dan jawaban wajib diisi')).toBeInTheDocument();
    });
  });

  it('submits form and closes modal', async () => {
    const user = userEvent.setup();
    mockGet.mockResolvedValue({ data: [] });
    render(<AdminFaq />);
    expect(await screen.findByText('Tambah FAQ')).toBeInTheDocument();
    await user.click(screen.getByText('Tambah FAQ'));
    await waitFor(() => {
      expect(screen.getByTestId('modal')).toBeInTheDocument();
    });

    await user.type(screen.getByTestId('input-Pertanyaan'), 'Test Q?');
    await user.type(screen.getByTestId('rte-Jawaban'), 'Test A.');

    await user.click(screen.getByText('Buat'));

    await waitFor(() => {
      expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
    });
  });

  it('calls delete API when Hapus is confirmed', async () => {
    const user = userEvent.setup();
    mockGet.mockResolvedValue({
      data: [
        {
          id: 'f1',
          question: 'Test?',
          answer: 'A.',
          category: null,
          displayOrder: 0,
          isActive: 'true',
        },
      ],
    });
    mockDelete.mockResolvedValue(undefined);

    const originalConfirm = window.confirm;
    window.confirm = vi.fn(() => true);

    render(<AdminFaq />);
    expect(await screen.findByText('Hapus')).toBeInTheDocument();
    await user.click(screen.getByText('Hapus'));

    await waitFor(() => {
      expect(mockDelete).toHaveBeenCalledWith('/api/v1/admin/faq/f1');
    });

    window.confirm = originalConfirm;
  });

  it('does not call delete API when confirm is cancelled', async () => {
    const user = userEvent.setup();
    mockGet.mockResolvedValue({
      data: [
        {
          id: 'f1',
          question: 'Test?',
          answer: 'A.',
          category: null,
          displayOrder: 0,
          isActive: 'true',
        },
      ],
    });

    const originalConfirm = window.confirm;
    window.confirm = vi.fn(() => false);

    render(<AdminFaq />);
    expect(await screen.findByText('Hapus')).toBeInTheDocument();
    await user.click(screen.getByText('Hapus'));

    await waitFor(() => {
      expect(mockDelete).not.toHaveBeenCalled();
    });

    window.confirm = originalConfirm;
  });
});
