import { Router } from 'express';
import { uploadImage } from '../controllers/uploadController';
import { protect, authorize } from '../middleware/auth';

const router = Router();

// Only admin (and designer if needed) can upload project images
router.post('/', protect, authorize('admin', 'designer'), uploadImage);

export default router;
