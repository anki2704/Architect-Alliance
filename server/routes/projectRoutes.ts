import { Router } from 'express';
import { listProjects, getProject, createProject, updateProject, deleteProject } from '../controllers/projectController';
import { protect, authorize } from '../middleware/auth';

const router = Router();

router.get('/', listProjects);
router.get('/:id', getProject);
router.post('/', protect, authorize('admin', 'designer'), createProject);
router.put('/:id', protect, authorize('admin', 'designer'), updateProject);
router.delete('/:id', protect, authorize('admin', 'designer'), deleteProject);

export default router;
