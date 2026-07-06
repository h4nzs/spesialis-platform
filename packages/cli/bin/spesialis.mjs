#!/usr/bin/env node

import { execSync } from 'node:child_process';
import { existsSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');

function run(cmd) {
  console.log(`> ${cmd}`);
  execSync(cmd, { cwd: ROOT, stdio: 'inherit' });
}

function runFilter(pkg, script) {
  run(`pnpm --filter ${pkg} ${script}`);
}

function help() {
  console.log(`
Spesialis CLI

Usage:
  spesialis <command> [options]

Commands:
  db:generate              Generate migration from schema (drizzle-kit)
  db:migrate               Apply pending migrations
  db:push                  Push schema directly to database
  db:seed                  Seed database with sample data
  cms:setup                Set up Directus CMS collections & roles
  cms:build-extensions     Build Directus extensions
  generate resource <name> Scaffold a new resource (route + test)
  start                    Start full dev environment
  help                     Show this help
`);
}

async function main() {
  const cmd = process.argv[2];

  if (!cmd || cmd === 'help') {
    help();
    process.exit(0);
  }

  switch (cmd) {
    case 'db:generate':
      runFilter('@specialist/database', 'db:generate');
      break;

    case 'db:migrate':
      runFilter('@specialist/database', 'db:migrate');
      break;

    case 'db:push':
      runFilter('@specialist/database', 'db:push');
      break;

    case 'db:seed':
      runFilter('@specialist/api', 'db:seed');
      break;

    case 'cms:setup': {
      const script = join(ROOT, 'scripts', 'directus-setup.ts');
      run(`tsx ${script}`);
      break;
    }

    case 'cms:build-extensions': {
      const extDirs = [
        join(ROOT, 'apps', 'cms', 'src', 'extensions', 'seo-revalidation'),
        join(ROOT, 'apps', 'cms', 'src', 'extensions', 'dashboard-stats'),
      ];
      for (const dir of extDirs) {
        if (existsSync(join(dir, 'package.json'))) {
          run(`cd ${dir} && npx directus-extension build`);
        }
      }
      break;
    }

    case 'generate': {
      const type = process.argv[3];
      if (type === 'resource') {
        await generateResource(process.argv[4]);
      } else {
        console.error('Usage: spesialis generate resource <name>');
        process.exit(1);
      }
      break;
    }

    case 'start':
      run('pnpm dev');
      break;

    default:
      console.error(`Unknown command: ${cmd}`);
      help();
      process.exit(1);
  }
}

function toPascalCase(s) {
  return s
    .split(/[-_ ]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join('');
}

function toCamelCase(s) {
  const p = toPascalCase(s);
  return p.charAt(0).toLowerCase() + p.slice(1);
}

function toKebabCase(s) {
  return s.replace(/([a-z])([A-Z])/g, '$1-$2').replace(/[_ ]/g, '-').toLowerCase();
}

async function generateResource(name) {
  if (!name) {
    console.error('Usage: spesialis generate resource <name>');
    process.exit(1);
  }

  const pascal = toPascalCase(name);
  const camel = toCamelCase(name);
  const kebab = toKebabCase(name);

  const apiDir = join(ROOT, 'apps', 'api', 'src', 'routes');
  const routeFile = join(apiDir, `${kebab}.ts`);
  const testFile = join(apiDir, `${kebab}.test.ts`);

  if (existsSync(routeFile)) {
    console.error(`Route already exists: ${routeFile}`);
    process.exit(1);
  }

  console.log(`Generating resource: ${pascal} (${kebab})`);

  const routeContent = `import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import { db, ${camel} } from '../lib/db.ts';
import { authMiddleware } from '../middleware/auth.ts';
import { success, created, notFound } from '../lib/response.ts';

const router = new Hono();

router.get('/', authMiddleware, async (c) => {
  const items = await db.select().from(${camel});
  return success(c, items);
});

router.get('/:id', authMiddleware, async (c) => {
  const id = c.req.param('id');
  const [item] = await db.select().from(${camel}).where(eq(${camel}.id, id)).limit(1);
  if (!item) return notFound(c, '${pascal} tidak ditemukan');
  return success(c, item);
});

router.post('/', authMiddleware, async (c) => {
  const body = await c.req.json();
  const [item] = await db.insert(${camel}).values(body).returning();
  return created(c, item);
});

router.patch('/:id', authMiddleware, async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const [item] = await db.update(${camel}).set(body).where(eq(${camel}.id, id)).returning();
  if (!item) return notFound(c, '${pascal} tidak ditemukan');
  return success(c, item);
});

router.delete('/:id', authMiddleware, async (c) => {
  const id = c.req.param('id');
  await db.delete(${camel}).where(eq(${camel}.id, id));
  return success(c, null, '${pascal} berhasil dihapus');
});

export { router as ${camel}Router };
`;

  const testContent = `import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import type { Context } from 'hono';
import type { UserRole } from '@specialist/types';
import { ${camel}Router } from './${kebab}.ts';
import { setTestEnv, makeChain, insertChain, updateChain } from '../test-utils.ts';

const { mockDb, authState, em } = vi.hoisted(() => {
  const db = {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) }),
    execute: vi.fn().mockResolvedValue([]),
  };
  const st = { userId: 'uid', userRole: 'admin' };
  const exps = globalThis.__TABLE_EXPORTS;
  return { mockDb: db, authState: st, em: exps };
});

vi.mock('../lib/db.ts', () => ({ db: mockDb, ...em }));

vi.mock('../middleware/auth.ts', () => ({
  authMiddleware: async (c, next) => {
    if (!c.req.header('Authorization')) {
      c.status(401);
      return c.json({ success: false, code: 'UNAUTHORIZED', message: 'No token' });
    }
    c.set('userId', authState.userId);
    c.set('userRole', authState.userRole);
    await next();
  },
}));

const UUID = '550e8400-e29b-41d4-a716-446655440000';

function a() {
  return { Authorization: 'Bearer x', 'Content-Type': 'application/json' };
}

function mkApp(role = 'admin') {
  authState.userRole = role;
  authState.userId = 'uid';
  const app = new Hono();
  app.route('/api/v1/${kebab}', ${camel}Router);
  return app;
}

beforeEach(() => {
  setTestEnv();
  vi.clearAllMocks();
});

describe('GET /', () => {
  it('200 list', async () => {
    mockDb.select.mockReturnValueOnce(makeChain([{ id: UUID }]));
    const res = await mkApp().request('/api/v1/${kebab}', { headers: a() });
    expect(res.status).toBe(200);
  });
});

describe('GET /:id', () => {
  it('200 found', async () => {
    mockDb.select.mockReturnValueOnce(makeChain([{ id: UUID }]));
    const res = await mkApp().request(\`/api/v1/${kebab}/\${UUID}\`, { headers: a() });
    expect(res.status).toBe(200);
  });

  it('404', async () => {
    mockDb.select.mockReturnValueOnce(makeChain([]));
    const res = await mkApp().request(\`/api/v1/${kebab}/\${UUID}\`, { headers: a() });
    expect(res.status).toBe(404);
  });
});

describe('POST /', () => {
  it('201 created', async () => {
    mockDb.select.mockReturnValueOnce(makeChain([]));
    mockDb.insert.mockReturnValueOnce(insertChain([{ id: UUID }]));
    const res = await mkApp().request('/api/v1/${kebab}', {
      method: 'POST',
      headers: a(),
      body: JSON.stringify({ name: 'Test' }),
    });
    expect(res.status).toBe(201);
  });
});

describe('PATCH /:id', () => {
  it('200 updated', async () => {
    mockDb.update.mockReturnValueOnce(updateChain([{ id: UUID, name: 'Updated' }]));
    const res = await mkApp().request(\`/api/v1/${kebab}/\${UUID}\`, {
      method: 'PATCH',
      headers: a(),
      body: JSON.stringify({ name: 'Updated' }),
    });
    expect(res.status).toBe(200);
  });
});

describe('DELETE /:id', () => {
  it('200 deleted', async () => {
    mockDb.select.mockReturnValueOnce(makeChain([{ id: UUID }]));
    const res = await mkApp().request(\`/api/v1/${kebab}/\${UUID}\`, {
      method: 'DELETE',
      headers: a(),
    });
    expect(res.status).toBe(200);
  });
});
`;

  writeFileSync(routeFile, routeContent);
  writeFileSync(testFile, testContent);
  console.log(`Created:\n  ${routeFile}\n  ${testFile}`);
  console.log('\nRemember to:');
  console.log(`  1. Add ${camel} to apps/api/src/lib/db.ts exports`);
  console.log(`  2. Register ${camel}Router in apps/api/src/routes/index.ts`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
