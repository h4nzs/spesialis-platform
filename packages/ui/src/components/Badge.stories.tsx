import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from './Badge';

const meta = {
  title: 'DataDisplay/Badge',
  component: Badge,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'success', 'warning', 'danger', 'info'],
    },
  },
  args: {
    children: 'Label',
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { children: 'Default' },
};

export const Success: Story = {
  args: { variant: 'success', children: 'Selesai' },
};

export const Warning: Story = {
  args: { variant: 'warning', children: 'Pending' },
};

export const Danger: Story = {
  args: { variant: 'danger', children: 'Gagal' },
};

export const Info: Story = {
  args: { variant: 'info', children: 'Info' },
};
