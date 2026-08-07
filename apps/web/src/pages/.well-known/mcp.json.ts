import type { APIRoute } from 'astro';

const SITE = 'https://ahlipanggilan.id';

/**
 * MCP discovery document (Model Context Protocol) — /.well-known/mcp.json
 *
 * This site does not host a Streamable HTTP MCP server (no JSON-RPC
 * endpoint). The transport below deliberately declares type "http" with an
 * explicit `protocol: REST` so agents do not attempt MCP JSON-RPC calls.
 * Interaction happens through the documented REST API instead.
 * Spec: https://modelcontextprotocol.io/specification/2025-06-18
 */
export const GET: APIRoute = async () => {
  const doc = {
    serverInfo: {
      name: 'Ahli Panggilan API',
      description:
        'On-demand professional service booking platform API (REST, not MCP protocol). Services include AC maintenance, plumbing, electrical, cleaning, and more.',
      version: '1.0.0',
      vendor: 'Ahli Panggilan',
      docsUrl: `${SITE}/auth.md`,
    },
    transport: {
      type: 'http',
      protocol: 'REST',
      endpoint: `${SITE}/api/v1`,
      headers: {
        'Content-Type': 'application/json',
      },
      authentication: {
        type: 'bearer-token',
        registrationUrl: `${SITE}/register`,
        docsUrl: `${SITE}/auth.md`,
      },
    },
    capabilities: {
      tools: {
        enabled: true,
        description:
          'REST API endpoints for service booking, customer management, partner operations, and admin functions.',
        endpoints: [
          { path: '/api/v1/services', methods: ['GET'], description: 'List available services' },
          {
            path: '/api/v1/bookings',
            methods: ['GET', 'POST'],
            description: 'Manage service bookings',
          },
          { path: '/api/v1/auth', methods: ['POST'], description: 'Authentication endpoints' },
          { path: '/api/v1/partners', methods: ['GET', 'POST'], description: 'Partner management' },
          { path: '/api/v1/customers', methods: ['GET'], description: 'Customer management' },
        ],
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
