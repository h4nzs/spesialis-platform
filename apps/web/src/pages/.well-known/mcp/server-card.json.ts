import type { APIRoute } from 'astro';

const SITE = 'https://ahlipanggilan.id';

/**
 * MCP Server Card — SEP-1649
 *
 * Exposes server metadata and capabilities for Model Context Protocol discovery.
 * Transport is the native Streamable HTTP endpoint /api/v1/mcp.
 * Schema: https://github.com/modelcontextprotocol/modelcontextprotocol/pull/2127
 */
export const GET: APIRoute = async () => {
  const card = {
    serverInfo: {
      name: 'Ahli Panggilan API',
      description:
        'On-demand professional service booking platform API. MCP tools cover service search, booking, tracking, coverage check, FAQ, articles, and partner lookup.',
      version: '1.0.0',
      vendor: 'Ahli Panggilan',
      docsUrl: `${SITE}/auth.md`,
    },
    transport: {
      type: 'streamable-http',
      protocol: 'MCP',
      endpoint: `${SITE}/api/v1/mcp`,
      protocolVersion: '2025-06-18',
      headers: {
        'Content-Type': 'application/json',
      },
      authentication: {
        type: 'bearer-token',
        docsUrl: `${SITE}/auth.md`,
      },
    },
    capabilities: {
      tools: {
        enabled: true,
        description:
          'MCP tools: search_services, get_service_detail, track_booking, check_coverage, search_faq, search_articles, navigate_to_page, get_platform_info, create_booking, search_partners.',
        endpoints: [
          {
            path: '/api/v1/mcp',
            type: 'streamable-http',
            description: 'search_services — cari layanan jasa profesional',
          },
          {
            path: '/api/v1/mcp',
            type: 'streamable-http',
            description: 'get_service_detail — detail layanan berdasarkan slug',
          },
          {
            path: '/api/v1/mcp',
            type: 'streamable-http',
            description: 'track_booking — lacak pesanan berdasarkan nomor SP-*',
          },
          {
            path: '/api/v1/mcp',
            type: 'streamable-http',
            description: 'check_coverage — cek area layanan per kota',
          },
          {
            path: '/api/v1/mcp',
            type: 'streamable-http',
            description: 'search_faq — cari pertanyaan umum',
          },
          {
            path: '/api/v1/mcp',
            type: 'streamable-http',
            description: 'search_articles — cari artikel dan tips',
          },
          {
            path: '/api/v1/mcp',
            type: 'streamable-http',
            description: 'navigate_to_page — arahan ke halaman web',
          },
          {
            path: '/api/v1/mcp',
            type: 'streamable-http',
            description: 'get_platform_info — informasi platform',
          },
          {
            path: '/api/v1/mcp',
            type: 'streamable-http',
            description: 'create_booking — buat pemesanan layanan',
          },
          {
            path: '/api/v1/mcp',
            type: 'streamable-http',
            description: 'search_partners — cari teknisi terverifikasi',
          },
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
          { path: '/sitemap.xml', type: 'application/xml', description: 'Site sitemap' },
        ],
      },
      prompts: {
        enabled: false,
      },
    },
  };

  return new Response(JSON.stringify(card, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600',
      'Access-Control-Allow-Origin': '*',
    },
  });
};
