import type { Meta, StoryObj } from '@storybook/react';
import { Pagination } from './Pagination';

const meta = {
  title: 'Navigation/Pagination',
  component: Pagination,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    page: { control: { type: 'number', min: 1 } },
    totalPages: { control: { type: 'number', min: 1 } },
  },
} satisfies Meta<typeof Pagination>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FewPages: Story = {
  args: { page: 1, totalPages: 3, onPageChange: () => {} },
};

export const ManyPages: Story = {
  args: { page: 5, totalPages: 10, onPageChange: () => {} },
};

export const FirstPage: Story = {
  args: { page: 1, totalPages: 8, onPageChange: () => {} },
};

export const LastPage: Story = {
  args: { page: 8, totalPages: 8, onPageChange: () => {} },
};

export const MiddlePage: Story = {
  args: { page: 6, totalPages: 12, onPageChange: () => {} },
};

export const SinglePage: Story = {
  args: { page: 1, totalPages: 1, onPageChange: () => {} },
  parameters: {
    docs: {
      description: {
        story:
          'The component returns `null` when `totalPages <= 1`, so nothing renders. Pagination only appears when there are 2+ pages.',
      },
    },
  },
};
