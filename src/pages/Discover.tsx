import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Search, 
  MapPin, 
  Star, 
  TrendingUp,
  IndianRupee,
  Globe,
  ArrowLeft,
  SlidersHorizontal,
  X,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cityApi, City } from "@/lib/api";

const regions = ["All Regions", "Asia", "Europe", "North America", "South America", "Africa", "Middle East", "Oceania"];
const costLevels = ["Any Budget", "Budget (₹)", "Mid-Range (₹₹)", "Comfortable (₹₹₹)", "Luxury (₹₹₹₹)"];

function CostIndicator({ level }: { level: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4].map((i) => (
        <IndianRupee
          key={i}
          className={`h-3.5 w-3.5 ${i <= level ? "text-success" : "text-muted"}`}
        />
      ))}
    </div>
  );
}

export default function Discover() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("All Regions");
  const [selectedCost, setSelectedCost] = useState("Any Budget");
  const [showFilters, setShowFilters] = useState(false);
  
  // API states
  const [destinations, setDestinations] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchSource, setSearchSource] = useState<'local' | 'global' | 'none'>('local');

  // Fetch cities using HYBRID SEARCH (local DB + global fallback)
  useEffect(() => {
    const fetchCities = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Convert cost level to costIndex
        let costIndex: number | undefined;
        if (selectedCost === "Budget (₹)") costIndex = 1;
        else if (selectedCost === "Mid-Range (₹₹)") costIndex = 2;
        else if (selectedCost === "Comfortable (₹₹₹)") costIndex = 3;
        else if (selectedCost === "Luxury (₹₹₹₹)") costIndex = 4;

        // Use hybrid search for global fallback capability
        const response = await cityApi.hybridSearch({
          region: selectedRegion !== "All Regions" ? selectedRegion : undefined,
          costIndex,
          search: searchQuery || undefined,
          limit: 50,
        });
        
        setDestinations(response.cities);
        setSearchSource(response.source || 'local');
      } catch (err) {
        console.error('Error fetching cities:', err);
        setError('Failed to load destinations. Please try again.');
        setSearchSource('none');
      } finally {
        setLoading(false);
      }
    };

    // Debounce search (500ms for global searches to avoid API spam)
    const timeoutId = setTimeout(fetchCities, searchQuery ? 500 : 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, selectedRegion, selectedCost]);

  const clearFilters = () => {
    setSelectedRegion("All Regions");
    setSelectedCost("Any Budget");
    setSearchQuery("");
  };

  const hasActiveFilters = selectedRegion !== "All Regions" || selectedCost !== "Any Budget" || searchQuery !== "";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 nav-glass">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/dashboard">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div className="flex items-center gap-2">
              <Globe className="h-6 w-6 text-primary" />
              <span className="font-semibold">Discover</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-semibold mb-4">
            Discover Your Next <span className="text-gradient-primary">Destination</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Explore {destinations.length}+ destinations worldwide. Find the perfect place for your next adventure.
          </p>
        </div>

        {/* Search & Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search destinations, countries..."
                className="pl-12 h-12 text-base"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button
              variant="outline"
              className="h-12 px-6"
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="h-5 w-5 mr-2" />
              Filters
              {hasActiveFilters && (
                <span className="ml-2 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                  !
                </span>
              )}
            </Button>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="card-3d p-6 animate-scale-in">
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px]">
                  <label className="text-sm font-medium mb-2 block">Region</label>
                  <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {regions.map((region) => (
                        <SelectItem key={region} value={region}>
                          {region}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1 min-w-[200px]">
                  <label className="text-sm font-medium mb-2 block">Budget Level</label>
                  <Select value={selectedCost} onValueChange={setSelectedCost}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {costLevels.map((level) => (
                        <SelectItem key={level} value={level}>
                          {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {hasActiveFilters && (
                  <div className="flex items-end">
                    <Button variant="ghost" onClick={clearFilters}>
                      <X className="h-4 w-4 mr-2" />
                      Clear Filters
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Global Search Banner - Shows when results come from global API */}
        {searchSource === 'global' && !loading && destinations.length > 0 && (
          <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 border border-blue-500/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Globe className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">🌍 Global Discovery Results</h3>
                <p className="text-xs text-muted-foreground">
                  These destinations were dynamically discovered from around the world and saved for you.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-muted-foreground">
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                {searchQuery ? 'Searching worldwide...' : 'Loading destinations...'}
              </span>
            ) : (
              <>
                <span className="text-foreground font-medium">{destinations.length}</span> destinations found
                {searchSource === 'global' && (
                  <span className="ml-2 text-xs text-blue-500">(via Global Search)</span>
                )}
              </>
            )}
          </p>
        </div>

        {/* Error State */}
        {error && (
          <div className="card-3d p-6 text-center text-destructive mb-6">
            <p>{error}</p>
            <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="card-3d overflow-hidden animate-pulse">
                <div className="aspect-[4/3] bg-muted" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                  <div className="flex gap-2">
                    <div className="h-5 bg-muted rounded w-16" />
                    <div className="h-5 bg-muted rounded w-16" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Destinations Grid */}
        {!loading && !error && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {destinations.map((destination, index) => (
              <Link
                key={destination._id}
                to={`/discover/${destination._id}`}
                className="group card-3d overflow-hidden animate-slide-up"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {/* Image */}
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={destination.imageUrl || `https://source.unsplash.com/800x600/?${destination.name},travel`}
                    alt={destination.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                    {/* Global Result Badge */}
                    {destination.source === 'global' && (
                      <div 
                        className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs font-medium shadow-lg"
                        title="This destination was dynamically discovered"
                      >
                        <Globe className="h-3 w-3" />
                        Global
                      </div>
                    )}
                    {/* Trending Badge */}
                    {(destination.popularityScore || 0) >= 80 && (
                      <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-accent text-accent-foreground text-xs font-medium">
                        <TrendingUp className="h-3 w-3" />
                        Trending
                      </div>
                    )}
                  </div>

                  {/* Cost Level */}
                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-card/80 backdrop-blur-sm">
                    <CostIndicator level={destination.costIndex} />
                  </div>

                  {/* Info */}
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-lg font-semibold text-white mb-1">
                      {destination.name}
                    </h3>
                    <div className="flex items-center gap-1 text-white/80 text-sm">
                      <MapPin className="h-3.5 w-3.5" />
                      {destination.country}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-accent fill-accent" />
                      <span className="font-medium">{((destination.popularityScore || 50) / 20).toFixed(1)}</span>
                      <span className="text-muted-foreground text-sm">
                        ({destination.region})
                      </span>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5">
                    {destination.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  {/* Description */}
                  {destination.description && (
                    <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                      {destination.description}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && destinations.length === 0 && (
          <div className="card-3d p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <MapPin className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg mb-2">No destinations found</h3>
            <p className="text-muted-foreground mb-6">
              Try adjusting your filters or search terms.
            </p>
            <Button variant="outline" onClick={clearFilters}>
              Clear All Filters
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
