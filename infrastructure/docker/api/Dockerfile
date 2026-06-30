FROM node:24-alpine

WORKDIR /app

COPY . .

RUN corepack enable

RUN pnpm install

EXPOSE 3000

CMD ["pnpm","--filter","@specialist/api","dev"]
