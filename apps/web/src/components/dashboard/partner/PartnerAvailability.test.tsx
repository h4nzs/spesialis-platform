import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PartnerAvailability } from './PartnerAvailability';

const mockGet = vi.fn();
const mockPatch = vi.fn();

vi.mock('@ahlipanggilan/shared', () => ({
  createBrowserClient: () => ({ get: mockGet, patch: mockPatch }),
  SCHEMA_TEMPLATES: [],
}));

vi.mock('@ahlipanggilan/ui', () => ({
  Card: ({
    children,
    className,
    padding: _padding,
  }: {
    children: React.ReactNode;
    className?: string;
    padding?: string;
  }) => <div className={className}>{children}</div>,
  Button: ({
    children,
    onClick,
    disabled,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
  }) => (
    <button onClick={onClick} disabled={disabled}>
      {children}
    </button>
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
      <select value={value} onChange={onChange}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  ),
  Skeleton: () => <div aria-hidden="true" />,
  TableSkeleton: () => <div data-testid="table-skeleton" />,
  Grid: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Badge: ({ children, ..._props }: { children: React.ReactNode; [key: string]: unknown }) => (
    <span>{children}</span>
  ),
  Modal: ({
    children,
    open,
    _onClose,
    title,
  }: {
    children: React.ReactNode;
    open: boolean;
    _onClose?: () => void;
    title?: string;
  }) =>
    open ? (
      <div data-testid="modal">
        {title ? <h2>{title}</h2> : null}
        {children}
      </div>
    ) : null,
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

beforeEach(() => {
  vi.clearAllMocks();
});

describe('PartnerAvailability', () => {
  it('shows loading state initially', () => {
    mockGet.mockImplementation(() => new Promise(() => {}));
    render(<PartnerAvailability />);
    // Loading state renders Skeleton components (aria-hidden, no visible text)
    // Data elements should not be present during loading
    expect(screen.queryByText('Simpan')).not.toBeInTheDocument();
  });

  it('shows availability select when loaded', async () => {
    mockGet.mockResolvedValue({ availability: 'Available' });
    render(<PartnerAvailability />);
    expect(await screen.findByText('Status Ketersediaan')).toBeInTheDocument();
    expect(screen.getByText('Simpan')).toBeInTheDocument();
  });

  it('defaults to Available on error', async () => {
    mockGet.mockRejectedValue(new Error('Gagal'));
    render(<PartnerAvailability />);
    expect(await screen.findByText('Simpan')).toBeInTheDocument();
    expect(screen.getByText('Status Ketersediaan')).toBeInTheDocument();
  });
});
