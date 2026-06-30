import { Hono } from 'hono';
import { healthRouter } from './health.ts';
import { authRouter } from './auth.ts';
import { bookingsRouter } from './bookings.ts';
import { servicesRouter } from './services.ts';
import { serviceCategoriesRouter } from './service-categories.ts';
import { customersRouter } from './customers.ts';
import { addressesRouter } from './addresses.ts';
import { partnersRouter } from './partners.ts';
import { paymentsRouter } from './payments.ts';
import { reviewsRouter } from './reviews.ts';
import { complaintsRouter } from './complaints.ts';
import { companiesRouter } from './companies.ts';
import { notificationsRouter } from './notifications.ts';
import { dashboardRouter } from './admin/dashboard.ts';

const router = new Hono();

router.route('/health', healthRouter);
router.route('/auth', authRouter);
router.route('/bookings', bookingsRouter);
router.route('/services', servicesRouter);
router.route('/service-categories', serviceCategoriesRouter);
router.route('/customers', customersRouter);
router.route('/addresses', addressesRouter);
router.route('/partners', partnersRouter);
router.route('/payments', paymentsRouter);
router.route('/reviews', reviewsRouter);
router.route('/complaints', complaintsRouter);
router.route('/companies', companiesRouter);
router.route('/notifications', notificationsRouter);
router.route('/admin/dashboard', dashboardRouter);

export { router as apiRouter };
