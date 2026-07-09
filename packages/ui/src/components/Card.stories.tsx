import type { Meta, StoryObj } from '@storybook/react';
import { Card } from './Card';

const meta = {
  title: 'Layout/Card',
  component: Card,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    padding: { control: 'select', options: ['sm', 'md', 'lg'] },
  },
  args: {
    children: 'Card content',
    className: 'w-80',
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const SmallPadding: Story = {
  args: { padding: 'sm', children: 'Compact card with small padding.' },
};

export const LargePadding: Story = {
  args: { padding: 'lg', children: 'Spacious card with large padding.' },
};

export const WithCustomContent: Story = {
  args: {
    children: (
      <div className="space-y-3">
        <h3 className="text-h5 text-text-primary">Judul Card</h3>
        <p className="text-body-sm text-text-secondary">
          Deskripsi card dengan konten yang lebih kompleks.
        </p>
        <div className="flex gap-2">
          <span className="inline-flex items-center rounded-full bg-primary-50 px-2 py-0.5 text-caption text-primary-700">
            Label 1
          </span>
          <span className="inline-flex items-center rounded-full bg-success-50 px-2 py-0.5 text-caption text-success-700">
            Label 2
          </span>
        </div>
      </div>
    ),
  },
};
