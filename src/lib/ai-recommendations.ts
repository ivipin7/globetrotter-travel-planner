// AI-powered travel recommendations service
// Uses intelligent algorithms to provide personalized travel suggestions

export interface DestinationRecommendation {
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
    max: number;
  };
  bestTimeToVisit: string[];
  travelTips: string[];
  category: 'cultural' | 'adventure' | 'relaxation' | 'nature' | 'urban' | 'historical';
}

export interface TripCompletionAnalysis {
  overallScore: number; // 0-100
  breakdown: {
    budgetScore: number;
    timeScore: number;
    activityScore: number;
    seasonScore: number;
  };
  suggestions: string[];
  risks: string[];
  confidence: 'high' | 'medium' | 'low';
}

// Destination database with AI-curated information
const destinationData: Record<string, DestinationRecommendation[]> = {
  // Popular destinations with detailed recommendations
  'paris': [
    {
      area: 'Eiffel Tower & Champ de Mars',
      description: 'Iconic landmark area with stunning views and romantic atmosphere',
      highlights: ['Eiffel Tower', 'Champ de Mars Gardens', 'Trocadéro', 'Seine River Cruise'],
      estimatedBudget: { min: 50, max: 150, currency: 'EUR' },
      estimatedDays: { min: 1, recommended: 2, max: 3 },
      bestTimeToVisit: ['April', 'May', 'September', 'October'],
      travelTips: ['Book tower tickets online in advance', 'Visit at sunset for best photos', 'Bring a picnic for Champ de Mars'],
      category: 'urban'
    },
    {
      area: 'Le Marais',
      description: 'Historic neighborhood with trendy boutiques, galleries, and cafes',
      highlights: ['Place des Vosges', 'Jewish Quarter', 'Picasso Museum', 'Vintage Shopping'],
      estimatedBudget: { min: 30, max: 100, currency: 'EUR' },
      estimatedDays: { min: 1, recommended: 1, max: 2 },
      bestTimeToVisit: ['March', 'April', 'May', 'June', 'September', 'October'],
      travelTips: ['Visit on Sunday for pedestrian-only streets', 'Try falafel at L\'As du Fallafel'],
      category: 'cultural'
    },
    {
      area: 'Montmartre',
      description: 'Bohemian hilltop village with Sacré-Cœur and artist squares',
      highlights: ['Sacré-Cœur Basilica', 'Place du Tertre', 'Moulin Rouge', 'Vineyard'],
      estimatedBudget: { min: 25, max: 80, currency: 'EUR' },
      estimatedDays: { min: 1, recommended: 1, max: 2 },
      bestTimeToVisit: ['April', 'May', 'September', 'October'],
      travelTips: ['Go early morning to avoid crowds', 'Walk up the stairs for exercise or take funicular'],
      category: 'historical'
    },
    {
      area: 'Louvre & Tuileries',
      description: 'World-famous museum and beautiful formal gardens',
      highlights: ['Louvre Museum', 'Tuileries Garden', 'Palais Royal', 'Mona Lisa'],
      estimatedBudget: { min: 40, max: 120, currency: 'EUR' },
      estimatedDays: { min: 1, recommended: 2, max: 3 },
      bestTimeToVisit: ['January', 'February', 'November'],
      travelTips: ['Book timed entry tickets', 'Wednesday/Friday evenings are less crowded'],
      category: 'cultural'
    }
  ],
  'tokyo': [
    {
      area: 'Shibuya & Harajuku',
      description: 'Youth culture hub with famous crossing and quirky fashion',
      highlights: ['Shibuya Crossing', 'Harajuku Takeshita Street', 'Meiji Shrine', 'Yoyogi Park'],
      estimatedBudget: { min: 5000, max: 15000, currency: 'JPY' },
      estimatedDays: { min: 1, recommended: 2, max: 3 },
      bestTimeToVisit: ['March', 'April', 'October', 'November'],
      travelTips: ['Visit Meiji Shrine early morning', 'Try crepes on Takeshita Street'],
      category: 'urban'
    },
    {
      area: 'Asakusa & Senso-ji',
      description: 'Traditional Tokyo with ancient temple and old-town atmosphere',
      highlights: ['Senso-ji Temple', 'Nakamise Shopping Street', 'Tokyo Skytree', 'Sumida River'],
      estimatedBudget: { min: 3000, max: 10000, currency: 'JPY' },
      estimatedDays: { min: 1, recommended: 1, max: 2 },
      bestTimeToVisit: ['March', 'April', 'May', 'October', 'November'],
      travelTips: ['Go before 9am for empty photos', 'Try traditional snacks along Nakamise'],
      category: 'historical'
    },
    {
      area: 'Shinjuku',
      description: 'Entertainment district with skyscrapers, nightlife, and gardens',
      highlights: ['Shinjuku Gyoen Garden', 'Golden Gai', 'Robot Restaurant', 'Tokyo Metropolitan Building'],
      estimatedBudget: { min: 4000, max: 20000, currency: 'JPY' },
      estimatedDays: { min: 1, recommended: 2, max: 3 },
      bestTimeToVisit: ['March', 'April', 'November', 'December'],
      travelTips: ['Free observation deck at Metropolitan Building', 'Explore Golden Gai at night'],
      category: 'urban'
    }
  ],
  'new york': [
    {
      area: 'Manhattan Midtown',
      description: 'Iconic skyline with Times Square, Empire State, and Broadway',
      highlights: ['Times Square', 'Empire State Building', 'Broadway Shows', 'Rockefeller Center'],
      estimatedBudget: { min: 100, max: 300, currency: 'USD' },
      estimatedDays: { min: 2, recommended: 3, max: 5 },
      bestTimeToVisit: ['April', 'May', 'September', 'October', 'December'],
      travelTips: ['Get Broadway lottery tickets for discounts', 'Visit Top of the Rock at sunset'],
      category: 'urban'
    },
    {
      area: 'Central Park & Upper East Side',
      description: 'Urban oasis with world-class museums',
      highlights: ['Central Park', 'Metropolitan Museum', 'Guggenheim', 'Bethesda Fountain'],
      estimatedBudget: { min: 50, max: 150, currency: 'USD' },
      estimatedDays: { min: 1, recommended: 2, max: 3 },
      bestTimeToVisit: ['April', 'May', 'September', 'October'],
      travelTips: ['Rent bikes for Central Park', 'Met Museum is pay-what-you-wish for NY residents'],
      category: 'cultural'
    },
    {
      area: 'Brooklyn',
      description: 'Trendy borough with amazing views, food, and culture',
      highlights: ['Brooklyn Bridge', 'DUMBO', 'Williamsburg', 'Prospect Park'],
      estimatedBudget: { min: 40, max: 120, currency: 'USD' },
      estimatedDays: { min: 1, recommended: 2, max: 3 },
      bestTimeToVisit: ['May', 'June', 'September', 'October'],
      travelTips: ['Walk across Brooklyn Bridge at sunrise', 'Explore Smorgasburg food market on weekends'],
      category: 'urban'
    }
  ],
  'bali': [
    {
      area: 'Ubud',
      description: 'Cultural heart of Bali with rice terraces and spiritual retreats',
      highlights: ['Tegallalang Rice Terraces', 'Sacred Monkey Forest', 'Ubud Palace', 'Art Markets'],
      estimatedBudget: { min: 500000, max: 1500000, currency: 'IDR' },
      estimatedDays: { min: 2, recommended: 4, max: 7 },
      bestTimeToVisit: ['April', 'May', 'June', 'September'],
      travelTips: ['Hire a local guide for rice terraces', 'Book spa treatments in advance'],
      category: 'nature'
    },
    {
      area: 'Seminyak & Canggu',
      description: 'Beach lifestyle with surfing, beach clubs, and trendy cafes',
      highlights: ['Sunset at Tanah Lot', 'Beach Clubs', 'Surfing', 'Rice Paddy Walks'],
      estimatedBudget: { min: 800000, max: 2500000, currency: 'IDR' },
      estimatedDays: { min: 2, recommended: 3, max: 5 },
      bestTimeToVisit: ['April', 'May', 'June', 'September', 'October'],
      travelTips: ['Rent a scooter for easy transport', 'Watch sunset at Potato Head Beach Club'],
      category: 'relaxation'
    },
    {
      area: 'Nusa Islands',
      description: 'Island hopping paradise with stunning cliffs and beaches',
      highlights: ['Kelingking Beach', 'Angel\'s Billabong', 'Snorkeling with Mantas', 'Crystal Bay'],
      estimatedBudget: { min: 600000, max: 2000000, currency: 'IDR' },
      estimatedDays: { min: 2, recommended: 3, max: 5 },
      bestTimeToVisit: ['April', 'May', 'June', 'July', 'August', 'September'],
      travelTips: ['Book fast boat tickets early', 'Stay overnight on Nusa Penida'],
      category: 'adventure'
    }
  ],
  'london': [
    {
      area: 'Westminster & South Bank',
      description: 'Historic heart of London with Parliament and riverside walks',
      highlights: ['Big Ben', 'Westminster Abbey', 'London Eye', 'South Bank Walk'],
      estimatedBudget: { min: 50, max: 150, currency: 'GBP' },
      estimatedDays: { min: 1, recommended: 2, max: 3 },
      bestTimeToVisit: ['April', 'May', 'June', 'September'],
      travelTips: ['Book Westminster Abbey tickets online', 'Walk along South Bank for street performers'],
      category: 'historical'
    },
    {
      area: 'Shoreditch & East London',
      description: 'Creative hub with street art, markets, and nightlife',
      highlights: ['Brick Lane', 'Spitalfields Market', 'Street Art Tours', 'Boxpark'],
      estimatedBudget: { min: 30, max: 100, currency: 'GBP' },
      estimatedDays: { min: 1, recommended: 1, max: 2 },
      bestTimeToVisit: ['May', 'June', 'July', 'August', 'September'],
      travelTips: ['Visit Brick Lane on Sunday for markets', 'Join a free street art walking tour'],
      category: 'cultural'
    }
  ],
  'dubai': [
    {
      area: 'Downtown Dubai',
      description: 'Futuristic skyline with world\'s tallest building and dancing fountains',
      highlights: ['Burj Khalifa', 'Dubai Mall', 'Dubai Fountain', 'Souk Al Bahar'],
      estimatedBudget: { min: 300, max: 800, currency: 'AED' },
      estimatedDays: { min: 1, recommended: 2, max: 3 },
      bestTimeToVisit: ['November', 'December', 'January', 'February', 'March'],
      travelTips: ['Book Burj Khalifa sunset slot', 'Fountain shows every 30 min after 6pm'],
      category: 'urban'
    },
    {
      area: 'Old Dubai',
      description: 'Traditional heritage area with souks and creek crossings',
      highlights: ['Gold Souk', 'Spice Souk', 'Abra Creek Crossing', 'Al Fahidi Historical District'],
      estimatedBudget: { min: 50, max: 200, currency: 'AED' },
      estimatedDays: { min: 1, recommended: 1, max: 2 },
      bestTimeToVisit: ['November', 'December', 'January', 'February'],
      travelTips: ['Cross the creek by Abra (water taxi) for 1 AED', 'Bargain in the souks'],
      category: 'cultural'
    },
    {
      area: 'Desert Safari',
      description: 'Adventure in the Arabian desert with dune bashing and camp dinner',
      highlights: ['Dune Bashing', 'Camel Riding', 'Desert Camp Dinner', 'Sandboarding'],
      estimatedBudget: { min: 200, max: 600, currency: 'AED' },
      estimatedDays: { min: 1, recommended: 1, max: 1 },
      bestTimeToVisit: ['October', 'November', 'December', 'January', 'February', 'March'],
      travelTips: ['Book evening safari for sunset views', 'Avoid during sandstorm season'],
      category: 'adventure'
    }
  ],
  'rome': [
    {
      area: 'Ancient Rome',
      description: 'Walk through 2000 years of history at iconic ancient sites',
      highlights: ['Colosseum', 'Roman Forum', 'Palatine Hill', 'Circus Maximus'],
      estimatedBudget: { min: 40, max: 100, currency: 'EUR' },
      estimatedDays: { min: 1, recommended: 2, max: 3 },
      bestTimeToVisit: ['April', 'May', 'September', 'October'],
      travelTips: ['Buy combined ticket for Colosseum + Forum', 'Go early morning or late afternoon'],
      category: 'historical'
    },
    {
      area: 'Vatican City',
      description: 'World\'s smallest country with priceless art and architecture',
      highlights: ['St. Peter\'s Basilica', 'Sistine Chapel', 'Vatican Museums', 'St. Peter\'s Square'],
      estimatedBudget: { min: 30, max: 80, currency: 'EUR' },
      estimatedDays: { min: 1, recommended: 1, max: 2 },
      bestTimeToVisit: ['January', 'February', 'November'],
      travelTips: ['Book skip-the-line tickets', 'Dress code: covered shoulders and knees'],
      category: 'cultural'
    },
    {
      area: 'Trastevere',
      description: 'Charming medieval neighborhood with authentic Roman life',
      highlights: ['Piazza di Santa Maria', 'Traditional Trattorias', 'Gianicolo Hill', 'Street Life'],
      estimatedBudget: { min: 30, max: 80, currency: 'EUR' },
      estimatedDays: { min: 1, recommended: 1, max: 2 },
      bestTimeToVisit: ['April', 'May', 'June', 'September', 'October'],
      travelTips: ['Best for evening dining and nightlife', 'Watch sunset from Gianicolo Hill'],
      category: 'cultural'
    }
  ],
  'barcelona': [
    {
      area: 'Gothic Quarter & Las Ramblas',
      description: 'Medieval maze of streets meeting famous pedestrian boulevard',
      highlights: ['La Rambla', 'Barcelona Cathedral', 'Plaça Reial', 'Boqueria Market'],
      estimatedBudget: { min: 30, max: 100, currency: 'EUR' },
      estimatedDays: { min: 1, recommended: 2, max: 3 },
      bestTimeToVisit: ['April', 'May', 'September', 'October'],
      travelTips: ['Visit Boqueria market in morning', 'Be aware of pickpockets on Las Ramblas'],
      category: 'historical'
    },
    {
      area: 'Gaudí\'s Barcelona',
      description: 'Explore the fantastical architecture of Antoni Gaudí',
      highlights: ['Sagrada Família', 'Park Güell', 'Casa Batlló', 'Casa Milà'],
      estimatedBudget: { min: 50, max: 150, currency: 'EUR' },
      estimatedDays: { min: 2, recommended: 2, max: 3 },
      bestTimeToVisit: ['April', 'May', 'September', 'October', 'November'],
      travelTips: ['Book Sagrada Família months ahead', 'Morning light is best inside the basilica'],
      category: 'cultural'
    },
    {
      area: 'Barceloneta Beach',
      description: 'Mediterranean beach life with seafood and waterfront fun',
      highlights: ['Beach', 'Seafood Restaurants', 'Port Olímpic', 'W Hotel Views'],
      estimatedBudget: { min: 20, max: 80, currency: 'EUR' },
      estimatedDays: { min: 1, recommended: 1, max: 2 },
      bestTimeToVisit: ['May', 'June', 'July', 'August', 'September'],
      travelTips: ['Arrive early for beach space in summer', 'Try paella at beachfront restaurants'],
      category: 'relaxation'
    }
  ],
  'sydney': [
    {
      area: 'Sydney Harbour',
      description: 'Iconic waterfront with Opera House and Harbour Bridge',
      highlights: ['Sydney Opera House', 'Harbour Bridge', 'Circular Quay', 'The Rocks'],
      estimatedBudget: { min: 50, max: 200, currency: 'AUD' },
      estimatedDays: { min: 1, recommended: 2, max: 3 },
      bestTimeToVisit: ['September', 'October', 'November', 'March', 'April', 'May'],
      travelTips: ['Book Opera House tour', 'Walk across the bridge or do BridgeClimb'],
      category: 'urban'
    },
    {
      area: 'Bondi to Coogee',
      description: 'Stunning coastal walk connecting famous beaches',
      highlights: ['Bondi Beach', 'Coastal Walk', 'Bronte Beach', 'Coogee Beach'],
      estimatedBudget: { min: 20, max: 80, currency: 'AUD' },
      estimatedDays: { min: 1, recommended: 1, max: 2 },
      bestTimeToVisit: ['October', 'November', 'December', 'January', 'February', 'March'],
      travelTips: ['Start early to avoid midday sun', 'Bring swimwear for beach stops'],
      category: 'nature'
    }
  ],
  'singapore': [
    {
      area: 'Marina Bay',
      description: 'Futuristic skyline with iconic buildings and gardens',
      highlights: ['Marina Bay Sands', 'Gardens by the Bay', 'Merlion Park', 'ArtScience Museum'],
      estimatedBudget: { min: 50, max: 200, currency: 'SGD' },
      estimatedDays: { min: 1, recommended: 2, max: 3 },
      bestTimeToVisit: ['February', 'March', 'April', 'May', 'June'],
      travelTips: ['Visit Gardens by the Bay for evening light show', 'Marina Bay Sands rooftop bar for views'],
      category: 'urban'
    },
    {
      area: 'Chinatown & Little India',
      description: 'Cultural enclaves with temples, food, and heritage',
      highlights: ['Buddha Tooth Relic Temple', 'Sri Mariamman Temple', 'Hawker Centers', 'Little India Arcade'],
      estimatedBudget: { min: 20, max: 80, currency: 'SGD' },
      estimatedDays: { min: 1, recommended: 1, max: 2 },
      bestTimeToVisit: ['January', 'February', 'October', 'November'],
      travelTips: ['Try Maxwell Food Centre for local food', 'Visit during Chinese New Year or Deepavali'],
      category: 'cultural'
    },
    {
      area: 'Sentosa Island',
      description: 'Resort island with beaches, attractions, and theme parks',
      highlights: ['Universal Studios', 'S.E.A. Aquarium', 'Siloso Beach', 'Cable Car'],
      estimatedBudget: { min: 80, max: 300, currency: 'SGD' },
      estimatedDays: { min: 1, recommended: 2, max: 3 },
      bestTimeToVisit: ['February', 'March', 'September', 'October'],
      travelTips: ['Get Universal Studios Express Pass during peak times', 'Stay overnight for full experience'],
      category: 'adventure'
    }
  ]
};

