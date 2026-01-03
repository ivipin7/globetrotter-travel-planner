import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
  getPackingList,
  addPackingItem,
  updatePackingItem,
  deletePackingItem,
  togglePackedStatus,
  addMultipleItems,
  clearCategory,
  toggleAllPacked
} from '../controllers/packing.controller';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get packing list
router.get('/:tripId', getPackingList);

// Single item operations
router.post('/:tripId/item', addPackingItem);
router.patch('/:tripId/item/:itemId', updatePackingItem);
router.delete('/:tripId/item/:itemId', deletePackingItem);
router.patch('/:tripId/item/:itemId/toggle', togglePackedStatus);

// Bulk operations
router.post('/:tripId/items', addMultipleItems);
router.delete('/:tripId/category/:category', clearCategory);
router.patch('/:tripId/toggle-all', toggleAllPacked);

export default router;
