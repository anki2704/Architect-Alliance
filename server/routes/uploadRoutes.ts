import { safeRouter } from '../utils/safeRouter';
import { uploadImage } from '../controllers/uploadController';
import { protect, authorize } from '../middleware/auth';

const router = safeRouter();

// Only admin (and designer if needed) can upload project images
router.post('/', protect, authorize('admin', 'designer'), uploadImage);

export default router;
