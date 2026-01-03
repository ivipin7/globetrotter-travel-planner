import { Star, ArrowRight, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const recommendations = [
  {
    id: "1",
    name: "Santorini",
    country: "Greece",
    image: "https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=600&q=80",
    rating: 4.9,
    priceLevel: "$$",
    matchScore: 98,
  },
  {
    id: "2",
    name: "Kyoto",
    country: "Japan",
    image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=600&q=80",
    rating: 4.8,
    priceLevel: "$$",
    matchScore: 95,
  },
  {
    id: "3",
    name: "Barcelona",
    country: "Spain",
    image: "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=600&q=80",
    rating: 4.7,
    priceLevel: "$$",
    matchScore: 92,
  },
  {
    id: "4",
    name: "Reykjavik",
    country: "Iceland",
    image: "https://images.unsplash.com/photo-1504829857797-ddff29c27927?w=600&q=80",
    rating: 4.8,
    priceLevel: "$$$",
    matchScore: 90,
  },
];

export function RecommendedDestinations() {
  return (
    <div className="card-3d p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-semibold text-lg">Recommended for You</h3>
          <p className="text-sm text-muted-foreground">Based on your travel preferences</p>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/discover">
            View All
            <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </Button>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-hide">
        {recommendations.map((dest) => (
          <Link
            key={dest.id}
            to={`/discover?city=${dest.name}`}
            className="group flex-shrink-0 w-48"
          >
            <div className="relative rounded-xl overflow-hidden mb-3">
              <img
                src={dest.image}
                alt={dest.name}
                className="w-full aspect-square object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              
              {/* Match Score Badge */}
              <div className="absolute top-2 right-2 px-2 py-1 rounded-full bg-success text-success-foreground text-xs font-medium">
                {dest.matchScore}% match
              </div>

              {/* Info */}
              <div className="absolute bottom-3 left-3 right-3">
                <h4 className="font-semibold text-white text-sm">{dest.name}</h4>
                <div className="flex items-center gap-1 text-white/80 text-xs">
                  <MapPin className="h-3 w-3" />
                  {dest.country}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-1">
                <Star className="h-3.5 w-3.5 text-accent fill-accent" />
                <span className="text-sm font-medium">{dest.rating}</span>
              </div>
              <span className="text-sm text-muted-foreground">{dest.priceLevel}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
