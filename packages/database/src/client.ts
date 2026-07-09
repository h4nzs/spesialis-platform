import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema/index.ts';

const connectionString =
  process.env.DATABASE_URL ?? 'postgres://specialist:specialist@localhost:5432/specialist';

const { DATABASE_POOL_MAX = '20', DATABASE_IDLE_TIMEOUT = '30' } = process.env;

const queryClient = postgres(connectionString, {
  prepare: false,
  max: Number(DATABASE_POOL_MAX),
  idle_timeout: Number(DATABASE_IDLE_TIMEOUT),
  connect_timeout: 10,
});
export const db = drizzle(queryClient, { schema });
