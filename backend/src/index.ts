import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { initializeDatabase } from './db/schema';
import { seedDatabase } from './db/seed';
import { errorHandler } from './middleware/errorHandler';
import { authMiddleware } from './middleware/auth';

import authRoutes from './routes/auth.routes';
import vehicleRoutes from './routes/vehicle.routes';
import reviewRoutes from './routes/review.routes';
import wishlistRoutes from './routes/wishlist.routes';
import comparisonRoutes from './routes/comparison.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/wishlist', authMiddleware, wishlistRoutes);
app.use('/api/comparisons', comparisonRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'API is running' });
});

// Error handling middleware
app.use(errorHandler);

// Initialize database and start server
const startServer = async () => {
  try {
    await initializeDatabase();
    console.log('Database initialized');

    // Check if data already seeded (optional check)
    const seedOnStart = process.env.SEED_ON_START !== 'false';
    if (seedOnStart) {
      try {
        await seedDatabase();
      } catch (error: any) {
        if (error.message?.includes('duplicate')) {
          console.log('Data already seeded, skipping...');
        } else {
          throw error;
        }
      }
    }

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