// Generic recommendations for unknown destinations
const genericRecommendations: DestinationRecommendation[] = [
  {
    area: 'City Center / Downtown',
    description: 'The main tourist and cultural hub of the city',
    highlights: ['Main Attractions', 'Local Markets', 'Historic Sites', 'Restaurants'],
    estimatedBudget: { min: 50, max: 150, currency: 'USD' },
    estimatedDays: { min: 2, recommended: 3, max: 5 },
    bestTimeToVisit: ['Spring', 'Fall'],
    travelTips: ['Research local customs', 'Learn basic local phrases', 'Use public transport'],
    category: 'urban'
  },
  {
    area: 'Cultural Quarter',
    description: 'Museums, galleries, and cultural institutions',
    highlights: ['Museums', 'Art Galleries', 'Theaters', 'Cultural Centers'],
    estimatedBudget: { min: 30, max: 100, currency: 'USD' },
    estimatedDays: { min: 1, recommended: 2, max: 3 },
    bestTimeToVisit: ['Any Season'],
    travelTips: ['Check for free museum days', 'Book popular attractions in advance'],
    category: 'cultural'
  },
  {
    area: 'Local Neighborhood',
    description: 'Authentic local experience away from tourist crowds',
    highlights: ['Local Cuisine', 'Street Markets', 'Daily Life', 'Hidden Gems'],
    estimatedBudget: { min: 20, max: 60, currency: 'USD' },
    estimatedDays: { min: 1, recommended: 1, max: 2 },
    bestTimeToVisit: ['Any Season'],
    travelTips: ['Ask locals for recommendations', 'Try street food', 'Walk or use local transport'],
    category: 'cultural'
  }
];

