import { PostgreSqlContainer } from '@testcontainers/postgresql';
import type { StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { afterAll, beforeAll } from 'vitest';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

let container: StartedPostgreSqlContainer | null = null;

beforeAll(async () => {
  container = await new PostgreSqlContainer('postgres:18')
    .withDatabase('ahlipanggilan_test')
    .withUsername('specialist')
    .withPassword('specialist')
    .start();

  const connectionUri = container.getConnectionUri();
  process.env.DATABASE_URL = connectionUri;

  const migrationClient = postgres(connectionUri, { max: 1 });
  await migrate(drizzle(migrationClient), {
    migrationsFolder: '../../packages/database/migrations',
  });
  await migrationClient.end();
}, 60000);

afterAll(async () => {
  await container?.stop();
});
