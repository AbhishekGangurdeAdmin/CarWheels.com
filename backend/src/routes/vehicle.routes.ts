import { Router } from 'express';
import { VehicleController } from '../controllers/vehicle.controller';

const router = Router();

router.get('/', VehicleController.getAll);
router.get('/search', VehicleController.search);
router.get('/categories', VehicleController.getCategories);
router.get('/:slug', VehicleController.getBySlug);

export default router;
