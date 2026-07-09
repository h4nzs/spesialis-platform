import type { Meta, StoryObj } from '@storybook/react';
import { Avatar } from './Avatar';

const meta = {
  title: 'DataDisplay/Avatar',
  component: Avatar,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg', 'xl'] },
    src: { control: 'text' },
    alt: { control: 'text' },
    fallback: { control: 'text' },
  },
  args: {
    alt: 'John Doe',
  },
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Initials: Story = {
  args: { alt: 'Admin User' },
};

export const WithImage: Story = {
  args: {
    alt: 'John Doe',
    src: 'https://i.pravatar.cc/150?u=john',
  },
};

export const Small: Story = {
  args: { size: 'sm', alt: 'Small Avatar' },
};

export const Large: Story = {
  args: { size: 'lg', alt: 'Large Avatar' },
};

export const ExtraLarge: Story = {
  args: { size: 'xl', alt: 'Extra Large Avatar' },
};

export const CustomFallback: Story = {
  args: { alt: 'Partner Teknisi', fallback: 'PT' },
};

export const SingleInitial: Story = {
  args: { alt: 'Admin', size: 'lg' },
};
