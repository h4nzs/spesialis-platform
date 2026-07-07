import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { AdminServices } from './AdminServices';

const mockGet = vi.fn();
const mockPost = vi.fn();
const mockPatch = vi.fn();

vi.mock('@specialist/shared', () => ({
  createBrowserClient: () => ({ get: mockGet, post: mockPost, patch: mockPatch }),
  formatCurrency: (n: number | string) => {
    const num = typeof n === 'string' ? Number(n) : n;
    return `Rp${num.toLocaleString('id-ID')}`;
  },
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
        <div key={i} data-testid="service-row">
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
    type,
  }: {
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    required?: boolean;
    type?: string;
  }) => (
    <div>
      <label htmlFor={label}>{label}</label>
      <input
        id={label}
        value={value}
        onChange={onChange}
        required={required}
        type={type ?? 'text'}
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
    required,
  }: {
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    options: { value: string; label: string }[];
    placeholder?: string;
    required?: boolean;
  }) => (
    <div>
      <label>{label}</label>
      <select value={value} onChange={onChange} required={required} data-testid={`select-${label}`}>
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
  }: {
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  }) => (
    <div>
      <label>{label}</label>
      <textarea value={value} onChange={onChange} />
    </div>
  ),
  Badge: ({ children, variant: _variant }: { children: React.ReactNode; variant?: string }) => (
    <span>{children}</span>
  ),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('AdminServices', () => {
  it('shows loading state initially', () => {
    mockGet.mockImplementation(() => new Promise(() => {}));
    render(<AdminServices />);
    expect(screen.getByText('Memuat...')).toBeInTheDocument();
  });

  it('shows service list when loaded', async () => {
    mockGet.mockResolvedValueOnce({
      data: [
        {
          id: 's1',
          name: 'Service 1',
          slug: 'service-1',
          basePrice: '150000',
          isActive: true,
          isFeatured: false,
          categoryName: 'Cat 1',
        },
      ],
    });
    mockGet.mockResolvedValueOnce([{ id: 'c1', name: 'Cat 1', slug: 'cat-1' }]);
    render(<AdminServices />);
    expect(await screen.findByText('Service 1')).toBeInTheDocument();
    expect(screen.getByText('Tambah Layanan')).toBeInTheDocument();
  });

  it('shows empty state', async () => {
    mockGet.mockResolvedValueOnce({ data: [] });
    mockGet.mockResolvedValueOnce([]);
    render(<AdminServices />);
    expect(await screen.findByText('Belum ada layanan')).toBeInTheDocument();
  });

  it('opens create modal', async () => {
    const user = userEvent.setup();
    mockGet.mockResolvedValueOnce({ data: [] });
    mockGet.mockResolvedValueOnce([]);
    render(<AdminServices />);
    expect(await screen.findByText('Tambah Layanan')).toBeInTheDocument();
    await user.click(screen.getByText('Tambah Layanan'));
    expect(await screen.findByTestId('modal')).toBeInTheDocument();
    expect(screen.getByText('Batal')).toBeInTheDocument();
  });

  it('shows edit and toggle buttons per row', async () => {
    mockGet.mockResolvedValueOnce({
      data: [
        {
          id: 's1',
          name: 'Service 1',
          slug: 'service-1',
          basePrice: '150000',
          isActive: true,
          isFeatured: false,
          categoryName: 'Cat 1',
          displayOrder: 0,
          estimatedDuration: null,
        },
      ],
    });
    mockGet.mockResolvedValueOnce([]);
    render(<AdminServices />);
    expect(await screen.findByText('Edit')).toBeInTheDocument();
    expect(screen.getByText('Nonaktifkan')).toBeInTheDocument();
  });

  it('shows Aktifkan for inactive service', async () => {
    mockGet.mockResolvedValueOnce({
      data: [
        {
          id: 's2',
          name: 'Service 2',
          slug: 'service-2',
          basePrice: '200000',
          isActive: false,
          isFeatured: false,
          categoryName: null,
          displayOrder: 0,
          estimatedDuration: null,
        },
      ],
    });
    mockGet.mockResolvedValueOnce([]);
    render(<AdminServices />);
    expect(await screen.findByText('Aktifkan')).toBeInTheDocument();
  });
});
