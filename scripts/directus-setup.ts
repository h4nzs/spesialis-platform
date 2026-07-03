/**
 * Directus CMS Setup Script
 *
 * Automates Directus collection, role, and permission setup via the Directus REST API.
 *
 * Usage: pnpm tsx scripts/directus-setup.ts
 *
 * Prerequisites: docker compose up -d (postgres + cms must be running)
 */

const DIRECTUS_URL = process.env.DIRECTUS_URL ?? 'http://localhost:8055';
const ADMIN_EMAIL = process.env.DIRECTUS_ADMIN_EMAIL ?? 'admin@example.com';
const ADMIN_PASSWORD = process.env.DIRECTUS_ADMIN_PASSWORD ?? 'admin123';
const SETUP_TOKEN = process.env.DIRECTUS_SETUP_TOKEN ?? 'specialist-setup-token';

interface DirectusCollection {
  collection: string;
  meta?: {
    singleton?: boolean;
    hidden?: boolean;
    icon?: string;
    note?: string;
  };
  schema?: {
    name: string;
    is_primary?: boolean;
    is_unique?: boolean;
    is_nullable?: boolean;
    is_required?: boolean;
    type: string;
    length?: number;
    default_value?: string | null;
  };
  fields: Array<{
    field: string;
    type: string;
    meta?: {
      required?: boolean;
      unique?: boolean;
      note?: string;
      width?: string;
      interface?: string;
      options?: Record<string, unknown>;
      display?: string;
    };
    schema?: {
      is_primary_key?: boolean;
      is_nullable?: boolean;
      default_value?: string | null;
      max_length?: number;
    };
  }>;
}

async function request(path: string, options: RequestInit = {}, token?: string) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const url = `${DIRECTUS_URL}${path}`;
  const res = await fetch(url, { ...options, headers });

  if (!res.ok && res.status !== 204) {
    const body = await res.text();
    throw new Error(`Directus API error ${res.status} ${res.statusText}: ${body}`);
  }

  if (res.status === 204) return null;
  return res.json();
}

async function login(): Promise<string> {
  console.log('  → Authenticating to Directus...');

  const res = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    }),
  });

  const token = res?.data?.access_token;
  if (!token) throw new Error('Failed to get Directus access token');

  // Set a static token so subsequent runs can use it instead of JWT
  const adminUserId = res?.data?.id;
  if (adminUserId) {
    try {
      await request(
        `/users/${adminUserId}`,
        {
          method: 'PATCH',
          body: JSON.stringify({ token: SETUP_TOKEN }),
        },
        token as string,
      );
    } catch {
      // Static token may already be set — proceed with JWT
    }
  }

  console.log('  ✓ Authenticated');
  return token as string;
}

async function collectionExists(token: string, name: string): Promise<boolean> {
  try {
    const res = await request(`/collections/${name}`, {}, token);
    return !!res?.data;
  } catch {
    return false;
  }
}

async function createCollection(
  token: string,
  name: string,
  meta: Record<string, unknown> = {},
  fields: Array<{
    field: string;
    type: string;
    schema?: Record<string, unknown>;
    meta?: Record<string, unknown>;
  }> = [],
) {
  console.log(`  → Creating collection: ${name}...`);

  await request(
    '/collections',
    {
      method: 'POST',
      body: JSON.stringify({
        collection: name,
        meta: {
          icon: 'article',
          note: '',
          ...meta,
        },
        schema: {},
        fields: [
          {
            field: 'id',
            type: 'uuid',
            meta: { hidden: true, readonly: true },
            schema: { is_primary_key: true, is_nullable: false },
          },
          {
            field: 'date_created',
            type: 'timestamp',
            meta: { hidden: true, readonly: true },
            schema: { is_nullable: true },
          },
          {
            field: 'date_updated',
            type: 'timestamp',
            meta: { hidden: true, readonly: true },
            schema: { is_nullable: true },
          },
          ...fields,
        ],
      }),
    },
    token,
  );

  console.log(`  ✓ Collection ${name} created`);
}

