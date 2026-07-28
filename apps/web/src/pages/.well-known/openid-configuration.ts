import type { APIRoute } from 'astro';

const SITE = 'https://ahlipanggilan.id';

/**
 * OpenID Connect Discovery — OpenID.Core 1.0
 *
 * Returns OpenID Provider metadata for agent and client discovery.
 * See: https://openid.net/specs/openid-connect-discovery-1_0.html
 *      https://openid.net/specs/openid-connect-core-1_0.html
 *
 * Note: We do not have a full OpenID Connect implementation (no JWKS,
 * no userinfo endpoint, no ID token issuance in the traditional sense).
 * This endpoint is provided for compatibility with tools and scanners
 * that expect it alongside the OAuth Authorization Server metadata.
 * The fields reflect the subset of OpenID Connect that we support.
 */
export const GET: APIRoute = async () => {
  const metadata = {
    // ── REQUIRED ──────────────────────────────────────────────
    issuer: SITE,
    authorization_endpoint: `${SITE}/login`,
    token_endpoint: `${SITE}/api/v1/auth/login`,
    jwks_uri: `${SITE}/.well-known/jwks.json`,
    response_types_supported: ['code', 'token'],
    subject_types_supported: ['public'],
    id_token_signing_alg_values_supported: ['HS256'],

    // ── RECOMMENDED ───────────────────────────────────────────
    scopes_supported: [
      'openid',
      'profile',
      'email',
      'bookings:read',
      'bookings:write',
      'services:read',
    ],
    claims_supported: ['sub', 'email', 'role', 'name'],
    grant_types_supported: [
      'authorization_code',
      'refresh_token',
      'client_credentials',
      'urn:ietf:params:oauth:grant-type:jwt-bearer',
    ],
    token_endpoint_auth_methods_supported: ['client_secret_basic', 'private_key_jwt'],
    token_endpoint_auth_signing_alg_values_supported: ['RS256', 'ES256'],
    code_challenge_methods_supported: ['S256'],
    ui_locales_supported: ['id', 'en'],

    // ── OPTIONAL ──────────────────────────────────────────────
    registration_endpoint: `${SITE}/register`,
    revocation_endpoint: `${SITE}/api/v1/auth/logout`,
    service_documentation: `${SITE}/auth.md`,
    op_policy_uri: `${SITE}/kebijakan-privasi`,
    op_tos_uri: `${SITE}/syarat-ketentuan`,
    claims_parameter_supported: false,
    request_parameter_supported: false,
    request_uri_parameter_supported: true,
    require_request_uri_registration: false,

    // Note: This is a minimal OpenID Connect discovery endpoint.
    // We don't issue true OpenID Connect ID tokens or have a userinfo endpoint.
    // The fields above reflect the subset we support for compatibility.
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
