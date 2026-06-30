import { Hono } from 'hono';
import { healthRouter } from './health.ts';
import { authRouter } from './auth.ts';
import { bookingsRouter } from './bookings.ts';

const router = new Hono();

router.route('/health', healthRouter);
router.route('/auth', authRouter);
router.route('/bookings', bookingsRouter);

export { router as apiRouter };
