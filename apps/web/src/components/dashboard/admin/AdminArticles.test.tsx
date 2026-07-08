import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { AdminArticles } from './AdminArticles';

const { mockGet, mockPost, mockPatch, mockDelete, mockDownloadCSV } = vi.hoisted(() => ({
  mockGet: vi.fn(),
  mockPost: vi.fn(),
  mockPatch: vi.fn(),
  mockDelete: vi.fn(),
  mockDownloadCSV: vi.fn(),
}));

vi.mock('@specialist/shared', () => ({
  createBrowserClient: () => ({
    get: mockGet,
    post: mockPost,
    patch: mockPatch,
    delete: mockDelete,
  }),
  downloadCSV: mockDownloadCSV,
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
    emptyMessage,
    emptyState,
    columns,
  }: {
    data: unknown[];
    emptyMessage?: string;
    emptyState?: React.ReactNode;
    columns: { key: string; header: string; render?: (item: unknown) => React.ReactNode }[];
  }) => (
    <div>
      {data.length === 0 && (emptyState ?? <p>{emptyMessage ?? ''}</p>)}
      {data.map((item, i) => (
        <div key={i} data-testid="article-row">
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
    placeholder,
  }: {
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    options: { value: string; label: string }[];
    placeholder?: string;
  }) => (
    <div>
      <label>{label}</label>
      <select value={value} onChange={onChange} data-testid={`select-${label}`}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  ),
  Textarea: ({
    label,
    value,
    onChange,
    rows,
  }: {
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    rows?: number;
  }) => (
    <div>
      <label>{label}</label>
      <textarea value={value} onChange={onChange} rows={rows} />
    </div>
  ),
  Badge: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
  EmptyState: ({ title, children }: { title?: string; children?: React.ReactNode }) => (
    <div>{title ?? children}</div>
  ),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('AdminArticles', () => {
  it('shows loading state initially', () => {
    mockGet.mockImplementation(() => new Promise(() => {}));
    render(<AdminArticles />);
    // Loading state renders skeleton shimmer (aria-hidden, no visible text)
    expect(screen.queryByText('Tulis Artikel')).not.toBeInTheDocument();
  });

  it('shows article list when loaded', async () => {
    mockGet.mockResolvedValueOnce({
      data: [
        { id: 'a1', title: 'Article 1', slug: 'article-1', status: 'Published', isFeatured: false },
      ],
    });
    mockGet.mockResolvedValueOnce({ data: [{ id: 'c1', name: 'News', slug: 'news' }] });
    render(<AdminArticles />);
    expect(await screen.findByText('Article 1')).toBeInTheDocument();
    expect(screen.getByText('Tulis Artikel')).toBeInTheDocument();
  });

  it('shows empty state when no articles', async () => {
    mockGet.mockResolvedValueOnce({ data: [] });
    mockGet.mockResolvedValueOnce({ data: [] });
    render(<AdminArticles />);
    expect(await screen.findByText('Belum ada artikel')).toBeInTheDocument();
  });

  it('opens create modal when clicking Tulis Artikel', async () => {
    const user = userEvent.setup();
    mockGet.mockResolvedValueOnce({ data: [] });
    mockGet.mockResolvedValueOnce({ data: [] });
    render(<AdminArticles />);
    expect(await screen.findByText('Tulis Artikel')).toBeInTheDocument();
    await user.click(screen.getByText('Tulis Artikel'));
    expect(await screen.findByTestId('modal')).toBeInTheDocument();
    expect(screen.getByText('Batal')).toBeInTheDocument();
  });

  it('shows edit and delete buttons per row', async () => {
    mockGet.mockResolvedValueOnce({
      data: [
        { id: 'a1', title: 'Article 1', slug: 'article-1', status: 'Draft', isFeatured: false },
      ],
    });
    mockGet.mockResolvedValueOnce({ data: [] });
    render(<AdminArticles />);
    expect(await screen.findByText('Edit')).toBeInTheDocument();
    expect(screen.getByText('Hapus')).toBeInTheDocument();
  });

  // --- Interaction Tests ---

  it('shows validation error when submitting empty form', async () => {
    const user = userEvent.setup();
    mockGet.mockResolvedValueOnce({ data: [] });
    mockGet.mockResolvedValueOnce({ data: [] });
    render(<AdminArticles />);
    expect(await screen.findByText('Tulis Artikel')).toBeInTheDocument();
    await user.click(screen.getByText('Tulis Artikel'));
    await waitFor(() => {
      expect(screen.getByTestId('modal')).toBeInTheDocument();
    });

    // Fire submit event on the form directly (click on submit button doesn't trigger form submit in JSDOM)
    const form = screen.getByTestId('modal').querySelector('form');
    fireEvent.submit(form!);

    await waitFor(() => {
      expect(screen.getByText('Judul dan slug wajib diisi')).toBeInTheDocument();
    });
  });

  it('submits form and calls post API', async () => {
    const user = userEvent.setup();
    mockGet.mockResolvedValueOnce({ data: [] });
    mockGet.mockResolvedValueOnce({ data: [{ id: 'c1', name: 'News', slug: 'news' }] });
    mockPost.mockResolvedValue(undefined);
    render(<AdminArticles />);
    expect(await screen.findByText('Tulis Artikel')).toBeInTheDocument();
    await user.click(screen.getByText('Tulis Artikel'));
    await waitFor(() => {
      expect(screen.getByTestId('modal')).toBeInTheDocument();
    });

    const titleInput = screen.getByTestId('input-Judul');
    const slugInput = screen.getByTestId('input-Slug');

    await user.type(titleInput, 'New Article');
    await user.type(slugInput, 'new-article');

    await user.click(screen.getByText('Buat'));

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith('/api/v1/admin/articles', {
        body: expect.objectContaining({
          title: 'New Article',
          slug: 'new-article',
          status: 'Draft',
          isFeatured: false,
        }),
      });
    });
  });

  it('calls delete API when Hapus is confirmed', async () => {
    const user = userEvent.setup();
    mockGet.mockResolvedValueOnce({
      data: [
        { id: 'a1', title: 'Article 1', slug: 'article-1', status: 'Draft', isFeatured: false },
      ],
    });
    mockGet.mockResolvedValueOnce({ data: [] });
    mockDelete.mockResolvedValue(undefined);

    // Mock window.confirm
    const originalConfirm = window.confirm;
    window.confirm = vi.fn(() => true);

    render(<AdminArticles />);
    expect(await screen.findByText('Hapus')).toBeInTheDocument();
    await user.click(screen.getByText('Hapus'));

    await waitFor(() => {
      expect(mockDelete).toHaveBeenCalledWith('/api/v1/admin/articles/a1');
    });

    window.confirm = originalConfirm;
  });

  it('does not call delete API when confirm is cancelled', async () => {
    const user = userEvent.setup();
    mockGet.mockResolvedValueOnce({
      data: [
        { id: 'a1', title: 'Article 1', slug: 'article-1', status: 'Draft', isFeatured: false },
      ],
    });
    mockGet.mockResolvedValueOnce({ data: [] });

    const originalConfirm = window.confirm;
    window.confirm = vi.fn(() => false);

    render(<AdminArticles />);
    expect(await screen.findByText('Hapus')).toBeInTheDocument();
    await user.click(screen.getByText('Hapus'));

    await waitFor(() => {
      expect(mockDelete).not.toHaveBeenCalled();
    });

    window.confirm = originalConfirm;
  });

  // ─── CSV Export Tests ───────────────────────────────────────────

  describe('CSV export', () => {
    beforeEach(() => {
      mockGet.mockResolvedValue({
        data: [
          {
            id: 'a1',
            title: 'Article 1',
            slug: 'article-1',
            categoryName: 'News',
            authorName: 'Admin',
            status: 'Published',
            isFeatured: true,
            publishedAt: '2026-01-15',
          },
        ],
      });
    });

    it('renders Export CSV button when data loaded', async () => {
      render(<AdminArticles />);
      expect(await screen.findByText('Export CSV')).toBeInTheDocument();
    });

    it('does not render Export CSV button when no articles', async () => {
      mockGet.mockReset();
      mockGet.mockResolvedValue({ data: [] });
      mockGet.mockResolvedValue({ data: [] });
      render(<AdminArticles />);
      expect(await screen.findByText('Belum ada artikel')).toBeInTheDocument();
      expect(screen.queryByText('Export CSV')).not.toBeInTheDocument();
    });

    it('calls downloadCSV with correct data on click', async () => {
      const user = userEvent.setup();
      render(<AdminArticles />);
      expect(await screen.findByText('Export CSV')).toBeInTheDocument();

      await user.click(screen.getByText('Export CSV'));

      expect(mockDownloadCSV).toHaveBeenCalledTimes(1);
      expect(mockDownloadCSV).toHaveBeenCalledWith(
        ['Judul', 'Slug', 'Kategori', 'Penulis', 'Status', 'Featured', 'Terbit'],
        [['Article 1', 'article-1', 'News', 'Admin', 'Published', 'Ya', '15/1/2026']],
        'artikel-export.csv',
      );
    });
  });
});
