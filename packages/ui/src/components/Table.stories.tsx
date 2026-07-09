import type { Meta, StoryObj } from '@storybook/react';
import { Table } from './Table';
import { Badge } from './Badge';

interface SampleUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
}

const meta = {
  title: 'DataDisplay/Table',
  component: Table<SampleUser>,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  argTypes: {
    emptyMessage: { control: 'text' },
  },
} satisfies Meta<typeof Table<SampleUser>>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleUsers: SampleUser[] = [
  { id: '1', name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'Aktif' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'Mitra', status: 'Aktif' },
  { id: '3', name: 'Bob Johnson', email: 'bob@example.com', role: 'Pelanggan', status: 'Nonaktif' },
  { id: '4', name: 'Alice Brown', email: 'alice@example.com', role: 'Mitra', status: 'Aktif' },
  { id: '5', name: 'Charlie Wilson', email: 'charlie@example.com', role: 'Admin', status: 'Aktif' },
];

const columns = [
  {
    key: 'name',
    header: 'Nama',
    render: (item: SampleUser) => (
      <span className="font-medium text-text-primary">{item.name}</span>
    ),
  },
  { key: 'email', header: 'Email' },
  { key: 'role', header: 'Role' },
  {
    key: 'status',
    header: 'Status',
    render: (item: SampleUser) => (
      <Badge variant={item.status === 'Aktif' ? 'success' : 'danger'}>{item.status}</Badge>
    ),
  },
];

export const Default: Story = {
  args: {
    data: sampleUsers,
    columns,
    keyExtractor: (item: SampleUser) => item.id,
  },
};

export const Empty: Story = {
  args: {
    data: [],
    columns,
    keyExtractor: (item: SampleUser) => item.id,
    emptyMessage: 'Tidak ada pengguna ditemukan',
  },
};

export const SingleRow: Story = {
  args: {
    data: [sampleUsers[0]],
    columns,
    keyExtractor: (item: SampleUser) => item.id,
  },
};
