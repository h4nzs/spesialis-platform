import { Hono } from 'hono';
import { eq, and, sql, desc } from 'drizzle-orm';
import {
  db,
  users,
  orders,
  partnerProfiles,
  complaints,
  companies,
  customerProfiles,
  auditLogs,
} from '../../lib/db.ts';
import { authMiddleware, requireRole } from '../../middleware/auth.ts';
import { success } from '../../lib/response.ts';

const router = new Hono();

router.get(
  '/',
  authMiddleware,
  requireRole('admin', 'super_admin', 'dispatcher', 'finance'),
  async (c) => {
    const userRole = c.get('userRole');

    const today = new Date().toISOString().slice(0, 10);

    const [totalUsers] = await db.select({ count: sql<number>`count(*)` }).from(users);
    const [totalCustomers] = await db
      .select({ count: sql<number>`count(*)` })
      .from(customerProfiles);
    const [totalPartners] = await db.select({ count: sql<number>`count(*)` }).from(partnerProfiles);
    const [availablePartners] = await db
      .select({ count: sql<number>`count(*)` })
      .from(partnerProfiles)
      .where(
        and(
          eq(partnerProfiles.availability, 'Available'),
          eq(partnerProfiles.verificationStatus, 'Approved'),
        ),
      );
    const [pendingVerification] = await db
      .select({ count: sql<number>`count(*)` })
      .from(partnerProfiles)
      .where(eq(partnerProfiles.verificationStatus, 'Pending'));

    const [totalOrders] = await db.select({ count: sql<number>`count(*)` }).from(orders);
    const [activeOrders] = await db
      .select({ count: sql<number>`count(*)` })
      .from(orders)
      .where(sql`status NOT IN ('Closed', 'Cancelled', 'Completed')`);
    const [waitingAssignment] = await db
      .select({ count: sql<number>`count(*)` })
      .from(orders)
      .where(eq(orders.status, 'Waiting Assignment'));
    const [todayOrders] = await db
      .select({ count: sql<number>`count(*)` })
      .from(orders)
      .where(sql`created_at >= ${today}`);

    const [totalRevenue] = await db
      .select({ total: sql<number>`COALESCE(SUM(CAST(final_price AS DECIMAL)), 0)` })
      .from(orders)
      .where(eq(orders.status, 'Paid'));

    const [totalComplaints] = await db.select({ count: sql<number>`count(*)` }).from(complaints);
    const [openComplaints] = await db
      .select({ count: sql<number>`count(*)` })
      .from(complaints)
      .where(sql`status NOT IN ('Resolved', 'Closed')`);

    const [totalCompanies] = await db
      .select({ count: sql<number>`count(*)` })
      .from(companies)
      .where(eq(companies.status, 'Verified'));

    const stats = {
      users: {
        total: Number(totalUsers?.count ?? 0),
        customers: Number(totalCustomers?.count ?? 0),
        partners: Number(totalPartners?.count ?? 0),
      },
      partners: {
        available: Number(availablePartners?.count ?? 0),
        pendingVerification: Number(pendingVerification?.count ?? 0),
      },
      orders: {
        total: Number(totalOrders?.count ?? 0),
        active: Number(activeOrders?.count ?? 0),
        waitingAssignment: Number(waitingAssignment?.count ?? 0),
        today: Number(todayOrders?.count ?? 0),
      },
      revenue: { total: Number(totalRevenue?.total ?? 0) },
      complaints: {
        total: Number(totalComplaints?.count ?? 0),
        open: Number(openComplaints?.count ?? 0),
      },
      companies: { verified: Number(totalCompanies?.count ?? 0) },
    };

    const allowed =
      userRole === 'finance'
        ? { revenue: stats.revenue }
        : userRole === 'dispatcher'
          ? {
              partners: { available: stats.partners.available },
              orders: {
                active: stats.orders.active,
                waitingAssignment: stats.orders.waitingAssignment,
              },
            }
          : stats;

    return success(c, allowed);
  },
);

router.get(
  '/revenue',
  authMiddleware,
  requireRole('admin', 'super_admin', 'finance'),
  async (c) => {
    const monthsBack = Number(c.req.query('months') ?? 12);
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - monthsBack);

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
  `)) as unknown as Array<{ month: string; order_count: number; revenue: number }>;

    // Calculate month-over-month growth
    const months = revenueByMonth as Array<{ month: string; order_count: number; revenue: number }>;
    let growthPercent: number | null = null;
    if (months.length >= 2) {
      const prev = months[months.length - 2]!.revenue;
      const curr = months[months.length - 1]!.revenue;
      growthPercent = prev > 0 ? Math.round(((curr - prev) / prev) * 100) : null;
    }

    return success(c, {
      revenueByMonth: months,
      totalRevenue: months.reduce((sum, m) => sum + Number(m.revenue), 0),
      growthPercent,
      monthsCount: months.length,
    });
  },
);

router.get('/activity', authMiddleware, requireRole('admin', 'super_admin'), async (c) => {
  const limit = Number(c.req.query('limit') ?? 20);

  const items = await db
    .select({
      id: auditLogs.id,
      action: auditLogs.action,
      entity: auditLogs.entity,
      entityId: auditLogs.entityId,
      ipAddress: auditLogs.ipAddress,
      createdAt: auditLogs.createdAt,
      userEmail: users.email,
      userRole: users.role,
    })
    .from(auditLogs)
    .leftJoin(users, eq(auditLogs.userId, users.id))
    .orderBy(desc(auditLogs.createdAt))
    .limit(limit);

  return success(c, items);
});

export { router as dashboardRouter };
