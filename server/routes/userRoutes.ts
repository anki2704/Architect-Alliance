import { Router } from 'express';
import { listUsers, createDesigner, deleteDesigner } from '../controllers/userController';
import { protect, authorize } from '../middleware/auth';

const router = Router();

router.get('/', protect, authorize('admin'), listUsers);
router.post('/', protect, authorize('admin'), createDesigner);
router.delete('/:id', protect, authorize('admin'), deleteDesigner);

export default router;
