import mongoose from 'mongoose';
import City from '../models/City';
import dotenv from 'dotenv';

dotenv.config();

const cities = [
  // Asia
  {
    name: "Tokyo",
    country: "Japan",
    region: "Asia",
    costIndex: 3,
    popularityScore: 95,
    imageUrl: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80",
    description: "A vibrant metropolis blending ultra-modern technology with traditional temples and gardens.",
    tags: ["Culture", "Food", "Modern", "Technology"],
    latitude: 35.6762,
    longitude: 139.6503
  },
  {
    name: "Bali",
    country: "Indonesia",
    region: "Asia",
    costIndex: 1,
    popularityScore: 92,
    imageUrl: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80",
    description: "Island paradise known for beaches, rice terraces, temples, and wellness retreats.",
    tags: ["Beach", "Wellness", "Nature", "Yoga"],
    latitude: -8.3405,
    longitude: 115.0920
  },
  {
    name: "Bangkok",
    country: "Thailand",
    region: "Asia",
    costIndex: 1,
    popularityScore: 88,
    imageUrl: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800&q=80",
    description: "Bustling capital known for ornate shrines, vibrant street life, and amazing street food.",
    tags: ["Food", "Culture", "Budget", "Nightlife"],
    latitude: 13.7563,
    longitude: 100.5018
  },
  {
    name: "Singapore",
    country: "Singapore",
    region: "Asia",
    costIndex: 4,
    popularityScore: 85,
    imageUrl: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800&q=80",
    description: "Modern city-state famous for gardens, Marina Bay, and world-class dining.",
    tags: ["Modern", "Food", "Shopping", "Clean"],
    latitude: 1.3521,
    longitude: 103.8198
  },
  {
    name: "Kyoto",
    country: "Japan",
    region: "Asia",
    costIndex: 3,
    popularityScore: 90,
    imageUrl: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80",
    description: "Ancient capital with thousands of Buddhist temples, Shinto shrines, and traditional gardens.",
    tags: ["History", "Culture", "Temples", "Traditional"],
    latitude: 35.0116,
    longitude: 135.7681
  },
  
  // India
  {
    name: "Jaipur",
    country: "India",
    region: "Asia",
    costIndex: 1,
    popularityScore: 82,
    imageUrl: "https://images.unsplash.com/photo-1477587458883-47145ed94245?w=800&q=80",
    description: "The Pink City, known for royal palaces, colorful bazaars, and rich Rajasthani culture.",
    tags: ["History", "Culture", "Heritage", "Shopping"],
    latitude: 26.9124,
    longitude: 75.7873
  },
  {
    name: "Goa",
    country: "India",
    region: "Asia",
    costIndex: 1,
    popularityScore: 85,
    imageUrl: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&q=80",
    description: "Beach paradise with Portuguese heritage, vibrant nightlife, and laid-back vibes.",
    tags: ["Beach", "Nightlife", "Party", "Relaxation"],
    latitude: 15.2993,
    longitude: 74.1240
  },
  {
    name: "Kerala",
    country: "India",
    region: "Asia",
    costIndex: 1,
    popularityScore: 80,
    imageUrl: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800&q=80",
    description: "God's Own Country - backwaters, Ayurveda, tea plantations, and serene beaches.",
    tags: ["Nature", "Wellness", "Backwaters", "Ayurveda"],
    latitude: 10.8505,
    longitude: 76.2711
  },
  {
    name: "Varanasi",
    country: "India",
    region: "Asia",
    costIndex: 1,
    popularityScore: 78,
    imageUrl: "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=800&q=80",
    description: "One of the world's oldest cities, spiritual capital on the banks of the Ganges.",
    tags: ["Spiritual", "Culture", "History", "Religious"],
    latitude: 25.3176,
    longitude: 82.9739
  },
  {
    name: "Udaipur",
    country: "India",
    region: "Asia",
    costIndex: 1,
    popularityScore: 83,
    imageUrl: "https://images.unsplash.com/photo-1524230507669-5ff97982bb5e?w=800&q=80",
    description: "City of Lakes with stunning palaces, romantic settings, and royal Rajasthani heritage.",
    tags: ["Romance", "Palaces", "Lakes", "Heritage"],
    latitude: 24.5854,
    longitude: 73.7125
  },
  
  // Europe
  {
    name: "Paris",
    country: "France",
    region: "Europe",
    costIndex: 4,
    popularityScore: 98,
    imageUrl: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80",
    description: "The City of Light - iconic landmarks, world-class art, fashion, and cuisine.",
    tags: ["Romance", "Art", "History", "Fashion"],
    latitude: 48.8566,
    longitude: 2.3522
  },
  {
    name: "Santorini",
    country: "Greece",
    region: "Europe",
    costIndex: 3,
    popularityScore: 93,
    imageUrl: "https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=800&q=80",
    description: "Stunning island with white-washed buildings, blue domes, and spectacular sunsets.",
    tags: ["Romance", "Beach", "Photography", "Luxury"],
    latitude: 36.3932,
    longitude: 25.4615
  },
  {
    name: "Barcelona",
    country: "Spain",
    region: "Europe",
    costIndex: 3,
    popularityScore: 90,
    imageUrl: "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800&q=80",
    description: "Vibrant coastal city with stunning Gaudí architecture, beaches, and nightlife.",
    tags: ["Architecture", "Beach", "Food", "Nightlife"],
    latitude: 41.3874,
    longitude: 2.1686
  },
  {
    name: "Amsterdam",
    country: "Netherlands",
    region: "Europe",
    costIndex: 3,
    popularityScore: 87,
    imageUrl: "https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=800&q=80",
    description: "Canal-ringed city known for museums, cycling culture, and artistic heritage.",
    tags: ["Art", "Culture", "Cycling", "Museums"],
    latitude: 52.3676,
    longitude: 4.9041
  },
  {
    name: "Rome",
    country: "Italy",
    region: "Europe",
    costIndex: 3,
    popularityScore: 94,
    imageUrl: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&q=80",
    description: "Eternal City with ancient ruins, Vatican treasures, and incredible Italian cuisine.",
    tags: ["History", "Art", "Food", "Architecture"],
    latitude: 41.9028,
    longitude: 12.4964
  },
  {
    name: "Prague",
    country: "Czech Republic",
    region: "Europe",
    costIndex: 2,
    popularityScore: 85,
    imageUrl: "https://images.unsplash.com/photo-1541849546-216549ae216d?w=800&q=80",
    description: "Fairy-tale city with Gothic architecture, historic squares, and vibrant nightlife.",
    tags: ["History", "Architecture", "Budget", "Beer"],
    latitude: 50.0755,
    longitude: 14.4378
  },
  {
    name: "Reykjavik",
    country: "Iceland",
    region: "Europe",
    costIndex: 4,
    popularityScore: 82,
    imageUrl: "https://images.unsplash.com/photo-1504829857797-ddff29c27927?w=800&q=80",
    description: "Gateway to natural wonders - Northern Lights, geysers, waterfalls, and glaciers.",
    tags: ["Nature", "Adventure", "Northern Lights", "Unique"],
    latitude: 64.1466,
    longitude: -21.9426
  },
  
  // North America
  {
    name: "New York",
    country: "USA",
    region: "North America",
    costIndex: 4,
    popularityScore: 96,
    imageUrl: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&q=80",
    description: "The city that never sleeps - iconic skyline, Broadway, Central Park, and diverse cuisine.",
    tags: ["City", "Culture", "Food", "Shopping"],
    latitude: 40.7128,
    longitude: -74.0060
  },
  {
    name: "Los Angeles",
    country: "USA",
    region: "North America",
    costIndex: 4,
    popularityScore: 88,
    imageUrl: "https://images.unsplash.com/photo-1534190760961-74e8c1c5c3da?w=800&q=80",
    description: "Entertainment capital with beaches, Hollywood, and year-round sunshine.",
    tags: ["Beach", "Entertainment", "Shopping", "Celebrity"],
    latitude: 34.0522,
    longitude: -118.2437
  },
  {
    name: "Cancun",
    country: "Mexico",
    region: "North America",
    costIndex: 2,
    popularityScore: 84,
    imageUrl: "https://images.unsplash.com/photo-1510097467424-192d713fd8b2?w=800&q=80",
    description: "Caribbean paradise with stunning beaches, Mayan ruins, and vibrant nightlife.",
    tags: ["Beach", "Party", "Ruins", "Resort"],
    latitude: 21.1619,
    longitude: -86.8515
  },
  
  // South America
  {
    name: "Machu Picchu",
    country: "Peru",
    region: "South America",
    costIndex: 2,
    popularityScore: 94,
    imageUrl: "https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=800&q=80",
    description: "Ancient Incan citadel set high in the Andes Mountains - a world wonder.",
    tags: ["Adventure", "History", "Nature", "Hiking"],
    latitude: -13.1631,
    longitude: -72.5450
  },
  {
    name: "Rio de Janeiro",
    country: "Brazil",
    region: "South America",
    costIndex: 2,
    popularityScore: 89,
    imageUrl: "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800&q=80",
    description: "Marvelous city with iconic beaches, Carnival, Christ the Redeemer, and samba.",
    tags: ["Beach", "Culture", "Party", "Nature"],
    latitude: -22.9068,
    longitude: -43.1729
  },
  {
    name: "Buenos Aires",
    country: "Argentina",
    region: "South America",
    costIndex: 2,
    popularityScore: 83,
    imageUrl: "https://images.unsplash.com/photo-1612294037637-ec328d0e075e?w=800&q=80",
    description: "Paris of South America - tango, steak, wine, and European-style architecture.",
    tags: ["Culture", "Food", "Tango", "Nightlife"],
    latitude: -34.6037,
    longitude: -58.3816
  },
  
  // Middle East
  {
    name: "Dubai",
    country: "UAE",
    region: "Middle East",
    costIndex: 4,
    popularityScore: 91,
    imageUrl: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80",
    description: "Futuristic city of superlatives - tallest buildings, luxury shopping, and desert adventures.",
    tags: ["Luxury", "Modern", "Shopping", "Desert"],
    latitude: 25.2048,
    longitude: 55.2708
  },
  {
    name: "Istanbul",
    country: "Turkey",
    region: "Middle East",
    costIndex: 2,
    popularityScore: 88,
    imageUrl: "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=800&q=80",
    description: "Where East meets West - historic mosques, bazaars, and Bosphorus views.",
    tags: ["History", "Culture", "Food", "Architecture"],
    latitude: 41.0082,
    longitude: 28.9784
  },
  {
    name: "Petra",
    country: "Jordan",
    region: "Middle East",
    costIndex: 2,
    popularityScore: 85,
    imageUrl: "https://images.unsplash.com/photo-1579606032821-4e6161c81571?w=800&q=80",
    description: "Ancient rose-red city carved into cliffs - one of the New Seven Wonders.",
    tags: ["History", "Adventure", "Archaeological", "Unique"],
    latitude: 30.3285,
    longitude: 35.4444
  },
  
  // Africa
  {
    name: "Cape Town",
    country: "South Africa",
    region: "Africa",
    costIndex: 2,
    popularityScore: 87,
    imageUrl: "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=800&q=80",
    description: "Stunning coastal city with Table Mountain, wine regions, and diverse wildlife.",
    tags: ["Nature", "Wine", "Beach", "Adventure"],
    latitude: -33.9249,
    longitude: 18.4241
  },
  {
    name: "Marrakech",
    country: "Morocco",
    region: "Africa",
    costIndex: 1,
    popularityScore: 84,
    imageUrl: "https://images.unsplash.com/photo-1597212618440-806262de4f6b?w=800&q=80",
    description: "Enchanting medina with souks, palaces, gardens, and rich Moroccan culture.",
    tags: ["Culture", "Shopping", "History", "Food"],
    latitude: 31.6295,
    longitude: -7.9811
  },
  {
    name: "Serengeti",
    country: "Tanzania",
    region: "Africa",
    costIndex: 3,
    popularityScore: 86,
    imageUrl: "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800&q=80",
    description: "World's greatest wildlife sanctuary - witness the Great Migration and Big Five.",
    tags: ["Safari", "Wildlife", "Nature", "Adventure"],
    latitude: -2.3333,
    longitude: 34.8333
  },
  
  // Oceania
  {
    name: "Sydney",
    country: "Australia",
    region: "Oceania",
    costIndex: 4,
    popularityScore: 89,
    imageUrl: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800&q=80",
    description: "Harbour city with iconic Opera House, beautiful beaches, and outdoor lifestyle.",
    tags: ["Beach", "City", "Culture", "Food"],
    latitude: -33.8688,
    longitude: 151.2093
  },
  {
    name: "Queenstown",
    country: "New Zealand",
    region: "Oceania",
    costIndex: 3,
    popularityScore: 85,
    imageUrl: "https://images.unsplash.com/photo-1589196474977-38a0fd4c5f65?w=800&q=80",
    description: "Adventure capital of the world surrounded by stunning mountains and lakes.",
    tags: ["Adventure", "Nature", "Extreme Sports", "Scenic"],
    latitude: -45.0312,
    longitude: 168.6626
  },
  {
    name: "Fiji",
    country: "Fiji",
    region: "Oceania",
    costIndex: 3,
    popularityScore: 82,
    imageUrl: "https://images.unsplash.com/photo-1584811644165-33db3b146db5?w=800&q=80",
    description: "Tropical paradise with crystal-clear waters, coral reefs, and warm hospitality.",
    tags: ["Beach", "Island", "Relaxation", "Diving"],
    latitude: -17.7134,
    longitude: 178.0650
  }
];

async function seedCities() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/globetrotter';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Clear existing cities
    await City.deleteMany({});
    console.log('🗑️ Cleared existing cities');

    // Insert cities
    const result = await City.insertMany(cities);
    console.log(`✅ Seeded ${result.length} cities successfully!`);

    // Show summary by region
    const regionCounts = await City.aggregate([
      { $group: { _id: '$region', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    console.log('\n📊 Cities by Region:');
    regionCounts.forEach(r => console.log(`   ${r._id}: ${r.count}`));

  } catch (error) {
    console.error('❌ Error seeding cities:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
  }
}

seedCities();
