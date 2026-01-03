// Gemini AI Service for Travel Recommendations
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent';

// ============================================
// MULTI-KEY API ROTATION SYSTEM
// ============================================

interface ApiKeyState {
  key: string;
  name: string;
  failCount: number;
  lastUsed: number;
  cooldownUntil: number;
}

class GeminiKeyManager {
  private keys: ApiKeyState[] = [];
  private currentIndex: number = 0;
  private readonly COOLDOWN_MS = 60000; // 1 minute cooldown after failures
  private readonly MAX_FAILS = 3; // Max failures before cooldown

  constructor() {
    this.initializeKeys();
  }

  private initializeKeys(): void {
    const keyConfigs = [
      { env: 'GEMINI_API_KEY', name: 'Primary' },
      { env: 'GEMINI_API_KEY_2', name: 'Secondary' },
      { env: 'GEMINI_API_KEY_3', name: 'Tertiary' }
    ];

    this.keys = keyConfigs
      .map(config => ({
        key: process.env[config.env] || '',
        name: config.name,
        failCount: 0,
        lastUsed: 0,
        cooldownUntil: 0
      }))
      .filter(k => k.key.length > 0);

    console.log(`🔑 Gemini Key Manager initialized with ${this.keys.length} API keys`);
  }

  getNextKey(): { key: string; name: string; index: number } | null {
    if (this.keys.length === 0) {
      // Try reinitializing in case env vars were loaded after constructor
      this.initializeKeys();
      if (this.keys.length === 0) {
        return null;
      }
    }

    const now = Date.now();
    const startIndex = this.currentIndex;
    
    // Round-robin through keys, skipping those in cooldown
    for (let i = 0; i < this.keys.length; i++) {
      const idx = (startIndex + i) % this.keys.length;
      const keyState = this.keys[idx];
      
      // Check if key is available (not in cooldown)
      if (keyState.cooldownUntil <= now) {
        this.currentIndex = (idx + 1) % this.keys.length; // Move to next for next call
        keyState.lastUsed = now;
        return { key: keyState.key, name: keyState.name, index: idx };
      }
    }

    // All keys in cooldown - return the one with shortest remaining cooldown
    const soonestAvailable = this.keys.reduce((min, k, idx) => 
      k.cooldownUntil < min.cooldownUntil ? { ...k, idx } : min,
      { ...this.keys[0], idx: 0 }
    );
    
    console.log(`⏳ All keys in cooldown, using ${soonestAvailable.name} (cooldown ends in ${Math.ceil((soonestAvailable.cooldownUntil - now) / 1000)}s)`);
    return { key: soonestAvailable.key, name: soonestAvailable.name, index: soonestAvailable.idx };
  }

  reportSuccess(index: number): void {
    if (index >= 0 && index < this.keys.length) {
      this.keys[index].failCount = 0;
      this.keys[index].cooldownUntil = 0;
    }
  }

  reportFailure(index: number): void {
    if (index >= 0 && index < this.keys.length) {
      const keyState = this.keys[index];
      keyState.failCount++;
      
      if (keyState.failCount >= this.MAX_FAILS) {
        keyState.cooldownUntil = Date.now() + this.COOLDOWN_MS;
        console.log(`🚫 ${keyState.name} key entered cooldown after ${keyState.failCount} failures`);
        keyState.failCount = 0; // Reset for next cooldown cycle
      }
    }
  }

  getStatus(): { total: number; available: number; keys: { name: string; status: string }[] } {
    const now = Date.now();
    return {
      total: this.keys.length,
      available: this.keys.filter(k => k.cooldownUntil <= now).length,
      keys: this.keys.map(k => ({
        name: k.name,
        status: k.cooldownUntil > now ? `Cooldown (${Math.ceil((k.cooldownUntil - now) / 1000)}s)` : 'Available'
      }))
    };
  }
}

// Singleton key manager instance
const keyManager = new GeminiKeyManager();

// Export for status checking
export function getGeminiKeyStatus() {
  return keyManager.getStatus();
}

interface GeminiResponse {
  candidates: {
    content: {
      parts: { text: string }[];
    };
  }[];
}

