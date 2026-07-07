/**
 * Directus Flows Setup — SEO Revalidation
 *
 * Creates Directus Flows that trigger when CMS collections change
 * and make HTTP requests to the Hono API for page revalidation.
 *
 * This replaces the broken file system extensions (hooks/endpoints)
 * that are not supported by Directus 11.6 Docker image.
 *
 * Usage: tsx scripts/directus-flows-setup.ts
 */

// Directus admin API
const DIRECTUS_URL = process.env['DIRECTUS_URL'] ?? 'http://localhost:8055';
const DIRECTUS_EMAIL = process.env['DIRECTUS_ADMIN_EMAIL'] ?? 'admin@example.com';
const DIRECTUS_PASSWORD = process.env['DIRECTUS_ADMIN_PASSWORD'] ?? 'admin123';

// Webhook URL — MUST use Docker-internal address (api:3000) for Flows running inside CMS container.
// Do NOT use the API_URL env var which points to localhost from the host machine.
const WEBHOOK_API_URL = 'http://api:3000';

const REVALIDATION_TOKEN = process.env['REVALIDATION_TOKEN'] ?? 'specialist-revalidation-token';

const CMS_COLLECTIONS = ['cms_articles', 'cms_faq', 'cms_pages', 'cms_homepage_sections'];

interface FlowRecord {
  id?: string;
  name: string;
  status: string;
  trigger: string;
  options: Record<string, unknown>;
  accountability: string;
  operation?: string | null;
}

interface OperationRecord {
  id?: string;
  name: string;
  key: string;
  type: string;
  options: Record<string, unknown>;
  flow: string;
  position_x: number;
  position_y: number;
  resolve: string | null;
  reject: string | null;
}

