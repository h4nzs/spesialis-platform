import type { Meta, StoryObj } from '@storybook/react';
import { Section } from './Section';

const meta = {
  title: 'Layout/Section',
  component: Section,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['default', 'alternate', 'brand'] },
    padding: { control: 'select', options: ['none', 'sm', 'md', 'lg'] },
    title: { control: 'text' },
    description: { control: 'text' },
  },
  args: {
    children: (
      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: 3 }, (_, i) => (
          <div
            key={i}
            className="rounded-lg border border-border-default bg-bg-surface p-4 text-center text-body-sm text-text-secondary"
          >
            Konten {i + 1}
          </div>
        ))}
      </div>
    ),
  },
} satisfies Meta<typeof Section>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Layanan Kami',
    description: 'Pilih layanan profesional yang sesuai dengan kebutuhan Anda.',
  },
};

export const Alternate: Story = {
  args: {
    variant: 'alternate',
    title: 'Mengapa Memilih Kami',
  },
};

export const Brand: Story = {
  args: {
    variant: 'brand',
    title: 'Mulai Sekarang',
    description: 'Daftar dan temukan mitra terbaik untuk kebutuhan Anda.',
    children: (
      <div className="flex justify-center gap-4">
        <span className="inline-flex items-center rounded-lg bg-white/20 px-6 py-3 text-body-sm font-medium text-white">
          Daftar Mitra
        </span>
        <span className="inline-flex items-center rounded-lg bg-white px-6 py-3 text-body-sm font-medium text-primary">
          Hubungi Kami
        </span>
      </div>
    ),
  },
};

export const WithoutHeader: Story = {
  args: {
    children: (
      <div className="rounded-xl border border-border-default bg-bg-surface p-6 text-center text-body-sm text-text-secondary">
        Section tanpa title atau description.
      </div>
    ),
  },
};
