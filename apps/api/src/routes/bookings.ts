import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth.ts';
import { success, created, notFound } from '../lib/response.ts';

const router = new Hono();

router.get('/', authMiddleware, async (c) => {
  return success(c, [], 'List bookings — not yet implemented');
});

router.post('/', async (c) => {
  return created(c, null, 'Create booking — not yet implemented');
});

router.get('/:id', authMiddleware, async (c) => {
  return notFound(c, 'Booking endpoint — not yet implemented');
});

router.post('/:id/confirm', authMiddleware, async (c) => {
  return success(c, null, 'Confirm booking — not yet implemented');
});

router.post('/:id/assign', authMiddleware, async (c) => {
  return success(c, null, 'Assign partner — not yet implemented');
});

router.post('/:id/accept', authMiddleware, async (c) => {
  return success(c, null, 'Accept assignment — not yet implemented');
});

router.post('/:id/reject', authMiddleware, async (c) => {
  return success(c, null, 'Reject assignment — not yet implemented');
});

router.post('/:id/start', authMiddleware, async (c) => {
  return success(c, null, 'Start job — not yet implemented');
});

router.post('/:id/complete', authMiddleware, async (c) => {
  return success(c, null, 'Complete job — not yet implemented');
});

router.post('/:id/payment', authMiddleware, async (c) => {
  return success(c, null, 'Payment — not yet implemented');
});

router.get('/tracking/:bookingNumber', async (c) => {
  return success(c, null, 'Tracking — not yet implemented');
});

export { router as bookingsRouter };
