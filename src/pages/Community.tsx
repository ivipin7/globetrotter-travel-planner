import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  Search, 
  Globe,
  Users,
  Heart,
  Share2,
  Copy,
  MapPin,
  Calendar,
  IndianRupee,
  Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

// Mock community trips
const communityTrips = [
  {
    id: "1",
    name: "10 Days in Japan - Complete Guide",
    user: { name: "Sarah Chen", avatar: "", verified: true },
    coverImage: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80",
    destinations: ["Tokyo", "Kyoto", "Osaka"],
    duration: "10 days",
    budget: "₹2,90,000",
    likes: 234,
    views: 1890,
    copies: 45,
    tags: ["Culture", "Food", "Adventure"],
  },
  {
    id: "2",
    name: "Budget Europe Backpacking",
    user: { name: "Mike Johnson", avatar: "", verified: false },
    coverImage: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800&q=80",
    destinations: ["Paris", "Amsterdam", "Berlin", "Prague"],
    duration: "21 days",
    budget: "₹2,35,000",
    likes: 567,
    views: 3420,
    copies: 89,
    tags: ["Budget", "Backpacking", "Solo"],
  },
  {
    id: "3",
    name: "Romantic Santorini Getaway",
    user: { name: "Emma Davis", avatar: "", verified: true },
    coverImage: "https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=800&q=80",
    destinations: ["Santorini", "Athens"],
    duration: "7 days",
    budget: "₹3,50,000",
    likes: 892,
    views: 5670,
    copies: 156,
    tags: ["Romance", "Beach", "Luxury"],
  },
  {
    id: "4",
    name: "Bali Wellness Journey",
    user: { name: "Alex Kim", avatar: "", verified: true },
    coverImage: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80",
    destinations: ["Ubud", "Seminyak", "Uluwatu"],
    duration: "14 days",
    budget: "₹1,75,000",
    likes: 445,
    views: 2890,
    copies: 67,
    tags: ["Wellness", "Nature", "Yoga"],
  },
];

export default function Community() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("trending");
  const { toast } = useToast();

  const handleCopyTrip = (tripName: string) => {
    toast({
      title: "Trip copied!",
      description: `"${tripName}" has been added to your trips.`,
    });
  };

  const handleLike = () => {
    toast({
      title: "Liked!",
      description: "Trip added to your favorites.",
    });
  };

  const filteredTrips = communityTrips.filter(trip =>
    trip.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    trip.destinations.some(d => d.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <DashboardLayout 
      title="Community"
      searchPlaceholder="Search shared trips..."
      onSearch={setSearchQuery}
    >
      <div className="p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-semibold">Community</h1>
            <p className="text-muted-foreground">
              Discover and get inspired by trips shared by other travelers
            </p>
          </div>
          <Button variant="outline">
            <Share2 className="h-4 w-4 mr-2" />
            Share Your Trip
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="trending">🔥 Trending</TabsTrigger>
            <TabsTrigger value="popular">⭐ Popular</TabsTrigger>
            <TabsTrigger value="recent">🆕 Recent</TabsTrigger>
            <TabsTrigger value="following">👥 Following</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Trip Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {filteredTrips.map((trip) => (
            <Card key={trip.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative h-48">
                <img
                  src={trip.coverImage}
                  alt={trip.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3 flex gap-2">
                  <Button
                    size="icon"
                    variant="secondary"
                    className="h-8 w-8 bg-white/90 hover:bg-white"
                    onClick={handleLike}
                  >
                    <Heart className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="secondary"
                    className="h-8 w-8 bg-white/90 hover:bg-white"
                    onClick={() => handleCopyTrip(trip.name)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardContent className="p-4">
                {/* User Info */}
                <div className="flex items-center gap-2 mb-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={trip.user.avatar} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {trip.user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-medium">{trip.user.name}</span>
                      {trip.user.verified && (
                        <Badge variant="secondary" className="text-xs px-1 py-0">✓</Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Trip Info */}
                <h3 className="font-semibold text-lg mb-2">{trip.name}</h3>
                
                <div className="flex flex-wrap gap-2 mb-3">
                  {trip.destinations.map((dest) => (
                    <Badge key={dest} variant="outline" className="text-xs">
                      <MapPin className="h-3 w-3 mr-1" />
                      {dest}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {trip.duration}
                  </span>
                  <span className="flex items-center gap-1">
                    <IndianRupee className="h-4 w-4" />
                    {trip.budget}
                  </span>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {trip.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between pt-3 border-t">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Heart className="h-4 w-4" />
                      {trip.likes}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      {trip.views}
                    </span>
                    <span className="flex items-center gap-1">
                      <Copy className="h-4 w-4" />
                      {trip.copies}
                    </span>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to={`/community/trip/${trip.id}`}>
                      View Details
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredTrips.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Globe className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-xl mb-2">No trips found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search or browse all community trips
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
