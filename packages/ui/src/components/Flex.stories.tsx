import type { Meta, StoryObj } from '@storybook/react';
import { Flex } from './Flex';

const meta = {
  title: 'Layout/Flex',
  component: Flex,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    direction: { control: 'select', options: ['row', 'row-reverse', 'col', 'col-reverse'] },
    align: { control: 'select', options: ['start', 'center', 'end', 'stretch', 'baseline'] },
    justify: {
      control: 'select',
      options: ['start', 'center', 'end', 'between', 'around', 'evenly'],
    },
    gap: { control: 'select', options: [0, 1, 2, 3, 4, 5, 6, 8, 10, 12] },
    wrap: { control: 'select', options: ['true', 'wrap-reverse', 'nowrap'] },
  },
} satisfies Meta<typeof Flex>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleBox = (label: string, color: string) => (
  <div className={`rounded-md ${color} px-4 py-3 text-body-sm`}>{label}</div>
);

export const Row: Story = {
  args: {
    direction: 'row',
    gap: 4,
    children: (
      <>
        {sampleBox('Satu', 'bg-primary-100 text-primary-700')}
        {sampleBox('Dua', 'bg-success-100 text-success-700')}
        {sampleBox('Tiga', 'bg-warning-100 text-warning-700')}
      </>
    ),
  },
};

export const Column: Story = {
  args: {
    direction: 'col',
    gap: 3,
    children: (
      <>
        {sampleBox('Atas', 'bg-primary-100 text-primary-700')}
        {sampleBox('Tengah', 'bg-success-100 text-success-700')}
        {sampleBox('Bawah', 'bg-warning-100 text-warning-700')}
      </>
    ),
  },
};

export const SpaceBetween: Story = {
  args: {
    direction: 'row',
    justify: 'between',
    className: 'w-96',
    children: (
      <>
        {sampleBox('Kiri', 'bg-primary-100 text-primary-700')}
        {sampleBox('Kanan', 'bg-warning-100 text-warning-700')}
      </>
    ),
  },
};

export const Wrapped: Story = {
  args: {
    direction: 'row',
    gap: 2,
    wrap: true,
    className: 'w-48',
    children: (
      <>
        {sampleBox('Tag 1', 'bg-info-100 text-info-700')}
        {sampleBox('Tag 2', 'bg-info-100 text-info-700')}
        {sampleBox('Tag 3', 'bg-info-100 text-info-700')}
        {sampleBox('Tag Panjang', 'bg-info-100 text-info-700')}
        {sampleBox('Tag 5', 'bg-info-100 text-info-700')}
        {sampleBox('Tag 6', 'bg-info-100 text-info-700')}
      </>
    ),
  },
};
