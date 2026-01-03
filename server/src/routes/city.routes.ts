import { Router } from 'express';
import {
  getCities,
  getCityById,
  getTrendingCities,
  getCitiesByRegion,
  searchCities,
  getRegions,
  hybridSearch,
  getOrCreateDestination
} from '../controllers/city.controller';

const router = Router();

// Public routes - no auth required
router.get('/', getCities);
router.get('/trending', getTrendingCities);
router.get('/search', searchCities);
router.get('/hybrid', hybridSearch); // Hybrid search with global fallback
router.get('/discover', getOrCreateDestination); // NEW: Get or create destination
router.get('/regions', getRegions);
router.get('/region/:region', getCitiesByRegion);
router.get('/:id', getCityById);

export default router;
