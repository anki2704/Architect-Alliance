import { Router } from 'express';
import { listTestimonials, createTestimonial, updateTestimonial, deleteTestimonial } from '../controllers/testimonialController';
import { protect, authorize } from '../middleware/auth';

const router = Router();

router.get('/', listTestimonials);
// Public: clients can submit feedback without login
router.post('/', createTestimonial);
// Admin only for edit/delete
router.put('/:id', protect, authorize('admin'), updateTestimonial);
router.delete('/:id', protect, authorize('admin'), deleteTestimonial);

export default router;
