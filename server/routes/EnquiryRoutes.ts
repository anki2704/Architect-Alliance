import { safeRouter } from '../utils/safeRouter';
import { listMessages, createMessage } from '../controllers/EnquiryController';
import { protect, authorize } from '../middleware/auth';
import { enquiryLimiter } from '../middleware/rateLimiters';

const router = safeRouter();

router.get('/', protect, authorize('admin'), listMessages);
router.post('/', enquiryLimiter, createMessage);

export default router;
