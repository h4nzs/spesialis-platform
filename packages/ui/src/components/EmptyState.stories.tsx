import type { Meta, StoryObj } from '@storybook/react';
import { EmptyState } from './EmptyState';
import { Button } from './Button';

const FOLDER_ICON =
  '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>';
const INBOX_ICON =
  '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>';
const SEARCH_ICON =
  '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>';

const meta = {
  title: 'Feedback/EmptyState',
  component: EmptyState,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text' },
    description: { control: 'text' },
  },
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    icon: FOLDER_ICON,
    title: 'Belum ada data',
    description: 'Belum ada data yang tersedia untuk ditampilkan.',
  },
};

export const WithAction: Story = {
  args: {
    icon: INBOX_ICON,
    title: 'Belum ada pesanan',
    description: 'Pesan layanan pertama Anda sekarang untuk mulai menggunakan spesialis.',
    action: <Button>Booking Sekarang</Button>,
  },
};

export const NoResults: Story = {
  args: {
    icon: SEARCH_ICON,
    title: 'Pencarian tidak ditemukan',
    description: 'Tidak ada hasil yang cocok dengan kata kunci Anda. Coba gunakan kata kunci lain.',
  },
};

export const WithoutIcon: Story = {
  args: {
    title: 'Coming Soon',
    description: 'Fitur ini akan segera tersedia.',
  },
};