/**
 * Get AI-powered recommendations for a destination
 */
export function getDestinationRecommendations(destination: string): DestinationRecommendation[] {
  const normalizedDestination = destination.toLowerCase().trim();
  
  // Check for exact match
  if (destinationData[normalizedDestination]) {
    return destinationData[normalizedDestination];
  }
  
  // Check for partial match
  for (const [key, recommendations] of Object.entries(destinationData)) {
    if (normalizedDestination.includes(key) || key.includes(normalizedDestination)) {
      return recommendations;
    }
  }
  
  // Return generic recommendations
  return genericRecommendations;
}

/**
 * Calculate overall budget estimate for a trip
 */
export function calculateBudgetEstimate(
  destination: string,
  days: number,
  travelStyle: 'budget' | 'moderate' | 'luxury' = 'moderate'
): { min: number; max: number; currency: string; perDay: { min: number; max: number } } {
  const recommendations = getDestinationRecommendations(destination);
  
  if (recommendations.length === 0) {
    return {
      min: days * 50,
      max: days * 200,
      currency: 'USD',
      perDay: { min: 50, max: 200 }
    };
  }
  
  const currency = recommendations[0].estimatedBudget.currency;
  
  // Calculate average daily costs from all areas
  let totalMin = 0;
  let totalMax = 0;
  
  recommendations.forEach(rec => {
    totalMin += rec.estimatedBudget.min;
    totalMax += rec.estimatedBudget.max;
  });
  
  const avgMin = totalMin / recommendations.length;
  const avgMax = totalMax / recommendations.length;
  
  // Adjust for travel style
  const styleMultiplier = {
    budget: 0.7,
    moderate: 1,
    luxury: 2
  };
  
  const multiplier = styleMultiplier[travelStyle];
  
  return {
    min: Math.round(days * avgMin * multiplier),
    max: Math.round(days * avgMax * multiplier),
    currency,
    perDay: {
      min: Math.round(avgMin * multiplier),
      max: Math.round(avgMax * multiplier)
    }
  };
}

