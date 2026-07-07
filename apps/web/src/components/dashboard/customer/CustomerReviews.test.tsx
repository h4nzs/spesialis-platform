import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { CustomerReviews } from './CustomerReviews';

const mockGet = vi.fn();
const mockPost = vi.fn();

vi.mock('@specialist/shared', () => ({
  createBrowserClient: () => ({ get: mockGet, post: mockPost }),
  formatDate: (d: string) => d,
  formatRating: (r: number) => `${r}/5`,
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
        <div key={i}>
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
    type?: string;
    disabled?: boolean;
  }) => (
    <button type={type ?? 'button'} onClick={onClick} disabled={disabled}>
      {children}
    </button>
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
      <select value={value} onChange={onChange} required={required}>
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
    placeholder,
  }: {
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    placeholder?: string;
  }) => (
    <div>
      <label>{label}</label>
      <textarea value={value} onChange={onChange} placeholder={placeholder} />
    </div>
  ),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('CustomerReviews', () => {
  it('shows loading state initially', () => {
    mockGet.mockImplementation(() => new Promise(() => {}));
    render(<CustomerReviews />);
    expect(screen.getByText('Memuat...')).toBeInTheDocument();
  });

  it('shows reviews when loaded', async () => {
    mockGet.mockResolvedValueOnce([
      { id: 'r1', rating: 5, review: 'Excellent!', createdAt: '2026-07-15' },
    ]);
    render(<CustomerReviews />);
    expect(await screen.findByText('5/5')).toBeInTheDocument();
    expect(screen.getByText('Excellent!')).toBeInTheDocument();
    expect(screen.getByText('Tulis Ulasan')).toBeInTheDocument();
  });

  it('shows empty state', async () => {
    mockGet.mockResolvedValueOnce([]);
    render(<CustomerReviews />);
    expect(await screen.findByText('Belum ada ulasan')).toBeInTheDocument();
  });

  it('opens create modal with order select', async () => {
    const user = userEvent.setup();
    mockGet.mockResolvedValueOnce([]);
    mockGet.mockResolvedValueOnce([{ id: 'o1', bookingNumber: 'SP-001', status: 'Completed' }]);
    render(<CustomerReviews />);
    const btn = await screen.findByText('Tulis Ulasan');
    await user.click(btn);
    expect(await screen.findByTestId('modal')).toBeInTheDocument();
    expect(await screen.findByText('SP-001 - Completed')).toBeInTheDocument();
    expect(screen.getByText('Rating')).toBeInTheDocument();
  });

  it('shows Kirim Ulasan button in modal', async () => {
    const user = userEvent.setup();
    mockGet.mockResolvedValueOnce([]);
    mockGet.mockResolvedValueOnce([]);
    render(<CustomerReviews />);
    const btn = await screen.findByText('Tulis Ulasan');
    await user.click(btn);
    expect(await screen.findByText('Kirim Ulasan')).toBeInTheDocument();
  });
});
