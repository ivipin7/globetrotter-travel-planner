import { Request, Response } from 'express';
import {
  getDestinationRecommendations,
  analyzeTripPlan,
  generateItinerary,
  getPackingSuggestions,
  askTravelQuestion,
  generateDestinationPageDetails
} from '../services/gemini.service';

// Cache for destination recommendations (5 minute TTL)
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCached(key: string) {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  return null;
}

function setCache(key: string, data: any) {
  cache.set(key, { data, timestamp: Date.now() });
}

// @desc    Get AI-powered destination recommendations
// @route   GET /api/ai/recommendations/:destination
// @access  Public
export const getRecommendations = async (req: Request, res: Response) => {
  try {
    const { destination } = req.params;
    
    if (!destination || destination.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Destination is required (minimum 2 characters)'
      });
    }

    // Check cache first
    const cacheKey = `rec_${destination.toLowerCase()}`;
    const cached = getCached(cacheKey);
    if (cached) {
      return res.json({ success: true, data: cached, cached: true });
    }

    const recommendations = await getDestinationRecommendations(destination);
    setCache(cacheKey, recommendations);

    res.json({
      success: true,
      data: recommendations,
      cached: false
    });
  } catch (error: any) {
    console.error('AI Recommendations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get recommendations',
      error: error.message
    });
  }
};

// @desc    Analyze trip feasibility with AI
// @route   POST /api/ai/analyze-trip
// @access  Public
export const analyzeTrip = async (req: Request, res: Response) => {
  try {
    const { destination, startDate, endDate, budget, currency, activities, travelers } = req.body;

    if (!destination || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Destination, start date, and end date are required'
      });
    }

    const analysis = await analyzeTripPlan(
      destination,
      startDate,
      endDate,
      budget || 0,
      currency || 'USD',
      activities || 0,
      travelers || 1
    );

    res.json({
      success: true,
      data: analysis
    });
  } catch (error: any) {
    console.error('Trip analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze trip',
      error: error.message
    });
  }
};

// @desc    Generate AI itinerary suggestions
// @route   POST /api/ai/generate-itinerary
// @access  Public
export const generateItinerarySuggestions = async (req: Request, res: Response) => {
  try {
    const { destination, startDate, endDate, interests, budget, tripType } = req.body;

    if (!destination || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Destination, start date, and end date are required'
      });
    }

    const itinerary = await generateItinerary(
      destination,
      startDate,
      endDate,
      interests || [],
      budget || 'moderate',
      tripType || 'leisure'
    );

    res.json({
      success: true,
      data: itinerary
    });
  } catch (error: any) {
    console.error('Itinerary generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate itinerary',
      error: error.message
    });
  }
};

// @desc    Get AI packing suggestions
// @route   POST /api/ai/packing-suggestions
// @access  Public
export const getAIPackingSuggestions = async (req: Request, res: Response) => {
  try {
    const { destination, startDate, duration, activities } = req.body;

    if (!destination || !startDate || !duration) {
      return res.status(400).json({
        success: false,
        message: 'Destination, start date, and duration are required'
      });
    }

    const suggestions = await getPackingSuggestions(
      destination,
      startDate,
      duration,
      activities || []
    );

    res.json({
      success: true,
      data: suggestions
    });
  } catch (error: any) {
    console.error('Packing suggestions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get packing suggestions',
      error: error.message
    });
  }
};

// @desc    Ask AI a travel question
// @route   POST /api/ai/ask
// @access  Public
export const askAI = async (req: Request, res: Response) => {
  try {
    const { question, context } = req.body;

    if (!question) {
      return res.status(400).json({
        success: false,
        message: 'Question is required'
      });
    }

    const answer = await askTravelQuestion(question, context);

    res.json({
      success: true,
      data: { answer }
    });
  } catch (error: any) {
    console.error('AI question error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to answer question',
      error: error.message
    });
  }
};

// @desc    Get AI-generated destination page details (activities, travel info, tips)
// @route   GET /api/ai/destination-details/:cityName/:country
// @access  Public
export const getDestinationPageInfo = async (req: Request, res: Response) => {
  try {
    const { cityName, country } = req.params;
    
    if (!cityName || !country) {
      return res.status(400).json({
        success: false,
        message: 'City name and country are required'
      });
    }

    // Check cache first
    const cacheKey = `dest_${cityName.toLowerCase()}_${country.toLowerCase()}`;
    const cached = getCached(cacheKey);
    if (cached) {
      return res.json({ success: true, data: cached, cached: true });
    }

    const details = await generateDestinationPageDetails(cityName, country);
    setCache(cacheKey, details);

    res.json({
      success: true,
      data: details,
      cached: false
    });
  } catch (error: any) {
    console.error('Destination details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get destination details',
      error: error.message
    });
  }
};
