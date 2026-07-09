import type { Meta, StoryObj } from '@storybook/react';
import { DatePicker } from './DatePicker';

const meta = {
  title: 'Form/DatePicker',
  component: DatePicker,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text' },
    disabled: { control: 'boolean' },
    error: { control: 'text' },
  },
  args: {
    label: 'Tanggal Booking',
  },
} satisfies Meta<typeof DatePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithValue: Story = {
  args: { value: '2026-07-15' },
};

export const WithError: Story = {
  args: { error: 'Tanggal tidak boleh di masa lalu' },
};

export const Disabled: Story = {
  args: { disabled: true, value: '2026-07-15' },
};

export const MinMax: Story = {
  args: { label: 'Tanggal Mulai', min: '2026-07-01', max: '2026-12-31' },
};
