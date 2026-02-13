import { Router } from 'express';
import { ComparisonController } from '../controllers/recommendation.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.post('/', ComparisonController.create);
router.get('/:comparisonId', ComparisonController.getComparison);
router.get('/user/all', authMiddleware, ComparisonController.getUserComparisons);

export default router;
