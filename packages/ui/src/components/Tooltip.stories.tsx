import type { Meta, StoryObj } from '@storybook/react';
import { Tooltip } from './Tooltip';

const meta = {
  title: 'DataDisplay/Tooltip',
  component: Tooltip,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    position: { control: 'select', options: ['top', 'bottom', 'left', 'right'] },
    content: { control: 'text' },
  },
  args: {
    content: 'Informasi detail',
    children: (
      <span className="inline-flex rounded-md bg-primary-100 px-4 py-2 text-body-sm text-primary-700 cursor-default">
        Hover saya
      </span>
    ),
  },
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Top: Story = {
  args: { position: 'top', content: 'Tooltip di atas' },
};

export const Bottom: Story = {
  args: { position: 'bottom', content: 'Tooltip di bawah' },
};

export const Left: Story = {
  args: { position: 'left', content: 'Tooltip di kiri' },
};

export const Right: Story = {
  args: { position: 'right', content: 'Tooltip di kanan' },
};

export const LongText: Story = {
  args: {
    position: 'top',
    content: 'Ini adalah tooltip dengan teks yang lebih panjang untuk demonstrasi',
  },
};
