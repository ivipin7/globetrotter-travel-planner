import { Router } from 'express';
import {
  getRecommendations,
  analyzeTrip,
  generateItinerarySuggestions,
  getAIPackingSuggestions,
  askAI
} from '../controllers/ai.controller';

const router = Router();

// GET /api/ai/recommendations/:destination - Get AI recommendations for a destination
router.get('/recommendations/:destination', getRecommendations);

// POST /api/ai/analyze-trip - Analyze trip feasibility
router.post('/analyze-trip', analyzeTrip);

// POST /api/ai/generate-itinerary - Generate AI itinerary suggestions
router.post('/generate-itinerary', generateItinerarySuggestions);

// POST /api/ai/packing-suggestions - Get AI packing suggestions
router.post('/packing-suggestions', getAIPackingSuggestions);

// POST /api/ai/ask - Ask AI a travel question
router.post('/ask', askAI);

export default router;
