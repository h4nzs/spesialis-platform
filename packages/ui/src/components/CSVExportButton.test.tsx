import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CSVExportButton } from './CSVExportButton';

const mockDownloadCSV = vi.hoisted(() => vi.fn());

vi.mock('@ahlipanggilan/shared', () => ({
  downloadCSV: mockDownloadCSV,
}));

const SAMPLE_DATA = [
  { name: 'John', email: 'john@test.com', score: '85' },
  { name: 'Jane', email: 'jane@test.com', score: '92' },
];

const SAMPLE_COLUMNS = [
  { key: 'name' as const, label: 'Nama' },
  { key: 'email' as const, label: 'Email' },
  { key: 'score' as const, label: 'Skor' },
];

describe('CSVExportButton', () => {
  beforeEach(() => {
    mockDownloadCSV.mockClear();
  });

  it('renders button with Export CSV text when data is not empty', () => {
    render(<CSVExportButton data={SAMPLE_DATA} columns={SAMPLE_COLUMNS} filename="test.csv" />);
    expect(screen.getByText('Export CSV')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('renders nothing when data is empty', () => {
    const { container } = render(
      <CSVExportButton data={[]} columns={SAMPLE_COLUMNS} filename="test.csv" />,
    );
    expect(container.textContent).toBe('');
  });

  it('calls downloadCSV with correct headers, rows, and filename on click', () => {
    render(<CSVExportButton data={SAMPLE_DATA} columns={SAMPLE_COLUMNS} filename="test.csv" />);

    fireEvent.click(screen.getByRole('button'));

    expect(mockDownloadCSV).toHaveBeenCalledTimes(1);
    expect(mockDownloadCSV).toHaveBeenCalledWith(
      ['Nama', 'Email', 'Skor'],
      [
        ['John', 'john@test.com', '85'],
        ['Jane', 'jane@test.com', '92'],
      ],
      'test.csv',
    );
  });

  it('uses format callbacks to transform cell values', () => {
    const columns = [
      { key: 'name' as const, label: 'Nama' },
      {
        key: 'score' as const,
        label: 'Skor',
        format: (v: unknown) => `Nilai: ${String(v)}`,
      },
    ];

    render(<CSVExportButton data={SAMPLE_DATA} columns={columns} filename="score.csv" />);

    fireEvent.click(screen.getByRole('button'));

    expect(mockDownloadCSV).toHaveBeenCalledWith(
      ['Nama', 'Skor'],
      [
        ['John', 'Nilai: 85'],
        ['Jane', 'Nilai: 92'],
      ],
      'score.csv',
    );
  });

  it('shows loading label when loading is true', () => {
    render(
      <CSVExportButton
        data={SAMPLE_DATA}
        columns={SAMPLE_COLUMNS}
        filename="test.csv"
        loading={true}
        loadingLabel="Mengexport..."
      />,
    );

    expect(screen.getByText('Mengexport...')).toBeInTheDocument();
    expect(screen.queryByText('Export CSV')).not.toBeInTheDocument();
  });

  it('shows default loading label when loadingLabel is not provided', () => {
    render(
      <CSVExportButton
        data={SAMPLE_DATA}
        columns={SAMPLE_COLUMNS}
        filename="test.csv"
        loading={true}
      />,
    );

    expect(screen.getByText('Mengexport...')).toBeInTheDocument();
  });

  it('disables the button when disabled prop is true', () => {
    render(
      <CSVExportButton
        data={SAMPLE_DATA}
        columns={SAMPLE_COLUMNS}
        filename="test.csv"
        disabled={true}
      />,
    );

    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('does not call downloadCSV when disabled and clicked', () => {
    render(
      <CSVExportButton
        data={SAMPLE_DATA}
        columns={SAMPLE_COLUMNS}
        filename="test.csv"
        disabled={true}
      />,
    );

    fireEvent.click(screen.getByRole('button'));
    expect(mockDownloadCSV).not.toHaveBeenCalled();
  });

  it('uses custom onClick handler instead of default export when provided', () => {
    const customOnClick = vi.fn();

    render(
      <CSVExportButton
        data={SAMPLE_DATA}
        columns={SAMPLE_COLUMNS}
        filename="test.csv"
        onClick={customOnClick}
      />,
    );

    fireEvent.click(screen.getByRole('button'));

    expect(customOnClick).toHaveBeenCalledTimes(1);
    expect(mockDownloadCSV).not.toHaveBeenCalled();
  });

  it('uses custom onExport function when provided', () => {
    const customOnExport = vi.fn();

    render(
      <CSVExportButton
        data={SAMPLE_DATA}
        columns={SAMPLE_COLUMNS}
        filename="test.csv"
        onExport={customOnExport}
      />,
    );

    fireEvent.click(screen.getByRole('button'));

    expect(customOnExport).toHaveBeenCalledTimes(1);
    expect(customOnExport).toHaveBeenCalledWith(
      ['Nama', 'Email', 'Skor'],
      [
        ['John', 'john@test.com', '85'],
        ['Jane', 'jane@test.com', '92'],
      ],
      'test.csv',
    );
    expect(mockDownloadCSV).not.toHaveBeenCalled();
  });

  it('has aria-hidden on the SVG icon', () => {
    render(<CSVExportButton data={SAMPLE_DATA} columns={SAMPLE_COLUMNS} filename="test.csv" />);

    const svg = document.querySelector('svg');
    expect(svg).toHaveAttribute('aria-hidden', 'true');
  });

  it('handles null and undefined values gracefully', () => {
    const data = [{ name: 'John', phone: null, notes: undefined }] as Record<string, unknown>[];
    const columns = [
      { key: 'name' as const, label: 'Nama' },
      { key: 'phone' as const, label: 'Telepon' },
      { key: 'notes' as const, label: 'Catatan' },
    ];

    render(<CSVExportButton data={data} columns={columns} filename="test.csv" />);

    fireEvent.click(screen.getByRole('button'));

    expect(mockDownloadCSV).toHaveBeenCalledWith(
      ['Nama', 'Telepon', 'Catatan'],
      [['John', '', '']],
      'test.csv',
    );
  });
});
