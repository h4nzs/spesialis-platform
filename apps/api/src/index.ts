import 'dotenv/config';

import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';
import { secureHeaders } from 'hono/secure-headers';

import { success } from './lib/response.ts';
import { errorHandler } from './middleware/error-handler.ts';
import { apiRouter } from './routes/index.ts';

const app = new Hono();

const CORS_ORIGIN = process.env.CORS_ORIGIN?.split(',').map((origin) => origin.trim()) ?? [
  'http://localhost:4321',
  'http://localhost:3000',
  'http://localhost',
];

app.use('*', prettyJSON());
app.use('*', secureHeaders());
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

serve(
  {
    fetch: app.fetch,
    port,
  },
  (info) => {
    console.log(`🚀 API listening on http://localhost:${info.port}`);
  },
);

export default app;
