FROM node:24-alpine

WORKDIR /app

COPY . .

RUN corepack enable && \
    pnpm install --no-optional

EXPOSE 3000

CMD ["pnpm", "--filter", "@specialist/api", "dev"]
