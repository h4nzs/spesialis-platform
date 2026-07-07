import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PartnerAvailability } from './PartnerAvailability';

const mockGet = vi.fn();
const mockPatch = vi.fn();

vi.mock('@specialist/shared', () => ({
  createBrowserClient: () => ({ get: mockGet, patch: mockPatch }),
}));

vi.mock('@specialist/ui', () => ({
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
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('PartnerAvailability', () => {
  it('shows loading state initially', () => {
    mockGet.mockImplementation(() => new Promise(() => {}));
    render(<PartnerAvailability />);
    expect(screen.getByText('Memuat...')).toBeInTheDocument();
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
