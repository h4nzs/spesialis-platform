import type { APIRoute } from 'astro';

const SITE = 'https://ahlipanggilan.id';
const API_BASE = '/api/v1';

/**
 * Agent Capability Descriptor — DNS-AID
 *
 * Referenced by the `cap` parameter in DNS-AID SVCB records.
 * Describes the full capabilities of this platform for AI agent discovery.
 *
 * Spec: https://datatracker.ietf.org/doc/draft-mozleywilliams-dnsop-dnsaid/
 *       https://www.rfc-editor.org/rfc/rfc9460
 */
export const GET: APIRoute = async () => {
  const descriptor = {
    $schema: 'https://agentskills.io/schema/capability.json',
    updatedAt: new Date().toISOString(),
    platform: {
      name: 'Ahli Panggilan',
      description:
        'On-demand professional service booking platform in Indonesia. Connects customers with verified technicians for AC, plumbing, electrical, cleaning, and other professional services.',
      website: SITE,
      contactEmail: 'hello@ahlipanggilan.id',
      serviceArea: ['Jakarta', 'Bandung', 'Tangerang', 'Bekasi', 'Depok', 'Bogor'],
      languages: ['id', 'en'],
    },
    authentication: {
      type: 'bearer-token',
      methods: ['jwt', 'http-cookie'],
      documentation: `${SITE}/auth.md`,
      registrationUrl: `${SITE}/register`,
      tokenEndpoint: `${SITE}${API_BASE}/auth/login`,
      refreshEndpoint: `${SITE}${API_BASE}/auth/refresh`,
      logoutEndpoint: `${SITE}${API_BASE}/auth/logout`,
    },
    protocols: {
      mcp: {
        supported: true,
        cardUrl: `${SITE}/.well-known/mcp/server-card.json`,
        transport: 'http',
      },
      rest: {
        supported: true,
        baseUrl: `${SITE}${API_BASE}`,
        documentation: `${SITE}/.well-known/api-catalog`,
      },
    },
    serviceCategories: [
      {
        name: 'AC Services',
        description: 'Air conditioner maintenance, repair, installation, and cleaning',
        endpoints: [`${SITE}${API_BASE}/services`],
      },
      {
        name: 'Electrical',
        description: 'Electrical installation, repair, panel maintenance',
        endpoints: [`${SITE}${API_BASE}/services`],
      },
      {
        name: 'Plumbing',
        description: 'Pipe repair, water heater, water pump, clogged drains',
        endpoints: [`${SITE}${API_BASE}/services`],
      },
      {
        name: 'Cleaning',
        description: 'Home, office, and apartment cleaning services',
        endpoints: [`${SITE}${API_BASE}/services`],
      },
      {
        name: 'Building Maintenance',
        description: 'Painting, furniture repair, general building maintenance',
        endpoints: [`${SITE}${API_BASE}/services`],
      },
      {
        name: 'CCTV',
        description: 'CCTV installation and repair',
        endpoints: [`${SITE}${API_BASE}/services`],
      },
      {
        name: 'Locksmith',
        description: 'Lock opening, replacement, and repair',
        endpoints: [`${SITE}${API_BASE}/services`],
      },
    ],
    agentResources: [
      {
        name: 'site-overview',
        url: `${SITE}/llms.txt`,
        type: 'text/markdown',
        description: 'Quick overview of the platform for AI agents',
      },
      {
        name: 'full-documentation',
        url: `${SITE}/llms-full.txt`,
        type: 'text/markdown',
        description: 'Complete platform documentation covering all services, FAQ, corporate',
      },
      {
        name: 'auth-documentation',
        url: `${SITE}/auth.md`,
        type: 'text/markdown',
        description: 'Authentication guide for AI agents',
      },
      {
        name: 'api-catalog',
        url: `${SITE}/.well-known/api-catalog`,
        type: 'application/linkset+json',
        description: 'Machine-readable API catalog with link relations (RFC 9727)',
      },
      {
        name: 'mcp-server-card',
        url: `${SITE}/.well-known/mcp/server-card.json`,
        type: 'application/json',
        description: 'MCP Server Card for Model Context Protocol discovery',
      },
      {
        name: 'agent-skills',
        url: `${SITE}/.well-known/agent-skills/index.json`,
        type: 'application/json',
        description: 'Index of all skills available for AI agents',
      },
      {
        name: 'oauth-authorization-server',
        url: `${SITE}/.well-known/oauth-authorization-server`,
        type: 'application/json',
        description: 'OAuth Authorization Server metadata (RFC 8414)',
      },
      {
        name: 'oauth-protected-resource',
        url: `${SITE}/.well-known/oauth-protected-resource`,
        type: 'application/json',
        description: 'OAuth Protected Resource metadata (RFC 9728)',
      },
      {
        name: 'sitemap',
        url: `${SITE}/sitemap.xml`,
        type: 'application/xml',
        description: 'XML sitemap of the entire site',
      },
      {
        name: 'content-signals',
        url: `${SITE}/.well-known/content-signal.json`,
        type: 'application/json',
        description: 'Content usage preferences for AI agents (IETF AIPREF Content Signals)',
      },
    ],
    rateLimiting: {
      general: '30 requests/second per IP',
      api: '100 requests/second per IP',
      auth: '10 requests/second per IP',
    },
  };

  return new Response(JSON.stringify(descriptor, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600',
      'Access-Control-Allow-Origin': '*',
    },
  });
};
