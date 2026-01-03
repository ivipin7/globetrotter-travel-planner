import { Request, Response } from 'express';
import City, { ICity } from '../models/City';
import { searchGlobalDestinations, createDuplicateCheckQuery, NormalizedDestination } from '../utils/globalSearch';

// Get all cities with filtering
export const getCities = async (req: Request, res: Response) => {
  try {
    const {
      region,
      costIndex,
      search,
      trending,
      popular,
      limit = 20,
      page = 1
    } = req.query;

    const query: any = {};

    // Region filter
    if (region && region !== 'All Regions') {
      query.region = region;
    }

    // Cost filter
    if (costIndex) {
      query.costIndex = Number(costIndex);
    }

    // Search by name, country, or tags
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { country: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search as string, 'i')] } }
      ];
    }

    // Trending (high popularity score)
    if (trending === 'true') {
      query.popularityScore = { $gte: 80 };
    }

    // Popular (moderate+ popularity)
    if (popular === 'true') {
      query.popularityScore = { $gte: 60 };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [cities, total] = await Promise.all([
      City.find(query)
        .sort({ popularityScore: -1 })
        .skip(skip)
        .limit(Number(limit)),
      City.countDocuments(query)
    ]);

    res.json({
      cities,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching cities:', error);
    res.status(500).json({ message: 'Error fetching cities' });
  }
};

// Get single city by ID
export const getCityById = async (req: Request, res: Response) => {
  try {
    const city = await City.findById(req.params.id);
    
    if (!city) {
      return res.status(404).json({ message: 'City not found' });
    }

    res.json(city);
  } catch (error) {
    console.error('Error fetching city:', error);
    res.status(500).json({ message: 'Error fetching city' });
  }
};

// Get trending cities
export const getTrendingCities = async (req: Request, res: Response) => {
  try {
    const cities = await City.find({ popularityScore: { $gte: 80 } })
      .sort({ popularityScore: -1 })
      .limit(8);

    res.json(cities);
  } catch (error) {
    console.error('Error fetching trending cities:', error);
    res.status(500).json({ message: 'Error fetching trending cities' });
  }
};

// Get cities by region
export const getCitiesByRegion = async (req: Request, res: Response) => {
  try {
    const { region } = req.params;
    
    const cities = await City.find({ region })
      .sort({ popularityScore: -1 })
      .limit(10);

    res.json(cities);
  } catch (error) {
    console.error('Error fetching cities by region:', error);
    res.status(500).json({ message: 'Error fetching cities' });
  }
};

// Search cities
export const searchCities = async (req: Request, res: Response) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const searchQuery: Record<string, any> = {
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { country: { $regex: q, $options: 'i' } },
        { tags: { $in: [new RegExp(q as string, 'i')] } }
      ]
    };

    const cities = await City.find(searchQuery)
      .sort({ popularityScore: -1 })
      .limit(10);

    res.json(cities);
  } catch (error) {
    console.error('Error searching cities:', error);
    res.status(500).json({ message: 'Error searching cities' });
  }
};

// Get all regions (for filters)
export const getRegions = async (_req: Request, res: Response) => {
  try {
    const regions = await City.distinct('region');
    res.json(['All Regions', ...regions]);
  } catch (error) {
    console.error('Error fetching regions:', error);
    res.status(500).json({ message: 'Error fetching regions' });
  }
};

// ============================================
// HYBRID SEARCH - Local DB + Global Fallback
// ============================================

/**
 * Hybrid destination search
 * 1. Search local database first
 * 2. If no results and search query exists, search globally
 * 3. Cache global results for future searches
 */
