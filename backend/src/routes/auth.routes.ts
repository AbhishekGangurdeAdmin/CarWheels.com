import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';

const router = Router();

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.get('/profile', AuthController.getProfile);
router.put('/profile', AuthController.updateProfile);

export default router;
