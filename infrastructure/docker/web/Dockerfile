FROM node:24-slim

WORKDIR /app

# ── 1️⃣ Dependency manifests only ──────────────────────────────────
# Layer ini FULLY CACHED — hanya invalid jika ada perubahan di
# package.json / pnpm-lock.yaml / pnpm-workspace.yaml.
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./

# Copy ONLY package.json files — Docker preserves directory structure.
# Semua workspace packages: packages/*/ + apps/*/
COPY packages/*/package.json packages/
COPY apps/*/package.json apps/

# ── 2️⃣ Install dependencies ──────────────────────────────────────
# FULLY CACHED selama manifest tidak berubah.
ENV CI=true
RUN corepack enable && pnpm install --frozen-lockfile

# ── 3️⃣ Copy actual source code ───────────────────────────────────
# Sering berubah, tapi TIDAK perlu re-install.
COPY packages/ ./packages/
COPY apps/web/ ./apps/web/

# Production build — ensures React uses jsx-runtime not jsx-dev-runtime
ENV NODE_ENV=production
RUN pnpm --filter web build

EXPOSE 4321

# Production: serve the pre-built Astro site
CMD ["pnpm", "--filter", "web", "preview", "--host"]
