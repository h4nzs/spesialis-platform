import { Hono } from 'hono';
import { eq, and, asc } from 'drizzle-orm';
import { db, serviceCategories, services } from '../lib/db.ts';
import { success, notFound } from '../lib/response.ts';

const router = new Hono();

router.get('/', async (c) => {
  const items = await db
    .select({
      id: serviceCategories.id,
      name: serviceCategories.name,
      slug: serviceCategories.slug,
      description: serviceCategories.description,
      icon: serviceCategories.icon,
      image: serviceCategories.image,
      displayOrder: serviceCategories.displayOrder,
    })
    .from(serviceCategories)
    .where(eq(serviceCategories.isActive, true))
    .orderBy(asc(serviceCategories.displayOrder));

  return success(c, items);
});

router.get('/:slug', async (c) => {
  const slug = c.req.param('slug')!;

  const [category] = await db
    .select({
      id: serviceCategories.id,
      name: serviceCategories.name,
      slug: serviceCategories.slug,
      description: serviceCategories.description,
      icon: serviceCategories.icon,
      image: serviceCategories.image,
    })
    .from(serviceCategories)
    .where(eq(serviceCategories.slug, slug))
    .limit(1);

  if (!category) return notFound(c, 'Kategori tidak ditemukan');

  const serviceList = await db
    .select({
      id: services.id,
      name: services.name,
      slug: services.slug,
      shortDescription: services.shortDescription,
      basePrice: services.basePrice,
      thumbnail: services.thumbnail,
    })
    .from(services)
    .where(and(eq(services.categoryId, category.id), eq(services.isActive, true)))
    .orderBy(asc(services.displayOrder));

  return success(c, { ...category, services: serviceList });
});

export { router as serviceCategoriesRouter };
