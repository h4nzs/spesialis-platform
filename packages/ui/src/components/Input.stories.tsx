import type { Meta, StoryObj } from '@storybook/react';
import { Input } from './Input';

const meta = {
  title: 'Form/Input',
  component: Input,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    type: { control: 'select', options: ['text', 'email', 'url', 'tel'] },
    placeholder: { control: 'text' },
    disabled: { control: 'boolean' },
    error: { control: 'text' },
    label: { control: 'text' },
  },
  args: {
    placeholder: 'Masukkan teks...',
    label: 'Nama Lengkap',
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithValue: Story = {
  args: { value: 'John Doe' },
};

export const WithError: Story = {
  args: {
    value: 'john',
    error: 'Nama lengkap harus diisi',
  },
};

export const Disabled: Story = {
  args: { disabled: true, value: 'John Doe' },
};

export const Email: Story = {
  args: { type: 'email', label: 'Email', placeholder: 'email@example.com' },
};

export const WithoutLabel: Story = {
  args: { label: undefined, placeholder: 'Cari...' },
};