async function callGemini(prompt: string): Promise<string> {
  const keyInfo = keyManager.getNextKey();
  
  if (!keyInfo) {
    console.error('❌ No Gemini API keys configured');
    throw new Error('No GEMINI_API_KEY configured. Please set GEMINI_API_KEY, GEMINI_API_KEY_2, or GEMINI_API_KEY_3');
  }

  console.log(`🤖 Calling Gemini API with ${keyInfo.name} key...`);

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${keyInfo.key}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
        }
      })
    });

    console.log('📡 Response status:', response.status);

    if (!response.ok) {
      const error = await response.text();
      console.error(`❌ Gemini API error with ${keyInfo.name} key:`, error);
      
      // Report failure for rate limits or auth errors
      if (response.status === 429 || response.status === 403 || response.status === 401) {
        keyManager.reportFailure(keyInfo.index);
        
        // Try with another key if available
        const status = keyManager.getStatus();
        if (status.available > 0) {
          console.log(`🔄 Retrying with different key (${status.available} keys available)...`);
          return callGemini(prompt); // Recursive retry with next key
        }
      }
      
      throw new Error(`Gemini API error: ${response.status} - ${error}`);
    }

    // Success - report it
    keyManager.reportSuccess(keyInfo.index);

    const data = await response.json() as GeminiResponse;
    const text = data.candidates[0]?.content?.parts[0]?.text || '';
    console.log(`✅ Gemini response received via ${keyInfo.name} key, length:`, text.length);
    return text;
  } catch (error: any) {
    console.error('❌ Gemini API call failed:', error.message);
    keyManager.reportFailure(keyInfo.index);
    throw error;
  }
}

function parseJsonFromResponse(text: string): any {
  // Extract JSON from markdown code blocks if present
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[1].trim());
  }
  // Try parsing the whole response as JSON
  return JSON.parse(text);
}

export interface AreaRecommendation {
  area: string;
  description: string;
  highlights: string[];
  estimatedBudget: {
    min: number;
    max: number;
    currency: string;
  };
  estimatedDays: {
    min: number;
    recommended: number;
  };
  bestTimeToVisit: string[];
  travelTips: string[];
  category: string;
}

export interface DestinationInsights {
  destination: string;
  country: string;
  overview: string;
  areas: AreaRecommendation[];
  recommendedDuration: {
    minimum: number;
    recommended: number;
    ideal: number;
  };
  estimatedDailyBudget: {
    budget: number;
    moderate: number;
    luxury: number;
    currency: string;
  };
  bestMonthsToVisit: string[];
  weatherInfo: string;
  localTips: string[];
  safetyInfo: string;
  visaInfo: string;
}

export async function getDestinationRecommendations(destination: string): Promise<DestinationInsights> {
  const prompt = `You are a travel expert AI. Provide detailed travel recommendations for "${destination}".

Return a JSON object with this exact structure (no markdown, just pure JSON):
{
  "destination": "City/Place Name",
  "country": "Country Name",
  "overview": "2-3 sentence overview of the destination",
  "areas": [
    {
      "area": "Area/Neighborhood Name",
      "description": "Brief description",
      "highlights": ["Attraction 1", "Attraction 2", "Attraction 3"],
      "estimatedBudget": { "min": 50, "max": 150, "currency": "USD" },
      "estimatedDays": { "min": 1, "recommended": 2 },
      "bestTimeToVisit": ["Month1", "Month2"],
      "travelTips": ["Tip 1", "Tip 2"],
      "category": "cultural|adventure|relaxation|nature|urban|historical"
    }
  ],
  "recommendedDuration": { "minimum": 3, "recommended": 5, "ideal": 7 },
  "estimatedDailyBudget": { "budget": 50, "moderate": 100, "luxury": 250, "currency": "USD" },
  "bestMonthsToVisit": ["Month1", "Month2", "Month3"],
  "weatherInfo": "Brief weather description",
  "localTips": ["Tip 1", "Tip 2", "Tip 3"],
  "safetyInfo": "Brief safety information",
  "visaInfo": "Brief visa requirements for common nationalities"
}

Provide 3-5 areas to explore. Use realistic budget estimates in local currency or USD. Be specific and helpful.`;

  try {
    const response = await callGemini(prompt);
    return parseJsonFromResponse(response);
  } catch (error) {
    console.error('Error getting destination recommendations:', error);
    throw error;
  }
}

