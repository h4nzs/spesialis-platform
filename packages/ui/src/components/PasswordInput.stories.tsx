import type { Meta, StoryObj } from '@storybook/react';
import { PasswordInput } from './PasswordInput';

const meta = {
  title: 'Form/PasswordInput',
  component: PasswordInput,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text' },
    placeholder: { control: 'text' },
    disabled: { control: 'boolean' },
    error: { control: 'text' },
  },
  args: {
    label: 'Password',
    placeholder: 'Masukkan password',
  },
} satisfies Meta<typeof PasswordInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithValue: Story = {
  args: { value: 'secret123' },
};

export const WithError: Story = {
  args: {
    value: '123',
    error: 'Password minimal 8 karakter',
  },
};

export const Disabled: Story = {
  args: { disabled: true, value: 'secret123' },
};
