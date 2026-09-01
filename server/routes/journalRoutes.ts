import { Router } from 'express';
import { listJournalPosts, getJournalPost, createJournalPost, updateJournalPost, deleteJournalPost } from '../controllers/journalController';
import { protect, authorize } from '../middleware/auth';

const router = Router();

router.get('/', listJournalPosts);
router.get('/:id', getJournalPost);
router.post('/', protect, authorize('admin'), createJournalPost);
router.put('/:id', protect, authorize('admin'), updateJournalPost);
router.delete('/:id', protect, authorize('admin'), deleteJournalPost);

export default router;
