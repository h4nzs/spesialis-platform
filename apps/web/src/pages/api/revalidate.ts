import type { APIRoute } from 'astro';
import { purgeCollectionCache } from '../../lib/cloudflare.ts';

const REVALIDATION_TOKEN =
  (import.meta as unknown as { env: Record<string, string | undefined> }).env.REVALIDATION_TOKEN ??
  '';

export const POST: APIRoute = async ({ request }) => {
  const authHeader = request.headers.get('Authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : '';

  if (!token || token !== REVALIDATION_TOKEN) {
    return new Response(JSON.stringify({ success: false, message: 'Invalid token' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const body = (await request.json()) as {
    collection?: string;
    event?: string;
    key?: string;
  };
  const { collection, event, key } = body;

  console.info('[Astro Revalidation]', { collection, event, key });

  // Purge Cloudflare CDN cache for affected URLs
  if (collection) {
    const result = await purgeCollectionCache({ collection, key });
    if (!result.success) {
      console.error('[Astro Revalidation] CDN purge failed:', result.error);
    }
  }

  return new Response(JSON.stringify({ success: true, message: 'Revalidation acknowledged' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
