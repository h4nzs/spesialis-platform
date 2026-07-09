import type { Meta, StoryObj } from '@storybook/react';
import { TableSkeleton } from './TableSkeleton';

const meta = {
  title: 'Feedback/TableSkeleton',
  component: TableSkeleton,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Reusable table loading skeleton that replaced the duplicated toolbar + row skeleton block across 15+ dashboard components.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    rows: { control: { type: 'number', min: 1, max: 20 } },
    showToolbar: { control: 'boolean' },
  },
} satisfies Meta<typeof TableSkeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const FiveRows: Story = {
  args: { rows: 5 },
};

export const WithoutToolbar: Story = {
  args: { showToolbar: false },
};

export const SingleRow: Story = {
  args: { rows: 1, showToolbar: false },
};
