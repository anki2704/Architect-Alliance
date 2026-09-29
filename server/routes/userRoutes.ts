import { safeRouter } from '../utils/safeRouter';
import { listUsers, createDesigner, deleteDesigner } from '../controllers/userController';
import { protect, authorize } from '../middleware/auth';

const router = safeRouter();

router.get('/', protect, authorize('admin'), listUsers);
router.post('/', protect, authorize('admin'), createDesigner);
router.delete('/:id', protect, authorize('admin'), deleteDesigner);

export default router;
