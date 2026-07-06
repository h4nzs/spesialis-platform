import { defineEndpoint } from '@directus/extensions-sdk';

interface StatsResponse {
  collections: Record<string, number>;
  users: number;
}

export default defineEndpoint((router, { database }) => {
  router.get('/', async (_req, res) => {
    try {
      const collections = ['cms_articles', 'cms_faq', 'cms_pages', 'cms_homepage_sections'];

      const counts: Record<string, number> = {};
      for (const name of collections) {
        const [result] = await database.raw(`SELECT COUNT(*)::int AS count FROM "${name}"`);
        counts[name] = Number(result?.count ?? 0);
      }

      const [userResult] = await database.raw(`SELECT COUNT(*)::int AS count FROM directus_users`);
      const users = Number(userResult?.count ?? 0);

      const response: StatsResponse = { collections: counts, users };
      res.json(response);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ error: message });
    }
  });
});
