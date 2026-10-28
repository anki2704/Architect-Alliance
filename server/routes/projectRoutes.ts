import { safeRouter } from '../utils/safeRouter';
import {
  listProjects,
  getProject,
  createProject,
  updateProject,
  setProjectPublished,
  deleteProject
} from '../controllers/projectController';
import { protect, authorize, optionalAuth } from '../middleware/auth';

const router = safeRouter();

// optionalAuth lets signed-in staff see drafts (?all=1); everyone else only gets published projects.
router.get('/', optionalAuth, listProjects);
router.get('/:id', optionalAuth, getProject);
router.post('/', protect, authorize('admin', 'designer'), createProject);
router.put('/:id', protect, authorize('admin', 'designer'), updateProject);
router.patch('/:id/publish', protect, authorize('admin', 'designer'), setProjectPublished);
router.delete('/:id', protect, authorize('admin', 'designer'), deleteProject);

export default router;
