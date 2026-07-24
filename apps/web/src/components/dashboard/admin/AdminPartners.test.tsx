import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { AdminPartners } from './AdminPartners';

const mockGet = vi.fn();
const mockPost = vi.fn();

vi.mock('@ahlipanggilan/shared', () => ({
  createBrowserClient: () => ({ get: mockGet, post: mockPost }),
  SCHEMA_TEMPLATES: [],
}));

vi.mock('@ahlipanggilan/ui', () => ({
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
        <div key={i} data-testid="partner-row">
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
  EmptyState: ({ title, children }: { title?: string; children?: React.ReactNode }) => (
    <div>{title ?? children}</div>
  ),
  TableSkeleton: () => <div data-testid="table-skeleton" />,
  Card: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Grid: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Badge: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
  Modal: ({
    children,
    open,
    title,
  }: {
    children: React.ReactNode;
    open: boolean;
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
  Input: ({
    label,
    value,
    onChange,
    placeholder,
  }: {
    label?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
  }) => (
    <div>
      {label && <label>{label}</label>}
      <input
        value={value ?? ''}
        onChange={onChange}
        placeholder={placeholder}
        data-testid="input"
      />
    </div>
  ),
  Pagination: () => <div />,
  ConfirmDialog: () => null,
  Spinner: () => <div aria-hidden="true" />,
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('AdminPartners', () => {
  it('shows loading state initially', () => {
    mockGet.mockImplementation(() => new Promise(() => {}));
    render(<AdminPartners />);
    // Loading state renders skeleton shimmer (aria-hidden, no visible text)
    expect(screen.queryByText('Belum ada partner')).not.toBeInTheDocument();
  });

  it('shows partner list when loaded', async () => {
    mockGet.mockResolvedValue([
      {
        id: 'p1',
        fullName: 'Partner 1',
        availability: 'Available',
        verificationStatus: 'Approved',
        completedJobs: 15,
        ratingAverage: '4.5',
      },
    ]);
    render(<AdminPartners />);
    expect(await screen.findByText('Partner 1')).toBeInTheDocument();
  });

  it('shows Setujui and Tolak for Pending partners', async () => {
    mockGet.mockResolvedValue([
      {
        id: 'p2',
        fullName: 'Pending Partner',
        availability: 'Available',
        verificationStatus: 'Pending',
        completedJobs: 0,
        ratingAverage: null,
      },
    ]);
    render(<AdminPartners />);
    expect(await screen.findByText('Setujui')).toBeInTheDocument();
    expect(screen.getByText('Tolak')).toBeInTheDocument();
  });

  it('shows empty state', async () => {
    mockGet.mockResolvedValue([]);
    render(<AdminPartners />);
    expect(await screen.findByText('Belum ada partner')).toBeInTheDocument();
  });

  it('handles API error', async () => {
    mockGet.mockRejectedValue(new Error('Gagal'));
    render(<AdminPartners />);
    expect(await screen.findByText('Belum ada partner')).toBeInTheDocument();
  });

  it('calls post API when Setujui is clicked', async () => {
    mockGet.mockResolvedValue([
      {
        id: 'p1',
        fullName: 'Pending Partner',
        availability: 'Available',
        verificationStatus: 'Pending',
        completedJobs: 0,
        ratingAverage: null,
      },
    ]);
    mockPost.mockResolvedValue(undefined);
    render(<AdminPartners />);
    expect(await screen.findByText('Setujui')).toBeInTheDocument();
    screen.getByText('Setujui').click();
    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith('/api/v1/partners/p1/verify', {
        body: { verificationStatus: 'Approved' },
      });
    });
  });

  it('calls post API when Tolak is clicked and confirmed', async () => {
    mockGet.mockResolvedValue([
      {
        id: 'p2',
        fullName: 'Pending Partner 2',
        availability: 'Available',
        verificationStatus: 'Pending',
        completedJobs: 0,
        ratingAverage: null,
      },
    ]);
    mockPost.mockResolvedValue(undefined);
    render(<AdminPartners />);
    expect(await screen.findByText('Tolak')).toBeInTheDocument();
    screen.getByText('Tolak').click();
    // Tolak opens a reject modal; click the modal button to actually submit
    await waitFor(() => {
      expect(screen.getByText('Tolak Partner')).toBeInTheDocument();
    });
    screen.getByText('Tolak Partner').click();
    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith('/api/v1/partners/p2/verify', {
        body: { verificationStatus: 'Rejected', note: undefined },
      });
    });
  });
});
