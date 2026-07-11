import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from './schema/index.ts';

const connectionString =
  process.env.DATABASE_URL ?? 'postgres://specialist:specialist@localhost:5432/specialist';

type Database = PostgresJsDatabase<typeof schema>;

let _client: Database | null = null;

function getClient(): Database {
  if (!_client) {
    const { DATABASE_POOL_MAX = '20', DATABASE_IDLE_TIMEOUT = '30' } = process.env;
    const queryClient = postgres(connectionString, {
      prepare: false,
      max: Number(DATABASE_POOL_MAX),
      idle_timeout: Number(DATABASE_IDLE_TIMEOUT),
      connect_timeout: 10,
    });
    _client = drizzle(queryClient, { schema });
  }
  return _client;
}

/**
 * Lazy database client.
 *
 * The PostgreSQL connection pool is NOT created at module import time.
 * Instead, it is initialized on the first property access (first `db.select()`,
 * `db.insert()`, etc.). This avoids side effects when the module is imported
 * purely for its type/schema exports (e.g., in test environments or during
 * build-time code analysis).
 *
 * Usage is identical to a plain `drizzle()` client:
 * ```ts
 * import { db } from '@specialist/database';
 * const users = await db.select().from(users);
 * ```
 */
export const db = new Proxy<Database>({} as Database, {
  get(_, prop: keyof Database) {
    const client = getClient();
    const value = client[prop];
    // Bind function properties so `this` references the real client
    return typeof value === 'function' ? value.bind(client) : value;
  },

  set(_, prop: keyof Database, value: unknown) {
    if (_client) (_client as unknown as Record<string, unknown>)[prop as string] = value;
    return true;
  },
});
