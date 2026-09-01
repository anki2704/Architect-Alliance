import { Router } from 'express';
import { listMessages, createMessage } from '../controllers/EnquiryController';
import { protect, authorize } from '../middleware/auth';

const router = Router();

router.get('/', protect, authorize('admin'), listMessages);
router.post('/', createMessage);

export default router;
