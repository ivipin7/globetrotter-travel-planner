import { Calendar, MapPin, IndianRupee, MoreHorizontal, Eye, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "react-router-dom";

interface TripCardProps {
  id: string;
  name: string;
  coverImage: string;
  startDate: string;
  endDate: string;
  destinations: number;
  estimatedBudget: number;
  status: "upcoming" | "ongoing" | "completed" | "draft";
  onDelete?: () => void;
}

const statusColors = {
  upcoming: "bg-primary/10 text-primary",
  ongoing: "bg-success/10 text-success",
  completed: "bg-muted text-muted-foreground",
  draft: "bg-accent/10 text-accent",
};

const statusLabels = {
  upcoming: "Upcoming",
  ongoing: "In Progress",
  completed: "Completed",
  draft: "Draft",
};

export function TripCard({
  id,
  name,
  coverImage,
  startDate,
  endDate,
  destinations,
  estimatedBudget,
  status,
  onDelete,
}: TripCardProps) {
  return (
    <div className="group card-3d overflow-hidden">
      {/* Cover Image */}
      <div className="relative h-40 overflow-hidden">
        <img
          src={coverImage}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        
        {/* Status Badge */}
        <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-medium ${statusColors[status]}`}>
          {statusLabels[status]}
        </div>

        {/* Actions Dropdown */}
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="glass" size="icon-sm" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem asChild>
                <Link to={status === 'draft' ? `/trip/edit/${id}` : `/trip/${id}`}>
                  <Eye className="h-4 w-4 mr-2" />
                  {status === 'draft' ? 'Continue Editing' : 'View Trip'}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to={`/trip/edit/${id}`}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Link>
              </DropdownMenuItem>
              {onDelete && (
                <DropdownMenuItem className="text-destructive" onClick={onDelete}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-semibold text-lg mb-3 group-hover:text-primary transition-colors line-clamp-1">
          {name}
        </h3>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{startDate} - {endDate}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{destinations} {destinations === 1 ? "destination" : "destinations"}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <IndianRupee className="h-4 w-4 text-success" />
            <span className="font-medium text-success">₹{estimatedBudget.toLocaleString()}</span>
            <span className="text-muted-foreground">estimated</span>
          </div>
        </div>

        <Button variant="subtle" className="w-full" asChild>
          <Link to={status === 'draft' ? `/trip/edit/${id}` : `/trip/${id}`}>
            {status === 'draft' ? 'Continue Editing' : 'View Trip'}
          </Link>
        </Button>
      </div>
    </div>
  );
}
