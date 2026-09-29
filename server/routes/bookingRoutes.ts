import { safeRouter } from '../utils/safeRouter';
import { listBookings, createBooking, updateBooking } from '../controllers/bookingController';
import { protect, authorize, optionalAuth } from '../middleware/auth';
import { bookingLimiter } from '../middleware/rateLimiters';

const router = safeRouter();

router.get('/', protect, listBookings);
router.post('/', bookingLimiter, optionalAuth, createBooking);
router.patch('/:id', protect, authorize('admin', 'designer'), updateBooking);

export default router;
