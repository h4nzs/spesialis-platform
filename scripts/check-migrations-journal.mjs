/**
 * Migration journal completeness check.
 *
 * Verifies that every migration SQL file under packages/database/migrations/
 * is registered in meta/_journal.json (and vice versa). `drizzle-kit migrate`
 * ONLY applies entries listed in the journal — a migration file that exists
 * but is missing from the journal silently never runs, which can leave the
 * database schema out of sync with the code (e.g. a missing `deleted_at`
 * column producing a 500 on `GET /api/v1/media/:id`).
 *
 * Fails (exit 1) when:
 *  - a migration SQL file has no journal entry, or
 *  - a journal entry points to a missing SQL file, or
 *  - the journal `idx` values are not sequential starting from 0.
 *
 * Usage: node scripts/check-migrations-journal.mjs
 */
import { readdirSync, existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const migrationsDir = join(root, 'packages/database/migrations');
const journalPath = join(migrationsDir, 'meta/_journal.json');

const errors = [];

// ── Collect migration files (skip meta/) ──────────────────────────
const sqlFiles = readdirSync(migrationsDir)
  .filter((f) => f.endsWith('.sql'))
  .map((f) => f.replace(/\.sql$/, ''))
  .sort();

// ── Collect journal tags ──────────────────────────────────────────
let journal;
try {
  journal = JSON.parse(readFileSync(journalPath, 'utf8'));
} catch (err) {
  console.error(`❌ Cannot read journal at ${journalPath}: ${err.message}`);
  process.exit(1);
}

const entries = journal.entries ?? [];
const tags = entries.map((e) => e.tag);

// ── 1. Every migration file must be journaled ─────────────────────
for (const file of sqlFiles) {
  if (!tags.includes(file)) {
    errors.push(
      `Migration file "packages/database/migrations/${file}.sql" is NOT in _journal.json — drizzle-kit migrate will never apply it.`,
    );
  }
}

// ── 2. Every journal entry must have a file ───────────────────────
for (const tag of tags) {
  if (!existsSync(join(migrationsDir, `${tag}.sql`))) {
    errors.push(`Journal entry "${tag}" has no corresponding SQL file.`);
  }
}

// ── 3. idx must be sequential (0..n-1) ────────────────────────────
entries.forEach((entry, i) => {
  if (entry.idx !== i) {
    errors.push(
      `Journal idx mismatch at position ${i}: expected ${i}, got ${entry.idx} (tag "${entry.tag}").`,
    );
  }
});

if (errors.length > 0) {
  console.error('❌ Migration journal is inconsistent:\n');
  for (const err of errors) console.error(`  - ${err}`);
  console.error(
    `\n${errors.length} issue(s) found. Fix _journal.json (or run ` +
      '`pnpm --filter @ahlipanggilan/database db:generate`) before pushing.',
  );
  process.exit(1);
}

console.log(
  `✅ Migration journal OK — ${sqlFiles.length} migration files, ${tags.length} journal entries.`,
);
