import { Hono } from 'hono';
import { success, unauthorized } from '../lib/response.ts';

const router = new Hono();

router.post('/revalidate', async (c) => {
  const authHeader = c.req.header('Authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : '';
  const revalidationToken = process.env.REVALIDATION_TOKEN ?? '';

  if (!token || token !== revalidationToken) {
    return unauthorized(c, 'Invalid revalidation token');
  }

  const body = await c.req.json();
  const { collection, event, key } = body as {
    collection?: string;
    event?: string;
    key?: string;
  };

  console.info('[CMS Revalidation]', { collection, event, key });

  return success(c, { revalidated: true }, 'Revalidation triggered');
});

export { router as cmsRevalidationRouter };
