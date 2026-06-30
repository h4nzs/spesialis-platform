import { Hono } from 'hono';
import { eq, and, sql } from 'drizzle-orm';
import {
  db,
  users,
  orders,
  partnerProfiles,
  complaints,
  companies,
  customerProfiles,
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

    const today = new Date();
    today.setHours(0, 0, 0, 0);

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

export { router as dashboardRouter };
