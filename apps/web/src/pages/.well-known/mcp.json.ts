import type { APIRoute } from 'astro';

const SITE = 'https://ahlipanggilan.id';

/**
 * MCP discovery document (Model Context Protocol) — /.well-known/mcp.json
 *
 * The site hosts a native Streamable HTTP MCP server at /api/v1/mcp
 * (stateless, JSON responses). Agent clients can connect with the MCP SDK.
 * Spec: https://modelcontextprotocol.io/specification/2025-06-18
 */
export const GET: APIRoute = async () => {
  const doc = {
    serverInfo: {
      name: 'Ahli Panggilan API',
      description:
        'On-demand professional service booking platform API. MCP tools cover service search, booking, tracking, coverage check, FAQ, articles, and partner lookup.',
      version: '1.0.0',
      vendor: 'Ahli Panggilan',
      docsUrl: `${SITE}/auth.md`,
    },
    url: `${SITE}/api/v1/mcp`,
    transport: {
      type: 'streamable-http',
      endpoint: `${SITE}/api/v1/mcp`,
      protocolVersion: '2025-06-18',
      headers: {
        'Content-Type': 'application/json',
      },
      authentication: {
        type: 'none',
        docsUrl: `${SITE}/auth.md`,
      },
    },
    capabilities: {
      tools: {
        enabled: true,
        description:
          'MCP tools: search_services, get_service_detail, track_booking, check_coverage, search_faq, search_articles, navigate_to_page, get_platform_info, create_booking, search_partners.',
      },
      resources: {
        enabled: true,
        description: 'Static documentation resources for AI agents.',
        endpoints: [
          { path: '/llms.txt', type: 'text/markdown', description: 'AI-readable site overview' },
          {
            path: '/llms-full.txt',
            type: 'text/markdown',
            description: 'Complete platform documentation',
          },
          {
            path: '/auth.md',
            type: 'text/markdown',
            description: 'Authentication guide for agents',
          },
        ],
      },
      prompts: {
        enabled: false,
      },
    },
  };

  return new Response(JSON.stringify(doc, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600',
      'Access-Control-Allow-Origin': '*',
    },
  });
};
