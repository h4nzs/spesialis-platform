import { Hono } from 'hono';
import { sql } from 'drizzle-orm';
import { db } from '../../lib/db.ts';
import { authMiddleware, requireRole } from '../../middleware/auth.ts';
import { success } from '../../lib/response.ts';

interface MonthRow {
  month: string;
  order_count: number;
  revenue: number;
}

interface StatusRow {
  status: string;
  count: number;
}

interface DayRow {
  day: string;
  count: number;
}

interface TopServiceRow {
  name: string;
  slug: string;
  category: string;
  order_count: number;
}

interface PartnerStatsRow {
  total_partners: number;
  avg_rating: number;
  total_completed_jobs: number;
}

interface TotalOrdersRow {
  total: number;
}

const router = new Hono();

router.get('/', authMiddleware, requireRole('admin', 'super_admin'), async (c) => {
  const period = c.req.query('period') ?? 'year';
  const monthsBack = period === 'month' ? 1 : 12;
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - monthsBack);

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const revenueByMonth = (await db.execute(sql`
      SELECT
        TO_CHAR(created_at, 'YYYY-MM') AS month,
        COUNT(*)::int AS order_count,
        COALESCE(SUM(CAST(final_price AS DECIMAL)), 0) AS revenue
      FROM orders
      WHERE status = 'Paid'
        AND created_at >= ${startDate.toISOString()}
      GROUP BY month
      ORDER BY month ASC
    `)) as unknown as MonthRow[];

  const ordersByStatus = (await db.execute(sql`
      SELECT status, COUNT(*)::int AS count
      FROM orders
      GROUP BY status
      ORDER BY count DESC
    `)) as unknown as StatusRow[];

  const ordersByDay = (await db.execute(sql`
      SELECT
        TO_CHAR(created_at, 'YYYY-MM-DD') AS day,
        COUNT(*)::int AS count
      FROM orders
      WHERE created_at >= ${thirtyDaysAgo.toISOString()}
      GROUP BY day
      ORDER BY day ASC
    `)) as unknown as DayRow[];

  const topServices = (await db.execute(sql`
      SELECT
        s.name,
        s.slug,
        sc.name AS category,
        COUNT(oi.id)::int AS order_count
      FROM order_items oi
      JOIN services s ON s.id = oi.service_id
      LEFT JOIN service_categories sc ON sc.id = s.category_id
      GROUP BY s.id, s.name, s.slug, sc.name
      ORDER BY order_count DESC
      LIMIT 10
    `)) as unknown as TopServiceRow[];

  const partnerStats = (await db.execute(sql`
      SELECT
        COUNT(*)::int AS total_partners,
        COALESCE(AVG(CAST(rating_average AS DECIMAL)), 0) AS avg_rating,
        COALESCE(SUM(completed_jobs), 0)::int AS total_completed_jobs
      FROM partner_profiles
      WHERE verification_status = 'Approved'
    `)) as unknown as PartnerStatsRow[];

  const totalOrdersResult = (await db.execute(sql`
      SELECT COUNT(*)::int AS total FROM orders
    `)) as unknown as TotalOrdersRow[];

  const summary = {
    totalOrders: totalOrdersResult[0]?.total ?? 0,
    totalPartners: partnerStats[0]?.total_partners ?? 0,
    avgRating: Number(partnerStats[0]?.avg_rating ?? 0),
    totalCompletedJobs: partnerStats[0]?.total_completed_jobs ?? 0,
  };

  return success(c, {
    summary,
    revenueByMonth,
    ordersByStatus,
    ordersByDay,
    topServices,
  });
});

export { router as adminReportsRouter };
