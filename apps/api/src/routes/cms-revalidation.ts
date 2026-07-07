import { Hono } from 'hono';
import { success, unauthorized, error } from '../lib/response.ts';

const ASTRO_URL = process.env.ASTRO_URL ?? 'http://web:4321';
const REVALIDATION_TOKEN = process.env.REVALIDATION_TOKEN ?? '';

const router = new Hono();

router.post('/revalidate', async (c) => {
  const authHeader = c.req.header('Authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : '';

  if (!token || token !== REVALIDATION_TOKEN) {
    return unauthorized(c, 'Invalid revalidation token');
  }

  const body = await c.req.json();
  const { collection, event, _key } = body as {
    collection?: string;
    event?: string;
    _key?: string;
  };

  console.info('[CMS Revalidation] Received:', { collection, event });

  try {
    const astroRes = await fetch(`${ASTRO_URL}/api/revalidate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${REVALIDATION_TOKEN}`,
      },
      body: JSON.stringify({ collection, event }),
    });

    if (!astroRes.ok) {
      const text = await astroRes.text();
      console.error('[CMS Revalidation] Astro revalidation failed:', astroRes.status, text);
      return error(c, 'REVALIDATION_FAILED', 'Astro revalidation failed', 502);
    }

    console.info('[CMS Revalidation] Astro notified successfully');
    return success(c, { revalidated: true }, 'Revalidation triggered');
  } catch (err) {
    console.error('[CMS Revalidation] Failed to notify Astro:', err);
    return error(c, 'REVALIDATION_FAILED', 'Failed to reach Astro', 502);
  }
});

export { router as cmsRevalidationRouter };
