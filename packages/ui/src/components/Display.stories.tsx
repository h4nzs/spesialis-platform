import type { Meta, StoryObj } from '@storybook/react';
import { Display } from './Typography';

const meta = {
  title: 'Typography/Display',
  component: Display,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: ['xl', 'lg'] },
    as: { control: 'select', options: ['h1', 'h2', 'h3'] },
  },
  args: {
    size: 'xl',
    children: 'Layanan Profesional Tanpa Ribet',
  },
} satisfies Meta<typeof Display>;

export default meta;
type Story = StoryObj<typeof meta>;

export const XL: Story = {
  name: 'Display XL',
  args: {
    size: 'xl',
    children: 'Layanan Profesional Tanpa Ribet',
  },
};

export const LG: Story = {
  name: 'Display LG',
  args: {
    size: 'lg',
    as: 'h2',
    children: 'Mengapa Memilih Kami',
  },
};
