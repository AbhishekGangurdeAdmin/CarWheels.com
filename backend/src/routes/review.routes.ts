import { Router } from 'express';
import { ReviewController } from '../controllers/review.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/:vehicleId', ReviewController.getVehicleReviews);
router.post('/:vehicleId', authMiddleware, ReviewController.addReview);
router.delete('/:reviewId', authMiddleware, ReviewController.deleteReview);

export default router;