export interface TripAnalysis {
  overallScore: number;
  feasibility: 'highly_achievable' | 'achievable' | 'challenging' | 'difficult';
  breakdown: {
    budgetScore: number;
    timeScore: number;
    seasonScore: number;
    pacingScore: number;
  };
  suggestions: string[];
  warnings: string[];
  optimizations: string[];
}

export async function analyzeTripPlan(
  destination: string,
  startDate: string,
  endDate: string,
  budget: number,
  currency: string,
  activities: number,
  travelers: number
): Promise<TripAnalysis> {
  const tripDays = Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const travelMonth = new Date(startDate).toLocaleString('en-US', { month: 'long' });
  
  const prompt = `You are a travel planning AI. Analyze this trip plan and provide a feasibility score.

Trip Details:
- Destination: ${destination}
- Duration: ${tripDays} days
- Travel Month: ${travelMonth}
- Budget: ${budget} ${currency} total (${Math.round(budget/tripDays)} per day)
- Number of Travelers: ${travelers}
- Planned Activities: ${activities}

Return a JSON object with this exact structure (no markdown, just pure JSON):
{
  "overallScore": 75,
  "feasibility": "achievable",
  "breakdown": {
    "budgetScore": 70,
    "timeScore": 80,
    "seasonScore": 85,
    "pacingScore": 65
  },
  "suggestions": [
    "Specific suggestion 1",
    "Specific suggestion 2"
  ],
  "warnings": [
    "Any concerns about the plan"
  ],
  "optimizations": [
    "Ways to improve the trip"
  ]
}

Score from 0-100. feasibility options: highly_achievable (80+), achievable (60-79), challenging (40-59), difficult (<40).
Be realistic and specific about ${destination} in ${travelMonth}.`;

  try {
    const response = await callGemini(prompt);
    return parseJsonFromResponse(response);
  } catch (error) {
    console.error('Error analyzing trip:', error);
    throw error;
  }
}

export interface ItinerarySuggestion {
  day: number;
  date: string;
  title: string;
  activities: {
    time: string;
    title: string;
    description: string;
    location: string;
    duration: string;
    category: string;
    estimatedCost: number;
    tips: string;
  }[];
}

export async function generateItinerary(
  destination: string,
  startDate: string,
  endDate: string,
  interests: string[],
  budget: string,
  tripType: string
): Promise<ItinerarySuggestion[]> {
  const tripDays = Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1;
  
  const prompt = `You are a travel itinerary expert. Create a day-by-day itinerary for ${destination}.

Trip Details:
- Duration: ${tripDays} days
- Start Date: ${startDate}
- Interests: ${interests.length > 0 ? interests.join(', ') : 'general sightseeing'}
- Budget Level: ${budget || 'moderate'}
- Trip Type: ${tripType || 'leisure'}

Return a JSON array with this structure (no markdown, just pure JSON):
[
  {
    "day": 1,
    "date": "${startDate}",
    "title": "Arrival & First Impressions",
    "activities": [
      {
        "time": "09:00",
        "title": "Activity Name",
        "description": "Brief description",
        "location": "Specific location",
        "duration": "2 hours",
        "category": "sightseeing",
        "estimatedCost": 25,
        "tips": "Helpful tip"
      }
    ]
  }
]

Create ${Math.min(tripDays, 7)} days. Include 3-5 activities per day with realistic timings. Categories: transport, accommodation, food, activity, sightseeing, shopping, other.`;

  try {
    const response = await callGemini(prompt);
    return parseJsonFromResponse(response);
  } catch (error) {
    console.error('Error generating itinerary:', error);
    throw error;
  }
}

export interface PackingSuggestion {
  category: string;
  items: {
    name: string;
    essential: boolean;
    note?: string;
  }[];
}

