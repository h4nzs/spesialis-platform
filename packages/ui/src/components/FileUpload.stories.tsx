import type { Meta, StoryObj } from '@storybook/react';
import { FileUpload } from './FileUpload';

const meta = {
  title: 'Form/FileUpload',
  component: FileUpload,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    accept: { control: 'text' },
    maxSizeMB: { control: 'number' },
    multiple: { control: 'boolean' },
    label: { control: 'text' },
    error: { control: 'text' },
  },
  args: {
    label: 'Upload Foto',
  },
} satisfies Meta<typeof FileUpload>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithError: Story = {
  args: { error: 'Ukuran file maksimal 10MB' },
};

export const MultipleFiles: Story = {
  args: {
    label: 'Upload Dokumentasi',
    multiple: true,
    accept: 'image/*,.pdf',
  },
};
