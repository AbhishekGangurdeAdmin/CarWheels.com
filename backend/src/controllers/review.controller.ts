import { Request, Response } from 'express';
import { ReviewService } from '../services/review.service';
import { asyncHandler } from '../middleware/errorHandler';

export const ReviewController = {
  getVehicleReviews: asyncHandler(async (req: Request, res: Response) => {
    const { vehicleId } = req.params;
    const page = parseInt(req.query.page as string) || 1;

    const reviews = await ReviewService.getVehicleReviews(parseInt(vehicleId), page);
    res.json(reviews);
  }),

  addReview: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { vehicleId } = req.params;
    const { title, content, rating } = req.body;

    if (!content || !rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Invalid review data' });
    }

    const review = await ReviewService.addReview(parseInt(vehicleId), req.user.userId, {
      title,
      content,
      rating,
    });

    res.status(201).json({
      message: 'Review added successfully',
      review,
    });
  }),

  deleteReview: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { reviewId } = req.params;
    const review = await ReviewService.deleteReview(parseInt(reviewId), req.user.userId);

    if (!review) {
      return res.status(404).json({ error: 'Review not found or you do not have permission to delete it' });
    }

    res.json({ message: 'Review deleted successfully' });
  }),
};