async function request(
  method: string,
  path: string,
  token: string,
  body?: Record<string, unknown> | null,
): Promise<{ data?: unknown; errors?: Array<{ message: string }> }> {
  const url = `${DIRECTUS_URL}${path}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
  });

  if (!response.ok) {
    const text = await response.text();
    console.error(`[${method}] ${path} — ${response.status} ${response.statusText}`);
    if (text) {
      try {
        const json = JSON.parse(text);
        console.error('Response:', JSON.stringify(json, null, 2));
      } catch {
        console.error('Body:', text);
      }
    }
    throw new Error(`Request failed: ${method} ${path} — ${response.status}`);
  }

  if (response.status === 204) {
    return {};
  }

  return (await response.json()) as { data?: unknown; errors?: Array<{ message: string }> };
}

async function login(): Promise<string> {
  console.log('🔑 Logging in to Directus...');
  const result = await request('POST', '/auth/login', '', {
    email: DIRECTUS_EMAIL,
    password: DIRECTUS_PASSWORD,
  });

  const data = result.data as { access_token: string } | undefined;
  if (!data?.access_token) {
    throw new Error('Login failed — no access token returned');
  }

  console.log('✅ Login successful');
  return data.access_token;
}

async function getExistingFlow(token: string, name: string): Promise<string | null> {
  try {
    const result = await request(
      'GET',
      `/flows?filter[ name ][_eq]=${encodeURIComponent(name)}`,
      token,
    );
    const data = result.data as FlowRecord[] | undefined;
    if (data && data.length > 0) {
      return data[0]?.id ?? null;
    }
  } catch {
    // Flow might not exist yet
  }
  return null;
}

async function getOperationsForFlow(token: string, flowId: string): Promise<string[]> {
  try {
    const result = await request('GET', `/operations?filter[flow][_eq]=${flowId}`, token);
    const data = result.data as OperationRecord[] | undefined;
    if (data && data.length > 0) {
      return data
        .map((op) => op.id!)
        .filter(Boolean as unknown as (id: string | undefined) => id is string);
    }
  } catch {
    // No operations
  }
  return [];
}

async function deleteFlow(token: string, flowId: string): Promise<void> {
  console.log(`  Cleaning up flow ${flowId} and its operations...`);

  // Delete related operations first
  const opIds = await getOperationsForFlow(token, flowId);
  for (const opId of opIds) {
    console.log(`    Deleting operation ${opId}...`);
    await request('DELETE', `/operations/${opId}`, token);
  }

  // Delete the flow
  await request('DELETE', `/flows/${flowId}`, token);
  console.log(`  ✅ Flow deleted`);
}

async function createFlow(token: string, flow: FlowRecord): Promise<string> {
  console.log(`  Creating flow "${flow.name}"...`);
  const result = await request('POST', '/flows', token, flow as unknown as Record<string, unknown>);
  const data = result.data as FlowRecord | undefined;
  if (!data?.id) {
    throw new Error(`Failed to create flow "${flow.name}" — no ID returned`);
  }
  console.log(`  ✅ Flow created: ${data.id}`);
  return data.id;
}

async function createOperation(token: string, operation: OperationRecord): Promise<string> {
  console.log(`  Creating operation "${operation.name}"...`);
  const result = await request(
    'POST',
    '/operations',
    token,
    operation as unknown as Record<string, unknown>,
  );
  const data = result.data as OperationRecord | undefined;
  if (!data?.id) {
    throw new Error(`Failed to create operation "${operation.name}" — no ID returned`);
  }
  console.log(`  ✅ Operation created: ${data.id}`);
  return data.id;
}

async function updateFlowOperation(
  token: string,
  flowId: string,
  operationId: string,
): Promise<void> {
  console.log(`  Linking operation to flow...`);
  await request('PATCH', `/flows/${flowId}`, token, { operation: operationId });
  console.log(`  ✅ Flow linked to operation`);
}

async function setupSeoRevalidationFlow(token: string): Promise<void> {
  console.log('\n📦 Setting up SEO Revalidation Flow...');

  const flowName = 'SEO Revalidation — Content Changes';
  const existingId = await getExistingFlow(token, flowName);
  if (existingId) {
    console.log(`  Flow "${flowName}" already exists (${existingId}), deleting and recreating...`);
    await deleteFlow(token, existingId);
  }

  // Step 1: Create the Flow with Event trigger
  const flowId = await createFlow(token, {
    name: flowName,
    status: 'active',
    trigger: 'event',
    options: {
      type: 'action',
      collections: CMS_COLLECTIONS,
      actions: ['items.create', 'items.update', 'items.delete'],
    },
    accountability: 'all',
    operation: null,
  });

  // Step 2: Create the Webhook operation
  const operationId = await createOperation(token, {
    name: 'Revalidate Pages',
    key: 'revalidate',
    type: 'webhook',
    options: {
      url: `${WEBHOOK_API_URL}/api/v1/cms/revalidate`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${REVALIDATION_TOKEN}`,
      },
      body: JSON.stringify({
        collection: '{{$trigger.collection}}',
        event: '{{$trigger.action}}',
        key: '{{$trigger.key}}',
      }),
      followRedirects: true,
    },
    flow: flowId,
    position_x: 20,
    position_y: 20,
    resolve: null,
    reject: null,
  });

  // Step 3: Link the operation to the flow
  await updateFlowOperation(token, flowId, operationId);

  console.log(`\n✅ Flow "${flowName}" created successfully:`);
  console.log(`   Flow ID: ${flowId}`);
  console.log(`   Operation ID: ${operationId}`);
  console.log(`   Collections: ${CMS_COLLECTIONS.join(', ')}`);
  console.log(`   Webhook URL: ${WEBHOOK_API_URL}/api/v1/cms/revalidate`);
}

async function main(): Promise<void> {
  console.log('═'.repeat(50));
  console.log('  Directus Flows Setup — SEO Revalidation');
  console.log('═'.repeat(50));
  console.log();
  console.log(`Directus URL: ${DIRECTUS_URL}`);
  console.log(`Webhook API URL: ${WEBHOOK_API_URL}`);
  console.log(`CMS Collections: ${CMS_COLLECTIONS.length}`);

  try {
    const token = await login();
    await setupSeoRevalidationFlow(token);

    console.log('\n' + '═'.repeat(50));
    console.log('  ✅ Setup complete!');
    console.log('═'.repeat(50));
    console.log('\nNext steps:');
    console.log('1. Open Directus Admin: http://localhost:8055/admin');
    console.log('2. Go to Settings → Flows to verify the flow exists');
    console.log('3. Try creating/updating an article in CMS to test revalidation');
  } catch (error) {
    console.error('\n❌ Setup failed:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

main();

export {};
