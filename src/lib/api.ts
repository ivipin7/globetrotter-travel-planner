const API_BASE_URL = 'http://localhost:5000/api';

// Get token from localStorage (matches AuthContext key)
const getToken = (): string | null => {
  return localStorage.getItem('globetrotter_token');
};

// Generic fetch wrapper with auth
async function fetchWithAuth(endpoint: string, options: RequestInit = {}): Promise<Response> {
  const token = getToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  return response;
}

// Trip interfaces
export interface Trip {
  _id: string;
  userId: string | { _id: string; name: string; email: string; avatar?: string };
  name: string;
  description?: string;
  destination?: string;
  tripType?: 'solo' | 'couple' | 'family' | 'friends' | 'business';
  travelers?: number;
  coverImageUrl?: string;
  startDate: string;
  endDate: string;
  status: 'draft' | 'upcoming' | 'ongoing' | 'completed';
  isPublic: boolean;
  publicUrl?: string;
  totalBudget?: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTripData {
  name: string;
  description?: string;
  destination?: string;
  tripType?: 'solo' | 'couple' | 'family' | 'friends' | 'business';
  travelers?: number;
  coverImageUrl?: string;
  startDate: string;
  endDate: string;
  status?: 'draft' | 'upcoming' | 'ongoing' | 'completed';
  isPublic?: boolean;
  totalBudget?: number;
}

export interface TripStats {
  totalTrips: number;
  totalBudget: number;
  draftCount: number;
  upcomingCount: number;
  ongoingCount: number;
  completedCount: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Trip API functions
export const tripApi = {
  // Create a new trip
  async create(data: CreateTripData): Promise<{ success: boolean; data: Trip }> {
    const response = await fetchWithAuth('/trips', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create trip');
    }
    
    return response.json();
  },

  // Get all trips for current user
  async getMyTrips(params?: {
    status?: string;
    sort?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Trip>> {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.append('status', params.status);
    if (params?.sort) searchParams.append('sort', params.sort);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());

    const queryString = searchParams.toString();
    const response = await fetchWithAuth(`/trips${queryString ? `?${queryString}` : ''}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch trips');
    }
    
    return response.json();
  },

  // Get single trip by ID
  async getById(id: string): Promise<{ success: boolean; data: Trip; isOwner: boolean }> {
    const response = await fetchWithAuth(`/trips/${id}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch trip');
    }
    
    return response.json();
  },

  // Update trip
  async update(id: string, data: Partial<CreateTripData>): Promise<{ success: boolean; data: Trip }> {
    const response = await fetchWithAuth(`/trips/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update trip');
    }
    
    return response.json();
  },

  // Delete trip
  async delete(id: string): Promise<{ success: boolean; message: string }> {
    const response = await fetchWithAuth(`/trips/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete trip');
    }
    
    return response.json();
  },

  // Get community trips
  async getCommunity(params?: {
    sort?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Trip>> {
    const searchParams = new URLSearchParams();
    if (params?.sort) searchParams.append('sort', params.sort);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());

    const queryString = searchParams.toString();
    const response = await fetch(`${API_BASE_URL}/trips/community${queryString ? `?${queryString}` : ''}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch community trips');
    }
    
    return response.json();
  },

  // Get trip stats
  async getStats(): Promise<{ success: boolean; data: TripStats }> {
    const response = await fetchWithAuth('/trips/stats');
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch trip stats');
    }
    
    return response.json();
  },

  // Duplicate trip
  async duplicate(id: string): Promise<{ success: boolean; data: Trip }> {
    const response = await fetchWithAuth(`/trips/${id}/duplicate`, {
      method: 'POST',
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to duplicate trip');
    }
    
    return response.json();
  },
};

// City interfaces
export interface City {
  _id: string;
  name: string;
  country: string;
  region: string;
  latitude?: number;
  longitude?: number;
  costIndex: number;
  popularityScore?: number;
  imageUrl?: string;
  description?: string;
  tags: string[];
  highlights?: string[]; // Top attractions (AI-generated for global results)
  bestTimeToVisit?: string; // Best season to visit (AI-generated)
  source?: 'local' | 'global'; // Track where the destination came from
  createdAt: string;
}

export interface CityFilters {
  region?: string;
  costIndex?: number;
  search?: string;
  trending?: boolean;
  popular?: boolean;
  limit?: number;
  page?: number;
}

export interface CitiesResponse {
  cities: City[];
  pagination: {
    total: number;
    page: number;
    pages: number;
  };
  source?: 'local' | 'global' | 'none'; // Indicates search source
}

// City API
export const cityApi = {
  // Get all cities with filters
  async getAll(filters: CityFilters = {}): Promise<CitiesResponse> {
    const params = new URLSearchParams();
    
    if (filters.region && filters.region !== 'All Regions') {
      params.append('region', filters.region);
    }
    if (filters.costIndex) {
      params.append('costIndex', filters.costIndex.toString());
    }
    if (filters.search) {
      params.append('search', filters.search);
    }
    if (filters.trending) {
      params.append('trending', 'true');
    }
    if (filters.popular) {
      params.append('popular', 'true');
    }
    if (filters.limit) {
      params.append('limit', filters.limit.toString());
    }
    if (filters.page) {
      params.append('page', filters.page.toString());
    }

    const queryString = params.toString();
    const url = `/cities${queryString ? `?${queryString}` : ''}`;
    
    const response = await fetch(`${API_BASE_URL}${url}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch cities');
    }
    
    return response.json();
  },

  // Get trending cities
  async getTrending(): Promise<City[]> {
    const response = await fetch(`${API_BASE_URL}/cities/trending`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch trending cities');
    }
    
    return response.json();
  },

  // Search cities
  async search(query: string): Promise<City[]> {
    const response = await fetch(`${API_BASE_URL}/cities/search?q=${encodeURIComponent(query)}`);
    
    if (!response.ok) {
      throw new Error('Failed to search cities');
    }
    
    return response.json();
  },

  // Get cities by region
  async getByRegion(region: string): Promise<City[]> {
    const response = await fetch(`${API_BASE_URL}/cities/region/${encodeURIComponent(region)}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch cities by region');
    }
    
    return response.json();
  },

  // Get single city
  async getById(id: string): Promise<City> {
    const response = await fetch(`${API_BASE_URL}/cities/${id}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch city');
    }
    
    return response.json();
  },

  // Get available regions
  async getRegions(): Promise<string[]> {
    const response = await fetch(`${API_BASE_URL}/cities/regions`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch regions');
    }
    
    return response.json();
  },

  // NEW: Hybrid search with global fallback
  // Searches local DB first, then falls back to OpenStreetMap Nominatim
  async hybridSearch(filters: CityFilters = {}): Promise<CitiesResponse> {
    const params = new URLSearchParams();
    
    if (filters.region && filters.region !== 'All Regions') {
      params.append('region', filters.region);
    }
    if (filters.costIndex) {
      params.append('costIndex', filters.costIndex.toString());
    }
    if (filters.search) {
      params.append('search', filters.search);
    }
    if (filters.limit) {
      params.append('limit', filters.limit.toString());
    }
    if (filters.page) {
      params.append('page', filters.page.toString());
    }

    const queryString = params.toString();
    const url = `/cities/hybrid${queryString ? `?${queryString}` : ''}`;
    
    const response = await fetch(`${API_BASE_URL}${url}`);
    
    if (!response.ok) {
      throw new Error('Failed to search destinations');
    }
    
    return response.json();
  },

  // NEW: Get or create destination by name
  async getOrCreate(name: string, country?: string): Promise<City> {
    const params = new URLSearchParams({ name });
    if (country) params.append('country', country);
    
    const response = await fetch(`${API_BASE_URL}/cities/discover?${params}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch destination');
    }
    
    return response.json();
  },
};

// Itinerary interfaces
export interface Activity {
  _id?: string;
  title: string;
  description?: string;
  location?: string;
  startTime?: string;
  endTime?: string;
  category: 'transport' | 'accommodation' | 'food' | 'activity' | 'sightseeing' | 'shopping' | 'other';
  cost?: number;
  isCompleted: boolean;
  notes?: string;
  order: number;
}

export interface ItineraryDay {
  _id?: string;
  date: string;
  dayNumber: number;
  title?: string;
  activities: Activity[];
}

export interface ItineraryResponse {
  success: boolean;
  data: {
    tripId: string;
    tripName: string;
    destination?: string;
    startDate: string;
    endDate: string;
    dayCount: number;
    itinerary: ItineraryDay[];
  };
}

// Itinerary API
export const itineraryApi = {
  // Get trip itinerary
  async getItinerary(tripId: string): Promise<ItineraryResponse> {
    const response = await fetchWithAuth(`/itinerary/${tripId}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch itinerary');
    }
    
    return response.json();
  },

  // Add activity to a day
  async addActivity(tripId: string, dayNumber: number, activity: Partial<Activity>): Promise<{ success: boolean; data: ItineraryDay }> {
    const response = await fetchWithAuth(`/itinerary/${tripId}/day/${dayNumber}/activity`, {
      method: 'POST',
      body: JSON.stringify(activity),
    });
    
    if (!response.ok) {
      throw new Error('Failed to add activity');
    }
    
    return response.json();
  },

  // Update activity
  async updateActivity(tripId: string, dayNumber: number, activityId: string, updates: Partial<Activity>): Promise<{ success: boolean; data: Activity }> {
    const response = await fetchWithAuth(`/itinerary/${tripId}/day/${dayNumber}/activity/${activityId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update activity');
    }
    
    return response.json();
  },

  // Delete activity
  async deleteActivity(tripId: string, dayNumber: number, activityId: string): Promise<{ success: boolean }> {
    const response = await fetchWithAuth(`/itinerary/${tripId}/day/${dayNumber}/activity/${activityId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete activity');
    }
    
    return response.json();
  },

  // Toggle activity completion
  async toggleActivity(tripId: string, dayNumber: number, activityId: string): Promise<{ success: boolean; data: Activity }> {
    const response = await fetchWithAuth(`/itinerary/${tripId}/day/${dayNumber}/activity/${activityId}/toggle`, {
      method: 'PATCH',
    });
    
    if (!response.ok) {
      throw new Error('Failed to toggle activity');
    }
    
    return response.json();
  },

  // Reorder activities
  async reorderActivities(tripId: string, dayNumber: number, activityIds: string[]): Promise<{ success: boolean; data: ItineraryDay }> {
    const response = await fetchWithAuth(`/itinerary/${tripId}/day/${dayNumber}/reorder`, {
      method: 'PUT',
      body: JSON.stringify({ activityIds }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to reorder activities');
    }
    
    return response.json();
  },

  // Update day title
  async updateDayTitle(tripId: string, dayNumber: number, title: string): Promise<{ success: boolean; data: ItineraryDay }> {
    const response = await fetchWithAuth(`/itinerary/${tripId}/day/${dayNumber}/title`, {
      method: 'PATCH',
      body: JSON.stringify({ title }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update day title');
    }
    
    return response.json();
  },
};

// Packing List interfaces
export interface PackingItem {
  _id?: string;
  name: string;
  quantity: number;
  category: 'clothing' | 'toiletries' | 'electronics' | 'documents' | 'medicine' | 'accessories' | 'other';
  isPacked: boolean;
}

export interface PackingListResponse {
  success: boolean;
  data: {
    tripId: string;
    tripName: string;
    destination?: string;
    packingList: PackingItem[];
    stats: {
      total: number;
      packed: number;
      remaining: number;
      progress: number;
    };
  };
}

// Packing API
export const packingApi = {
  // Get packing list
  async getPackingList(tripId: string): Promise<PackingListResponse> {
    const response = await fetchWithAuth(`/packing/${tripId}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch packing list');
    }
    
    return response.json();
  },

  // Add item
  async addItem(tripId: string, item: Partial<PackingItem>): Promise<{ success: boolean; data: PackingItem }> {
    const response = await fetchWithAuth(`/packing/${tripId}/item`, {
      method: 'POST',
      body: JSON.stringify(item),
    });
    
    if (!response.ok) {
      throw new Error('Failed to add item');
    }
    
    return response.json();
  },

  // Update item
  async updateItem(tripId: string, itemId: string, updates: Partial<PackingItem>): Promise<{ success: boolean; data: PackingItem }> {
    const response = await fetchWithAuth(`/packing/${tripId}/item/${itemId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update item');
    }
    
    return response.json();
  },

  // Delete item
  async deleteItem(tripId: string, itemId: string): Promise<{ success: boolean }> {
    const response = await fetchWithAuth(`/packing/${tripId}/item/${itemId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete item');
    }
    
    return response.json();
  },

  // Toggle packed status
  async toggleItem(tripId: string, itemId: string): Promise<{ success: boolean; data: PackingItem }> {
    const response = await fetchWithAuth(`/packing/${tripId}/item/${itemId}/toggle`, {
      method: 'PATCH',
    });
    
    if (!response.ok) {
      throw new Error('Failed to toggle item');
    }
    
    return response.json();
  },

  // Add multiple items
  async addMultipleItems(tripId: string, items: Partial<PackingItem>[]): Promise<{ success: boolean; data: PackingItem[] }> {
    const response = await fetchWithAuth(`/packing/${tripId}/items`, {
      method: 'POST',
      body: JSON.stringify({ items }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to add items');
    }
    
    return response.json();
  },

  // Toggle all items
  async toggleAll(tripId: string, packed: boolean): Promise<{ success: boolean; data: PackingItem[] }> {
    const response = await fetchWithAuth(`/packing/${tripId}/toggle-all`, {
      method: 'PATCH',
      body: JSON.stringify({ packed }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to toggle all items');
    }
    
    return response.json();
  },
};

// AI API types
export interface AIDestinationRecommendation {
  destination: string;
  country: string;
  overview: string;
  areas: {
    area: string;
    description: string;
    highlights: string[];
    estimatedBudget: { min: number; max: number; currency: string };
    estimatedDays: { min: number; recommended: number };
    bestTimeToVisit: string[];
    travelTips: string[];
    category: string;
  }[];
  recommendedDuration: { minimum: number; recommended: number; ideal: number };
  estimatedDailyBudget: { budget: number; moderate: number; luxury: number; currency: string };
  bestMonthsToVisit: string[];
  weatherInfo: string;
  localTips: string[];
  safetyInfo: string;
  visaInfo: string;
}

export interface AITripAnalysis {
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

export interface AIItinerarySuggestion {
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

export interface AIPackingSuggestion {
  category: string;
  items: {
    name: string;
    essential: boolean;
    note?: string;
  }[];
}

// AI API functions (using Gemini)
export const aiApi = {
  // Get AI-powered destination recommendations
  async getRecommendations(destination: string): Promise<{ success: boolean; data: AIDestinationRecommendation; cached?: boolean }> {
    const response = await fetch(`${API_BASE_URL}/ai/recommendations/${encodeURIComponent(destination)}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get recommendations');
    }
    
    return response.json();
  },

  // Analyze trip feasibility
  async analyzeTrip(data: {
    destination: string;
    startDate: string;
    endDate: string;
    budget?: number;
    currency?: string;
    activities?: number;
    travelers?: number;
  }): Promise<{ success: boolean; data: AITripAnalysis }> {
    const response = await fetch(`${API_BASE_URL}/ai/analyze-trip`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to analyze trip');
    }
    
    return response.json();
  },

  // Generate AI itinerary suggestions
  async generateItinerary(data: {
    destination: string;
    startDate: string;
    endDate: string;
    interests?: string[];
    budget?: string;
    tripType?: string;
  }): Promise<{ success: boolean; data: AIItinerarySuggestion[] }> {
    const response = await fetch(`${API_BASE_URL}/ai/generate-itinerary`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to generate itinerary');
    }
    
    return response.json();
  },

  // Get AI packing suggestions
  async getPackingSuggestions(data: {
    destination: string;
    startDate: string;
    duration: number;
    activities?: string[];
  }): Promise<{ success: boolean; data: AIPackingSuggestion[] }> {
    const response = await fetch(`${API_BASE_URL}/ai/packing-suggestions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get packing suggestions');
    }
    
    return response.json();
  },

  // Ask AI a travel question
  async askQuestion(question: string, context?: string): Promise<{ success: boolean; data: { answer: string } }> {
    const response = await fetch(`${API_BASE_URL}/ai/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, context }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get answer');
    }
    
    return response.json();
  },
};

export default tripApi;
