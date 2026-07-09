import type { Meta, StoryObj } from '@storybook/react';
import { Select } from './Select';

const meta = {
  title: 'Form/Select',
  component: Select,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    disabled: { control: 'boolean' },
    error: { control: 'text' },
    label: { control: 'text' },
    placeholder: { control: 'text' },
  },
  args: {
    label: 'Kategori',
    placeholder: 'Pilih kategori',
    options: [
      { value: 'elektronik', label: 'Elektronik' },
      { value: 'kebersihan', label: 'Kebersihan' },
      { value: 'taman', label: 'Taman & Outdoor' },
      { value: 'renovasi', label: 'Renovasi' },
    ],
  },
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Selected: Story = {
  args: { value: 'kebersihan' },
};

export const WithError: Story = {
  args: { error: 'Kategori wajib dipilih' },
};

export const Disabled: Story = {
  args: { disabled: true, value: 'elektronik' },
};

export const ManyOptions: Story = {
  args: {
    options: [
      { value: '1', label: 'Jakarta Pusat' },
      { value: '2', label: 'Jakarta Selatan' },
      { value: '3', label: 'Jakarta Barat' },
      { value: '4', label: 'Jakarta Timur' },
      { value: '5', label: 'Jakarta Utara' },
      { value: '6', label: 'Bandung' },
      { value: '7', label: 'Surabaya' },
      { value: '8', label: 'Yogyakarta' },
      { value: '9', label: 'Bali' },
      { value: '10', label: 'Medan' },
    ],
  },
};
