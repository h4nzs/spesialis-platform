import type { APIRoute } from 'astro';

const SITE = 'https://ahlipanggilan.id';
const API_BASE = '/api/v1';

/**
 * API Catalog — RFC 9727
 *
 * Returns a linkset document describing available APIs and their relations.
 * See: https://www.rfc-editor.org/rfc/rfc9727
 *      https://www.rfc-editor.org/rfc/rfc9264
 */
export const GET: APIRoute = async () => {
  const linkset = {
    linkset: [
      {
        anchor: `${SITE}${API_BASE}`,
        'service-doc': [
          {
            href: `${SITE}/auth.md`,
            type: 'text/markdown',
          },
          {
            href: `${SITE}/llms.txt`,
            type: 'text/markdown',
          },
          {
            href: `${SITE}/llms-full.txt`,
            type: 'text/markdown',
          },
        ],
        status: [
          {
            href: `${SITE}${API_BASE}/health`,
            type: 'application/json',
          },
        ],
        'api-catalog': [
          {
            href: `${SITE}/.well-known/api-catalog`,
            type: 'application/linkset+json',
          },
        ],
        describedby: [
          {
            href: `${SITE}/.well-known/oauth-protected-resource`,
            type: 'application/json',
          },
          {
            href: `${SITE}/.well-known/oauth-authorization-server`,
            type: 'application/json',
          },
          {
            href: `${SITE}/.well-known/openid-configuration`,
            type: 'application/json',
          },
        ],
        'service-meta': [
          {
            href: `${SITE}/.well-known/mcp/server-card.json`,
            type: 'application/json',
          },
          {
            href: `${SITE}/.well-known/agent-skills/index.json`,
            type: 'application/json',
          },
          {
            href: `${SITE}/.well-known/agent-cap.json`,
            type: 'application/json',
          },
          {
            href: `${SITE}/.well-known/content-signal.json`,
            type: 'application/json',
          },
          {
            href: `${SITE}/sitemap.xml`,
            type: 'application/xml',
          },
        ],
        collection: [
          {
            href: `${SITE}${API_BASE}/services`,
            type: 'application/json',
          },
          {
            href: `${SITE}${API_BASE}/cms/articles`,
            type: 'application/json',
          },
          {
            href: `${SITE}${API_BASE}/public/coverage-areas`,
            type: 'application/json',
          },
        ],
      },
      // ── Auth API ──
      {
        anchor: `${SITE}${API_BASE}/auth`,
        'service-doc': [
          {
            href: `${SITE}/auth.md`,
            type: 'text/markdown',
          },
        ],
      },
    ],
  };

  return new Response(JSON.stringify(linkset, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/linkset+json',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
