import type { Meta, StoryObj } from '@storybook/react';
import { Container } from './Container';

const meta = {
  title: 'Layout/Container',
  component: Container,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
  args: {
    children: (
      <div className="rounded-lg border border-dashed border-primary-300 bg-primary-50 p-8 text-center text-body-sm text-primary-700">
        Container content — this div is constrained to max-w-7xl with responsive padding.
      </div>
    ),
  },
} satisfies Meta<typeof Container>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
