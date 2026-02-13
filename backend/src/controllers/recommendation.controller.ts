import { Request, Response } from 'express';
import { ComparisonService } from '../services/comparison.service';
import { asyncHandler } from '../middleware/errorHandler';

export const ComparisonController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    const { vehicleIds } = req.body;

    if (!vehicleIds || !Array.isArray(vehicleIds) || vehicleIds.length < 2 || vehicleIds.length > 3) {
      return res.status(400).json({ error: 'Please select 2-3 vehicles to compare' });
    }

    const comparison = await ComparisonService.createComparison(vehicleIds, req.user?.userId);
    res.json({ comparison });
  }),

  getComparison: asyncHandler(async (req: Request, res: Response) => {
    const { comparisonId } = req.params;
    const comparison = await ComparisonService.getComparison(parseInt(comparisonId));

    if (!comparison) {
      return res.status(404).json({ error: 'Comparison not found' });
    }

    res.json({ comparison });
  }),

  getUserComparisons: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const comparisons = await ComparisonService.getUserComparisons(req.user.userId);
    res.json({ comparisons });
  }),
};
