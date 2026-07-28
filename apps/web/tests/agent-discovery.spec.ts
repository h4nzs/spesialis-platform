import { test, expect } from '@playwright/test';

/**
 * E2E tests for Agent Discovery endpoints (well-known URLs).
 * These endpoints enable automated AI agent discovery of APIs,
 * documentation, and capabilities.
 *
 * Covers:
 * - RFC 8288 Link headers on homepage
 * - RFC 9727 API Catalog (/.well-known/api-catalog)
 * - SEP-1649 MCP Server Card (/.well-known/mcp/server-card.json)
 * - Agent Skills Index (/.well-known/agent-skills/index.json)
 * - RFC 8414 OAuth Authorization Server (/.well-known/oauth-authorization-server)
 * - RFC 9728 OAuth Protected Resource (/.well-known/oauth-protected-resource)
 * - auth.md documentation
 * - Content-Signal in robots.txt
 * - Agent-accessible static files (llms.txt, llms-full.txt)
 */
test.describe('Agent Discovery — Well-Known Endpoints', () => {
  test.describe('API Catalog (RFC 9727)', () => {
    test('AGENT-01: Mengembalikan 200 dengan Content-Type application/linkset+json', async ({
      request,
    }) => {
      const res = await request.get('/.well-known/api-catalog');
      expect(res.status()).toBe(200);
      expect(res.headers()['content-type']).toContain('application/linkset+json');
    });

    test('AGENT-02: Response memiliki struktur linkset yang benar', async ({ request }) => {
      const res = await request.get('/.well-known/api-catalog');
      const body = await res.json();

      expect(body).toHaveProperty('linkset');
      expect(Array.isArray(body.linkset)).toBe(true);
      expect(body.linkset.length).toBeGreaterThanOrEqual(1);

      const mainEntry = body.linkset[0];
      expect(mainEntry).toHaveProperty('anchor');
      expect(mainEntry.anchor).toContain('ahlipanggilan.id');
      expect(mainEntry.anchor).toContain('/api/v1');

      // Should have at least: service-doc, status, collection
      expect(mainEntry).toHaveProperty('service-doc');
      expect(mainEntry).toHaveProperty('status');
      expect(mainEntry).toHaveProperty('collection');
    });

    test('AGENT-03: service-doc mengarah ke auth.md, llms.txt, dan llms-full.txt', async ({
      request,
    }) => {
      const res = await request.get('/.well-known/api-catalog');
      const body = await res.json();

      const serviceDocs = body.linkset[0]['service-doc'];
      expect(Array.isArray(serviceDocs)).toBe(true);

      const hrefs = serviceDocs.map((doc: { href: string }) => doc.href);
      expect(hrefs.some((h: string) => h.endsWith('/auth.md'))).toBe(true);
      expect(hrefs.some((h: string) => h.endsWith('/llms.txt'))).toBe(true);
      expect(hrefs.some((h: string) => h.endsWith('/llms-full.txt'))).toBe(true);
    });

    test('AGENT-04: Mencakup endpoint health, services, articles, dan coverage-areas', async ({
      request,
    }) => {
      const res = await request.get('/.well-known/api-catalog');
      const body = await res.json();

      const mainEntry = body.linkset[0];
      const collectionUrls = mainEntry.collection.map((c: { href: string }) => c.href);
      const statusUrls = mainEntry.status.map((s: { href: string }) => s.href);

      expect(collectionUrls.some((u: string) => u.includes('/services'))).toBe(true);
      expect(collectionUrls.some((u: string) => u.includes('/cms/articles'))).toBe(true);
      expect(statusUrls.some((u: string) => u.includes('/health'))).toBe(true);
    });
  });

  test.describe('MCP Server Card (SEP-1649)', () => {
    test('AGENT-05: Mengembalikan 200 dengan Content-Type application/json', async ({
      request,
    }) => {
      const res = await request.get('/.well-known/mcp/server-card.json');
      expect(res.status()).toBe(200);
      expect(res.headers()['content-type']).toContain('application/json');
    });

    test('AGENT-06: Memiliki serverInfo dengan name, version, vendor', async ({ request }) => {
      const res = await request.get('/.well-known/mcp/server-card.json');
      const body = await res.json();

      expect(body).toHaveProperty('serverInfo');
      expect(body.serverInfo).toHaveProperty('name');
      expect(body.serverInfo).toHaveProperty('version');
      expect(body.serverInfo).toHaveProperty('vendor');
      expect(body.serverInfo.name).toContain('Ahli Panggilan');
    });

    test('AGENT-07: Memiliki transport config dengan authentication', async ({ request }) => {
      const res = await request.get('/.well-known/mcp/server-card.json');
      const body = await res.json();

      expect(body).toHaveProperty('transport');
      expect(body.transport).toHaveProperty('type');
      expect(body.transport).toHaveProperty('endpoint');
      expect(body.transport).toHaveProperty('authentication');
      expect(body.transport.authentication.type).toBe('bearer-token');
      expect(body.transport.endpoint).toContain('ahlipanggilan.id');
    });

    test('AGENT-08: Memiliki capabilities dengan tools enabled', async ({ request }) => {
      const res = await request.get('/.well-known/mcp/server-card.json');
      const body = await res.json();

      expect(body).toHaveProperty('capabilities');
      expect(body.capabilities).toHaveProperty('tools');
      expect(body.capabilities.tools.enabled).toBe(true);
      expect(body.capabilities.tools).toHaveProperty('endpoints');
      expect(Array.isArray(body.capabilities.tools.endpoints)).toBe(true);

      expect(body.capabilities).toHaveProperty('resources');
      expect(body.capabilities.resources.enabled).toBe(true);

      expect(body.capabilities).toHaveProperty('prompts');
      expect(body.capabilities.prompts.enabled).toBe(false);
    });
  });

  test.describe('Agent Skills Index', () => {
    test('AGENT-09: Mengembalikan 200 dengan Content-Type application/json', async ({
      request,
    }) => {
      const res = await request.get('/.well-known/agent-skills/index.json');
      expect(res.status()).toBe(200);
      expect(res.headers()['content-type']).toContain('application/json');
    });

    test('AGENT-10: Memiliki $schema dan skills array', async ({ request }) => {
      const res = await request.get('/.well-known/agent-skills/index.json');
      const body = await res.json();

      expect(body).toHaveProperty('$schema');
      expect(body.$schema).toContain('agentskills.io');
      expect(body).toHaveProperty('skills');
      expect(Array.isArray(body.skills)).toBe(true);
      expect(body.skills.length).toBeGreaterThan(0);
    });

    test('AGENT-11: Setiap skill memiliki name, type, description, dan url', async ({
      request,
    }) => {
      const res = await request.get('/.well-known/agent-skills/index.json');
      const body = await res.json();

      for (const skill of body.skills) {
        expect(skill).toHaveProperty('name');
        expect(skill).toHaveProperty('type');
        expect(skill).toHaveProperty('description');
        expect(skill).toHaveProperty('url');
        expect(typeof skill.name).toBe('string');
        expect(skill.name.length).toBeGreaterThan(0);
        expect(skill.url).toContain('ahlipanggilan.id');
      }
    });

    test('AGENT-12: Mencakup skill service-booking, service-list, site-overview', async ({
      request,
    }) => {
      const res = await request.get('/.well-known/agent-skills/index.json');
      const body = await res.json();

      const skillNames = body.skills.map((s: { name: string }) => s.name);
      expect(skillNames).toContain('service-booking');
      expect(skillNames).toContain('service-list');
      expect(skillNames).toContain('site-overview');
      expect(skillNames).toContain('site-documentation');
      expect(skillNames).toContain('auth-documentation');
      expect(skillNames).toContain('api-catalog');
      expect(skillNames).toContain('sitemap');
    });

    test('AGENT-13: Memiliki Access-Control-Allow-Origin header', async ({ request }) => {
      const res = await request.get('/.well-known/agent-skills/index.json');
      expect(res.headers()['access-control-allow-origin']).toBe('*');
    });
  });

  test.describe('OAuth Authorization Server (RFC 8414)', () => {
    test('AGENT-14: Mengembalikan 200 dengan Content-Type application/json', async ({
      request,
    }) => {
      const res = await request.get('/.well-known/oauth-authorization-server');
      expect(res.status()).toBe(200);
      expect(res.headers()['content-type']).toContain('application/json');
    });

    test('AGENT-15: Memiliki issuer, authorization_endpoint, token_endpoint', async ({
      request,
    }) => {
      const res = await request.get('/.well-known/oauth-authorization-server');
      const body = await res.json();

      expect(body).toHaveProperty('issuer');
      expect(body.issuer).toContain('ahlipanggilan.id');
      expect(body).toHaveProperty('authorization_endpoint');
      expect(body).toHaveProperty('token_endpoint');
      expect(body).toHaveProperty('refresh_endpoint');
      expect(body).toHaveProperty('registration_endpoint');
    });

    test('AGENT-16: Memiliki agent_auth block lengkap dengan semua field WorkOS auth.md spec', async ({
      request,
    }) => {
      const res = await request.get('/.well-known/oauth-authorization-server');
      const body = await res.json();

      expect(body).toHaveProperty('agent_auth');
      const auth = body.agent_auth;

      // ── Core registration fields ──
      expect(auth).toHaveProperty('skill');
      expect(auth.skill).toContain('/auth.md');
      expect(auth).toHaveProperty('documentation_uri');
      expect(auth.documentation_uri).toContain('/auth.md');
      expect(auth).toHaveProperty('register_uri');
      expect(auth.register_uri).toContain('/register');

      // ── Claim & Revocation URIs ──
      expect(auth).toHaveProperty('claim_uri');
      expect(auth.claim_uri).toContain('/agent/claim');
      expect(auth).toHaveProperty('revocation_uri');
      expect(auth.revocation_uri).toContain('/auth/logout');

      // ── Identity endpoints ──
      expect(auth).toHaveProperty('identity_endpoint');
      expect(auth).toHaveProperty('claim_endpoint');
      expect(auth).toHaveProperty('events_endpoint');

      // ── Credential types ──
      expect(auth).toHaveProperty('credential_types_supported');
      expect(Array.isArray(auth.credential_types_supported)).toBe(true);
      expect(auth.credential_types_supported).toContain('access_token');
      expect(auth.credential_types_supported).toContain('refresh_token');

      // ── Identity types ──
      expect(auth).toHaveProperty('identity_types_supported');
      expect(Array.isArray(auth.identity_types_supported)).toBe(true);
      expect(auth.identity_types_supported).toContain('anonymous');
      expect(auth.identity_types_supported).toContain('identity_assertion');
      expect(auth.identity_types_supported).toContain('service_auth');

      // ── Anonymous block ──
      expect(auth).toHaveProperty('anonymous');
      expect(auth.anonymous).toHaveProperty('credential_types_supported');
      expect(Array.isArray(auth.anonymous.credential_types_supported)).toBe(true);
      expect(auth.anonymous).toHaveProperty('claim_uri');
      expect(auth.anonymous.claim_uri).toContain('/agent/claim');

      // ── Identity assertion block ──
      expect(auth).toHaveProperty('identity_assertion');
      expect(auth.identity_assertion).toHaveProperty('assertion_types_supported');
      expect(Array.isArray(auth.identity_assertion.assertion_types_supported)).toBe(true);
      expect(auth.identity_assertion.assertion_types_supported).toContain(
        'urn:ietf:params:oauth:token-type:id-jag',
      );
      expect(auth.identity_assertion.assertion_types_supported).toContain('verified_email');

      // ── Events ──
      expect(auth).toHaveProperty('events_supported');
      expect(Array.isArray(auth.events_supported)).toBe(true);
      expect(auth.events_supported.length).toBeGreaterThanOrEqual(1);
    });

    test('AGENT-17: Memiliki grant_types_supported dan scopes_supported', async ({ request }) => {
      const res = await request.get('/.well-known/oauth-authorization-server');
      const body = await res.json();

      expect(body).toHaveProperty('grant_types_supported');
      expect(Array.isArray(body.grant_types_supported)).toBe(true);
      expect(body.grant_types_supported).toContain('refresh_token');

      expect(body).toHaveProperty('scopes_supported');
      expect(Array.isArray(body.scopes_supported)).toBe(true);
      expect(body.scopes_supported).toContain('openid');

      expect(body).toHaveProperty('ui_locales_supported');
      expect(body.ui_locales_supported).toContain('id');
    });
  });

  test.describe('OpenID Connect Discovery (OpenID.Core)', () => {
    test('AGENT-34: openid-configuration mengembalikan 200 dengan Content-Type application/json', async ({
      request,
    }) => {
      const res = await request.get('/.well-known/openid-configuration');
      expect(res.status()).toBe(200);
      expect(res.headers()['content-type']).toContain('application/json');
    });

    test('AGENT-35: Memiliki issuer, authorization_endpoint, token_endpoint', async ({
      request,
    }) => {
      const res = await request.get('/.well-known/openid-configuration');
      const body = await res.json();

      expect(body).toHaveProperty('issuer');
      expect(body.issuer).toContain('ahlipanggilan.id');
      expect(body).toHaveProperty('authorization_endpoint');
      expect(body.authorization_endpoint).toContain('/login');
      expect(body).toHaveProperty('token_endpoint');
      expect(body.token_endpoint).toContain('/auth/login');
      expect(body).toHaveProperty('jwks_uri');
      expect(body.jwks_uri).toContain('/.well-known/jwks.json');
    });

    test('AGENT-36: Memiliki response_types_supported, subject_types_supported, id_token_signing_alg_values_supported', async ({
      request,
    }) => {
      const res = await request.get('/.well-known/openid-configuration');
      const body = await res.json();

      expect(body).toHaveProperty('response_types_supported');
      expect(Array.isArray(body.response_types_supported)).toBe(true);
      expect(body.response_types_supported).toContain('code');

      expect(body).toHaveProperty('subject_types_supported');
      expect(body.subject_types_supported).toContain('public');

      expect(body).toHaveProperty('id_token_signing_alg_values_supported');
      expect(Array.isArray(body.id_token_signing_alg_values_supported)).toBe(true);
      expect(body.id_token_signing_alg_values_supported).toContain('HS256');
      expect(body.id_token_signing_alg_values_supported).not.toContain('RS256');
    });

    test('AGENT-37: Memiliki scopes_supported termasuk openid dan claims_supported', async ({
      request,
    }) => {
      const res = await request.get('/.well-known/openid-configuration');
      const body = await res.json();

      expect(body).toHaveProperty('scopes_supported');
      expect(body.scopes_supported).toContain('openid');
      expect(body.scopes_supported).toContain('email');

      expect(body).toHaveProperty('claims_supported');
      expect(body.claims_supported).toContain('sub');
      expect(body.claims_supported).toContain('email');
    });

    test('AGENT-38: Memiliki grant_types dan token_endpoint_auth config', async ({ request }) => {
      const res = await request.get('/.well-known/openid-configuration');
      const body = await res.json();

      expect(body).toHaveProperty('grant_types_supported');
      expect(body.grant_types_supported).toContain('refresh_token');

      expect(body).toHaveProperty('token_endpoint_auth_methods_supported');
      expect(Array.isArray(body.token_endpoint_auth_methods_supported)).toBe(true);

      expect(body).toHaveProperty('code_challenge_methods_supported');
      expect(body.code_challenge_methods_supported).toContain('S256');
    });

    test('AGENT-39: Memiliki service_documentation, policy_uri, dan tos_uri', async ({
      request,
    }) => {
      const res = await request.get('/.well-known/openid-configuration');
      const body = await res.json();

      expect(body).toHaveProperty('service_documentation');
      expect(body.service_documentation).toContain('/auth.md');
      expect(body).toHaveProperty('op_policy_uri');
      expect(body.op_policy_uri).toContain('/kebijakan-privasi');
      expect(body).toHaveProperty('op_tos_uri');
      expect(body.op_tos_uri).toContain('/syarat-ketentuan');
    });

    test('AGENT-40: Memiliki Access-Control-Allow-Origin header', async ({ request }) => {
      const res = await request.get('/.well-known/openid-configuration');
      expect(res.headers()['access-control-allow-origin']).toBe('*');
    });
  });

  test.describe('OAuth Protected Resource (RFC 9728)', () => {
    test('AGENT-18: Mengembalikan 200 dengan Content-Type application/json', async ({
      request,
    }) => {
      const res = await request.get('/.well-known/oauth-protected-resource');
      expect(res.status()).toBe(200);
      expect(res.headers()['content-type']).toContain('application/json');
    });

    test('AGENT-19: Memiliki resource, authorization_servers, scopes_supported', async ({
      request,
    }) => {
      const res = await request.get('/.well-known/oauth-protected-resource');
      const body = await res.json();

      expect(body).toHaveProperty('resource');
      expect(body.resource).toContain('ahlipanggilan.id');
      expect(body).toHaveProperty('authorization_servers');
      expect(Array.isArray(body.authorization_servers)).toBe(true);
      expect(body.authorization_servers[0]).toContain('ahlipanggilan.id');
      expect(body).toHaveProperty('resource_name');
      expect(body.resource_name).toBe('Ahli Panggilan');
      expect(body).toHaveProperty('scopes_supported');
      expect(body.scopes_supported).toContain('admin:read');
      expect(body).toHaveProperty('bearer_methods_supported');
    });
  });

  test.describe('auth.md Documentation', () => {
    test('AGENT-20: auth.md dapat diakses dan berisi dokumentasi autentikasi', async ({
      request,
    }) => {
      const res = await request.get('/auth.md');
      expect(res.status()).toBe(200);
      const text = await res.text();

      expect(text).toContain('Authentication');
      expect(text).toContain('Bearer Token');
      expect(text).toContain('/api/v1');
      expect(text).toContain('httpOnly');
    });
  });

  test.describe('Content Signal JSON', () => {
    test('AGENT-28: content-signal.json mengembalikan 200 dengan Content-Type application/json', async ({
      request,
    }) => {
      const res = await request.get('/.well-known/content-signal.json');
      expect(res.status()).toBe(200);
      expect(res.headers()['content-type']).toContain('application/json');
    });

    test('AGENT-29: Memiliki signals.global dengan ai-train, search, ai-input', async ({
      request,
    }) => {
      const res = await request.get('/.well-known/content-signal.json');
      const body = await res.json();

      expect(body).toHaveProperty('signals');
      expect(body.signals).toHaveProperty('global');
      expect(body.signals.global).toHaveProperty('ai-train');
      expect(body.signals.global).toHaveProperty('search');
      expect(body.signals.global).toHaveProperty('ai-input');
    });

    test('AGENT-30: Memiliki signals.agents array dengan userAgent dan signal preferences', async ({
      request,
    }) => {
      const res = await request.get('/.well-known/content-signal.json');
      const body = await res.json();

      expect(body).toHaveProperty('signals');
      expect(body.signals).toHaveProperty('agents');
      expect(Array.isArray(body.signals.agents)).toBe(true);
      expect(body.signals.agents.length).toBeGreaterThan(0);

      // Setiap agent harus punya userAgent dan signal fields
      for (const agent of body.signals.agents) {
        expect(agent).toHaveProperty('userAgent');
        expect(typeof agent.userAgent).toBe('string');
        expect(agent).toHaveProperty('ai-train');
        expect(agent).toHaveProperty('search');
        expect(agent).toHaveProperty('ai-input');
      }
    });

    test('AGENT-31: Global default ai-train adalah false', async ({ request }) => {
      const res = await request.get('/.well-known/content-signal.json');
      const body = await res.json();

      expect(body.signals.global['ai-train']).toBe(false);
      expect(body.signals.global.search).toBe(true);
    });

    test('AGENT-32: Memiliki Access-Control-Allow-Origin header', async ({ request }) => {
      const res = await request.get('/.well-known/content-signal.json');
      expect(res.headers()['access-control-allow-origin']).toBe('*');
    });

    test('AGENT-33: Memiliki platform dan policy informasi', async ({ request }) => {
      const res = await request.get('/.well-known/content-signal.json');
      const body = await res.json();

      expect(body).toHaveProperty('platform');
      expect(body.platform).toHaveProperty('name');
      expect(body.platform.name).toBe('Ahli Panggilan');
      expect(body).toHaveProperty('policy');
      expect(body.policy).toHaveProperty('strategy');
    });
  });

  test.describe('robots.txt dengan Content-Signal', () => {
    test('AGENT-21: robots.txt mengandung Content-Signal directive', async ({ request }) => {
      const res = await request.get('/robots.txt');
      expect(res.status()).toBe(200);
      const text = await res.text();

      // Content-Signal untuk AI preferences (contentsignals.org)
      expect(text).toContain('Content-Signal');
      expect(text).toContain('ai-train');
      expect(text).toContain('search=yes');
    });

    test('AGENT-22: robots.txt mengandung referensi agent discovery endpoints', async ({
      request,
    }) => {
      const res = await request.get('/robots.txt');
      const text = await res.text();

      // Agent discovery references
      expect(text).toContain('api-catalog');
      expect(text).toContain('mcp/server-card');
      expect(text).toContain('agent-skills');
      expect(text).toContain('auth.md');
    });
  });

  test.describe('Link Headers (RFC 8288) on Homepage', () => {
    test('AGENT-23: Homepage memiliki Link headers untuk agent discovery', async ({ page }) => {
      const res = await page.goto('/');
      const linkHeader = res?.headers()['link'];

      expect(linkHeader).toBeTruthy();
      expect(linkHeader).toContain('rel="api-catalog"');
      expect(linkHeader).toContain('rel="service-doc"');
      expect(linkHeader).toContain('rel="describedby"');
      expect(linkHeader).toContain('rel="sitemap"');
    });

    test('AGENT-24: Link headers mengandung URL yang benar', async ({ page }) => {
      const res = await page.goto('/');
      const linkHeader = res?.headers()['link'];

      expect(linkHeader).toContain('/.well-known/api-catalog');
      expect(linkHeader).toContain('/auth.md');
      expect(linkHeader).toContain('/llms.txt');
      expect(linkHeader).toContain('/sitemap.xml');
    });
  });

  test.describe('Agent-Accessible Static Files', () => {
    test('AGENT-25: llms.txt berisi overview platform untuk AI', async ({ request }) => {
      const res = await request.get('/llms.txt');
      expect(res.status()).toBe(200);
      const text = await res.text();

      // Harus berisi informasi platform
      expect(text).toContain('Ahli Panggilan');
      expect(text).toContain('booking');
      expect(text).toContain('layanan');
    });

    test('AGENT-26: llms-full.txt berisi dokumentasi lengkap platform', async ({ request }) => {
      const res = await request.get('/llms-full.txt');
      expect(res.status()).toBe(200);
      const text = await res.text();

      expect(text).toContain('Ahli Panggilan');
      expect(text).toContain('Visi');
      expect(text).toContain('Misi');
      expect(text).toContain('FAQ');
      expect(text).toContain('Corporate');
      expect(text).toContain('Mitra');
    });

    test('AGENT-27: Sitemap XML dapat diakses', async ({ request }) => {
      const res = await request.get('/sitemap.xml');
      expect(res.status()).toBe(200);
      expect(res.headers()['content-type']).toContain('application/xml');
      const text = await res.text();

      expect(text).toContain('<?xml');
      expect(text).toContain('urlset');
      expect(text).toContain('ahlipanggilan.id');
    });
  });
});
