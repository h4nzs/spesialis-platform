import { createBrowserClient, type ApiClient } from '@specialist/shared';

let clientInstance: ApiClient | null = null;

export function getApiClient(): ApiClient {
  if (!clientInstance) {
    clientInstance = createBrowserClient();
  }
  return clientInstance;
}

const ROLE_DASHBOARD: Record<string, string> = {
  customer: '/dashboard/customer',
  partner: '/dashboard/partner',
  corporate: '/dashboard/corporate',
  admin: '/dashboard/admin',
  super_admin: '/dashboard/admin',
  dispatcher: '/dashboard/admin',
  finance: '/dashboard/admin',
  content_manager: '/dashboard/admin',
};

export function redirectToDashboard(role?: string): void {
  const path = role ? ROLE_DASHBOARD[role] : '/';
  window.location.href = path ?? '/';
}

export function redirectToLogin(): void {
  window.location.href = '/login';
}

export async function forceLogout(): Promise<void> {
  try {
    const api = getApiClient();
    await api.post('/api/v1/auth/logout');
  } catch {
    // ignore — proceed to redirect
  }
  window.location.href = '/login';
}
