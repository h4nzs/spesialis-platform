import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AuthNav } from './AuthNav';

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
});

function mockFetchResponse(data: unknown) {
  return vi.spyOn(global, 'fetch').mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({ data: { user: data } }),
  } as Response);
}

describe('AuthNav', () => {
  it('shows login/register when no token', () => {
    render(<AuthNav />);
    expect(screen.getByText('Masuk')).toBeInTheDocument();
    expect(screen.getByText('Daftar')).toBeInTheDocument();
  });

  it('shows dashboard link when token exists and user loaded', async () => {
    localStorage.setItem('spesialis_access_token', 'token-123');
    mockFetchResponse({ role: 'customer' });
    render(<AuthNav />);
    expect(await screen.findByText('Dashboard')).toBeInTheDocument();
  });

  it('shows login/register when token exists but API fails', async () => {
    localStorage.setItem('spesialis_access_token', 'token-123');
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('API error')) as unknown as typeof fetch;
    render(<AuthNav />);
    expect(await screen.findByText('Masuk')).toBeInTheDocument();
  });

  it('links dashboard to correct URL per role', async () => {
    localStorage.setItem('spesialis_access_token', 'token-123');
    mockFetchResponse({ role: 'admin' });
    render(<AuthNav />);
    const link = await screen.findByText('Dashboard');
    expect(link).toHaveAttribute('href', '/dashboard/admin');
  });
});
