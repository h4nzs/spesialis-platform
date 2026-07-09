FROM node:24-alpine

WORKDIR /app

# Copy only package files first for efficient layer caching
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/ ./packages/
COPY apps/web/ ./apps/web/

RUN corepack enable && \
    pnpm install --frozen-lockfile --no-optional && \
    pnpm --filter web build

EXPOSE 4321

# Production: serve the pre-built Astro site
CMD ["pnpm", "--filter", "web", "preview", "--host"]
