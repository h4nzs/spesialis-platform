import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AuthGuard } from './AuthGuard';

describe('AuthGuard', () => {
  it('renders children when no requiredRole', () => {
    render(
      <AuthGuard>
        <p>Content</p>
      </AuthGuard>,
    );
    expect(screen.getByText('Content')).toBeInTheDocument();
    expect(screen.queryByText('Akses Ditolak')).not.toBeInTheDocument();
  });

  it('renders children when user has matching role', () => {
    render(
      <AuthGuard
        requiredRole="customer"
        initialUser={{ id: 'u1', email: 'test@test.com', role: 'customer' }}
      >
        <p>Customer Content</p>
      </AuthGuard>,
    );
    expect(screen.getByText('Customer Content')).toBeInTheDocument();
    expect(screen.queryByText('Akses Ditolak')).not.toBeInTheDocument();
  });

  it('renders children when user is super_admin regardless of requiredRole', () => {
    render(
      <AuthGuard
        requiredRole="partner"
        initialUser={{ id: 'u1', email: 'admin@test.com', role: 'super_admin' }}
      >
        <p>Admin Content</p>
      </AuthGuard>,
    );
    expect(screen.getByText('Admin Content')).toBeInTheDocument();
    expect(screen.queryByText('Akses Ditolak')).not.toBeInTheDocument();
  });

  it('shows access denied when role does not match', () => {
    render(
      <AuthGuard
        requiredRole="admin"
        initialUser={{ id: 'u1', email: 'user@test.com', role: 'customer' }}
      >
        <p>Admin Content</p>
      </AuthGuard>,
    );
    expect(screen.getByText('Akses Ditolak')).toBeInTheDocument();
    expect(screen.getByText('Anda tidak memiliki akses ke halaman ini')).toBeInTheDocument();
    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
  });

  it('shows access denied with link back to homepage', () => {
    render(
      <AuthGuard
        requiredRole="corporate"
        initialUser={{ id: 'u1', email: 'partner@test.com', role: 'partner' }}
      >
        <p>Corporate Content</p>
      </AuthGuard>,
    );
    expect(screen.getByText('Akses Ditolak')).toBeInTheDocument();
    const link = screen.getByText('Kembali ke Beranda');
    expect(link.closest('a')).toHaveAttribute('href', '/');
  });

  it('renders children when initialUser is undefined (SSR placeholder)', () => {
    render(
      <AuthGuard requiredRole="customer">
        <p>SSR Content</p>
      </AuthGuard>,
    );
    expect(screen.getByText('SSR Content')).toBeInTheDocument();
  });
});
