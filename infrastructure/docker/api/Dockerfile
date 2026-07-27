FROM node:24-alpine

WORKDIR /app

# ── 1️⃣ Dependency manifests only ──────────────────────────────────
# Layer ini FULLY CACHED — hanya invalid jika ada perubahan di
# package.json / pnpm-lock.yaml / pnpm-workspace.yaml.
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./

# Copy ONLY package.json files — Docker preserves directory structure
# sehingga hasilnya: packages/database/package.json, packages/shared/..., etc.
# Ini cukup untuk pnpm resolve workspace dependencies tanpa perlu source code.
COPY packages/*/package.json packages/
COPY apps/*/package.json apps/

# ── 2️⃣ Install dependencies ──────────────────────────────────────
# FULLY CACHED selama manifest di atas tidak berubah.
# Tidak peduli perubahan source code — tetap cache hit!
ENV CI=true
RUN corepack enable && pnpm install --frozen-lockfile

# ── 3️⃣ Copy actual source code ───────────────────────────────────
# Layer ini sering berubah (setiap ada perubahan kode),
# TAPI TIDAK perlu re-install dependencies — Ratusan MB tersimpan.
COPY packages/ ./packages/
COPY apps/api/ ./apps/api/

EXPOSE 3000

# Production: run without file watcher (no hot-reload)
# Uses tsx to execute TypeScript directly — no build step needed
# Uses start:prod to avoid --env-file flag (env vars come from docker-compose)
CMD ["pnpm", "--filter", "@ahlipanggilan/api", "start:prod"]
