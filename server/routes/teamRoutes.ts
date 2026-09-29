import { safeRouter } from '../utils/safeRouter';
import { listTeamMembers, createTeamMember, updateTeamMember, deleteTeamMember } from '../controllers/teamController';
import { protect, authorize } from '../middleware/auth';

const router = safeRouter();

router.get('/', listTeamMembers);
router.post('/', protect, authorize('admin'), createTeamMember);
router.put('/:id', protect, authorize('admin'), updateTeamMember);
router.delete('/:id', protect, authorize('admin'), deleteTeamMember);

export default router;
