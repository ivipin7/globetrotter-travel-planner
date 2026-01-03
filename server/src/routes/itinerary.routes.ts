import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
  getItinerary,
  addActivity,
  updateActivity,
  deleteActivity,
  toggleActivityComplete,
  reorderActivities,
  updateDayTitle
} from '../controllers/itinerary.controller';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get trip itinerary
router.get('/:tripId', getItinerary);

// Day operations
router.patch('/:tripId/day/:dayNumber/title', updateDayTitle);

// Activity operations
router.post('/:tripId/day/:dayNumber/activity', addActivity);
router.patch('/:tripId/day/:dayNumber/activity/:activityId', updateActivity);
router.delete('/:tripId/day/:dayNumber/activity/:activityId', deleteActivity);
router.patch('/:tripId/day/:dayNumber/activity/:activityId/toggle', toggleActivityComplete);
router.put('/:tripId/day/:dayNumber/reorder', reorderActivities);

export default router;
