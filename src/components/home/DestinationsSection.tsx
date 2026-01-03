import { ArrowRight, Star, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const destinations = [
  {
    name: "Tokyo",
    country: "Japan",
    image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80",
    rating: 4.9,
    trips: "12.5K",
    costIndex: "$$",
    trending: true,
  },
  {
    name: "Paris",
    country: "France",
    image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80",
    rating: 4.8,
    trips: "18.2K",
    costIndex: "$$$",
    trending: false,
  },
  {
    name: "Bali",
    country: "Indonesia",
    image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80",
    rating: 4.9,
    trips: "9.8K",
    costIndex: "$",
    trending: true,
  },
  {
    name: "New York",
    country: "USA",
    image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&q=80",
    rating: 4.7,
    trips: "22.1K",
    costIndex: "$$$",
    trending: false,
  },
];

export function DestinationsSection() {
  return (
    <section className="py-24 bg-muted/30 relative overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-semibold mb-4">
              Popular Destinations
            </h2>
            <p className="text-muted-foreground max-w-xl">
              Discover where travelers are heading. Get inspired by the most-visited destinations this season.
            </p>
          </div>
          <Button variant="hero-outline" asChild>
            <Link to="/discover">
              View All
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>

        {/* Destinations Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {destinations.map((destination, index) => (
            <Link
              key={destination.name}
              to={`/discover?city=${destination.name}`}
              className="group relative card-3d overflow-hidden"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Image */}
              <div className="aspect-[4/5] relative overflow-hidden">
                <img
                  src={destination.image}
                  alt={destination.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Trending Badge */}
                {destination.trending && (
                  <div className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent text-accent-foreground text-xs font-medium">
                    <TrendingUp className="h-3 w-3" />
                    Trending
                  </div>
                )}

                {/* Cost Index */}
                <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-card/80 backdrop-blur-sm text-xs font-medium">
                  {destination.costIndex}
                </div>

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <h3 className="text-xl font-semibold text-white mb-1">
                    {destination.name}
                  </h3>
                  <p className="text-white/70 text-sm mb-3">
                    {destination.country}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-accent fill-accent" />
                      <span className="text-white text-sm font-medium">{destination.rating}</span>
                    </div>
                    <span className="text-white/60 text-sm">{destination.trips} trips</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
