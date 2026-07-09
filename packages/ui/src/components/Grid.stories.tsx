import type { Meta, StoryObj } from '@storybook/react';
import { Grid } from './Grid';

const meta = {
  title: 'Layout/Grid',
  component: Grid,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  argTypes: {
    cols: { control: 'select', options: [1, 2, 3, 4, 5, 6, 12] },
    gap: { control: 'select', options: [0, 1, 2, 3, 4, 5, 6, 8, 10, 12] },
  },
} satisfies Meta<typeof Grid>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleCard = (label: string) => (
  <div className="rounded-lg border border-border-default bg-bg-surface p-4 text-center text-body-sm text-text-secondary">
    {label}
  </div>
);

const sampleCards = (count: number) =>
  Array.from({ length: count }, (_, i) => sampleCard(`Item ${i + 1}`));

export const SingleColumn: Story = {
  args: { cols: 1, gap: 4, children: sampleCards(3) },
};

export const TwoColumns: Story = {
  args: { cols: 2, gap: 4, children: sampleCards(4) },
};

export const ThreeColumns: Story = {
  args: { cols: 3, gap: 6, children: sampleCards(6) },
};

export const FourColumns: Story = {
  args: { cols: 4, gap: 4, children: sampleCards(8) },
};

export const SixColumns: Story = {
  args: { cols: 6, gap: 3, children: sampleCards(6) },
};
