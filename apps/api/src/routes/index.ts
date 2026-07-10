import { Hono } from 'hono';
import { rateLimit } from '../middleware/rate-limiter.ts';
import { csrfProtection } from '../middleware/csrf.ts';
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
import { adminServicesRouter } from './admin/services.ts';
import { adminServiceCategoriesRouter } from './admin/service-categories.ts';
import { mediaRouter } from './media.ts';
import { adminArticlesRouter } from './admin/articles.ts';
import { adminUsersRouter } from './admin/users.ts';
import { adminSettingsRouter } from './admin/settings.ts';
import { adminFaqRouter } from './admin/faq.ts';
import { adminOrdersRouter } from './admin/orders.ts';
import { cmsRouter } from './cms.ts';
import { cmsRevalidationRouter } from './cms-revalidation.ts';
import { seoRouter } from './seo.ts';
import { contractsRouter } from './contracts.ts';
import { invoicesRouter } from './invoices.ts';
import { corporateInquiriesRouter } from './corporate-inquiries.ts';
import { adminAuditLogsRouter } from './admin/audit-logs.ts';
import { adminReportsRouter } from './admin/reports.ts';
import { adminPenaltiesRouter } from './admin/penalties.ts';
import { publicRouter } from './public.ts';
import { adminCmsPagesRouter } from './admin/cms-pages.ts';
import { adminHomepageSectionsRouter } from './admin/homepage-sections.ts';

const router = new Hono();

// Global CSRF protection for state-changing requests
router.use('*', csrfProtection());

// Global default rate limit — 100 requests per 60 detik per IP
// Override dengan rate limit lebih ketat di masing-masing route
router.use('*', rateLimit(100, 60_000));

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
router.route('/admin/services', adminServicesRouter);
router.route('/admin/service-categories', adminServiceCategoriesRouter);
router.route('/admin/articles', adminArticlesRouter);
router.route('/admin/users', adminUsersRouter);
router.route('/admin/settings', adminSettingsRouter);
router.route('/admin/faq', adminFaqRouter);
router.route('/admin/orders', adminOrdersRouter);
router.route('/media', mediaRouter);
router.route('/cms', cmsRouter);
router.route('/cms', cmsRevalidationRouter);
router.route('/seo', seoRouter);
router.route('/contracts', contractsRouter);
router.route('/invoices', invoicesRouter);
router.route('/corporate-inquiries', corporateInquiriesRouter);
router.route('/admin/audit-logs', adminAuditLogsRouter);
router.route('/admin/reports', adminReportsRouter);
router.route('/admin/penalties', adminPenaltiesRouter);
router.route('/public', publicRouter);
router.route('/admin/cms-pages', adminCmsPagesRouter);
router.route('/admin/homepage-sections', adminHomepageSectionsRouter);

export { router as apiRouter };
