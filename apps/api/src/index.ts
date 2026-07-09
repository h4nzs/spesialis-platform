import 'dotenv/config';

import { serve } from '@hono/node-server';

// ── Environment validation ───────────────────────────────────────
// Fail fast at startup, not at first request
function validateEnv(): void {
  const required = [
    ['DATABASE_URL', 'Database connection string'],
    ['JWT_SECRET', 'JWT signing secret'],
  ] as const;

  for (const [key, label] of required) {
    if (!process.env[key]) {
      console.error(`❌ Missing required environment variable: ${key} (${label})`);
      process.exit(1);
    }
  }

  if (process.env.JWT_SECRET === 'change-me') {
    console.error(
      '❌ JWT_SECRET is still set to the default value "change-me". Generate a strong secret.',
    );
    console.error('   Run: openssl rand -hex 32');
    process.exit(1);
  }

  const port = Number(process.env.PORT ?? '');
  if (process.env.PORT && (isNaN(port) || port < 1 || port > 65535)) {
    console.error(`❌ PORT must be a valid port number (1-65535), got: ${process.env.PORT}`);
    process.exit(1);
  }
}

validateEnv();

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';
import { secureHeaders } from 'hono/secure-headers';

import { success } from './lib/response.ts';
import { errorHandler } from './middleware/error-handler.ts';
import { traceMiddleware } from './middleware/trace.ts';
import { apiRouter } from './routes/index.ts';

const app = new Hono();

const CORS_ORIGIN = process.env.CORS_ORIGIN?.split(',').map((origin) => origin.trim()) ?? [
  'http://localhost:4321',
  'http://localhost:4322',
  'http://localhost:3000',
  'http://localhost',
];

app.use('*', traceMiddleware());
app.use('*', prettyJSON());
app.use(
  '*',
  secureHeaders({
    contentSecurityPolicy: {
      defaultSrc: ["'self'"],
      // 'unsafe-inline' required for Tailwind's style injection.
      // 'unsafe-eval' required for Vite/Astro dev tooling & source maps.
      // TODO: Remove 'unsafe-eval' in production build with proper CSP hashes/nonces.
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      fontSrc: ["'self'", 'https:', 'data:'],
      connectSrc: ["'self'", process.env.CORS_ORIGIN ?? ''],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      upgradeInsecureRequests: [],
    },
    crossOriginEmbedderPolicy: false,
  }),
);
app.use(
  '*',
  cors({
    origin: CORS_ORIGIN,
    credentials: true,
  }),
);
app.use('*', logger());

app.onError(errorHandler);

app.get('/', (c) => {
  return success(c, {
    service: 'Specialist API',
    version: '1.0.0',
  });
});

app.route('/api/v1', apiRouter);

const port = Number(process.env.PORT ?? 3000);

const server = serve(
  {
    fetch: app.fetch,
    port,
  },
  (info) => {
    console.log(`🚀 API listening on http://localhost:${info.port}`);
  },
);

// Graceful shutdown — drain in-flight requests before exiting
function shutdown() {
  console.log('\n🛑 Shutting down gracefully...');
  server.close();
  // Force exit after 10s if connections don't drain
  setTimeout(() => {
    console.error('⚠️ Forced shutdown after timeout');
    process.exit(1);
  }, 10_000).unref();
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

export default app;
