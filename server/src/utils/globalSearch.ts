/**
 * Global Destination Search Utility
 * 
 * Provides fallback search capability using OpenStreetMap Nominatim API
 * when local database has no results. Uses Gemini AI to enrich destination data.
 */

import { generateDestinationDetails } from '../services/gemini.service';

// ============================================
// REGION MAPPING - Country to Region
// ============================================
const COUNTRY_TO_REGION: Record<string, string> = {
  // Asia
  'japan': 'Asia', 'china': 'Asia', 'india': 'Asia', 'thailand': 'Asia',
  'vietnam': 'Asia', 'indonesia': 'Asia', 'malaysia': 'Asia', 'singapore': 'Asia',
  'philippines': 'Asia', 'south korea': 'Asia', 'taiwan': 'Asia', 'nepal': 'Asia',
  'sri lanka': 'Asia', 'bangladesh': 'Asia', 'myanmar': 'Asia', 'cambodia': 'Asia',
  'laos': 'Asia', 'mongolia': 'Asia', 'pakistan': 'Asia', 'maldives': 'Asia',
  
  // Europe
  'france': 'Europe', 'germany': 'Europe', 'deutschland': 'Europe', 'italy': 'Europe', 'italia': 'Europe', 'spain': 'Europe', 'españa': 'Europe',
  'united kingdom': 'Europe', 'netherlands': 'Europe', 'nederland': 'Europe', 'belgium': 'Europe', 'belgique': 'Europe', 'belgië': 'Europe',
  'switzerland': 'Europe', 'schweiz': 'Europe', 'suisse': 'Europe', 'austria': 'Europe', 'österreich': 'Europe', 'portugal': 'Europe',
  'greece': 'Europe', 'ελλάδα': 'Europe', 'czech republic': 'Europe', 'czechia': 'Europe', 'česko': 'Europe', 'poland': 'Europe', 'polska': 'Europe',
  'hungary': 'Europe', 'magyarország': 'Europe', 'sweden': 'Europe', 'sverige': 'Europe', 'norway': 'Europe', 'norge': 'Europe', 'denmark': 'Europe', 'danmark': 'Europe',
  'finland': 'Europe', 'suomi': 'Europe', 'ireland': 'Europe', 'scotland': 'Europe', 'croatia': 'Europe', 'hrvatska': 'Europe',
  'slovenia': 'Europe', 'slovenija': 'Europe', 'romania': 'Europe', 'românia': 'Europe', 'bulgaria': 'Europe', 'българия': 'Europe', 'iceland': 'Europe', 'ísland': 'Europe',
  'luxembourg': 'Europe', 'monaco': 'Europe', 'malta': 'Europe', 'cyprus': 'Europe', 'κύπρος': 'Europe',
  
  // North America
  'united states': 'North America', 'usa': 'North America', 'canada': 'North America',
  'mexico': 'North America', 'cuba': 'North America', 'jamaica': 'North America',
  'bahamas': 'North America', 'dominican republic': 'North America', 'puerto rico': 'North America',
  'costa rica': 'North America', 'panama': 'North America', 'guatemala': 'North America',
  'belize': 'North America', 'honduras': 'North America', 'el salvador': 'North America',
  'nicaragua': 'North America',
  
  // South America
  'brazil': 'South America', 'argentina': 'South America', 'chile': 'South America',
  'peru': 'South America', 'colombia': 'South America', 'ecuador': 'South America',
  'bolivia': 'South America', 'venezuela': 'South America', 'uruguay': 'South America',
  'paraguay': 'South America', 'guyana': 'South America', 'suriname': 'South America',
  
  // Africa
  'south africa': 'Africa', 'egypt': 'Africa', 'morocco': 'Africa', 'kenya': 'Africa',
  'tanzania': 'Africa', 'ethiopia': 'Africa', 'nigeria': 'Africa', 'ghana': 'Africa',
  'tunisia': 'Africa', 'algeria': 'Africa', 'namibia': 'Africa', 'botswana': 'Africa',
  'zimbabwe': 'Africa', 'zambia': 'Africa', 'uganda': 'Africa', 'rwanda': 'Africa',
  'mauritius': 'Africa', 'seychelles': 'Africa', 'madagascar': 'Africa', 'senegal': 'Africa',
  
  // Middle East
  'united arab emirates': 'Middle East', 'uae': 'Middle East', 'dubai': 'Middle East',
  'saudi arabia': 'Middle East', 'qatar': 'Middle East', 'israel': 'Middle East',
  'jordan': 'Middle East', 'lebanon': 'Middle East', 'turkey': 'Middle East',
  'iran': 'Middle East', 'iraq': 'Middle East', 'oman': 'Middle East',
  'bahrain': 'Middle East', 'kuwait': 'Middle East', 'yemen': 'Middle East',
  
  // Oceania
  'australia': 'Oceania', 'new zealand': 'Oceania', 'fiji': 'Oceania',
  'papua new guinea': 'Oceania', 'samoa': 'Oceania', 'tonga': 'Oceania',
  'vanuatu': 'Oceania', 'solomon islands': 'Oceania', 'french polynesia': 'Oceania',
  'new caledonia': 'Oceania', 'guam': 'Oceania', 'palau': 'Oceania',
};

