/**
 * Directus CMS Setup Script
 *
 * Automates Directus collection, role, and permission setup via the Directus REST API.
 *
 * Usage: pnpm tsx scripts/directus-setup.ts
 *
 * Prerequisites: docker compose up -d (postgres + cms must be running)
 *
 * Design decisions:
 * - Business entity tables (orders, users, payments, etc.) are managed by Hono API.
 * - Directus only manages CMS content collections (cms_*).
 * - Business entity collections are hidden from the Directus UI and have no permissions
 *   for non-admin roles.
 * - The Administrator role retains full access (admin_access = true).
 * - The Content Manager role gets CRUD access on CMS collections only.
 */

const DIRECTUS_URL = process.env.DIRECTUS_URL ?? 'http://localhost:8055';
const ADMIN_EMAIL = process.env.DIRECTUS_ADMIN_EMAIL ?? 'admin@example.com';
const ADMIN_PASSWORD = process.env.DIRECTUS_ADMIN_PASSWORD ?? 'admin123';
const SETUP_TOKEN = process.env.DIRECTUS_SETUP_TOKEN ?? 'specialist-setup-token';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface DirectusCollection {
  collection: string;
  meta?: {
    singleton?: boolean;
    hidden?: boolean;
    icon?: string;
    note?: string;
  };
}

