import type { Meta, StoryObj } from '@storybook/react';
import { NumberInput } from './NumberInput';

const meta = {
  title: 'Form/NumberInput',
  component: NumberInput,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text' },
    placeholder: { control: 'text' },
    disabled: { control: 'boolean' },
    error: { control: 'text' },
    min: { control: 'number' },
    max: { control: 'number' },
    step: { control: 'number' },
  },
  args: {
    label: 'Jumlah',
    placeholder: '0',
  },
} satisfies Meta<typeof NumberInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithValue: Story = {
  args: { value: 42, min: 0, max: 100 },
};

export const WithError: Story = {
  args: {
    value: -1,
    error: 'Nilai tidak boleh negatif',
  },
};

export const WithStep: Story = {
  args: { value: 2.5, step: 0.5, min: 0, max: 10 },
};

export const Disabled: Story = {
  args: { disabled: true, value: 10 },
};
