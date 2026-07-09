import type { Meta, StoryObj } from '@storybook/react';
import { SearchInput } from './SearchInput';

const meta = {
  title: 'Form/SearchInput',
  component: SearchInput,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    placeholder: { control: 'text' },
    disabled: { control: 'boolean' },
    error: { control: 'text' },
    clearable: { control: 'boolean' },
    label: { control: 'text' },
  },
  args: {
    placeholder: 'Cari layanan...',
  },
} satisfies Meta<typeof SearchInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithValue: Story = {
  args: { value: 'kebersihan', clearable: true, onClear: () => {} },
};

export const Clearable: Story = {
  args: { clearable: true, value: 'AC', onClear: () => {} },
};

export const WithError: Story = {
  args: { error: 'Pencarian terlalu pendek' },
};

export const WithLabel: Story = {
  args: { label: 'Cari Layanan' },
};
