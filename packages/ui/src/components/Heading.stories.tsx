import type { Meta, StoryObj } from '@storybook/react';
import { Heading } from './Typography';

const meta = {
  title: 'Typography/Heading',
  component: Heading,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    level: { control: 'select', options: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] },
  },
  args: {
    children: 'Judul Halaman',
  },
} satisfies Meta<typeof Heading>;

export default meta;
type Story = StoryObj<typeof meta>;

export const H1: Story = { args: { level: 'h1', children: 'Heading 1 — Judul Utama' } };
export const H2: Story = { args: { level: 'h2', children: 'Heading 2 — Sub Judul' } };
export const H3: Story = { args: { level: 'h3', children: 'Heading 3 — Section Title' } };
export const H4: Story = { args: { level: 'h4', children: 'Heading 4 — Card Title' } };
export const H5: Story = { args: { level: 'h5', children: 'Heading 5 — Sub Section' } };
export const H6: Story = { args: { level: 'h6', children: 'Heading 6 — Label' } };

export const FullScale: Story = {
  name: 'Full Scale',
  parameters: { layout: 'padded' },
  render: () => (
    <div className="space-y-4">
      <Heading level="h1">H1 — Layanan Profesional</Heading>
      <Heading level="h2">H2 — Mengapa Memilih Kami</Heading>
      <Heading level="h3">H3 — Keunggulan Kami</Heading>
      <Heading level="h4">H4 — Testimoni Pelanggan</Heading>
      <Heading level="h5">H5 — Kontak Kami</Heading>
      <Heading level="h6">H6 — Label Section</Heading>
    </div>
  ),
};
