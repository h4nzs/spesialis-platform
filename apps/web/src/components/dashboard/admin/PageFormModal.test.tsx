import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import PageFormModal from './PageFormModal';

const { mockGet, mockPost, mockPatch } = vi.hoisted(() => ({
  mockGet: vi.fn(),
  mockPost: vi.fn(),
  mockPatch: vi.fn(),
}));

vi.mock('@specialist/shared', () => ({
  createBrowserClient: () => ({
    get: mockGet,
    post: mockPost,
    patch: mockPatch,
    delete: vi.fn(),
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
  }: {
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    options: { value: string; label: string }[];
  }) => (
    <div>
      <label>{label}</label>
      <select value={value} onChange={onChange} data-testid={`select-${label}`}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  ),
  RichTextEditor: () => <div data-testid="richtexteditor" />,
  SEOEditor: () => <div data-testid="seoeditor" />,
}));

const onClose = vi.fn();
const onSaved = vi.fn();

function renderModal(overrides: Partial<{ open: boolean; editingId: string | null }> = {}) {
  return render(
    <PageFormModal
      open={overrides.open ?? true}
      onClose={onClose}
      editingId={overrides.editingId ?? null}
      onSaved={onSaved}
    />,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('PageFormModal', () => {
  // ─── Create Mode ─────────────────────────────────────────────

  describe('create mode', () => {
    it('renders nothing when closed', () => {
      renderModal({ open: false });
      expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
    });

    it('renders create modal with correct title', () => {
      renderModal();
      expect(screen.getByTestId('modal')).toBeInTheDocument();
      expect(screen.getByText('Tambah Halaman')).toBeInTheDocument();
    });

    it('renders all required form fields', () => {
      renderModal();
      expect(screen.getByTestId('input-Judul')).toBeInTheDocument();
      expect(screen.getByTestId('input-Slug')).toBeInTheDocument();
      expect(screen.getByTestId('select-Status')).toBeInTheDocument();
      expect(screen.getByTestId('richtexteditor')).toBeInTheDocument();
      expect(screen.getByTestId('seoeditor')).toBeInTheDocument();
    });

    it('shows validation error on empty submit', async () => {
      renderModal();

      const form = screen.getByTestId('modal').querySelector('form');
      fireEvent.submit(form!);

      expect(screen.getByText('Judul dan slug wajib diisi')).toBeInTheDocument();
    });

    it('calls POST API and fires callbacks on valid submit', async () => {
      const user = userEvent.setup();
      mockPost.mockResolvedValue(undefined);
      renderModal();

      const titleInput = screen.getByTestId('input-Judul');
      const slugInput = screen.getByTestId('input-Slug');
      await user.type(titleInput, 'About Us');
      await user.type(slugInput, 'tentang-kami');

      await user.click(screen.getByText('Buat'));

      await waitFor(() => {
        expect(mockPost).toHaveBeenCalledWith('/api/v1/admin/cms-pages', {
          body: expect.objectContaining({
            title: 'About Us',
            slug: 'tentang-kami',
            status: 'Published',
          }),
        });
      });

      expect(onClose).toHaveBeenCalledOnce();
      expect(onSaved).toHaveBeenCalledOnce();
    });

    it('shows error message on API failure', async () => {
      const user = userEvent.setup();
      mockPost.mockRejectedValue(new Error('API Error'));
      renderModal();

      const titleInput = screen.getByTestId('input-Judul');
      const slugInput = screen.getByTestId('input-Slug');
      await user.type(titleInput, 'About Us');
      await user.type(slugInput, 'tentang-kami');

      await user.click(screen.getByText('Buat'));

      await waitFor(() => {
        expect(screen.getByText('API Error')).toBeInTheDocument();
      });
    });

    it('calls onClose when Batal is clicked', async () => {
      const user = userEvent.setup();
      renderModal();

      await user.click(screen.getByText('Batal'));
      expect(onClose).toHaveBeenCalledOnce();
    });

    it('defaults status to Published', () => {
      renderModal();
      const select = screen.getByTestId('select-Status') as HTMLSelectElement;
      expect(select.value).toBe('Published');
    });
  });

  // ─── Edit Mode ───────────────────────────────────────────────

  describe('edit mode', () => {
    const pageDetail = {
      title: 'About Us',
      slug: 'tentang-kami',
      content: '<p>About content</p>',
      status: 'Published',
      meta: {
        seo: {
          metaTitle: 'Tentang Kami - Spesialis',
          metaDescription: 'Pelajari tentang Spesialis',
          ogTitle: '',
          ogDescription: '',
          ogImage: '',
          canonicalUrl: '',
          robots: 'index, follow',
        },
      },
    };

    it('renders edit modal with correct title', () => {
      mockGet.mockResolvedValue(pageDetail);
      renderModal({ editingId: 'p1' });

      expect(screen.getByText('Edit Halaman')).toBeInTheDocument();
    });

    it('fetches and pre-fills form on mount', async () => {
      mockGet.mockResolvedValue(pageDetail);
      renderModal({ editingId: 'p1' });

      await waitFor(() => {
        expect(mockGet).toHaveBeenCalledWith('/api/v1/admin/cms-pages/p1');
      });

      const titleInput = screen.getByTestId('input-Judul') as HTMLInputElement;
      await waitFor(() => {
        expect(titleInput.value).toBe('About Us');
      });
    });

    it('shows error when detail fetch fails', async () => {
      mockGet.mockRejectedValue(new Error('Not found'));
      renderModal({ editingId: 'p1' });

      await waitFor(() => {
        expect(screen.getByText('Gagal memuat detail halaman')).toBeInTheDocument();
      });
    });

    it('calls PATCH API on edit submit', async () => {
      const user = userEvent.setup();
      mockGet.mockResolvedValue(pageDetail);
      mockPatch.mockResolvedValue(undefined);
      renderModal({ editingId: 'p1' });

      await waitFor(() => {
        expect(screen.getByText('Simpan')).toBeInTheDocument();
      });

      const titleInput = screen.getByTestId('input-Judul');
      await user.clear(titleInput);
      await user.type(titleInput, 'Updated Page');

      await user.click(screen.getByText('Simpan'));

      await waitFor(() => {
        expect(mockPatch).toHaveBeenCalledWith('/api/v1/admin/cms-pages/p1', {
          body: expect.objectContaining({
            title: 'Updated Page',
            slug: 'tentang-kami',
          }),
        });
      });

      expect(onClose).toHaveBeenCalledOnce();
      expect(onSaved).toHaveBeenCalledOnce();
    });

    it('restores empty form when opening create after edit', async () => {
      mockGet.mockResolvedValue(pageDetail);
      const { rerender } = render(
        <PageFormModal open={true} onClose={onClose} editingId="p1" onSaved={onSaved} />,
      );

      await waitFor(() => {
        expect(screen.getByText('Simpan')).toBeInTheDocument();
      });

      // Re-render with create mode
      mockGet.mockReset();
      rerender(<PageFormModal open={true} onClose={onClose} editingId={null} onSaved={onSaved} />);

      await waitFor(() => {
        expect(screen.getByText('Buat')).toBeInTheDocument();
      });

      const titleInput = screen.getByTestId('input-Judul') as HTMLInputElement;
      expect(titleInput.value).toBe('');
    });
  });
});
