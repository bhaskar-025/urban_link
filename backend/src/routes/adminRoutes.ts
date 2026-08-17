import express from 'express';
import { getAllComplaints, updateComplaintStatus, getDailyAnalytics } from '../controllers/adminController';
import { protect, isAdmin } from '../middlewares/authMiddleware';

const router = express.Router();

router.use(protect);
router.use(isAdmin);

router.get('/complaints', getAllComplaints);
router.get('/analytics', getDailyAnalytics);
router.patch('/complaints/:id', updateComplaintStatus);

export default router;
