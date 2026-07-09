import type { Meta, StoryObj } from '@storybook/react';
import { Alert } from './Alert';

const meta = {
  title: 'Feedback/Alert',
  component: Alert,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['info', 'success', 'warning', 'danger'] },
    dismissible: { control: 'boolean' },
    title: { control: 'text' },
  },
  args: {
    children: 'Operasi berhasil dilakukan.',
  },
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Info: Story = {
  args: {
    variant: 'info',
    title: 'Informasi',
    children: 'Pembayaran akan diproses dalam 1x24 jam.',
  },
};

export const Success: Story = {
  args: {
    variant: 'success',
    title: 'Berhasil',
    children: 'Booking layanan berhasil dikonfirmasi.',
  },
};

export const Warning: Story = {
  args: {
    variant: 'warning',
    title: 'Perhatian',
    children: 'Jadwal Anda akan berakhir dalam 2 jam.',
  },
};

export const Danger: Story = {
  args: {
    variant: 'danger',
    title: 'Gagal',
    children: 'Pembayaran tidak dapat diproses. Silakan coba lagi.',
  },
};

export const Dismissible: Story = {
  args: {
    variant: 'info',
    dismissible: true,
    children: 'Klik X untuk menutup alert ini.',
  },
};

export const WithoutTitle: Story = {
  args: {
    variant: 'success',
    children: 'Data berhasil disimpan.',
  },
};
