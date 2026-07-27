import type { APIRoute } from 'astro';

const SITE = 'https://ahlipanggilan.id';

/**
 * Agent Skills Discovery Index
 *
 * Publishes available skills for AI agents to discover and use.
 * RFC: https://github.com/cloudflare/agent-skills-discovery-rfc
 * Schema: https://agentskills.io/
 */
export const GET: APIRoute = async () => {
  const index = {
    $schema: 'https://agentskills.io/schema/index.json',
    updatedAt: new Date().toISOString(),
    skills: [
      {
        name: 'service-booking',
        type: 'api',
        description:
          'Book a professional service (AC, plumbing, electrical, cleaning) through Ahli Panggilan. Requires authentication.',
        url: `${SITE}/api/v1/bookings`,
        method: 'POST',
        contentType: 'application/json',
      },
      {
        name: 'service-list',
        type: 'api',
        description: 'List all available professional services with prices and descriptions.',
        url: `${SITE}/api/v1/services`,
        method: 'GET',
        contentType: 'application/json',
      },
      {
        name: 'partner-search',
        type: 'api',
        description: 'Search for verified partner technicians by service category or location.',
        url: `${SITE}/api/v1/partners`,
        method: 'GET',
        contentType: 'application/json',
      },
      {
        name: 'booking-tracking',
        type: 'api',
        description: 'Track the status of a service booking using its booking number.',
        url: `${SITE}/api/v1/bookings/tracking/:bookingNumber`,
        method: 'GET',
        contentType: 'application/json',
      },
      {
        name: 'coverage-check',
        type: 'api',
        description: 'Check if a location is within the service coverage area.',
        url: `${SITE}/api/v1/public/coverage-areas`,
        method: 'GET',
        contentType: 'application/json',
      },
      {
        name: 'article-list',
        type: 'api',
        description: 'List blog articles about home maintenance, AC care, plumbing tips, and more.',
        url: `${SITE}/api/v1/cms/articles`,
        method: 'GET',
        contentType: 'application/json',
      },
      {
        name: 'site-overview',
        type: 'resource',
        description: 'Complete platform information in markdown format for AI consumption.',
        url: `${SITE}/llms.txt`,
        contentType: 'text/markdown',
      },
      {
        name: 'site-documentation',
        type: 'resource',
        description:
          'Comprehensive platform documentation covering all services, FAQ, corporate solutions, and partner info.',
        url: `${SITE}/llms-full.txt`,
        contentType: 'text/markdown',
      },
      {
        name: 'auth-documentation',
        type: 'resource',
        description: 'Authentication documentation for AI agents wanting to access protected APIs.',
        url: `${SITE}/auth.md`,
        contentType: 'text/markdown',
      },
      {
        name: 'api-catalog',
        type: 'resource',
        description: 'Full API catalog with link relations per RFC 9727.',
        url: `${SITE}/.well-known/api-catalog`,
        contentType: 'application/linkset+json',
      },
      {
        name: 'sitemap',
        type: 'resource',
        description: 'XML sitemap of the entire site.',
        url: `${SITE}/sitemap.xml`,
        contentType: 'application/xml',
      },
    ],
  };

  return new Response(JSON.stringify(index, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600',
      'Access-Control-Allow-Origin': '*',
    },
  });
};
