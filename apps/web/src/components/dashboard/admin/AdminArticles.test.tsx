import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { AdminArticles } from './AdminArticles';

const { mockGet, mockDelete, mockDownloadCSV } = vi.hoisted(() => ({
  mockGet: vi.fn(),
  mockDelete: vi.fn(),
  mockDownloadCSV: vi.fn(),
}));

vi.mock('@ahlipanggilan/shared', () => ({
  createBrowserClient: () => ({
    get: mockGet,
    delete: mockDelete,
  }),
  downloadCSV: mockDownloadCSV,
}));

vi.mock('@ahlipanggilan/ui', () => ({
  Button: ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
    <button type="button" onClick={onClick}>
      {children}
    </button>
  ),
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
      {data.length === 0 && (emptyState ?? null)}
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
  Badge: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
  EmptyState: ({ title }: { title?: string }) => <div>{title}</div>,
  CSVExportButton: ({
    data,
    columns,
    filename,
  }: {
    data: Record<string, unknown>[];
    columns: { key: string; label: string; format?: (v: unknown) => string }[];
    filename: string;
  }) => (
    <button
      type="button"
      onClick={() => {
        const headers = columns.map((c) => c.label);
        const rows = data.map((item) =>
          columns.map((c) => (c.format ? c.format(item[c.key]) : String(item[c.key] ?? ''))),
        );
        mockDownloadCSV(headers, rows, filename);
      }}
    >
      Export CSV
    </button>
  ),
  TableSkeleton: () => <div data-testid="table-skeleton" />,
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('AdminArticles', () => {
  it('shows loading state initially', () => {
    mockGet.mockImplementation(() => new Promise(() => {}));
    render(<AdminArticles />);
    expect(screen.queryByText('Tulis Artikel')).not.toBeInTheDocument();
  });

  it('shows article list when loaded', async () => {
    mockGet.mockResolvedValueOnce({
      data: [
        { id: 'a1', title: 'Article 1', slug: 'article-1', status: 'Published', isFeatured: false },
      ],
    });
    render(<AdminArticles />);
    expect(await screen.findByText('Article 1')).toBeInTheDocument();
    expect(screen.getByText('Tulis Artikel')).toBeInTheDocument();
  });

  it('shows empty state when no articles', async () => {
    mockGet.mockResolvedValueOnce({ data: [] });
    render(<AdminArticles />);
    expect(await screen.findByText('Belum ada artikel')).toBeInTheDocument();
  });

  it('shows edit and delete buttons per row', async () => {
    mockGet.mockResolvedValueOnce({
      data: [
        { id: 'a1', title: 'Article 1', slug: 'article-1', status: 'Draft', isFeatured: false },
      ],
    });
    render(<AdminArticles />);
    expect(await screen.findByText('Edit')).toBeInTheDocument();
    expect(screen.getByText('Hapus')).toBeInTheDocument();
  });

  it('calls delete API when Hapus is confirmed', async () => {
    const user = userEvent.setup();
    mockGet.mockResolvedValueOnce({
      data: [
        { id: 'a1', title: 'Article 1', slug: 'article-1', status: 'Draft', isFeatured: false },
      ],
    });
    mockDelete.mockResolvedValue(undefined);

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

  it('navigates to new article page when clicking Tulis Artikel', async () => {
    const user = userEvent.setup();
    mockGet.mockResolvedValueOnce({ data: [] });

    const { href: _href, ...locationRest } = window.location;
    const mockLocation = { ...locationRest, href: '' };
    Object.defineProperty(window, 'location', {
      value: mockLocation,
      writable: true,
    });

    render(<AdminArticles />);
    expect(await screen.findByText('Tulis Artikel')).toBeInTheDocument();
    await user.click(screen.getByText('Tulis Artikel'));

    expect(window.location.href).toBe('/dashboard/admin/articles/new');
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
