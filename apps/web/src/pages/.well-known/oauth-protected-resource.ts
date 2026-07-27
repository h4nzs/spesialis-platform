import type { APIRoute } from 'astro';

const SITE = 'https://ahlipanggilan.id';

/**
 * OAuth Protected Resource Metadata — RFC 9728 + WorkOS auth.md
 *
 * Describes the protected resources for agents to discover
 * how to obtain access tokens.
 * See: https://www.rfc-editor.org/rfc/rfc9728
 *      https://github.com/workos/auth.md
 */
export const GET: APIRoute = async () => {
  const metadata = {
    resource: `${SITE}/api/v1`,
    resource_name: 'Ahli Panggilan',
    resource_logo_uri: `${SITE}/logo-icon.png`,
    authorization_servers: [SITE],
    scopes_supported: [
      'openid',
      'profile',
      'email',
      'bookings:read',
      'bookings:write',
      'services:read',
      'services:write',
      'partners:read',
      'customers:read',
      'admin:read',
      'admin:write',
    ],
    bearer_methods_supported: ['header', 'cookie'],
    token_introspection_endpoint: `${SITE}/api/v1/auth/me`,
    resource_documentation: `${SITE}/auth.md`,
  };

  return new Response(JSON.stringify(metadata, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600',
      'Access-Control-Allow-Origin': '*',
    },
  });
};
