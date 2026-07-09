import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta = {
  title: 'Primitives/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Primary action button with 5 variants and 3 sizes. Used across the entire platform for CTAs, form submissions, and toolbar actions.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'outline', 'ghost', 'danger'],
      description: 'Visual style of the button',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Button size',
    },
    disabled: {
      control: 'boolean',
      description: 'Disables the button',
    },
    children: {
      control: 'text',
      description: 'Button content',
    },
  },
  args: {
    children: 'Simpan',
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Simpan',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Lihat Detail',
  },
};

export const Outline: Story = {
  args: {
    variant: 'outline',
    children: 'Batal',
  },
};

export const Ghost: Story = {
  args: {
    variant: 'ghost',
    children: 'Hapus',
  },
};

export const Danger: Story = {
  args: {
    variant: 'danger',
    children: 'Hapus Akun',
  },
};

export const Small: Story = {
  args: {
    size: 'sm',
    children: 'Edit',
  },
};

export const Large: Story = {
  args: {
    size: 'lg',
    children: 'Booking Sekarang',
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    children: 'Simpan',
  },
};

export const WithIcon: Story = {
  args: {
    children: (
      <>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M5 12h14" />
          <path d="M12 5v14" />
        </svg>
        Tambah Baru
      </>
    ),
  },
};