/**
 * Calculate recommended trip duration
 */
export function calculateRecommendedDuration(destination: string): {
  minimum: number;
  recommended: number;
  ideal: number;
} {
  const recommendations = getDestinationRecommendations(destination);
  
  let totalMin = 0;
  let totalRec = 0;
  let totalMax = 0;
  
  recommendations.forEach(rec => {
    totalMin += rec.estimatedDays.min;
    totalRec += rec.estimatedDays.recommended;
    totalMax += rec.estimatedDays.max;
  });
  
  return {
    minimum: Math.max(1, Math.ceil(totalMin / 2)), // At least see half the places
    recommended: totalRec,
    ideal: totalMax
  };
}

/**
 * Analyze trip completion possibility
 */
export function analyzeTripCompletion(
  destination: string,
  startDate: Date,
  endDate: Date,
  budget: number,
  plannedActivities: number,
  travelMonth: number
): TripCompletionAnalysis {
  const recommendations = getDestinationRecommendations(destination);
  const tripDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  
  // Budget Score (0-100)
  const budgetEstimate = calculateBudgetEstimate(destination, tripDays);
  let budgetScore = 100;
  if (budget < budgetEstimate.min) {
    budgetScore = Math.max(0, (budget / budgetEstimate.min) * 70);
  } else if (budget < budgetEstimate.max) {
    budgetScore = 70 + ((budget - budgetEstimate.min) / (budgetEstimate.max - budgetEstimate.min)) * 30;
  }
  
  // Time Score (0-100)
  const durationRec = calculateRecommendedDuration(destination);
  let timeScore = 100;
  if (tripDays < durationRec.minimum) {
    timeScore = Math.max(20, (tripDays / durationRec.minimum) * 60);
  } else if (tripDays < durationRec.recommended) {
    timeScore = 60 + ((tripDays - durationRec.minimum) / (durationRec.recommended - durationRec.minimum)) * 30;
  } else if (tripDays >= durationRec.recommended) {
    timeScore = 90 + Math.min(10, (tripDays - durationRec.recommended) * 2);
  }
  
  // Activity Score (0-100)
  const recommendedActivities = Math.ceil(tripDays * 2.5); // ~2-3 activities per day
  let activityScore = 100;
  if (plannedActivities === 0) {
    activityScore = 50; // No activities planned yet
  } else if (plannedActivities > recommendedActivities * 1.5) {
    activityScore = Math.max(40, 100 - (plannedActivities - recommendedActivities) * 5);
  } else if (plannedActivities < recommendedActivities * 0.5) {
    activityScore = 70 + (plannedActivities / (recommendedActivities * 0.5)) * 20;
  }
  
  // Season Score (0-100)
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                  'July', 'August', 'September', 'October', 'November', 'December'];
  const travelMonthName = months[travelMonth];
  
  let bestMonthMatches = 0;
  let totalAreas = recommendations.length;
  
  recommendations.forEach(rec => {
    if (rec.bestTimeToVisit.some(m => 
      m.toLowerCase() === travelMonthName.toLowerCase() ||
      m.toLowerCase() === 'any season'
    )) {
      bestMonthMatches++;
    }
  });
  
  const seasonScore = totalAreas > 0 ? (bestMonthMatches / totalAreas) * 100 : 70;
  
  // Calculate overall score (weighted average)
  const overallScore = Math.round(
    budgetScore * 0.3 +
    timeScore * 0.3 +
    activityScore * 0.2 +
    seasonScore * 0.2
  );
  
  // Generate suggestions
  const suggestions: string[] = [];
  const risks: string[] = [];
  
  if (budgetScore < 70) {
    suggestions.push(`Consider increasing your budget to at least ${budgetEstimate.min} ${budgetEstimate.currency} for a comfortable trip`);
    risks.push('Budget may be tight for planned activities');
  }
  
  if (timeScore < 70) {
    suggestions.push(`We recommend ${durationRec.recommended} days to fully experience ${destination}`);
    risks.push('Limited time may mean rushing through attractions');
  }
  
  if (activityScore < 70 && plannedActivities > recommendedActivities) {
    suggestions.push('Consider reducing activities to avoid an exhausting schedule');
    risks.push('Overpacked itinerary may lead to fatigue');
  } else if (activityScore < 70 && plannedActivities < recommendedActivities * 0.5) {
    suggestions.push('Add more activities to make the most of your trip');
  }
  
  if (seasonScore < 60) {
    suggestions.push(`${travelMonthName} may not be the ideal time to visit. Consider traveling in ${recommendations[0]?.bestTimeToVisit[0] || 'spring/fall'}`);
    risks.push('Weather conditions might affect some activities');
  }
  
  // Determine confidence level
  let confidence: 'high' | 'medium' | 'low' = 'high';
  if (overallScore < 50) confidence = 'low';
  else if (overallScore < 75) confidence = 'medium';
  
  return {
    overallScore,
    breakdown: {
      budgetScore: Math.round(budgetScore),
      timeScore: Math.round(timeScore),
      activityScore: Math.round(activityScore),
      seasonScore: Math.round(seasonScore)
    },
    suggestions,
    risks,
    confidence
  };
}

/**
 * Get smart travel tips based on destination and travel date
 */
export function getSmartTravelTips(destination: string, month: number): string[] {
  const recommendations = getDestinationRecommendations(destination);
  const tips: string[] = [];
  
  recommendations.forEach(rec => {
    tips.push(...rec.travelTips);
  });
  
  // Add generic tips based on month
  const seasonTips: Record<string, string[]> = {
    winter: ['Pack layers for cold weather', 'Check for holiday closures', 'Book accommodations early for holiday season'],
    spring: ['Pack rain gear', 'Book outdoor activities in advance', 'Check for local festivals'],
    summer: ['Stay hydrated', 'Book popular attractions early', 'Consider travel insurance'],
    fall: ['Enjoy mild weather for walking tours', 'Pack layers', 'Great time for photography']
  };
  
  let season = 'spring';
  if (month >= 11 || month <= 1) season = 'winter';
  else if (month >= 2 && month <= 4) season = 'spring';
  else if (month >= 5 && month <= 7) season = 'summer';
  else season = 'fall';
  
  tips.push(...seasonTips[season]);
  
  // Remove duplicates and return
  return [...new Set(tips)].slice(0, 8);
}
