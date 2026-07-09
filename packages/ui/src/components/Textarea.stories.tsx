import type { Meta, StoryObj } from '@storybook/react';
import { Textarea } from './Textarea';

const meta = {
  title: 'Form/Textarea',
  component: Textarea,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    placeholder: { control: 'text' },
    disabled: { control: 'boolean' },
    error: { control: 'text' },
    label: { control: 'text' },
    rows: { control: 'number' },
  },
  args: {
    placeholder: 'Tulis deskripsi...',
    label: 'Deskripsi',
  },
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithValue: Story = {
  args: {
    value:
      'Layanan ini sangat membantu. Teknisi datang tepat waktu dan menyelesaikan pekerjaan dengan baik.',
  },
};

export const WithError: Story = {
  args: {
    value: 'Pendek',
    error: 'Deskripsi minimal 20 karakter',
  },
};

export const Disabled: Story = {
  args: { disabled: true, value: 'Input tidak bisa diubah' },
};
