import type { Meta, StoryObj } from '@storybook/react';
import { Toast } from './Toast';

const meta = {
  title: 'Feedback/Toast',
  component: Toast,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Transient notification with auto-dismiss. Use `showToast()` for imperative usage.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['info', 'success', 'warning', 'danger'] },
    duration: { control: 'number' },
    dismissible: { control: 'boolean' },
  },
  args: {
    children: 'Notifikasi toast',
    duration: 0,
    dismissible: true,
    onDismiss: () => {},
  },
} satisfies Meta<typeof Toast>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Info: Story = {
  args: {
    variant: 'info',
    children: 'Pembayaran sedang diproses.',
  },
};

export const Success: Story = {
  args: {
    variant: 'success',
    children: 'Booking berhasil dibuat!',
  },
};

export const Warning: Story = {
  args: {
    variant: 'warning',
    children: 'Sisa kuota tinggal 2 kali lagi.',
  },
};

export const Danger: Story = {
  args: {
    variant: 'danger',
    children: 'Gagal memproses pembayaran.',
  },
};

export const NonDismissible: Story = {
  args: {
    dismissible: false,
    variant: 'info',
    children: 'Toast tanpa tombol tutup.',
  },
};