export const hybridSearch = async (req: Request, res: Response) => {
  try {
    const {
      region,
      costIndex,
      search,
      limit = 20,
      page = 1
    } = req.query;

    const query: Record<string, any> = {};
    const searchQuery = search as string;

    // Region filter
    if (region && region !== 'All Regions') {
      query.region = region as string;
    }

    // Cost filter
    if (costIndex) {
      query.costIndex = Number(costIndex);
    }

    // Search by name, country, or tags
    if (searchQuery) {
      query.$or = [
        { name: { $regex: searchQuery, $options: 'i' } },
        { country: { $regex: searchQuery, $options: 'i' } },
        { tags: { $in: [new RegExp(searchQuery, 'i')] } }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    // Step 1: Search local database
    const [localCities, total] = await Promise.all([
      City.find(query)
        .sort({ popularityScore: -1 })
        .skip(skip)
        .limit(Number(limit)),
      City.countDocuments(query)
    ]);

    // If we have local results, return them
    if (localCities.length > 0) {
      return res.json({
        cities: localCities,
        pagination: {
          total,
          page: Number(page),
          pages: Math.ceil(total / Number(limit))
        },
        source: 'local'
      });
    }

    // Step 2: No local results + search query exists → Global fallback
    if (searchQuery && searchQuery.length >= 2) {
      console.log(`🌐 No local results for "${searchQuery}", searching globally...`);
      
      const globalResults = await searchGlobalDestinations(searchQuery, Number(limit));
      
      if (globalResults.length > 0) {
        // Step 3: Cache global results (avoid duplicates)
        const savedCities = await cacheGlobalResults(globalResults);
        
        console.log(`✅ Cached ${savedCities.length} new destinations from global search`);
        
        return res.json({
          cities: savedCities,
          pagination: {
            total: savedCities.length,
            page: 1,
            pages: 1
          },
          source: 'global'
        });
      }
    }

    // No results from either source
    return res.json({
      cities: [],
      pagination: {
        total: 0,
        page: Number(page),
        pages: 0
      },
      source: 'none'
    });
  } catch (error) {
    console.error('Error in hybrid search:', error);
    res.status(500).json({ message: 'Error searching destinations' });
  }
};

/**
 * Cache global search results into database
 * Prevents duplicates by checking existing entries
 */
async function cacheGlobalResults(destinations: NormalizedDestination[]): Promise<any[]> {
  const savedCities: any[] = [];
  
  for (const destination of destinations) {
    try {
      // Check if destination already exists
      const duplicateQuery = createDuplicateCheckQuery(destination);
      const existing = await City.findOne(duplicateQuery);
      
      if (existing) {
        // Already exists, return existing
        savedCities.push(existing);
        continue;
      }
      
      // Create new city entry with AI-enriched data
      const newCity = new City({
        name: destination.name,
        country: destination.country,
        region: destination.region,
        latitude: destination.latitude,
        longitude: destination.longitude,
        costIndex: destination.costIndex,
        popularityScore: destination.popularityScore,
        tags: destination.tags,
        description: destination.description,
        highlights: destination.highlights || [],
        bestTimeToVisit: destination.bestTimeToVisit || 'Year-round',
        imageUrl: destination.imageUrl,
        source: 'global'
      });
      
      const saved = await newCity.save();
      savedCities.push(saved);
    } catch (err) {
      console.error(`Failed to cache destination ${destination.name}:`, err);
      // Continue with other destinations even if one fails
    }
  }
  
  return savedCities;
}

/**
 * Get a single global destination by searching
 * Used when user clicks on a destination detail that hasn't been cached yet
 */
export const getOrCreateDestination = async (req: Request, res: Response) => {
  try {
    const { name, country } = req.query;
    
    if (!name) {
      return res.status(400).json({ message: 'Destination name is required' });
    }
    
    // First, try to find in database
    const query: any = {
      name: { $regex: new RegExp(`^${name}$`, 'i') }
    };
    
    if (country) {
      query.country = { $regex: new RegExp(`^${country}$`, 'i') };
    }
    
    let city = await City.findOne(query);
    
    if (city) {
      return res.json(city);
    }
    
    // Not found locally, search globally
    const searchTerm = country ? `${name}, ${country}` : name as string;
    const globalResults = await searchGlobalDestinations(searchTerm, 1);
    
    if (globalResults.length > 0) {
      const cached = await cacheGlobalResults([globalResults[0]]);
      return res.json(cached[0]);
    }
    
    return res.status(404).json({ message: 'Destination not found' });
  } catch (error) {
    console.error('Error getting destination:', error);
    res.status(500).json({ message: 'Error fetching destination' });
  }
};
