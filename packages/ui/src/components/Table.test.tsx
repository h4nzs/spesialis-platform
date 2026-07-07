import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Table } from './Table';

interface Item {
  id: string;
  name: string;
  price: number;
}

const columns = [
  { key: 'name', header: 'Nama' },
  { key: 'price', header: 'Harga' },
];

const data: Item[] = [
  { id: '1', name: 'AC Service', price: 150000 },
  { id: '2', name: 'Plumbing', price: 200000 },
];

describe('Table', () => {
  it('renders headers', () => {
    render(<Table columns={columns} data={data} keyExtractor={(i) => i.id} />);
    expect(screen.getByText('Nama')).toBeInTheDocument();
    expect(screen.getByText('Harga')).toBeInTheDocument();
  });

  it('renders data rows', () => {
    render(<Table columns={columns} data={data} keyExtractor={(i) => i.id} />);
    expect(screen.getByText('AC Service')).toBeInTheDocument();
    expect(screen.getByText('Plumbing')).toBeInTheDocument();
    expect(screen.getByText('150000')).toBeInTheDocument();
  });

  it('renders empty state when no data', () => {
    render(<Table columns={columns} data={[]} keyExtractor={(i) => i.id} />);
    expect(screen.getByText('Tidak ada data')).toBeInTheDocument();
  });

  it('renders custom empty message', () => {
    render(
      <Table
        columns={columns}
        data={[]}
        keyExtractor={(i) => i.id}
        emptyMessage="Belum ada data"
      />,
    );
    expect(screen.getByText('Belum ada data')).toBeInTheDocument();
  });

  it('renders without empty state when data exists', () => {
    render(<Table columns={columns} data={data} keyExtractor={(i) => i.id} />);
    expect(screen.queryByText('Tidak ada data')).not.toBeInTheDocument();
  });

  it('uses custom render function', () => {
    const cols = [
      { key: 'name', header: 'Nama', render: (item: Item) => <strong>{item.name}</strong> },
      { key: 'price', header: 'Harga' },
    ];
    render(<Table columns={cols} data={data} keyExtractor={(i) => i.id} />);
    expect(screen.getByText('AC Service').tagName).toBe('STRONG');
  });
});
