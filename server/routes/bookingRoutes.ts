import { Router } from 'express';
import { listBookings, createBooking, updateBooking } from '../controllers/bookingController';
import { protect, authorize, optionalAuth } from '../middleware/auth';

const router = Router();

router.get('/', protect, listBookings);
router.post('/', optionalAuth, createBooking);
router.patch('/:id', protect, authorize('admin', 'designer'), updateBooking);

export default router;
