import type { Meta, StoryObj } from '@storybook/react';
import { Text, Heading } from './Typography';
import { Divider } from './Divider';

const meta = {
  title: 'Typography/Text',
  component: Text,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['body-lg', 'body', 'body-sm', 'caption', 'overline', 'lead', 'code'],
    },
  },
  args: {
    variant: 'body',
    children: 'Standard body text for paragraphs and descriptions.',
  },
} satisfies Meta<typeof Text>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Body: Story = {
  args: { variant: 'body', children: 'Standard body text for paragraphs and descriptions.' },
};

export const BodyLarge: Story = {
  name: 'Body Large',
  args: { variant: 'body-lg', children: 'Larger body text for intro paragraphs.' },
};

export const BodySmall: Story = {
  name: 'Body Small',
  args: { variant: 'body-sm', children: 'Smaller body text for descriptions and metadata.' },
};

export const Caption: Story = {
  args: { variant: 'caption', children: '12 Jan 2026 · 3 menit lalu' },
};

export const Overline: Story = {
  args: { variant: 'overline', children: 'Kategori Layanan' },
};

export const Lead: Story = {
  args: { variant: 'lead', children: 'Temukan mitra terbaik untuk kebutuhan profesional Anda.' },
};

export const Code: Story = {
  args: { variant: 'code', children: 'npm install @ahlipanggilan/ui' },
};

export const FullScale: Story = {
  name: 'Full Scale',
  parameters: { layout: 'padded' },
  render: () => (
    <div className="space-y-3">
      <Heading level="h4">Text Scale</Heading>
      <Divider />
      <Text variant="body-lg">body-lg — Intro paragraph for landing sections</Text>
      <Text variant="body">body — Default body text for all pages</Text>
      <Text variant="body-sm">body-sm — Description, helper text</Text>
      <Text variant="caption">caption — Timestamps, metadata, small labels</Text>
      <Text variant="overline">OVERLINE — Category labels, uppercase</Text>
      <Text variant="lead">lead — Lead paragraph for articles</Text>
      <Text variant="code">code — Inline code snippets</Text>
    </div>
  ),
};
