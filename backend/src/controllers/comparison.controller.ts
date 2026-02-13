import { Request, Response } from 'express';
import { WishlistService } from '../services/wishlist.service';
import { asyncHandler } from '../middleware/errorHandler';

export const WishlistController = {
  getWishlist: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const wishlist = await WishlistService.getUserWishlist(req.user.userId);
    res.json({ wishlist });
  }),

  addToWishlist: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { vehicleId } = req.params;
    await WishlistService.addToWishlist(req.user.userId, parseInt(vehicleId));

    res.json({ message: 'Added to wishlist' });
  }),

  removeFromWishlist: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { vehicleId } = req.params;
    await WishlistService.removeFromWishlist(req.user.userId, parseInt(vehicleId));

    res.json({ message: 'Removed from wishlist' });
  }),

  isInWishlist: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { vehicleId } = req.params;
    const inWishlist = await WishlistService.isInWishlist(req.user.userId, parseInt(vehicleId));

    res.json({ inWishlist });
  }),
};
