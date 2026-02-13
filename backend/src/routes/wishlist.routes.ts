import { Router } from 'express';
import { WishlistController } from '../controllers/comparison.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/', authMiddleware, WishlistController.getWishlist);
router.post('/:vehicleId', authMiddleware, WishlistController.addToWishlist);
router.delete('/:vehicleId', authMiddleware, WishlistController.removeFromWishlist);
router.get('/:vehicleId/check', authMiddleware, WishlistController.isInWishlist);

export default router;
