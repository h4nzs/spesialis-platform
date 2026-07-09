import type { Meta, StoryObj } from '@storybook/react';
import { ConfirmDialog } from './ConfirmDialog';

const meta = {
  title: 'Feedback/ConfirmDialog',
  component: ConfirmDialog,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Confirmation dialog with backdrop, portal rendering, and loading state for async actions.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    confirmVariant: { control: 'select', options: ['primary', 'danger'] },
    loading: { control: 'boolean' },
  },
  args: {
    open: true,
    title: 'Konfirmasi',
    children: 'Apakah Anda yakin ingin melanjutkan?',
    confirmLabel: 'Konfirmasi',
    cancelLabel: 'Batal',
    onConfirm: () => {},
    onCancel: () => {},
  },
} satisfies Meta<typeof ConfirmDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const DangerConfirm: Story = {
  args: {
    title: 'Hapus Data',
    children: 'Data ini akan dihapus secara permanen. Tindakan ini tidak dapat dibatalkan.',
    confirmLabel: 'Hapus',
    confirmVariant: 'danger',
  },
};

export const Loading: Story = {
  args: {
    title: 'Memproses...',
    children: 'Mohon tunggu sebentar.',
    confirmLabel: 'Simpan',
    loading: true,
  },
};

export const LongText: Story = {
  args: {
    title: 'Booking Ulang',
    children:
      'Apakah Anda yakin ingin melakukan booking ulang untuk layanan ini? Jadwal yang sudah ada akan dibatalkan dan diganti dengan jadwal baru. Pastikan Anda telah menghubungi mitra terkait sebelum melanjutkan.',
    confirmLabel: 'Ya, Booking Ulang',
  },
};
