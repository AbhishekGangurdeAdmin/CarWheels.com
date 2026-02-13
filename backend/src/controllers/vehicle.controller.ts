import { Request, Response } from 'express';
import { VehicleService } from '../services/vehicle.service';
import { asyncHandler } from '../middleware/errorHandler';

export const VehicleController = {
  getAll: asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;

    const filters = {
      category: req.query.category,
      fuelType: req.query.fuelType,
      transmission: req.query.transmission,
      minPrice: req.query.minPrice,
      maxPrice: req.query.maxPrice,
      sortBy: req.query.sortBy,
    };

    const result = await VehicleService.getAllVehicles(filters, page, limit);
    res.json(result);
  }),

  getBySlug: asyncHandler(async (req: Request, res: Response) => {
    const { slug } = req.params;
    const vehicle = await VehicleService.getVehicleBySlug(slug);

    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    // Increment view count
    await VehicleService.incrementViewCount(vehicle.id);

    // Get variants and similar vehicles
    const variants = await VehicleService.getVariantsByVehicleId(vehicle.id);
    const similar = await VehicleService.getSimilarVehicles(vehicle.id);

    res.json({
      vehicle,
      variants,
      similar,
    });
  }),

  search: asyncHandler(async (req: Request, res: Response) => {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const vehicles = await VehicleService.searchVehicles(q as string);
    res.json({ vehicles });
  }),

  getCategories: asyncHandler(async (req: Request, res: Response) => {
    const categories = ['SUV', 'Sedan', 'Hatchback', 'MPV', 'Cruiser', 'Sports Bike', 'EV'];
    res.json({ categories });
  }),
};
