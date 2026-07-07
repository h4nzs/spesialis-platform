import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { CorporateBranches } from './CorporateBranches';

const mockGet = vi.fn();
const mockPost = vi.fn();
const mockDelete = vi.fn();

vi.mock('@specialist/shared', () => ({
  createBrowserClient: () => ({ get: mockGet, post: mockPost, delete: mockDelete }),
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
        <div key={i} data-testid="branch-row">
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
    size: _size,
    variant: _variant,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    size?: string;
    variant?: string;
  }) => <button onClick={onClick}>{children}</button>,
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
      <input id={label} value={value} onChange={onChange} required={required} />
    </div>
  ),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('CorporateBranches', () => {
  it('shows loading state initially', () => {
    mockGet.mockImplementation(() => new Promise(() => {}));
    render(<CorporateBranches />);
    expect(screen.getByText('Memuat...')).toBeInTheDocument();
  });

  it('shows branches when loaded', async () => {
    mockGet.mockResolvedValueOnce({ id: 'company1' });
    mockGet.mockResolvedValueOnce([
      { id: 'b1', name: 'Branch 1', address: 'Jl. Merdeka', city: 'Jakarta', phone: '08123456789' },
    ]);
    render(<CorporateBranches />);
    expect(await screen.findByText('Branch 1')).toBeInTheDocument();
    expect(screen.getByText('Tambah Cabang')).toBeInTheDocument();
  });

  it('shows empty state', async () => {
    mockGet.mockResolvedValueOnce({ id: 'company1' });
    mockGet.mockResolvedValueOnce([]);
    render(<CorporateBranches />);
    expect(await screen.findByText('Belum ada cabang')).toBeInTheDocument();
  });

  it('handles API error', async () => {
    mockGet.mockRejectedValue(new Error('Gagal'));
    render(<CorporateBranches />);
    expect(await screen.findByText('Belum ada cabang')).toBeInTheDocument();
  });

  it('shows Tambah Cabang modal', async () => {
    const user = userEvent.setup();
    mockGet.mockResolvedValueOnce({ id: 'company1' });
    mockGet.mockResolvedValueOnce([]);
    render(<CorporateBranches />);
    const btn = await screen.findByText('Tambah Cabang');
    await user.click(btn);
    expect(await screen.findByTestId('modal')).toBeInTheDocument();
    expect(screen.getByText('Batal')).toBeInTheDocument();
    expect(screen.getByText('Nama Cabang')).toBeInTheDocument();
    expect(screen.getByText('Alamat')).toBeInTheDocument();
    expect(screen.getByText('Kota')).toBeInTheDocument();
    expect(screen.getByText('Telepon')).toBeInTheDocument();
  });

  it('shows Hapus button per branch row', async () => {
    mockGet.mockResolvedValueOnce({ id: 'company1' });
    mockGet.mockResolvedValueOnce([
      { id: 'b1', name: 'Branch 1', address: 'Jl. Merdeka', city: 'Jakarta', phone: null },
    ]);
    render(<CorporateBranches />);
    expect(await screen.findByText('Hapus')).toBeInTheDocument();
  });
});
