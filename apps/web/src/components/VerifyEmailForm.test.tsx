import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { VerifyEmailForm } from './VerifyEmailForm';

const mockPost = vi.fn();

vi.mock('@specialist/shared', () => ({
  createBrowserClient: () => ({ post: mockPost }),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

const TOKEN = 'verify-token-123';

describe('VerifyEmailForm', () => {
  it('shows loading state initially', () => {
    mockPost.mockImplementation(() => new Promise(() => {}));
    render(<VerifyEmailForm token={TOKEN} />);
    expect(screen.getByText('Memverifikasi email...')).toBeInTheDocument();
  });

  it('shows success when verification succeeds', async () => {
    mockPost.mockResolvedValue(undefined);
    render(<VerifyEmailForm token={TOKEN} />);
    expect(await screen.findByText('Email Terverifikasi')).toBeInTheDocument();
    expect(await screen.findByText('Email berhasil diverifikasi!')).toBeInTheDocument();
  });

  it('shows error when verification fails', async () => {
    mockPost.mockRejectedValue(new Error('Invalid token'));
    render(<VerifyEmailForm token={TOKEN} />);
    expect(await screen.findByText('Verifikasi Gagal')).toBeInTheDocument();
    expect(
      await screen.findByText('Token verifikasi tidak valid atau sudah kadaluarsa.'),
    ).toBeInTheDocument();
  });

  it('calls API with token', () => {
    mockPost.mockImplementation(() => new Promise(() => {}));
    render(<VerifyEmailForm token={TOKEN} />);
    expect(mockPost).toHaveBeenCalledWith('/api/v1/auth/verify-email', {
      body: { token: TOKEN },
    });
  });
});
