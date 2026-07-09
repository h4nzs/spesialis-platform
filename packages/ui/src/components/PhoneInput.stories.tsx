import type { Meta, StoryObj } from '@storybook/react';
import { PhoneInput } from './PhoneInput';

const meta = {
  title: 'Form/PhoneInput',
  component: PhoneInput,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text' },
    placeholder: { control: 'text' },
    disabled: { control: 'boolean' },
    error: { control: 'text' },
  },
  args: {
    label: 'No. HP',
    placeholder: '81234567890',
  },
} satisfies Meta<typeof PhoneInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithValue: Story = {
  args: { value: '81234567890' },
};

export const WithError: Story = {
  args: {
    value: '123',
    error: 'Nomor HP tidak valid',
  },
};

export const Disabled: Story = {
  args: { disabled: true, value: '81234567890' },
};
