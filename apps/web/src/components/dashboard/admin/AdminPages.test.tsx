import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { AdminPages } from './AdminPages';

const { mockGet, mockPost, mockPatch, mockDelete } = vi.hoisted(() => ({
  mockGet: vi.fn(),
  mockPost: vi.fn(),
  mockPatch: vi.fn(),
  mockDelete: vi.fn(),
}));

vi.mock('@specialist/shared', () => ({
  createBrowserClient: () => ({
    get: mockGet,
    post: mockPost,
    patch: mockPatch,
    delete: mockDelete,
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
        <div key={i} data-testid="page-row">
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
  SEOEditor: ({
    value,
    onChange,
  }: {
    value?: Record<string, string>;
    onChange?: (seo: Record<string, string>) => void;
  }) => (
    <div data-testid="seo-editor">
      <input
        data-testid="seo-meta-title"
        value={value?.metaTitle ?? ''}
        onChange={(e) => onChange?.({ ...value!, metaTitle: e.target.value })}
      />
    </div>
  ),
}));

// Mock the lazy-loaded PageFormModal
vi.mock('./PageFormModal', () => {
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
    const [title, setTitle] = useState('');
    const [slug, setSlug] = useState('');
    const [error, setError] = useState('');

    if (!open) return null;

    return (
      <div data-testid="modal">
        <h2>Tambah Halaman</h2>
        {error && <p className="text-sm text-danger-500">{error}</p>}
        <form
          onSubmit={(e: React.SyntheticEvent) => {
            e.preventDefault();
            if (!title || !slug) {
              setError('Judul dan slug wajib diisi');
              return;
            }
            onSaved();
            onClose();
          }}
        >
          <div>
            <label>Judul</label>
            <input
              data-testid="input-Judul"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div>
            <label>Slug</label>
            <input
              data-testid="input-Slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
            />
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

describe('AdminPages', () => {
  it('shows loading state initially', () => {
    mockGet.mockImplementation(() => new Promise(() => {}));
    render(<AdminPages />);
    expect(screen.queryByText('Tambah Halaman')).not.toBeInTheDocument();
  });

  it('shows pages list when loaded', async () => {
    mockGet.mockResolvedValue({
      data: [
        {
          id: 'p1',
          title: 'Tentang Kami',
          slug: 'tentang-kami',
          status: 'Published',
          updatedAt: '2026-01-15T00:00:00Z',
        },
      ],
    });
    render(<AdminPages />);
    expect(await screen.findByText('Tentang Kami')).toBeInTheDocument();
    expect(screen.getByText('Tambah Halaman')).toBeInTheDocument();
  });

  it('shows empty state when no pages', async () => {
    mockGet.mockResolvedValue({ data: [] });
    render(<AdminPages />);
    expect(await screen.findByText('Belum ada halaman')).toBeInTheDocument();
  });

  it('opens create modal when clicking Tambah Halaman', async () => {
    const user = userEvent.setup();
    mockGet.mockResolvedValue({ data: [] });
    render(<AdminPages />);
    expect(await screen.findByText('Tambah Halaman')).toBeInTheDocument();
    await user.click(screen.getByText('Tambah Halaman'));
    expect(await screen.findByTestId('modal')).toBeInTheDocument();
    expect(screen.getByText('Batal')).toBeInTheDocument();
  });

  it('shows validation error when submitting empty form', async () => {
    const user = userEvent.setup();
    mockGet.mockResolvedValue({ data: [] });
    render(<AdminPages />);
    expect(await screen.findByText('Tambah Halaman')).toBeInTheDocument();
    await user.click(screen.getByText('Tambah Halaman'));
    await waitFor(() => {
      expect(screen.getByTestId('modal')).toBeInTheDocument();
    });
    const form = screen.getByTestId('modal').querySelector('form');
    fireEvent.submit(form!);
    await waitFor(() => {
      expect(screen.getByText('Judul dan slug wajib diisi')).toBeInTheDocument();
    });
  });

  it('submits form and closes modal', async () => {
    const user = userEvent.setup();
    mockGet.mockResolvedValue({ data: [] });
    render(<AdminPages />);
    expect(await screen.findByText('Tambah Halaman')).toBeInTheDocument();
    await user.click(screen.getByText('Tambah Halaman'));
    await waitFor(() => {
      expect(screen.getByTestId('modal')).toBeInTheDocument();
    });

    await user.type(screen.getByTestId('input-Judul'), 'Test Page');
    await user.type(screen.getByTestId('input-Slug'), 'test-page');

    await user.click(screen.getByText('Buat'));

    await waitFor(() => {
      expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
    });
  });

  it('calls delete API when Hapus is confirmed', async () => {
    const user = userEvent.setup();
    mockGet.mockResolvedValue({
      data: [{ id: 'p1', title: 'Test', slug: 'test', status: 'Published' }],
    });
    mockDelete.mockResolvedValue(undefined);

    const originalConfirm = window.confirm;
    window.confirm = vi.fn(() => true);

    render(<AdminPages />);
    expect(await screen.findByText('Hapus')).toBeInTheDocument();
    await user.click(screen.getByText('Hapus'));

    await waitFor(() => {
      expect(mockDelete).toHaveBeenCalledWith('/api/v1/admin/cms-pages/p1');
    });

    window.confirm = originalConfirm;
  });

  it('does not call delete API when confirm is cancelled', async () => {
    const user = userEvent.setup();
    mockGet.mockResolvedValue({
      data: [{ id: 'p1', title: 'Test', slug: 'test', status: 'Published' }],
    });

    const originalConfirm = window.confirm;
    window.confirm = vi.fn(() => false);

    render(<AdminPages />);
    expect(await screen.findByText('Hapus')).toBeInTheDocument();
    await user.click(screen.getByText('Hapus'));

    await waitFor(() => {
      expect(mockDelete).not.toHaveBeenCalled();
    });

    window.confirm = originalConfirm;
  });
});
