import type { APIRoute } from 'astro';

const SITE = 'https://ahlipanggilan.id';

/**
 * OAuth Authorization Server Metadata — RFC 8414 + WorkOS auth.md
 *
 * Describes the authorization server for agents to discover
 * how to authenticate with the platform.
 * See: https://www.rfc-editor.org/rfc/rfc8414
 *      https://github.com/workos/auth.md
 */
export const GET: APIRoute = async () => {
  const metadata = {
    issuer: SITE,
    authorization_endpoint: `${SITE}/login`,
    token_endpoint: `${SITE}/api/v1/auth/login`,
    revocation_endpoint: `${SITE}/api/v1/auth/logout`,
    refresh_endpoint: `${SITE}/api/v1/auth/refresh`,
    registration_endpoint: `${SITE}/register`,

    // JWKS not available — auth is JWT-based with symmetric signing (HMAC)

    // ── agent_auth block (WorkOS auth.md spec) ────────────────
    // See: https://github.com/workos/auth.md
    agent_auth: {
      skill: `${SITE}/auth.md`,
      documentation_uri: `${SITE}/auth.md`,
      register_uri: `${SITE}/register`,
      claim_uri: `${SITE}/api/v1/auth/agent/claim`,
      revocation_uri: `${SITE}/api/v1/auth/logout`,
      identity_endpoint: `${SITE}/api/v1/auth/agent/identity`,
      claim_endpoint: `${SITE}/api/v1/auth/agent/claim`,
      events_endpoint: `${SITE}/api/v1/auth/agent/events`,
      credential_types_supported: ['access_token', 'refresh_token'],
      identity_types_supported: ['anonymous', 'identity_assertion', 'service_auth'],
      // Anonymous: credential-less registration flow
      anonymous: {
        credential_types_supported: ['temporary_token'],
        claim_uri: `${SITE}/api/v1/auth/agent/claim`,
      },
      // Identity assertion: ID-JAG + Verified Email
      // Per WorkOS spec: identity_assertion MUST include credential_types_supported
      identity_assertion: {
        assertion_types_supported: ['urn:ietf:params:oauth:token-type:id-jag', 'verified_email'],
        credential_types_supported: ['access_token', 'refresh_token'],
        revocation_uri: `${SITE}/api/v1/auth/logout`,
      },
      events_supported: ['https://schemas.workos.com/events/agent/auth/identity/assertion/revoked'],
    },

    token_endpoint_auth_methods_supported: ['client_secret_basic', 'private_key_jwt'],
    token_endpoint_auth_signing_alg_values_supported: ['RS256', 'ES256'],
    grant_types_supported: [
      'authorization_code',
      'refresh_token',
      'client_credentials',
      'urn:ietf:params:oauth:grant-type:jwt-bearer',
    ],
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
