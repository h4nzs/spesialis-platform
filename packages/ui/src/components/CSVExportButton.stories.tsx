import type { Meta, StoryObj } from '@storybook/react';
import { CSVExportButton } from './CSVExportButton';

/**
 * Reusable CSV export button used across 16 dashboard components.
 *
 * - **Hidden** when `data` is empty — prevents exporting empty files.
 * - Builds CSV headers/rows from `columns` × `data` and calls `downloadCSV`.
 * - Supports custom `onClick`, `onExport`, loading, and disabled states.
 */
const meta = {
  title: 'DataExport/CSVExportButton',
  component: CSVExportButton,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A reusable button that exports table data to CSV. Replaces the duplicated `handleExportCSV` + button+SVG pattern previously found across 8+ dashboard components.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    disabled: {
      control: 'boolean',
      description: 'Disables the button and prevents export',
    },
    loading: {
      control: 'boolean',
      description: 'Shows loading label instead of "Export CSV"',
    },
    loadingLabel: {
      control: 'text',
      description: 'Custom label shown while loading (default: "Mengexport...")',
    },
    filename: {
      control: 'text',
      description: 'Output CSV filename (e.g. "users-export.csv")',
    },
  },
  args: {
    onClick: () => console.log('Custom onClick triggered'),
  },
} satisfies Meta<typeof CSVExportButton>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─── Sample Data ──────────────────────────────────────────────────────────

const sampleUsers: Record<string, unknown>[] = [
  { name: 'John Doe', email: 'john@example.com', role: 'admin', joinedAt: '2024-01-15' },
  { name: 'Jane Smith', email: 'jane@example.com', role: 'customer', joinedAt: '2024-03-22' },
  { name: 'Bob Johnson', email: 'bob@example.com', role: 'partner', joinedAt: '2024-06-10' },
];

const userColumns = [
  { key: 'name' as const, label: 'Nama' },
  { key: 'email' as const, label: 'Email' },
  { key: 'role' as const, label: 'Role' },
  { key: 'joinedAt' as const, label: 'Bergabung' },
];

// ─── Stories ───────────────────────────────────────────────────────────────

/**
 * Default state — renders as a small button with a download icon and "Export CSV" label.
 * The button is hidden automatically when `data` is empty.
 */
export const Default: Story = {
  args: {
    data: sampleUsers as Record<string, unknown>[],
    columns: userColumns,
    filename: 'users-export.csv',
  },
};

/**
 * When `data` is an empty array, the component returns `null` and renders nothing.
 * This prevents exporting empty CSV files.
 */
export const EmptyData: Story = {
  args: {
    data: [],
    columns: userColumns,
    filename: 'users-export.csv',
  },
  parameters: {
    docs: {
      description: {
        story:
          'The component returns `null` when `data.length === 0`, so nothing is rendered. Check the DOM — no button will appear.',
      },
    },
  },
};

/**
 * Loading state — shows "Mengexport..." text and disables interaction.
 * Useful for server-side export flows where the export takes time.
 */
export const Loading: Story = {
  args: {
    data: sampleUsers as Record<string, unknown>[],
    columns: userColumns,
    filename: 'users-export.csv',
    loading: true,
  },
};

/**
 * Custom loading label — overrides the default "Mengexport..." text.
 */
export const CustomLoadingLabel: Story = {
  args: {
    data: sampleUsers as Record<string, unknown>[],
    columns: userColumns,
    filename: 'users-export.csv',
    loading: true,
    loadingLabel: 'Exporting...',
  },
};

/**
 * Disabled state — the button appears muted and cannot be clicked.
 * Useful when a prerequisite (e.g., date range selection) is not yet satisfied.
 */
export const Disabled: Story = {
  args: {
    data: sampleUsers as Record<string, unknown>[],
    columns: userColumns,
    filename: 'users-export.csv',
    disabled: true,
  },
};

/**
 * With format callbacks — transforms cell values before export.
 * Here `role` is mapped to Indonesian labels and `joinedAt` is formatted as a locale date.
 */
const ROLE_LABELS: Record<string, string> = {
  admin: 'Admin',
  customer: 'Pelanggan',
  partner: 'Mitra',
  corporate: 'Perusahaan',
};

export const WithFormatCallbacks: Story = {
  args: {
    data: sampleUsers as Record<string, unknown>[],
    columns: [
      { key: 'name' as const, label: 'Nama' },
      { key: 'email' as const, label: 'Email' },
      {
        key: 'role' as const,
        label: 'Role',
        format: (v: unknown) => ROLE_LABELS[String(v)] ?? String(v),
      },
      {
        key: 'joinedAt' as const,
        label: 'Bergabung',
        format: (v: unknown) =>
          new Date(v as string).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }),
      },
    ],
    filename: 'users-export.csv',
  },
};

/**
 * Custom `onClick` handler — overrides the default export logic entirely.
 * Useful for server-side export flows (e.g., `AdminBookings`).
 */
export const CustomOnClick: Story = {
  args: {
    data: sampleUsers as Record<string, unknown>[],
    columns: userColumns,
    filename: 'users-export.csv',
    onClick: () => {
      console.log('Custom export triggered — would call API here');
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          'When `onClick` is provided, the default CSV building and `downloadCSV` call are skipped entirely. Useful for server-side streaming exports.',
      },
    },
  },
};

/**
 * Custom `onExport` function — receives the computed headers, rows, and filename.
 * This lets you send the CSV data to a custom destination (e.g., an API endpoint)
 * while keeping the header/row building logic from the component.
 */
export const CustomOnExport: Story = {
  args: {
    data: sampleUsers as Record<string, unknown>[],
    columns: userColumns,
    filename: 'users-export.csv',
    onExport: (headers, rows, filename) => {
      console.log('Custom export:', { headers, rows, filename });
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          '`onExport` receives the pre-built `headers`, `rows`, and `filename`. Use this to send data to an API instead of triggering a browser download.',
      },
    },
  },
};

/**
 * Null and undefined values — the component safely handles missing data
 * by converting null/undefined to empty strings.
 */
export const NullValues: Story = {
  args: {
    data: [
      { name: 'John', phone: null, notes: undefined },
      { name: 'Jane', phone: '08123456789', notes: 'Priority customer' },
    ] as Record<string, unknown>[],
    columns: [
      { key: 'name' as const, label: 'Nama' },
      { key: 'phone' as const, label: 'Telepon' },
      { key: 'notes' as const, label: 'Catatan' },
    ],
    filename: 'contacts-export.csv',
  },
};