interface DirectusField {
  field: string;
  type: string;
  schema?: Record<string, unknown>;
  meta?: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

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

async function getAllCollections(token: string): Promise<DirectusCollection[]> {
  const res = await request('/collections', {}, token);
  return (res?.data ?? []) as DirectusCollection[];
}

async function updateCollection(
  token: string,
  name: string,
  meta: Record<string, unknown>,
): Promise<void> {
  await request(
    `/collections/${name}`,
    {
      method: 'PATCH',
      body: JSON.stringify({ meta }),
    },
    token,
  );
}

// ---------------------------------------------------------------------------
// CMS Content Collections
// ---------------------------------------------------------------------------

interface CollectionDef {
  name: string;
  meta: Record<string, unknown>;
  fields: DirectusField[];
}

const CMS_COLLECTIONS: CollectionDef[] = [
  {
    name: 'cms_articles',
    meta: { icon: 'article', note: 'Blog articles and content' },
    fields: [
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
      { field: 'content', type: 'text', meta: { interface: 'input-rich-text-md', width: 'full' } },
      { field: 'cover_image', type: 'uuid', meta: { interface: 'file-image', width: 'half' } },
      { field: 'category', type: 'string', meta: { interface: 'input', width: 'half' } },
      {
        field: 'tags',
        type: 'json',
        meta: { interface: 'tags', special: ['json'], width: 'full' },
      },
      { field: 'author', type: 'string', meta: { interface: 'input', width: 'half' } },
      { field: 'published_at', type: 'timestamp', meta: { interface: 'datetime', width: 'half' } },
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
  },
  {
    name: 'cms_faq',
    meta: { icon: 'quiz', note: 'Frequently Asked Questions' },
    fields: [
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
    ],
  },
  {
    name: 'cms_pages',
    meta: { icon: 'web', note: 'Landing pages and static content' },
    fields: [
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
      { field: 'content', type: 'text', meta: { interface: 'input-rich-text-md', width: 'full' } },
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
  },
  {
    name: 'cms_homepage_sections',
    meta: { icon: 'view_carousel', note: 'Homepage sections (hero, services, why-us, etc.)' },
    fields: [
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
      { field: 'content', type: 'text', meta: { interface: 'input-rich-text-md', width: 'full' } },
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
  },
];

// ---------------------------------------------------------------------------
// Business entity collections — to be hidden from Directus UI
// These are managed entirely by Hono API
// ---------------------------------------------------------------------------

const BUSINESS_COLLECTIONS = [
  'users',
  'customer_profiles',
  'partner_profiles',
  'partner_skills',
  'partner_documents',
  'companies',
  'company_users',
  'branches',
  'addresses',
  'services',
  'service_categories',
  'orders',
  'order_items',
  'order_media',
  'order_status_history',
  'assignments',
  'payments',
  'reviews',
  'complaints',
  'notifications',
  'media',
  'seo_metadata',
  'system_settings',
  'audit_logs',
  'refresh_tokens',
  'password_resets',
];

// ---------------------------------------------------------------------------
// Create collection with fields
// ---------------------------------------------------------------------------

async function createCollection(token: string, def: CollectionDef) {
  console.log(`  → Creating collection: ${def.name}...`);

  await request(
    '/collections',
    {
      method: 'POST',
      body: JSON.stringify({
        collection: def.name,
        meta: { icon: 'article', note: '', ...def.meta },
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
          ...def.fields,
        ],
      }),
    },
    token,
  );

  console.log(`  ✓ Collection ${def.name} created`);
}

// ---------------------------------------------------------------------------
// Hide business entity collections
// ---------------------------------------------------------------------------

async function hideBusinessCollections(token: string): Promise<void> {
  console.log('\n─── Hiding Business Collections ────────────────\n');

  const all = await getAllCollections(token);

  for (const name of BUSINESS_COLLECTIONS) {
    const existing = all.find((c) => c.collection === name);
    if (!existing) {
      console.log(`  - ${name}: not found in Directus, skipping`);
      continue;
    }

    const meta = existing.meta ?? {};
    if (meta.hidden) {
      console.log(`  - ${name}: already hidden, skipping`);
      continue;
    }

    try {
      await updateCollection(token, name, { hidden: true });
      console.log(`  ✓ ${name}: hidden`);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.log(`  ⚠ ${name}: could not hide — ${message}`);
    }
  }
}

// ---------------------------------------------------------------------------
// Ensure CMS collections have proper note/icon
// ---------------------------------------------------------------------------

async function updateCMSCollections(token: string): Promise<void> {
  console.log('\n─── Updating CMS Collection Metadata ───────────\n');

  const all = await getAllCollections(token);

  for (const def of CMS_COLLECTIONS) {
    const existing = all.find((c) => c.collection === def.name);
    if (!existing) continue;

    try {
      await updateCollection(token, def.name, {
        icon: def.meta.icon,
        note: def.meta.note,
        hidden: false,
      });
      console.log(`  ✓ ${def.name}: metadata updated`);
    } catch {
      console.log(`  - ${def.name}: metadata update skipped`);
    }
  }
}

// ---------------------------------------------------------------------------
// Role & Permission management
// ---------------------------------------------------------------------------

async function findRoleId(token: string, name: string): Promise<string | undefined> {
  const res = await request('/roles', {}, token);
  const roles = (res?.data ?? []) as Array<{ id: string; name: string }>;
  return roles.find((r) => r.name === name)?.id;
}

async function findPolicyId(token: string, name: string): Promise<string | undefined> {
  const res = await request('/policies', {}, token);
  const policies = (res?.data ?? []) as Array<{ id: string; name: string }>;
  return policies.find((p) => p.name === name)?.id;
}

async function ensureRole(token: string, name: string, description: string): Promise<string> {
  console.log(`  → Ensuring role: ${name}...`);

  const existingId = await findRoleId(token, name);
  if (existingId) {
    console.log(`  ✓ Role ${name} already exists (${existingId})`);
    return existingId;
  }

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

async function ensurePolicy(token: string, name: string, description: string): Promise<string> {
  console.log(`  → Ensuring policy: ${name}...`);

  const existingId = await findPolicyId(token, name);
  if (existingId) {
    console.log(`  ✓ Policy ${name} already exists (${existingId})`);
    return existingId;
  }

  const res = await request(
    '/policies',
    {
      method: 'POST',
      body: JSON.stringify({
        name,
        description,
        icon: 'article',
        enforce_tfa: false,
        ip_access: null,
      }),
    },
    token,
  );

  const policyId = res?.data?.id as string;
  console.log(`  ✓ Policy ${name} created (${policyId})`);
  return policyId;
}

async function ensureAccessLink(token: string, roleId: string, policyId: string): Promise<void> {
  // Check if this link already exists
  const res = await request('/access', {}, token);
  const accessList = (res?.data ?? []) as Array<{ role: string | null; policy: string }>;
  const existing = accessList.find((a) => a.role === roleId && a.policy === policyId);

  if (existing) {
    console.log(`  ✓ Access link already exists`);
    return;
  }

  await request(
    '/access',
    {
      method: 'POST',
      body: JSON.stringify({
        role: roleId,
        policy: policyId,
        sort: 1,
      }),
    },
    token,
  );

  console.log(`  ✓ Access link created`);
}

async function ensureCRUDPermissions(
  token: string,
  policyId: string,
  collections: string[],
): Promise<void> {
  console.log(`  → Granting CRUD permissions on ${collections.length} collections...`);

  // Get existing permissions for this policy
  const res = await request(`/permissions?filter={"policy":{"_eq":"${policyId}"}}`, {}, token);
  const existingPerms = (res?.data ?? []) as Array<{ collection: string; action: string }>;
  const existingSet = new Set(existingPerms.map((p) => `${p.collection}:${p.action}`));

  const actions = ['create', 'read', 'update', 'delete'];
  let count = 0;
  let skipped = 0;

  for (const collection of collections) {
    for (const action of actions) {
      const key = `${collection}:${action}`;
      if (existingSet.has(key)) {
        skipped++;
        continue;
      }

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
              fields: ['*'],
            }),
          },
          token,
        );
        count++;
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.log(`  ⚠ Could not grant ${action} on ${collection}: ${message}`);
      }
    }
  }

  console.log(`  ✓ ${count} new permissions granted, ${skipped} already existed`);
}

// ---------------------------------------------------------------------------
// Clean stale "manager" policy if it exists with no permissions
// ---------------------------------------------------------------------------

