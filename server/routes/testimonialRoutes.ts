import { Router } from 'express';
import {
  listTestimonials,
  listAdminTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial
} from '../controllers/testimonialController';
import { protect, authorize } from '../middleware/auth';
import { testimonialLimiter } from '../middleware/rateLimiters';

const router = Router();

router.get('/', listTestimonials);
// Admin list includes pending (unapproved) testimonials
router.get('/admin', protect, authorize('admin'), listAdminTestimonials);
// Public: clients can submit feedback without login
router.post('/', testimonialLimiter, createTestimonial);
// Admin only for edit/delete
router.put('/:id', protect, authorize('admin'), updateTestimonial);
router.delete('/:id', protect, authorize('admin'), deleteTestimonial);

export default router;
