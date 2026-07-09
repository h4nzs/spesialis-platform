import type { Meta, StoryObj } from '@storybook/react';
import { Switch } from './Switch';

const meta = {
  title: 'Form/Switch',
  component: Switch,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: ['sm', 'md'] },
    disabled: { control: 'boolean' },
    label: { control: 'text' },
    checked: { control: 'boolean' },
  },
  args: {
    label: 'Tersedia',
    onChange: () => {},
  },
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Off: Story = {
  args: { checked: false },
};

export const On: Story = {
  args: { checked: true },
};

export const Small: Story = {
  args: { size: 'sm', checked: true, label: 'Mode Ringkas' },
};

export const Disabled: Story = {
  args: { checked: false, disabled: true, label: 'Nonaktif' },
};

export const DisabledOn: Story = {
  args: { checked: true, disabled: true, label: 'Aktif (dinonaktifkan)' },
};

export const WithoutLabel: Story = {
  args: { label: undefined, checked: true },
};
