import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  IndianRupee,
  Star,
  Globe,
  TrendingUp,
  Calendar,
  Users,
  Plane,
  Hotel,
  Utensils,
  Camera,
  Heart,
  Share2,
  Plus,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WeatherWidget } from "@/components/weather/WeatherWidget";
import { cityApi, City } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

function CostIndicator({ level }: { level: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4].map((i) => (
        <IndianRupee
          key={i}
          className={`h-4 w-4 ${i <= level ? "text-success" : "text-muted"}`}
        />
      ))}
    </div>
  );
}

const costLabels: Record<number, string> = {
  1: "Budget Friendly",
  2: "Mid-Range",
  3: "Comfortable",
  4: "Luxury",
};

// Mock data for activities (in real app, this would come from API)
const getActivities = (cityName: string) => [
  {
    id: 1,
    name: `${cityName} City Tour`,
    type: "Tour",
    duration: "4 hours",
    price: "₹2,500",
    rating: 4.8,
  },
  {
    id: 2,
    name: "Local Food Experience",
    type: "Food",
    duration: "3 hours",
    price: "₹1,800",
    rating: 4.9,
  },
  {
    id: 3,
    name: "Cultural Heritage Walk",
    type: "Culture",
    duration: "2 hours",
    price: "₹1,200",
    rating: 4.7,
  },
  {
    id: 4,
    name: "Photography Tour",
    type: "Adventure",
    duration: "5 hours",
    price: "₹3,000",
    rating: 4.6,
  },
];

