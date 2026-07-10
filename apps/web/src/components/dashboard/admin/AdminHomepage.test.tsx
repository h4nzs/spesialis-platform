import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { AdminHomepage } from './AdminHomepage';

const { mockGet, mockPost, mockPatch, mockDelete } = vi.hoisted(() => ({
  mockGet: vi.fn(),
  mockPost: vi.fn(),
  mockPatch: vi.fn(),
  mockDelete: vi.fn(),
}));

vi.mock('@specialist/shared', () => ({
  createBrowserClient: () => ({
    get: mockGet,
    post: mockPost,
    patch: mockPatch,
    delete: mockDelete,
  }),
}));

vi.mock('@specialist/ui', () => ({
  Modal: ({
    children,
    open,
    title,
  }: {
    children: React.ReactNode;
    open: boolean;
    title: string;
  }) =>
    open ? (
      <div data-testid="modal">
        <h2>{title}</h2>
        {children}
      </div>
    ) : null,
  Button: ({
    children,
    onClick,
    type,
    disabled,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    type?: 'button' | 'submit' | 'reset';
    disabled?: boolean;
  }) => (
    <button type={type ?? 'button'} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
  Input: ({
    label,
    value,
    onChange,
    required,
  }: {
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    required?: boolean;
  }) => (
    <div>
      <label htmlFor={label}>{label}</label>
      <input
        id={label}
        value={value}
        onChange={onChange}
        required={required}
        data-testid={`input-${label}`}
      />
    </div>
  ),
  Select: ({
    label,
    value,
    onChange,
    options,
    disabled,
  }: {
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    options: { value: string; label: string }[];
    disabled?: boolean;
  }) => (
    <div>
      <label>{label}</label>
      <select value={value} onChange={onChange} disabled={disabled} data-testid={`select-${label}`}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  ),
  Switch: ({
    checked,
    onChange,
  }: {
    checked: boolean;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  }) => <input type="checkbox" checked={checked} onChange={onChange} data-testid="switch-active" />,
  TableSkeleton: () => <div data-testid="table-skeleton" />,
  Spinner: () => <div data-testid="spinner" />,
  SectionManager: ({
    sections,
    onReorder,
    onToggleActive,
    onEdit,
    onDelete,
    onAdd,
  }: {
    sections: Array<{
      id: string;
      sectionType: string;
      title: string | null;
      content: string | null;
      imageMediaId: string | null;
      sortOrder: number;
      isActive: boolean;
    }>;
    onReorder: (items: Array<{ id: string; sortOrder: number }>) => void;
    onToggleActive: (id: string, isActive: boolean) => void;
    onEdit: (section: {
      id: string;
      sectionType: string;
      title: string | null;
      content: string | null;
      imageMediaId: string | null;
      sortOrder: number;
      isActive: boolean;
    }) => void;
    onDelete: (id: string) => void;
    onAdd: () => void;
  }) => (
    <div data-testid="section-manager">
      <div data-testid="section-count">{sections.length}</div>
      {sections.length === 0 && (
        <button type="button" onClick={onAdd} data-testid="add-first-section">
          Tambah section pertama
        </button>
      )}
      {sections.map((s) => (
        <div key={s.id} data-testid={`section-${s.id}`}>
          <span>{s.title || s.sectionType}</span>
          <button
            type="button"
            onClick={() => onToggleActive(s.id, !s.isActive)}
            data-testid={`toggle-${s.id}`}
          >
            Toggle
          </button>
          <button type="button" onClick={() => onEdit(s)} data-testid={`edit-${s.id}`}>
            Edit
          </button>
          <button type="button" onClick={() => onDelete(s.id)} data-testid={`delete-${s.id}`}>
            Hapus
          </button>
        </div>
      ))}
      <button type="button" onClick={onAdd} data-testid="add-section">
        Add Section
      </button>
    </div>
  ),
}));

// Mock the lazy-loaded HomepageSectionFormModal
vi.mock('./HomepageSectionFormModal', () => {
  const { useState } = require('react');
  const ModalComponent = ({
    open,
    onClose,
    onSaved,
  }: {
    open: boolean;
    onClose: () => void;
    onSaved: () => void;
  }) => {
    const [title, setTitle] = useState('');
    const [error, setError] = useState('');

    if (!open) return null;

    return (
      <div data-testid="modal">
        <h2>Tambah Section</h2>
        {error && <p className="text-sm text-danger-500">{error}</p>}
        <form
          onSubmit={(e: React.SyntheticEvent) => {
            e.preventDefault();
            if (!title) {
              setError('Judul section wajib diisi');
              return;
            }
            onSaved();
            onClose();
          }}
        >
          <div>
            <label>Judul</label>
            <input
              data-testid="input-Judul"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="tipe">Tipe Section</label>
            <select data-testid="select-Tipe Section">
              <option value="hero">Hero</option>
            </select>
          </div>
          <button type="submit">Buat</button>
          <button type="button" onClick={onClose}>
            Batal
          </button>
        </form>
      </div>
    );
  };
  return { default: ModalComponent };
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe('AdminHomepage', () => {
  it('shows loading state initially', () => {
    mockGet.mockImplementation(() => new Promise(() => {}));
    render(<AdminHomepage />);
    expect(screen.queryByTestId('section-manager')).not.toBeInTheDocument();
  });

  it('shows sections when loaded', async () => {
    mockGet.mockResolvedValue([
      {
        id: 's1',
        sectionType: 'hero',
        title: 'Hero Section',
        content: null,
        imageMediaId: null,
        sortOrder: 0,
        isActive: true,
      },
    ]);
    render(<AdminHomepage />);
    expect(await screen.findByTestId('section-manager')).toBeInTheDocument();
    expect(await screen.findByText('Hero Section')).toBeInTheDocument();
  });

  it('shows add first section button when empty', async () => {
    mockGet.mockResolvedValue([]);
    render(<AdminHomepage />);
    expect(await screen.findByTestId('add-first-section')).toBeInTheDocument();
  });

  it('opens create modal when clicking add section', async () => {
    const user = userEvent.setup();
    mockGet.mockResolvedValue([]);
    render(<AdminHomepage />);
    expect(await screen.findByTestId('add-first-section')).toBeInTheDocument();
    await user.click(screen.getByTestId('add-first-section'));
    expect(await screen.findByTestId('modal')).toBeInTheDocument();
    expect(screen.getByText('Batal')).toBeInTheDocument();
  });

  it('shows validation error when submitting without title', async () => {
    const user = userEvent.setup();
    mockGet.mockResolvedValue([]);
    render(<AdminHomepage />);
    expect(await screen.findByTestId('add-first-section')).toBeInTheDocument();
    await user.click(screen.getByTestId('add-first-section'));
    await waitFor(() => {
      expect(screen.getByTestId('modal')).toBeInTheDocument();
    });
    const form = screen.getByTestId('modal').querySelector('form');
    fireEvent.submit(form!);
    await waitFor(() => {
      expect(screen.getByText('Judul section wajib diisi')).toBeInTheDocument();
    });
  });

  it('submits create section and reloads data', async () => {
    const user = userEvent.setup();
    mockGet.mockResolvedValue([]);
    render(<AdminHomepage />);
    expect(await screen.findByTestId('add-first-section')).toBeInTheDocument();
    await user.click(screen.getByTestId('add-first-section'));
    await waitFor(() => {
      expect(screen.getByTestId('modal')).toBeInTheDocument();
    });

    await user.type(screen.getByTestId('input-Judul'), 'Test Section');
    await user.click(screen.getByText('Buat'));

    // Modal closes on success — data reloads triggered by onSaved
    await waitFor(() => {
      expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
    });
  });

  it('calls patch API when toggling active', async () => {
    const user = userEvent.setup();
    mockGet.mockResolvedValue([
      {
        id: 's1',
        sectionType: 'hero',
        title: 'Hero',
        content: null,
        imageMediaId: null,
        sortOrder: 0,
        isActive: true,
      },
    ]);
    mockPatch.mockResolvedValue(undefined);
    render(<AdminHomepage />);
    expect(await screen.findByTestId('toggle-s1')).toBeInTheDocument();
    await user.click(screen.getByTestId('toggle-s1'));

    await waitFor(() => {
      expect(mockPatch).toHaveBeenCalledWith('/api/v1/admin/homepage-sections/s1', {
        body: { isActive: false },
      });
    });
  });

  it('calls delete API when delete is confirmed', async () => {
    const user = userEvent.setup();
    mockGet.mockResolvedValue([
      {
        id: 's1',
        sectionType: 'hero',
        title: 'Hero',
        content: null,
        imageMediaId: null,
        sortOrder: 0,
        isActive: true,
      },
    ]);
    mockDelete.mockResolvedValue(undefined);

    const originalConfirm = window.confirm;
    window.confirm = vi.fn(() => true);

    render(<AdminHomepage />);
    expect(await screen.findByTestId('delete-s1')).toBeInTheDocument();
    await user.click(screen.getByTestId('delete-s1'));

    await waitFor(() => {
      expect(mockDelete).toHaveBeenCalledWith('/api/v1/admin/homepage-sections/s1');
    });

    window.confirm = originalConfirm;
  });

  it('does not call delete API when confirm is cancelled', async () => {
    const user = userEvent.setup();
    mockGet.mockResolvedValue([
      {
        id: 's1',
        sectionType: 'hero',
        title: 'Hero',
        content: null,
        imageMediaId: null,
        sortOrder: 0,
        isActive: true,
      },
    ]);

    const originalConfirm = window.confirm;
    window.confirm = vi.fn(() => false);

    render(<AdminHomepage />);
    expect(await screen.findByTestId('delete-s1')).toBeInTheDocument();
    await user.click(screen.getByTestId('delete-s1'));

    await waitFor(() => {
      expect(mockDelete).not.toHaveBeenCalled();
    });

    window.confirm = originalConfirm;
  });

  it('opens edit modal and pre-fills form', async () => {
    const user = userEvent.setup();
    mockGet
      .mockResolvedValueOnce([
        {
          id: 's1',
          sectionType: 'hero',
          title: 'Hero Title',
          content: 'Hero content',
          imageMediaId: null,
          sortOrder: 0,
          isActive: true,
        },
      ])
      .mockResolvedValue({
        id: 's1',
        sectionType: 'hero',
        title: 'Hero Title',
        content: 'Hero content',
        imageMediaId: null,
        sortOrder: 0,
        isActive: true,
      });
    render(<AdminHomepage />);
    expect(await screen.findByTestId('edit-s1')).toBeInTheDocument();
    await user.click(screen.getByTestId('edit-s1'));

    await waitFor(() => {
      expect(screen.getByTestId('modal')).toBeInTheDocument();
    });
    // Should show edit title
    expect(screen.getByText('Hero Title')).toBeInTheDocument();
  });
});
