import { Router } from 'express';
import {
  createTrip,
  getMyTrips,
  getTripById,
  updateTrip,
  deleteTrip,
  getCommunityTrips,
  getTripStats,
  duplicateTrip
} from '../controllers/trip.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Public routes
router.get('/community', getCommunityTrips);

// Protected routes (require authentication)
router.use(authenticate);

// Trip stats for dashboard
router.get('/stats', getTripStats);

// CRUD operations
router.route('/')
  .get(getMyTrips)
  .post(createTrip);

router.route('/:id')
  .get(getTripById)
  .put(updateTrip)
  .delete(deleteTrip);

// Duplicate trip
router.post('/:id/duplicate', duplicateTrip);

export default router;
