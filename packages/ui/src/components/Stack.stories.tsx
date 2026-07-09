import type { Meta, StoryObj } from '@storybook/react';
import { Stack } from './Stack';

const meta = {
  title: 'Layout/Stack',
  component: Stack,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    direction: { control: 'select', options: ['vertical', 'horizontal'] },
    gap: { control: 'select', options: [0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16] },
    align: { control: 'select', options: ['start', 'center', 'end', 'stretch', 'baseline'] },
    justify: {
      control: 'select',
      options: ['start', 'center', 'end', 'between', 'around', 'evenly'],
    },
    wrap: { control: 'boolean' },
  },
} satisfies Meta<typeof Stack>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleBoxes = (count: number) =>
  Array.from({ length: count }, (_, i) => (
    <div key={i} className="rounded-md bg-primary-100 px-4 py-3 text-body-sm text-primary-700">
      Item {i + 1}
    </div>
  ));

export const Vertical: Story = {
  args: { direction: 'vertical', gap: 4, children: sampleBoxes(3) },
};

export const Horizontal: Story = {
  args: { direction: 'horizontal', gap: 4, children: sampleBoxes(3) },
};

export const Tight: Story = {
  args: { direction: 'vertical', gap: 1, children: sampleBoxes(3) },
};

export const WithAlignment: Story = {
  args: {
    direction: 'horizontal',
    gap: 6,
    align: 'center',
    justify: 'between',
    className: 'w-96',
    children: (
      <>
        <div className="rounded-md bg-primary-100 px-4 py-3 text-body-sm">Kiri</div>
        <div className="rounded-md bg-success-100 px-4 py-3 text-body-sm">Kanan</div>
      </>
    ),
  },
};
