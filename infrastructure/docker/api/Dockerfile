FROM node:24-alpine

WORKDIR /app

# ── 1️⃣ Fetch packages to virtual store ────────────────────────────
# Layer ini FULLY CACHED — hanya invalid jika pnpm-lock.yaml berubah.
# pnpm fetch mendownload semua packages ke content-addressable store
# tanpa perlu source code workspace packages.
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./

ENV CI=true
RUN corepack enable && pnpm fetch --frozen-lockfile

# ── 2️⃣ Copy source code ───────────────────────────────────────────
# Layer ini sering berubah (setiap ada perubahan kode), tapi pnpm install
# di step 3 hanya perlu LINK dari store — TIDAK download ulang.
COPY packages/ ./packages/
COPY apps/api/ ./apps/api/

# ── 3️⃣ Install from store (fast) ──────────────────────────────────
# --prefer-offline: packages SUDAH di store dari step 1.
# Hanya linking symlinks — sangat cepat meski layer invalid.
RUN pnpm install --frozen-lockfile --prefer-offline

EXPOSE 3000

# Production: run without file watcher (no hot-reload)
# Uses tsx to execute TypeScript directly — no build step needed
# Uses start:prod to avoid --env-file flag (env vars come from docker-compose)
CMD ["pnpm", "--filter", "@ahlipanggilan/api", "start:prod"]
