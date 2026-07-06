import { defineHook } from '@directus/extensions-sdk';

const API_URL = process.env.API_URL ?? 'http://api:3000';
const API_TOKEN = process.env.REVALIDATION_TOKEN ?? '';

const TRIGGERED_COLLECTIONS = new Set([
  'cms_articles',
  'cms_faq',
  'cms_pages',
  'cms_homepage_sections',
]);

async function triggerRevalidation(collection: string, event: string, key: string) {
  try {
    await fetch(`${API_URL}/api/v1/cms/revalidate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_TOKEN}`,
      },
      body: JSON.stringify({ collection, event, key }),
      signal: AbortSignal.timeout(5000),
    });
  } catch {
    // Revalidation is non-critical — silently fail
  }
}

export default defineHook(({ action }) => {
  action('items.create', async (meta: { collection: string; key: string }) => {
    if (TRIGGERED_COLLECTIONS.has(meta.collection)) {
      await triggerRevalidation(meta.collection, 'create', meta.key);
    }
  });

  action('items.update', async (meta: { collection: string; keys: string[] }) => {
    if (TRIGGERED_COLLECTIONS.has(meta.collection)) {
      for (const key of meta.keys) {
        await triggerRevalidation(meta.collection, 'update', key);
      }
    }
  });

  action('items.delete', async (meta: { collection: string; keys: string[] }) => {
    if (TRIGGERED_COLLECTIONS.has(meta.collection)) {
      for (const key of meta.keys) {
        await triggerRevalidation(meta.collection, 'delete', key);
      }
    }
  });
});
