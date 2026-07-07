import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { AdminArticles } from './AdminArticles';

const mockGet = vi.fn();
const mockPost = vi.fn();
const mockPatch = vi.fn();
const mockDelete = vi.fn();

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
    emptyMessage,
    columns,
  }: {
    data: unknown[];
    emptyMessage: string;
    columns: { key: string; header: string; render?: (item: unknown) => React.ReactNode }[];
  }) => (
    <div>
      {data.length === 0 && <p>{emptyMessage}</p>}
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
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('AdminArticles', () => {
  it('shows loading state initially', () => {
    mockGet.mockImplementation(() => new Promise(() => {}));
    render(<AdminArticles />);
    expect(screen.getByText('Memuat...')).toBeInTheDocument();
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
});
