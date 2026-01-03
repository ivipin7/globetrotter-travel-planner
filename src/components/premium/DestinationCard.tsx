import { MapPin, TrendingUp, Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface DestinationCardProps {
  cityName: string;
  country: string;
  costIndex: "low" | "medium" | "high";
  popularity: number;
  imageUrl?: string;
  description?: string;
  onAddToTrip?: () => void;
  onViewDetails?: () => void;
}

export function DestinationCard({
  cityName,
  country,
  costIndex,
  popularity,
  imageUrl,
  description,
  onAddToTrip,
  onViewDetails,
}: DestinationCardProps) {
  const costColors = {
    low: "bg-success/20 text-success border-success/30",
    medium: "bg-accent/20 text-accent border-accent/30",
    high: "bg-destructive/20 text-destructive border-destructive/30",
  };

  const costLabels = {
    low: "$",
    medium: "$$",
    high: "$$$",
  };

  return (
    <Card className="group relative overflow-hidden glass-card-hover border-border/50 h-full">
      {/* City Image */}
      <div className="relative h-48 overflow-hidden rounded-t-xl">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={cityName}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 via-accent/10 to-success/20 relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <MapPin className="h-16 w-16 text-primary/30" />
            </div>
          </div>
        )}

        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

        {/* Cost Badge */}
        <div className="absolute top-3 right-3">
          <Badge className={`${costColors[costIndex]} font-semibold px-3 py-1.5 shadow-lg backdrop-blur-sm border`}>
            {costLabels[costIndex]}
          </Badge>
        </div>

        {/* Popularity Indicator */}
        {popularity >= 80 && (
          <div className="absolute top-3 left-3">
            <Badge className="bg-amber-100 text-amber-700 border-amber-300 font-medium px-2 py-1 shadow-lg backdrop-blur-sm flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              Trending
            </Badge>
          </div>
        )}

        {/* Location Text */}
        <div className="absolute bottom-3 left-3 text-white">
          <h3 className="text-xl font-semibold mb-1 drop-shadow-lg">{cityName}</h3>
          <p className="text-sm text-white/90 drop-shadow-md flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {country}
          </p>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4">
        {description && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {description}
          </p>
        )}

        {/* Popularity Bar */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-xs text-muted-foreground">Popularity</span>
            <span className="text-xs font-medium text-foreground">{popularity}%</span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500 rounded-full"
              style={{ width: `${popularity}%` }}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={onViewDetails}
            variant="outline"
            className="flex-1 group/btn"
            size="sm"
          >
            View Details
          </Button>
          <Button
            onClick={onAddToTrip}
            className="flex-1 group/btn relative overflow-hidden"
            size="sm"
          >
            <Plus className="h-4 w-4 mr-1 transition-transform group-hover/btn:rotate-90" />
            Add to Trip
          </Button>
        </div>
      </div>

      {/* Hover Glow */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-accent/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity blur-xl -z-10" />
    </Card>
  );
}