async function cleanupStalePolicy(token: string): Promise<void> {
  const stalePolicyId = await findPolicyId(token, 'manager');
  if (!stalePolicyId) return;

  // Check if it has any permissions
  const res = await request(`/permissions?filter={"policy":{"_eq":"${stalePolicyId}"}}`, {}, token);
  const perms = (res?.data ?? []) as Array<unknown>;

  // Also check if any access links point to it
  const accessRes = await request('/access', {}, token);
  const accessList = (accessRes?.data ?? []) as Array<{ role: string | null; policy: string }>;
  const linkedRoles = accessList.filter((a) => a.policy === stalePolicyId);

  if (perms.length > 0 || linkedRoles.length > 0) {
    // It's in use — skip cleanup
    console.log('  - Stale "manager" policy exists but is in use, skipping cleanup');
    return;
  }

  try {
    await request(`/policies/${stalePolicyId}`, { method: 'DELETE' }, token);
    console.log('  ✓ Removed stale "manager" policy (no permissions assigned)');
  } catch {
    console.log('  - Could not remove stale "manager" policy');
  }
}

// ---------------------------------------------------------------------------
// Check Directus is running
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log('\n═══════════════════════════════════════════');
  console.log('  Directus CMS Setup');
  console.log('═══════════════════════════════════════════\n');
  console.log(`  Target: ${DIRECTUS_URL}\n`);

  await checkDirectusRunning();
  const token = await login();

  // 1. Create CMS Collections (if not exist)
  console.log('\n─── CMS Content Collections ─────────────────\n');

  for (const def of CMS_COLLECTIONS) {
    if (!(await collectionExists(token, def.name))) {
      await createCollection(token, def);
    } else {
      console.log(`  - ${def.name} already exists, skipping`);
    }
  }

  // 2. Update CMS collection metadata (icon, note, ensure not hidden)
  await updateCMSCollections(token);

  // 3. Hide business entity collections from Directus UI
  await hideBusinessCollections(token);

  // 4. Clean up stale "manager" policy if unused
  console.log('\n─── Cleanup ──────────────────────────────────\n');
  await cleanupStalePolicy(token);

  // 5. Ensure Content Manager role with proper policy
  console.log('\n─── Roles & Permissions ──────────────────────\n');

  const contentManagerRoleId = await ensureRole(
    token,
    'Content Manager',
    'Manages CMS content (articles, FAQ, pages, media)',
  );

  // Check if Content Manager role already has a policy via access
  const accessRes = await request('/access', {}, token);
  const accessList = (accessRes?.data ?? []) as Array<{ role: string | null; policy: string }>;
  const existingAccess = accessList.find((a) => a.role === contentManagerRoleId);

  let cmsPolicyId: string | undefined;
  if (existingAccess) {
    // Find the policy name
    const policiesRes = await request('/policies', {}, token);
    const policies = (policiesRes?.data ?? []) as Array<{ id: string; name: string }>;
    const linkedPolicy = policies.find((p) => p.id === existingAccess.policy);
    if (linkedPolicy) {
      cmsPolicyId = linkedPolicy.id;
      console.log(`  ✓ Content Manager already linked to policy "${linkedPolicy.name}"`);
    }
  }

  if (!cmsPolicyId) {
    // Create CMS Full Access policy
    cmsPolicyId = await ensurePolicy(
      token,
      'CMS Full Access',
      'Full CRUD access to CMS content collections',
    );

    // Link policy to Content Manager role
    await ensureAccessLink(token, contentManagerRoleId, cmsPolicyId);
  }

  // Grant CRUD permissions on CMS collections
  const cmsCollectionNames = CMS_COLLECTIONS.map((c) => c.name);
  await ensureCRUDPermissions(token, cmsPolicyId, [
    ...cmsCollectionNames,
    'directus_files',
    'directus_folders',
  ]);

  // 6. Summary
  console.log('\n═══════════════════════════════════════════');
  console.log('  ✅ Directus CMS setup complete!');
  console.log('═══════════════════════════════════════════\n');
  console.log(`  CMS Admin:  ${DIRECTUS_URL}/admin\n`);
  console.log('  Login:');
  console.log(`    Email:    ${ADMIN_EMAIL}`);
  console.log(`    Password: ${ADMIN_PASSWORD}\n`);
  console.log(`  Static Token: ${SETUP_TOKEN}\n`);
  console.log('  Collections:');
  for (const def of CMS_COLLECTIONS) {
    console.log(`    - ${def.name}`);
  }
  console.log('');
  console.log('  Hidden business collections:');
  for (const name of BUSINESS_COLLECTIONS) {
    console.log(`    - ${name}`);
  }
  console.log('\n  Roles:');
  console.log('    - Administrator (full system access)');
  console.log('    - Content Manager (CMS collections only)');
  console.log('\n  ─────────────────────────────────────────────');
  console.log('  Next steps:');
  console.log('    1. Open the CMS Admin and log in');
  console.log('    2. Verify CMS collections in the sidebar');
  console.log('    3. Verify business collections are hidden');
  console.log('    4. Create a Content Manager user (Settings → Users)');
  console.log('  ─────────────────────────────────────────────\n');
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

export {};
