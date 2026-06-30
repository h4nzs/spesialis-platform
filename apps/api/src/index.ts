import { Hono } from 'hono';

const app = new Hono();

app.get('/', (c) => {
  return c.json({
    message: 'Specialist API',
  });
});

export default app;
