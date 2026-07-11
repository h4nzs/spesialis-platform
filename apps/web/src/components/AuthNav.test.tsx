import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AuthNav } from './AuthNav';

vi.mock('@ahlipanggilan/ui', () => ({}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('AuthNav', () => {
  it('shows login/register when no user', () => {
    const { container } = render(<AuthNav />);
    expect(container.textContent).toContain('Masuk');
    expect(container.textContent).toContain('Daftar');
  });

  it('shows dashboard link for customer role', () => {
    render(<AuthNav initialAuth={{ userId: 'u1', userEmail: 'a@b.com', userRole: 'customer' }} />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toHaveAttribute('href', '/dashboard/customer');
  });

  it('shows admin panel for admin role', () => {
    render(<AuthNav initialAuth={{ userId: 'u1', userEmail: 'a@b.com', userRole: 'admin' }} />);
    expect(screen.getByText('Admin Panel')).toBeInTheDocument();
    expect(screen.getByText('Admin Panel')).toHaveAttribute('href', '/dashboard/admin');
  });

  it('shows dashboard link for partner role', () => {
    render(<AuthNav initialAuth={{ userId: 'u1', userEmail: 'a@b.com', userRole: 'partner' }} />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toHaveAttribute('href', '/dashboard/partner');
  });

  it('shows admin panel for super_admin role', () => {
    render(
      <AuthNav initialAuth={{ userId: 'u1', userEmail: 'a@b.com', userRole: 'super_admin' }} />,
    );
    expect(screen.getByText('Admin Panel')).toBeInTheDocument();
    expect(screen.getByText('Admin Panel')).toHaveAttribute('href', '/dashboard/admin');
  });
});
