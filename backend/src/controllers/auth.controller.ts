import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { asyncHandler } from '../middleware/errorHandler';

export const AuthController = {
  register: asyncHandler(async (req: Request, res: Response) => {
    const { email, password, full_name, phone, city, state } = req.body;

    if (!email || !password || !full_name) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
      const { user, token } = await AuthService.register({
        email,
        password,
        full_name,
        phone,
        city,
        state,
      });

      res.status(201).json({
        message: 'User registered successfully',
        user,
        token,
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }),

  login: asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
      const { user, token } = await AuthService.login(email, password);
      res.json({
        message: 'Login successful',
        user,
        token,
      });
    } catch (error: any) {
      res.status(401).json({ error: error.message });
    }
  }),

  getProfile: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await AuthService.getUserById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  }),

  updateProfile: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await AuthService.updateUser(req.user.userId, req.body);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'Profile updated successfully',
      user,
    });
  }),
};
