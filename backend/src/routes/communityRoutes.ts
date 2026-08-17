import express from 'express';
import { getCityMessages, analyzeCityGrid } from '../controllers/communityController';
import { protect } from '../middlewares/authMiddleware';

const router = express.Router();

router.get('/:city/messages', protect, getCityMessages);
router.post('/:city/analyze', protect, analyzeCityGrid);

export default router;