// ============================================
// COST LEVEL MAPPING - Country to Cost Index
// ============================================
const LUXURY_COUNTRIES = new Set([
  'switzerland', 'norway', 'iceland', 'denmark', 'sweden', 'japan', 'singapore',
  'united arab emirates', 'uae', 'qatar', 'monaco', 'luxembourg', 'maldives'
]);

const EXPENSIVE_COUNTRIES = new Set([
  'united states', 'usa', 'united kingdom', 'france', 'germany', 'italy',
  'australia', 'new zealand', 'canada', 'netherlands', 'belgium', 'austria',
  'ireland', 'finland', 'israel', 'south korea', 'hong kong'
]);

const BUDGET_COUNTRIES = new Set([
  'india', 'vietnam', 'cambodia', 'laos', 'nepal', 'bangladesh', 'myanmar',
  'indonesia', 'philippines', 'bolivia', 'ecuador', 'peru', 'guatemala',
  'nicaragua', 'honduras', 'egypt', 'morocco', 'tunisia', 'ethiopia'
]);

// ============================================
// TAG KEYWORDS - For rule-based tag generation
// ============================================
const TAG_KEYWORDS: Record<string, string[]> = {
  'Beach': ['beach', 'coast', 'island', 'sea', 'ocean', 'bay', 'shore', 'marina', 'reef', 'lagoon'],
  'Mountains': ['mountain', 'peak', 'alps', 'hill', 'highland', 'ridge', 'summit', 'himalaya'],
  'Culture': ['historic', 'heritage', 'ancient', 'temple', 'palace', 'castle', 'museum', 'old town', 'monument'],
  'Nature': ['park', 'forest', 'jungle', 'wildlife', 'safari', 'lake', 'river', 'waterfall', 'canyon', 'valley'],
  'Adventure': ['trek', 'hiking', 'diving', 'surf', 'ski', 'climbing', 'rafting'],
  'City': ['city', 'metropolitan', 'urban', 'capital', 'downtown'],
  'Relaxation': ['spa', 'resort', 'retreat', 'wellness', 'peaceful'],
  'Food': ['cuisine', 'culinary', 'food', 'gastronomy', 'wine'],
};

// ============================================
// NOMINATIM API RESPONSE INTERFACE
// ============================================
interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  type: string;
  class: string;
  importance: number;
  addresstype?: string;
  name?: string;
}

// ============================================
// NORMALIZED DESTINATION INTERFACE
// ============================================
export interface NormalizedDestination {
  name: string;
  country: string;
  region: string;
  latitude: number;
  longitude: number;
  costIndex: number;
  popularityScore: number;
  tags: string[];
  description: string;
  imageUrl: string;
  source: 'local' | 'global';
  highlights?: string[];
  bestTimeToVisit?: string;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Extract country from Nominatim display_name
 * Format: "City, State/Region, Country"
 */
function extractCountry(displayName: string): string {
  const parts = displayName.split(',').map(p => p.trim());
  // Country is usually the last part
  const country = parts[parts.length - 1];
  return country || 'Unknown';
}

/**
 * Extract city/place name from Nominatim result
 */
function extractName(result: NominatimResult): string {
  if (result.name) return result.name;
  
  const parts = result.display_name.split(',').map(p => p.trim());
  return parts[0] || 'Unknown Place';
}

/**
 * Map country to region using our static mapping
 * Handles multi-language country names from Nominatim
 */
function mapCountryToRegion(country: string): string {
  const normalized = country.toLowerCase().trim();
  
  // Direct lookup
  if (COUNTRY_TO_REGION[normalized]) {
    return COUNTRY_TO_REGION[normalized];
  }
  
  // Handle multi-language country names (e.g., "Schweiz/Suisse/Svizzera/Svizra")
  const parts = normalized.split('/');
  for (const part of parts) {
    const trimmed = part.trim();
    if (COUNTRY_TO_REGION[trimmed]) {
      return COUNTRY_TO_REGION[trimmed];
    }
  }
  
  // Fallback: try to find partial matches
  for (const [key, region] of Object.entries(COUNTRY_TO_REGION)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return region;
    }
  }
  
  return 'Europe'; // Default to Europe as safer fallback
}

/**
 * Estimate cost level based on country
 * Returns 1-4 (₹ to ₹₹₹₹)
 */
function estimateCostLevel(country: string): number {
  const normalized = country.toLowerCase().trim();
  
  if (LUXURY_COUNTRIES.has(normalized)) return 4;
  if (EXPENSIVE_COUNTRIES.has(normalized)) return 3;
  if (BUDGET_COUNTRIES.has(normalized)) return 1;
  
  return 2; // Default mid-range
}

/**
 * Generate tags based on place type and name
 */
