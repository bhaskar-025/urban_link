import express from 'express';
import { createComplaint, getUserComplaints, getAllPublicComplaints, uploadImage, getComplaintById, deleteComplaint, upvoteComplaint, downvoteComplaint, getCityComplaints } from '../controllers/complaintController';
import { protect } from '../middlewares/authMiddleware';
import { upload } from '../middlewares/uploadMiddleware';

const router = express.Router();

router.post('/', protect, upload.single('images'), createComplaint);
router.post('/upload', protect, upload.single('image'), uploadImage);
router.get('/', protect, getUserComplaints);
router.get('/map', protect, getAllPublicComplaints);
router.get('/city/:city', protect, getCityComplaints);
router.post('/:id/upvote', protect, upvoteComplaint);
router.post('/:id/downvote', protect, downvoteComplaint);
router.get('/:id', protect, getComplaintById);
router.delete('/:id', protect, deleteComplaint);

export default router;
