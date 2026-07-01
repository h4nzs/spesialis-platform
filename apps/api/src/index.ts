import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';
import { secureHeaders } from 'hono/secure-headers';
import { apiRouter } from './routes/index.ts';
import { errorHandler } from './middleware/error-handler.ts';
import { success } from './lib/response.ts';

const app = new Hono();

app.use('*', prettyJSON());
app.use('*', secureHeaders());
const CORS_ORIGIN = process.env.CORS_ORIGIN?.split(',').map((o) => o.trim()) ?? [
  'http://localhost:4321',
  'http://localhost:3000',
  'http://localhost',
];
app.use('*', cors({ origin: CORS_ORIGIN, credentials: true }));
app.use('*', logger());

app.onError(errorHandler);

app.get('/', (c) => {
  return success(c, { service: 'Specialist API', version: '1.0.0' });
});

app.route('/api/v1', apiRouter);

export default app;
