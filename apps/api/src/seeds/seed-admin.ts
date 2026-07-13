#!/usr/bin/env tsx
/**
 * Seed Admin — Create a single super_admin user
 *
 * Membuat 1 user super_admin tanpa mengubah data lainnya.
 * Email dan password bisa diatur via environment variables:
 *   ADMIN_EMAIL=admin@ahlipanggilan.id
 *   ADMIN_PASSWORD=password123
 *
 * Cara pakai (local):
 *   pnpm --filter @ahlipanggilan/api db:seed-admin
 *
 * Cara pakai (Docker/production):
 *   docker exec -it ahlipanggilan-api sh -c "cd /app/apps/api && pnpm db:seed-admin:prod"
 *
 * Atau via docker compose run:
 *   docker compose -f docker-compose.prod.yml --env-file .env.prod run --rm \
 *     -e ADMIN_EMAIL=admin@ahlipanggilan.id \
 *     -e ADMIN_PASSWORD=password123 \
 *     api pnpm --filter @ahlipanggilan/api db:seed-admin:prod
 */

import { eq } from 'drizzle-orm';
import { db } from '@ahlipanggilan/database';
import { users } from '@ahlipanggilan/database';
import { hashPassword } from '../lib/auth.ts';

const email = process.env['ADMIN_EMAIL'] ?? 'admin@ahlipanggilan.id';
const password = process.env['ADMIN_PASSWORD'] ?? 'password123';

async function main() {
  console.log('👤 Creating super_admin user...\n');

  // Check if user already exists
  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existing) {
    console.log(`  ⚠️  User "${email}" already exists — skipping`);
    console.log(`\n  Login: ${email} / ${password}`);
    return;
  }

  const passwordHash = await hashPassword(password);

  const [user] = await db
    .insert(users)
    .values({
      email,
      phone: '6281234567890',
      passwordHash,
      role: 'super_admin',
      status: 'active',
    })
    .returning({ id: users.id, email: users.email, role: users.role });

  console.log(`  ✅ Super admin created:`);
  console.log(`     Email: ${user.email}`);
  console.log(`     Password: ${password}`);
  console.log(`     Role: ${user.role}`);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error('❌ Failed:', e);
    process.exit(1);
  });
