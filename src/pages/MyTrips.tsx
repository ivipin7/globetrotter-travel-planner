import { Link } from "react-router-dom";
import { 
  Plus, 
  LayoutGrid, 
  List, 
  Search,
  Filter,
  MapPin,
  Calendar,
  IndianRupee,
  Loader2,
  Trash2
} from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { TripCard } from "@/components/dashboard/TripCard";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { tripApi, Trip, TripStats } from "@/lib/api";

export default function MyTrips() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  
  // Real data states
  const [trips, setTrips] = useState<Trip[]>([]);
  const [stats, setStats] = useState<TripStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Fetch trips
  const fetchTrips = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [tripsResponse, statsResponse] = await Promise.all([
        tripApi.getMyTrips({ limit: 50 }),
        tripApi.getStats()
      ]);
      
      setTrips(tripsResponse.data);
      setStats(statsResponse.data);
    } catch (err: any) {
      console.error('Failed to fetch trips:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  // Handle delete
  const handleDelete = async () => {
    if (!deleteId) return;
    
    try {
      setDeleting(true);
      await tripApi.delete(deleteId);
      await fetchTrips(); // Refresh list
      setDeleteId(null);
    } catch (err: any) {
      console.error('Failed to delete trip:', err);
      alert(err.message);
    } finally {
      setDeleting(false);
    }
  };

  // Format trip for TripCard component
  const formatTrip = (trip: Trip) => ({
    id: trip._id,
    name: trip.name,
    coverImage: trip.coverImageUrl || `https://source.unsplash.com/800x600/?travel,${encodeURIComponent(trip.name)}`,
    startDate: new Date(trip.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    endDate: new Date(trip.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    destinations: 1,
    estimatedBudget: trip.totalBudget || 0,
    status: trip.status,
    onDelete: () => setDeleteId(trip._id),
  });

  const filteredTrips = trips
    .filter(trip => {
      const matchesSearch = trip.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTab = activeTab === "all" || trip.status === activeTab;
      return matchesSearch && matchesTab;
    })
    .sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "budget") return (b.totalBudget || 0) - (a.totalBudget || 0);
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const counts = {
    all: stats?.totalTrips || 0,
    upcoming: stats?.upcomingCount || 0,
    draft: stats?.draftCount || 0,
    completed: stats?.completedCount || 0,
  };

  return (
    <DashboardLayout 
      title="My Trips"
      searchPlaceholder="Search your trips..."
      onSearch={setSearchQuery}
    >
      <div className="p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-semibold">My Trips</h1>
            <p className="text-muted-foreground">
              Manage all your travel plans in one place
            </p>
          </div>
          <Button variant="hero" asChild>
            <Link to="/trip/new">
              <Plus className="h-4 w-4 mr-2" />
              Create New Trip
            </Link>
          </Button>
        </div>

        {/* Filters & Tabs */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">All ({counts.all})</TabsTrigger>
              <TabsTrigger value="upcoming">Upcoming ({counts.upcoming})</TabsTrigger>
              <TabsTrigger value="draft">Drafts ({counts.draft})</TabsTrigger>
              <TabsTrigger value="completed">Completed ({counts.completed})</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-3">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="budget">Budget</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center border rounded-lg">
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="icon"
                className="rounded-r-none"
                onClick={() => setViewMode("grid")}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="icon"
                className="rounded-l-none"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Trips Grid */}
        {loading ? (
          <div className="text-center py-16">
            <Loader2 className="h-10 w-10 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading your trips...</p>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-destructive mb-4">{error}</p>
            <Button variant="outline" onClick={() => fetchTrips()}>
              Try Again
            </Button>
          </div>
        ) : filteredTrips.length > 0 ? (
          <div className={`grid gap-6 ${viewMode === "grid" ? "sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}>
            {filteredTrips.map((trip) => (
              <TripCard key={trip._id} {...formatTrip(trip)} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Search className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-xl mb-2">No trips found</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {searchQuery 
                ? "Try adjusting your search or filters" 
                : "You haven't created any trips yet. Start planning your first adventure!"}
            </p>
            <Button variant="hero" asChild>
              <Link to="/trip/new">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Trip
              </Link>
            </Button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Trip</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this trip? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleting}
            >
              {deleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
