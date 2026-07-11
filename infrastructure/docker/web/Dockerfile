FROM node:24-slim

WORKDIR /app

# Copy only package files first for efficient layer caching
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/ ./packages/
COPY apps/web/ ./apps/web/

ENV CI=true

# Install ALL dependencies (including devDependencies needed for build)
RUN corepack enable && \
    pnpm install --frozen-lockfile

# Production build — ensures React uses jsx-runtime not jsx-dev-runtime
ENV NODE_ENV=production
RUN pnpm --filter web build

EXPOSE 4321

# Production: serve the pre-built Astro site
CMD ["pnpm", "--filter", "web", "preview", "--host"]