async function createField(
  token: string,
  collection: string,
  field: string,
  type: string,
  meta: Record<string, unknown> = {},
  schema: Record<string, unknown> = {},
) {
  await request(
    `/fields/${collection}/${field}`,
    {
      method: 'POST',
      body: JSON.stringify({
        field,
        type,
        meta,
        schema,
      }),
    },
    token,
  );
}

async function createRole(token: string, name: string, description = ''): Promise<string> {
  console.log(`  → Creating role: ${name}...`);

  const res = await request(
    '/roles',
    {
      method: 'POST',
      body: JSON.stringify({
        name,
        description,
        icon: 'supervised_user_circle',
        admin_access: false,
        app_access: true,
      }),
    },
    token,
  );

  const roleId = res?.data?.id as string;
  console.log(`  ✓ Role ${name} created (${roleId})`);
  return roleId;
}

async function checkDirectusRunning(): Promise<void> {
  try {
    const res = await fetch(`${DIRECTUS_URL}/server/info`, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) throw new Error(`Server responded with ${res.status}`);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.log(`\n  ⚠ Could not reach Directus at ${DIRECTUS_URL}`);
    console.log(`  Error: ${message}\n`);
    console.log('  Make sure Directus is running:');
    console.log('    docker compose up cms -d');
    console.log('');
    console.log('  Or set DIRECTUS_URL if using a different address:');
    console.log('    DIRECTUS_URL=http://localhost:8055 pnpm cms:setup');
    console.log('');
    process.exit(1);
  }
  console.log(`  ✓ Directus is reachable at ${DIRECTUS_URL}\n`);
}