export default function DestinationDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [city, setCity] = useState<City | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const fetchCity = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        const data = await cityApi.getById(id);
        setCity(data);
      } catch (err) {
        console.error("Error fetching city:", err);
        setError("Failed to load destination details");
      } finally {
        setLoading(false);
      }
    };

    fetchCity();
  }, [id]);

  const handleSave = () => {
    setIsSaved(!isSaved);
    toast({
      title: isSaved ? "Removed from saved" : "Saved!",
      description: isSaved 
        ? `${city?.name} removed from your saved destinations`
        : `${city?.name} added to your saved destinations`,
    });
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied!",
        description: "Share this destination with friends",
      });
    } catch {
      toast({
        title: "Share",
        description: window.location.href,
      });
    }
  };

  const handleCreateTrip = () => {
    navigate(`/trip/new?destination=${encodeURIComponent(city?.name || '')}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !city) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 nav-glass">
          <div className="container mx-auto px-4">
            <div className="flex h-16 items-center gap-4">
              <Button variant="ghost" size="icon" asChild>
                <Link to="/discover">
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              </Button>
              <span className="font-semibold">Destination</span>
            </div>
          </div>
        </header>
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <MapPin className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Destination not found</h2>
          <p className="text-muted-foreground mb-6">{error || "This destination doesn't exist."}</p>
          <Button asChild>
            <Link to="/discover">Browse Destinations</Link>
          </Button>
        </div>
      </div>
    );
  }

  const activities = getActivities(city.name);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 nav-glass">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild>
                <Link to="/discover">
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              </Button>
              <div>
                <h1 className="font-semibold">{city.name}</h1>
                <p className="text-xs text-muted-foreground">{city.country}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={handleSave}>
                <Heart className={`h-5 w-5 ${isSaved ? 'fill-red-500 text-red-500' : ''}`} />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleShare}>
                <Share2 className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Image */}
      <div className="relative h-64 md:h-80 lg:h-96">
        <img
          src={city.imageUrl || `https://source.unsplash.com/1200x800/?${city.name},travel,landmark`}
          alt={city.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        
        {/* Hero Content */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
          <div className="container mx-auto">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  {(city.popularityScore || 0) >= 80 && (
                    <Badge className="bg-accent text-accent-foreground">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      Trending
                    </Badge>
                  )}
                  <Badge variant="secondary" className="bg-white/20 text-white border-0">
                    {city.region}
                  </Badge>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-1">{city.name}</h1>
                <div className="flex items-center gap-2 text-white/80">
                  <MapPin className="h-4 w-4" />
                  <span>{city.country}</span>
                </div>
              </div>
              
              <Button size="lg" onClick={handleCreateTrip} className="shadow-xl">
                <Plus className="h-5 w-5 mr-2" />
                Plan a Trip Here
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="card-3d">
            <CardContent className="p-4 text-center">
              <div className="flex justify-center mb-2">
                <Star className="h-5 w-5 text-accent fill-accent" />
              </div>
              <p className="text-2xl font-bold">{((city.popularityScore || 50) / 20).toFixed(1)}</p>
              <p className="text-xs text-muted-foreground">Rating</p>
            </CardContent>
          </Card>
          
          <Card className="card-3d">
            <CardContent className="p-4 text-center">
              <div className="flex justify-center mb-2">
                <CostIndicator level={city.costIndex} />
              </div>
              <p className="text-sm font-medium">{costLabels[city.costIndex]}</p>
              <p className="text-xs text-muted-foreground">Cost Level</p>
            </CardContent>
          </Card>
          
          <Card className="card-3d">
            <CardContent className="p-4 text-center">
              <div className="flex justify-center mb-2">
                <Globe className="h-5 w-5 text-primary" />
              </div>
              <p className="text-sm font-medium">{city.region}</p>
              <p className="text-xs text-muted-foreground">Region</p>
            </CardContent>
          </Card>
          
          <Card className="card-3d">
            <CardContent className="p-4 text-center">
              <div className="flex justify-center mb-2">
                <Calendar className="h-5 w-5 text-success" />
              </div>
              <p className="text-sm font-medium">Year-round</p>
              <p className="text-xs text-muted-foreground">Best Time</p>
            </CardContent>
          </Card>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-8">
          {city.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-sm px-3 py-1">
              {tag}
            </Badge>
          ))}
        </div>

        {/* Description */}
        {city.description && (
          <Card className="card-3d mb-8">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-3">About {city.name}</h2>
              <p className="text-muted-foreground leading-relaxed">{city.description}</p>
            </CardContent>
          </Card>
        )}

        {/* Weather Widget */}
        <div className="mb-8">
          <WeatherWidget destination={city.name} />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="activities" className="mb-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="activities">Activities</TabsTrigger>
            <TabsTrigger value="travel">Travel Info</TabsTrigger>
            <TabsTrigger value="tips">Tips</TabsTrigger>
          </TabsList>
          
          <TabsContent value="activities" className="mt-6">
            <div className="grid md:grid-cols-2 gap-4">
              {activities.map((activity) => (
                <Card key={activity.id} className="card-3d hover:scale-[1.02] transition-transform">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-medium">{activity.name}</h3>
                        <p className="text-sm text-muted-foreground">{activity.type} • {activity.duration}</p>
                      </div>
                      <Badge variant="outline">{activity.price}</Badge>
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="h-4 w-4 text-accent fill-accent" />
                      <span className="font-medium">{activity.rating}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="travel" className="mt-6">
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="card-3d">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Plane className="h-4 w-4 text-primary" />
                    Getting There
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Major airlines fly to {city.name}. Book 2-3 months in advance for best prices.
                    Average flight time varies by origin.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="card-3d">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Hotel className="h-4 w-4 text-primary" />
                    Where to Stay
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Options range from budget hostels (₹1,500/night) to luxury hotels (₹15,000+/night).
                    Central areas offer best access to attractions.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="card-3d">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Utensils className="h-4 w-4 text-primary" />
                    Food & Dining
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Local cuisine is a must-try. Street food from ₹100, restaurants ₹500-2,000 per meal.
                    Vegetarian options widely available.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="card-3d">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Camera className="h-4 w-4 text-primary" />
                    Must-See Spots
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Popular attractions fill up quickly. Book tickets online when possible.
                    Early mornings are best for photos with fewer crowds.
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="tips" className="mt-6">
            <Card className="card-3d">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">1</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Best Time to Visit</h4>
                    <p className="text-sm text-muted-foreground">
                      Research the weather patterns. Shoulder seasons often offer the best combination of good weather and fewer tourists.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">2</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Local Currency</h4>
                    <p className="text-sm text-muted-foreground">
                      Have some local currency on hand for small purchases. Most tourist areas accept cards, but cash is useful for markets.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">3</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Cultural Etiquette</h4>
                    <p className="text-sm text-muted-foreground">
                      Learn basic local phrases and customs. Respectful behavior opens doors to authentic experiences.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">4</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Stay Connected</h4>
                    <p className="text-sm text-muted-foreground">
                      Get a local SIM card or international roaming plan. Having maps and translation apps offline helps navigate easily.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* CTA */}
        <Card className="card-3d bg-gradient-to-r from-primary/10 to-accent/10">
          <CardContent className="p-6 md:p-8 text-center">
            <h2 className="text-xl font-semibold mb-2">Ready to explore {city.name}?</h2>
            <p className="text-muted-foreground mb-6">
              Start planning your trip and create unforgettable memories.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" onClick={handleCreateTrip}>
                <Plus className="h-5 w-5 mr-2" />
                Create Trip to {city.name}
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/discover">
                  Explore More Destinations
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