function generateTags(result: NominatimResult, country: string): string[] {
  const tags: Set<string> = new Set();
  const searchText = `${result.display_name} ${result.type} ${result.class}`.toLowerCase();
  
  // Check each tag keyword
  for (const [tag, keywords] of Object.entries(TAG_KEYWORDS)) {
    if (keywords.some(keyword => searchText.includes(keyword))) {
      tags.add(tag);
    }
  }
  
  // Add default tag based on type
  if (result.type === 'city' || result.type === 'town' || result.class === 'place') {
    tags.add('City');
  }
  
  // Always add "Explore" as a default
  tags.add('Explore');
  
  // Limit to 4 tags
  return Array.from(tags).slice(0, 4);
}

/**
 * Generate a description for the destination
 */
function generateDescription(name: string, country: string, tags: string[]): string {
  const tagText = tags.filter(t => t !== 'Explore').slice(0, 2).join(' and ');
  
  if (tagText) {
    return `Discover ${name}, a destination known for ${tagText.toLowerCase()} in ${country}. A perfect spot for travelers seeking new adventures.`;
  }
  
  return `Explore ${name} in ${country}. A destination waiting to be discovered with unique experiences and local charm.`;
}

/**
 * Generate Unsplash image URL for destination
 */
function generateImageUrl(name: string, country: string): string {
  // Use Unsplash source for reliable, free images
  const query = encodeURIComponent(`${name} ${country} travel`);
  return `https://source.unsplash.com/800x600/?${query}`;
}

// ============================================
// MAIN FUNCTION: Global Search
// ============================================

/**
 * Search OpenStreetMap Nominatim for destinations
 * Called only when local database has no results
 * 
 * @param query - Search query string
 * @param limit - Maximum results (default 5)
 * @returns Array of normalized destinations
 */
export async function searchGlobalDestinations(
  query: string,
  limit: number = 5
): Promise<NormalizedDestination[]> {
  try {
    // Build Nominatim API URL
    const url = new URL('https://nominatim.openstreetmap.org/search');
    url.searchParams.set('format', 'json');
    url.searchParams.set('limit', String(limit));
    url.searchParams.set('q', query);
    url.searchParams.set('addressdetails', '1');
    url.searchParams.set('extratags', '1');
    
    // Make request with proper User-Agent (required by Nominatim)
    const response = await fetch(url.toString(), {
      headers: {
        'User-Agent': 'GlobeTrotter-Travel-Planner/1.0',
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      console.error(`Nominatim API error: ${response.status}`);
      return [];
    }
    
    const results: NominatimResult[] = await response.json() as NominatimResult[];
    
    // Filter to only include places (cities, towns, villages, etc.)
    const placeResults = results.filter(r => 
      r.class === 'place' || 
      r.class === 'boundary' ||
      r.type === 'city' ||
      r.type === 'town' ||
      r.type === 'village' ||
      r.type === 'administrative'
    );
    
    // If no place results, use original results
    const finalResults = placeResults.length > 0 ? placeResults : results;
    
    // Normalize results with AI enrichment
    const normalizedResults: NormalizedDestination[] = [];
    
    for (const result of finalResults.slice(0, 3)) { // Limit to 3 for AI calls
      const name = extractName(result);
      const country = extractCountry(result.display_name);
      const region = mapCountryToRegion(country);
      
      // Use AI to generate real destination details
      console.log(`🤖 Enriching destination: ${name}, ${country}...`);
      let aiDetails;
      try {
        aiDetails = await generateDestinationDetails(name, country, region);
      } catch (err) {
        console.log(`⚠️ AI enrichment failed for ${name}, using defaults`);
        // Fallback to basic estimation if AI fails
        aiDetails = {
          description: generateDescription(name, country, generateTags(result, country)),
          costIndex: estimateCostLevel(country),
          popularityScore: 70,
          tags: generateTags(result, country),
          highlights: [],
          bestTimeToVisit: 'Year-round'
        };
      }
      
      normalizedResults.push({
        name,
        country,
        region,
        latitude: parseFloat(result.lat),
        longitude: parseFloat(result.lon),
        costIndex: aiDetails.costIndex,
        popularityScore: aiDetails.popularityScore,
        tags: aiDetails.tags,
        description: aiDetails.description,
        highlights: aiDetails.highlights,
        bestTimeToVisit: aiDetails.bestTimeToVisit,
        imageUrl: generateImageUrl(name, country),
        source: 'global' as const,
      });
    }
    
    return normalizedResults;
  } catch (error) {
    console.error('Global search error:', error);
    return []; // Return empty on any error - graceful degradation
  }
}

/**
 * Check if a destination already exists in database
 * Used to prevent duplicates when caching global results
 */
export function createDuplicateCheckQuery(destination: NormalizedDestination): object {
  return {
    $or: [
      // Exact name + country match
      { 
        name: { $regex: new RegExp(`^${escapeRegex(destination.name)}$`, 'i') },
        country: { $regex: new RegExp(`^${escapeRegex(destination.country)}$`, 'i') }
      },
      // Close coordinate match (within ~1km)
      {
        latitude: { 
          $gte: destination.latitude - 0.01, 
          $lte: destination.latitude + 0.01 
        },
        longitude: { 
          $gte: destination.longitude - 0.01, 
          $lte: destination.longitude + 0.01 
        }
      }
    ]
  };
}

/**
 * Escape special regex characters in string
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
