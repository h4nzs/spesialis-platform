import { defineMiddleware } from 'astro/middleware';

export interface AuthLocals {
  userId: string;
  userEmail: string;
  userRole: string;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace App {
    interface Locals {
      auth?: AuthLocals | null;
    }
  }
}

export const onRequest = defineMiddleware(async ({ locals, request }, next) => {
  const cookieHeader = request.headers.get('cookie') ?? '';

  const token = extractCookie(cookieHeader, 'token');

  if (!token) {
    locals.auth = null;
    if (request.url.includes('/dashboard/')) {
      return Response.redirect(new URL('/login', request.url), 302);
    }
    return next();
  }

  try {
    const apiUrl = import.meta.env.PUBLIC_API_URL ?? 'http://localhost:3000';
    const response = await fetch(`${apiUrl}/api/v1/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      locals.auth = null;
      return next();
    }

    const json = (await response.json()) as {
      data: { id: string; email: string; role: string };
    };

    locals.auth = {
      userId: json.data.id,
      userEmail: json.data.email,
      userRole: json.data.role,
    };
  } catch {
    locals.auth = null;
  }

  return next();
});

function extractCookie(cookieHeader: string, name: string): string | null {
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}
