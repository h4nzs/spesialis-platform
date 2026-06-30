FROM node:24-alpine

WORKDIR /app

COPY . .

RUN corepack enable

RUN pnpm install

EXPOSE 4321

CMD ["pnpm","--filter","web","dev","--host"]