async function main() {
  console.log('\n═══════════════════════════════════════════');
  console.log('  Directus CMS Setup');
  console.log('═══════════════════════════════════════════\n');
  console.log(`  Target: ${DIRECTUS_URL}\n`);

  await checkDirectusRunning();
  const token = await login();

  // 1. Create Collections
  console.log('\n─── Collections ──────────────────────────\n');

  // cms_articles
  if (!(await collectionExists(token, 'cms_articles'))) {
    await createCollection(
      token,
      'cms_articles',
      { icon: 'article', note: 'Blog articles and content' },
      [
        {
          field: 'title',
          type: 'string',
          schema: { is_required: true },
          meta: { required: true, interface: 'input', width: 'half' },
        },
        {
          field: 'slug',
          type: 'string',
          schema: { is_required: true, is_unique: true },
          meta: { required: true, interface: 'input', width: 'half' },
        },
        { field: 'summary', type: 'text', meta: { interface: 'input-multiline', width: 'full' } },
        {
          field: 'content',
          type: 'text',
          meta: { interface: 'input-rich-text-md', width: 'full' },
        },
        { field: 'cover_image', type: 'uuid', meta: { interface: 'file-image', width: 'half' } },
        { field: 'category', type: 'string', meta: { interface: 'input', width: 'half' } },
        {
          field: 'tags',
          type: 'json',
          meta: { interface: 'tags', special: ['json'], width: 'full' },
        },
        { field: 'author', type: 'string', meta: { interface: 'input', width: 'half' } },
        {
          field: 'published_at',
          type: 'timestamp',
          meta: { interface: 'datetime', width: 'half' },
        },
        {
          field: 'status',
          type: 'string',
          schema: { default_value: 'draft' },
          meta: {
            interface: 'select-dropdown',
            options: {
              choices: [
                { value: 'draft', text: 'Draft' },
                { value: 'published', text: 'Published' },
                { value: 'archived', text: 'Archived' },
              ],
            },
            width: 'half',
          },
        },
      ],
    );
  } else {
    console.log('  - cms_articles already exists, skipping');
  }

  // cms_faq
  if (!(await collectionExists(token, 'cms_faq'))) {
    await createCollection(token, 'cms_faq', { icon: 'quiz', note: 'Frequently Asked Questions' }, [
      {
        field: 'question',
        type: 'string',
        schema: { is_required: true },
        meta: { required: true, interface: 'input', width: 'full' },
      },
      {
        field: 'answer',
        type: 'text',
        schema: { is_required: true },
        meta: { required: true, interface: 'input-rich-text-md', width: 'full' },
      },
      { field: 'category', type: 'string', meta: { interface: 'input', width: 'half' } },
      {
        field: 'sort',
        type: 'integer',
        schema: { default_value: '0' },
        meta: { interface: 'input', width: 'half' },
      },
    ]);
  } else {
    console.log('  - cms_faq already exists, skipping');
  }

  // cms_pages
  if (!(await collectionExists(token, 'cms_pages'))) {
    await createCollection(
      token,
      'cms_pages',
      { icon: 'web', note: 'Landing pages and static content' },
      [
        {
          field: 'title',
          type: 'string',
          schema: { is_required: true },
          meta: { required: true, interface: 'input', width: 'half' },
        },
        {
          field: 'slug',
          type: 'string',
          schema: { is_required: true, is_unique: true },
          meta: { required: true, interface: 'input', width: 'half' },
        },
        {
          field: 'content',
          type: 'text',
          meta: { interface: 'input-rich-text-md', width: 'full' },
        },
        {
          field: 'meta',
          type: 'json',
          meta: {
            interface: 'input-code',
            special: ['json'],
            options: { language: 'json' },
            width: 'full',
          },
        },
      ],
    );
  } else {
    console.log('  - cms_pages already exists, skipping');
  }

  // cms_homepage_sections
  if (!(await collectionExists(token, 'cms_homepage_sections'))) {
    await createCollection(
      token,
      'cms_homepage_sections',
      { icon: 'view_carousel', note: 'Homepage sections (hero, services, why-us, etc.)' },
      [
        {
          field: 'section_type',
          type: 'string',
          schema: { is_required: true },
          meta: {
            required: true,
            interface: 'select-dropdown',
            options: {
              choices: [
                { value: 'hero', text: 'Hero' },
                { value: 'services', text: 'Services' },
                { value: 'why-us', text: 'Why Us' },
                { value: 'stats', text: 'Statistics' },
                { value: 'testimonials', text: 'Testimonials' },
                { value: 'cta', text: 'CTA' },
                { value: 'faq', text: 'FAQ' },
              ],
            },
            width: 'half',
          },
        },
        { field: 'title', type: 'string', meta: { interface: 'input', width: 'full' } },
        {
          field: 'content',
          type: 'text',
          meta: { interface: 'input-rich-text-md', width: 'full' },
        },
        { field: 'image', type: 'uuid', meta: { interface: 'file-image', width: 'half' } },
        {
          field: 'sort_order',
          type: 'integer',
          schema: { default_value: '0' },
          meta: { interface: 'input', width: 'half' },
        },
        {
          field: 'is_active',
          type: 'boolean',
          schema: { default_value: 'true' },
          meta: { interface: 'boolean', width: 'half' },
        },
      ],
    );
  } else {
    console.log('  - cms_homepage_sections already exists, skipping');
  }

  // 2. Create Roles
  console.log('\n─── Roles ─────────────────────────────────\n');

  const rolesRes = await request('/roles', {}, token);
  const existingRoles = (rolesRes?.data ?? []) as Array<{ id: string; name: string }>;
  const hasContentManager = existingRoles.some(
    (r: { name: string }) => r.name === 'Content Manager',
  );

  let contentManagerRoleId: string | undefined;

  if (!hasContentManager) {
    contentManagerRoleId = await createRole(
      token,
      'Content Manager',
      'Manages CMS content (articles, FAQ, pages, media)',
    );
  } else {
    const existing = existingRoles.find((r: { name: string }) => r.name === 'Content Manager');
    contentManagerRoleId = existing?.id;
    console.log(`  - Content Manager role already exists (${contentManagerRoleId}), skipping`);
  }

  // 3. Permissions — attempt auto-setup via Directus API
  if (contentManagerRoleId) {
    console.log('\n─── Permissions ───────────────────────────\n');

    const cmsCollections = [
      'cms_articles',
      'cms_faq',
      'cms_pages',
      'cms_homepage_sections',
      'directus_files',
    ];

    try {
      // Directus 11 uses Access → Policy → Permission relationship.
      // Create a policy first, then link it to the role.
      const policyRes = await request(
        '/policies',
        {
          method: 'POST',
          body: JSON.stringify({
            name: 'CMS Full Access',
            description: 'Full CRUD access to CMS collections',
            icon: 'article',
            enforce_tfa: false,
            ip_access: null,
          }),
        },
        token,
      );

      const policyId = policyRes?.data?.id as string;

      if (policyId) {
        // Link policy to Content Manager role via Access
        await request(
          '/access',
          {
            method: 'POST',
            body: JSON.stringify({
              role: contentManagerRoleId,
              policy: policyId,
              sort: 1,
            }),
          },
          token,
        );

        // Grant CRUD permissions for each collection
        const actions = ['create', 'read', 'update', 'delete'];
        for (const collection of cmsCollections) {
          for (const action of actions) {
            try {
              await request(
                '/permissions',
                {
                  method: 'POST',
                  body: JSON.stringify({
                    policy: policyId,
                    collection,
                    action,
                    permissions: {},
                    fields: collection === 'directus_files' ? ['*'] : ['*'],
                  }),
                },
                token,
              );
            } catch {
              // Some permissions may already exist — continue
            }
          }
        }

        console.log('  ✓ Permissions auto-configured for Content Manager role');
      }
    } catch {
      console.log('  ⚠ Could not auto-configure permissions. Set manually:');
      console.log(`    1. Open ${DIRECTUS_URL}/admin`);
      console.log('    2. Login and go to Settings → Roles → Content Manager');
      console.log('    3. Create Policy → "CMS Full Access"');
      console.log(
        '    4. Add CRUD for: cms_articles, cms_faq, cms_pages, cms_homepage_sections, directus_files',
      );
    }
  }

  console.log('\n═══════════════════════════════════════════');
  console.log('  ✅ Directus CMS setup complete!');
  console.log('═══════════════════════════════════════════');
  console.log(`\n  CMS Admin:  ${DIRECTUS_URL}/admin`);
  console.log('\n  Login:');
  console.log(`    Email:    ${ADMIN_EMAIL}`);
  console.log(`    Password: ${ADMIN_PASSWORD}`);
  console.log(`\n  Static Token: ${SETUP_TOKEN}`);
  console.log('\n  Collections created:');
  console.log('    - cms_articles');
  console.log('    - cms_faq');
  console.log('    - cms_pages');
  console.log('    - cms_homepage_sections');
  console.log('\n  Role created:');
  console.log('    - Content Manager');
  console.log('');
  console.log('  ─────────────────────────────────────────────');
  console.log('  Next steps:');
  console.log('    1. Open the CMS Admin and log in');
  console.log('    2. Go to Settings → Roles → Content Manager');
  console.log('    3. Create a Policy with CRUD access to CMS collections');
  console.log('    4. Create a Content Manager user (or assign existing)');
  console.log('  ─────────────────────────────────────────────');
  console.log('');
}

main().catch((err) => {
  const message = err instanceof Error ? err.message : String(err);
  console.error('\n❌ Directus setup failed:', message);
  console.error('\n  Troubleshooting:');
  console.error('    1. Ensure Docker is running: docker ps');
  console.error('    2. Start Directus: docker compose up cms -d');
  console.error('    3. Wait for Directus to be ready, then retry');
  console.error('    4. Check logs: docker compose logs cms');
  console.error('');
  process.exit(1);
});
