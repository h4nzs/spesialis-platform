import type { Meta, StoryObj } from '@storybook/react';
import { Skeleton } from './Skeleton';

const meta = {
  title: 'Feedback/Skeleton',
  component: Skeleton,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['text', 'heading', 'avatar', 'card', 'table', 'form', 'dashboard', 'hero'],
    },
  },
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Text: Story = {
  args: { variant: 'text', className: 'w-64' },
};

export const Heading: Story = {
  args: { variant: 'heading' },
};

export const Avatar: Story = {
  args: { variant: 'avatar' },
};

export const Card: Story = {
  args: { variant: 'card', className: 'w-80' },
};

export const TableRow: Story = {
  args: { variant: 'table', className: 'w-full max-w-xl' },
};

export const FormField: Story = {
  args: { variant: 'form', className: 'w-80' },
};

export const DashboardCard: Story = {
  args: { variant: 'dashboard', className: 'w-80' },
};

export const HeroSection: Story = {
  args: { variant: 'hero', className: 'w-full max-w-4xl' },
};
