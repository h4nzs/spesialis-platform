import type { APIRoute } from 'astro';

const SITE = 'https://ahlipanggilan.id';

/**
 * OAuth Authorization Server Metadata — RFC 8414
 *
 * Describes the authorization server for agents to discover
 * how to authenticate with the platform.
 * See: https://www.rfc-editor.org/rfc/rfc8414
 */
export const GET: APIRoute = async () => {
  const metadata = {
    issuer: SITE,
    authorization_endpoint: `${SITE}/login`,
    token_endpoint: `${SITE}/api/v1/auth/login`,
    refresh_endpoint: `${SITE}/api/v1/auth/refresh`,
    registration_endpoint: `${SITE}/register`,
    // JWKS not available — auth is JWT-based with symmetric signing (HMAC)
    // Custom agent_auth block per auth.md spec (WorkOS Auth.md)
    agent_auth: {
      register_uri: `${SITE}/register`,
      supported_identity_types: ['email_password', 'google_oauth'],
      credential_types: ['bearer_token', 'http_cookie'],
      token_revocation: {
        endpoint: `${SITE}/api/v1/auth/logout`,
        method: 'POST',
      },
      documentation_uri: `${SITE}/auth.md`,
      mcp_server_card: `${SITE}/.well-known/mcp/server-card.json`,
      agent_skills: `${SITE}/.well-known/agent-skills/index.json`,
    },
    token_endpoint_auth_methods_supported: ['client_secret_basic', 'private_key_jwt'],
    token_endpoint_auth_signing_alg_values_supported: ['RS256', 'ES256'],
    grant_types_supported: ['authorization_code', 'refresh_token', 'client_credentials'],
    response_types_supported: ['code', 'token'],
    scopes_supported: [
      'openid',
      'profile',
      'email',
      'bookings:read',
      'bookings:write',
      'services:read',
    ],
    claims_supported: ['sub', 'email', 'role', 'name'],
    code_challenge_methods_supported: ['S256'],
    service_documentation: `${SITE}/auth.md`,
    ui_locales_supported: ['id', 'en'],
    op_policy_uri: `${SITE}/kebijakan-privasi`,
    op_tos_uri: `${SITE}/syarat-ketentuan`,
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
