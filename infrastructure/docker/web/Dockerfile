FROM node:24-alpine

WORKDIR /app

COPY . .

RUN corepack enable && \
    pnpm install --no-optional

EXPOSE 4321

CMD ["pnpm", "--filter", "web", "dev", "--host"]
