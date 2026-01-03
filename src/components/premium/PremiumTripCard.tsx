import { Calendar, MapPin, IndianRupee, ArrowRight, MoreVertical } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

interface PremiumTripCardProps {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  cityCount: number;
  totalBudget: number;
  coverImage?: string;
  status?: "upcoming" | "ongoing" | "completed";
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function PremiumTripCard({
  name,
  startDate,
  endDate,
  cityCount,
  totalBudget,
  coverImage,
  status = "upcoming",
  onView,
  onEdit,
  onDelete,
}: PremiumTripCardProps) {
  const statusColors = {
    upcoming: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    ongoing: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
    completed: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  };

  return (
    <Card className="group relative overflow-hidden card-3d hover:scale-[1.02] transition-all duration-300 border-border/50">
      {/* Cover Image or Gradient */}
      <div className="relative h-40 overflow-hidden rounded-t-xl">
        {coverImage ? (
          <img
            src={coverImage}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full gradient-primary relative">
            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-4 right-4 w-24 h-24 bg-white/20 rounded-full blur-2xl" />
              <div className="absolute bottom-4 left-4 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
            </div>
          </div>
        )}
        
        {/* Floating Status Badge */}
        <div className="absolute top-3 left-3">
          <Badge className={`${statusColors[status]} font-medium px-3 py-1 shadow-lg`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        </div>

        {/* Actions Menu */}
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="secondary"
                size="icon"
                className="h-8 w-8 bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onView}>View Details</DropdownMenuItem>
              <DropdownMenuItem onClick={onEdit}>Edit Trip</DropdownMenuItem>
              <DropdownMenuItem onClick={onDelete} className="text-destructive">
                Delete Trip
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5">
        <h3 className="text-xl font-semibold mb-3 text-foreground group-hover:text-primary transition-colors">
          {name}
        </h3>

        {/* Trip Details */}
        <div className="space-y-2.5 mb-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 text-primary" />
            <span>
              {new Date(startDate).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}{" "}
              -{" "}
              {new Date(endDate).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 text-accent" />
            <span>
              {cityCount} {cityCount === 1 ? "City" : "Cities"}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <IndianRupee className="h-4 w-4 text-success" />
            <span className="font-medium text-foreground">
              ₹{totalBudget.toLocaleString()}
            </span>
            <span className="text-xs">total budget</span>
          </div>
        </div>

        {/* View Button */}
        <Button
          onClick={onView}
          className="w-full group/btn relative overflow-hidden"
          size="lg"
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            View Trip
            <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
        </Button>
      </div>

      {/* Hover Glow Effect */}
      <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5 rounded-xl" />
      </div>
    </Card>
  );
}