export async function getPackingSuggestions(
  destination: string,
  startDate: string,
  duration: number,
  activities: string[]
): Promise<PackingSuggestion[]> {
  const travelMonth = new Date(startDate).toLocaleString('en-US', { month: 'long' });
  
  const prompt = `You are a travel packing expert. Suggest a packing list for a trip to ${destination} in ${travelMonth} for ${duration} days.

Planned activities: ${activities.length > 0 ? activities.join(', ') : 'general tourism'}

Return a JSON array with this structure (no markdown, just pure JSON):
[
  {
    "category": "Clothing",
    "items": [
      { "name": "T-shirts (5)", "essential": true, "note": "Light, breathable fabrics" },
      { "name": "Rain jacket", "essential": true }
    ]
  },
  {
    "category": "Electronics",
    "items": [...]
  }
]

Include categories: Clothing, Electronics, Toiletries, Documents, Accessories, Medications, Destination-Specific.
Be specific to the weather and culture of ${destination} in ${travelMonth}.`;

  try {
    const response = await callGemini(prompt);
    return parseJsonFromResponse(response);
  } catch (error) {
    console.error('Error getting packing suggestions:', error);
    throw error;
  }
}

export async function askTravelQuestion(question: string, context?: string): Promise<string> {
  const prompt = `You are a helpful travel assistant. Answer this travel-related question concisely.

${context ? `Context: ${context}\n\n` : ''}Question: ${question}

Provide a helpful, accurate, and concise answer. If you're unsure, say so.`;

  try {
    return await callGemini(prompt);
  } catch (error) {
    console.error('Error answering question:', error);
    throw error;
  }
}

// ============================================
// DESTINATION DETAILS ENRICHMENT
// ============================================

export interface DestinationDetails {
  description: string;
  costIndex: number; // 1-4 (Budget to Luxury)
  popularityScore: number; // 0-100
  tags: string[];
  highlights: string[];
  bestTimeToVisit: string;
}

/**
 * Generate rich destination details using Gemini AI
 * Called when a new destination is discovered via global search
 */
export async function generateDestinationDetails(
  name: string,
  country: string,
  region: string
): Promise<DestinationDetails> {
  const prompt = `You are a travel expert. Generate accurate travel information for this destination.

Destination: ${name}, ${country} (${region})

Respond with ONLY a valid JSON object (no markdown, no explanation) with these exact fields:
{
  "description": "A compelling 1-2 sentence description highlighting what makes this place special for travelers (max 150 chars)",
  "costIndex": <number 1-4 where 1=Budget-friendly, 2=Mid-range, 3=Comfortable, 4=Luxury>,
  "popularityScore": <number 50-95 based on how popular this is as a tourist destination>,
  "tags": ["array", "of", "3-4", "relevant", "travel", "tags"],
  "highlights": ["Top attraction 1", "Top attraction 2", "Top attraction 3"],
  "bestTimeToVisit": "Brief best season/months to visit"
}

Tags should be from: Beach, Mountains, Culture, History, Nature, Adventure, City, Relaxation, Food, Nightlife, Art, Architecture, Wildlife, Island, Desert, Temples, Shopping, Romantic, Family, Budget

Be accurate and realistic. If unsure about a small town, give moderate scores.`;

  try {
    const response = await callGemini(prompt);
    const details = parseJsonFromResponse(response);
    
    // Validate and sanitize the response
    return {
      description: String(details.description || `Discover ${name} in ${country}`).slice(0, 200),
      costIndex: Math.min(4, Math.max(1, Number(details.costIndex) || 2)),
      popularityScore: Math.min(95, Math.max(50, Number(details.popularityScore) || 70)),
      tags: Array.isArray(details.tags) ? details.tags.slice(0, 5) : ['Explore'],
      highlights: Array.isArray(details.highlights) ? details.highlights.slice(0, 3) : [],
      bestTimeToVisit: String(details.bestTimeToVisit || 'Year-round')
    };
  } catch (error) {
    console.error('Error generating destination details:', error);
    // Return safe defaults if AI fails
    return {
      description: `Explore ${name}, a destination in ${country} waiting to be discovered.`,
      costIndex: 2,
      popularityScore: 70,
      tags: ['Explore', 'Travel'],
      highlights: [],
      bestTimeToVisit: 'Year-round'
    };
  }
}
