FROM node:24-alpine

WORKDIR /app

# Copy only package files first for efficient layer caching
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/ ./packages/
COPY apps/api/ ./apps/api/

ENV CI=true

RUN corepack enable && \
    pnpm install --frozen-lockfile --no-optional

EXPOSE 3000

# Production: run without file watcher (no hot-reload)
# Uses tsx to execute TypeScript directly — no build step needed
CMD ["pnpm", "--filter", "@ahlipanggilan/api", "start"]
