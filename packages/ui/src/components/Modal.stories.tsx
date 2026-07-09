import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';

const meta = {
  title: 'Feedback/Modal',
  component: Modal,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Accessible modal dialog with focus trap, Escape key, backdrop click, and ARIA attributes.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    open: { control: 'boolean' },
    title: { control: 'text' },
  },
} satisfies Meta<typeof Modal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    open: true,
    title: 'Edit Layanan',
    children: (
      <p className="text-body text-text-secondary">Apakah Anda yakin ingin mengubah layanan ini?</p>
    ),
    footer: (
      <>
        <Button variant="outline">Batal</Button>
        <Button variant="primary">Simpan</Button>
      </>
    ),
    onClose: () => {},
  },
};

export const WithoutTitle: Story = {
  args: {
    open: true,
    children: <p className="text-body text-text-secondary">Modal tanpa judul — hanya konten.</p>,
    onClose: () => {},
  },
};

export const WithoutFooter: Story = {
  args: {
    open: true,
    title: 'Informasi',
    children: (
      <p className="text-body text-text-secondary">
        Modal tanpa footer — hanya konten body. Tutup dengan klik backdrop atau tombol X.
      </p>
    ),
    onClose: () => {},
  },
};

export const LongContent: Story = {
  args: {
    open: true,
    title: 'Syarat & Ketentuan',
    children: (
      <div className="space-y-3 text-body-sm text-text-secondary">
        {Array.from({ length: 8 }, (_, i) => (
          <p key={i}>
            {i + 1}. Dengan menggunakan layanan Spesialis, Anda menyetujui ketentuan berikut ini.
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.
          </p>
        ))}
      </div>
    ),
    footer: (
      <>
        <Button variant="outline">Tutup</Button>
        <Button variant="primary">Setuju</Button>
      </>
    ),
    onClose: () => {},
  },
};
