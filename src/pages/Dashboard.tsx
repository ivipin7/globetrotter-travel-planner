import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Plus, 
  LayoutGrid, 
  List, 
  Search,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { TripCard } from "@/components/dashboard/TripCard";
import { BudgetCard } from "@/components/dashboard/BudgetCard";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { RecommendedDestinations } from "@/components/dashboard/RecommendedDestinations";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { tripApi, Trip, TripStats } from "@/lib/api";

export default function Dashboard() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const { user } = useAuth();
  
  // Real data states
  const [trips, setTrips] = useState<Trip[]>([]);
  const [stats, setStats] = useState<TripStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch trips and stats
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [tripsResponse, statsResponse] = await Promise.all([
          tripApi.getMyTrips({ limit: 10 }),
          tripApi.getStats()
        ]);
        
        setTrips(tripsResponse.data);
        setStats(statsResponse.data);
      } catch (err: any) {
        console.error('Failed to fetch dashboard data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Format trip for TripCard component
  const formatTrip = (trip: Trip) => ({
    id: trip._id,
    name: trip.name,
    coverImage: trip.coverImageUrl || `https://source.unsplash.com/800x600/?travel,${encodeURIComponent(trip.name)}`,
    startDate: new Date(trip.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    endDate: new Date(trip.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    destinations: 1, // TODO: Add destinations count from itinerary
    estimatedBudget: trip.totalBudget || 0,
    status: trip.status,
  });

  const filteredTrips = trips.filter(trip => {
    const matchesSearch = trip.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === "all" || trip.status === activeTab;
    return matchesSearch && matchesTab;
  });

  const upcomingCount = stats?.upcomingCount || 0;
  const draftCount = stats?.draftCount || 0;

  const budgetData = {
    totalBudget: stats?.totalBudget || 0,
    spent: 0, // TODO: Calculate from actual expenses
    categories: [
      { name: "Transport", amount: 0, color: "hsl(217, 91%, 60%)" },
      { name: "Accommodation", amount: 0, color: "hsl(142, 71%, 45%)" },
      { name: "Activities", amount: 0, color: "hsl(38, 92%, 50%)" },
      { name: "Food & Dining", amount: 0, color: "hsl(199, 89%, 48%)" },
    ],
  };

  return (
    <DashboardLayout 
      title="Dashboard"
      searchPlaceholder="Search trips, destinations..."
      onSearch={setSearchQuery}
    >
      <div className="p-6 lg:p-8 space-y-8">
        {/* Welcome Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-semibold mb-1">
              Welcome back, <span className="text-gradient-primary">{user?.fullName?.split(' ')[0] || 'Traveler'}</span>! 👋
            </h1>
            <p className="text-muted-foreground">
              Ready to plan your next adventure? You have <span className="text-primary font-medium">{upcomingCount} upcoming trips</span>.
            </p>
          </div>
          <Button variant="hero" asChild className="w-fit">
            <Link to="/trip/new">
              <Plus className="h-4 w-4 mr-2" />
              New Trip
            </Link>
          </Button>
        </div>

        {/* Quick Actions */}
        <QuickActions />

        {/* Main Grid */}
        <div className="grid xl:grid-cols-3 gap-8">
          {/* Main Content - Trips */}
          <div className="xl:col-span-2 space-y-6">
            {/* Trips Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
                <TabsList>
                  <TabsTrigger value="all">All Trips ({stats?.totalTrips || 0})</TabsTrigger>
                  <TabsTrigger value="upcoming">Upcoming ({upcomingCount})</TabsTrigger>
                  <TabsTrigger value="draft">Drafts ({draftCount})</TabsTrigger>
                  <TabsTrigger value="completed">Completed ({stats?.completedCount || 0})</TabsTrigger>
                </TabsList>
              </Tabs>
              
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === "grid" ? "secondary" : "ghost"}
                  size="icon"
                  onClick={() => setViewMode("grid")}
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "secondary" : "ghost"}
                  size="icon"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Loading State */}
            {loading ? (
              <div className="card-3d p-12 text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                <p className="text-muted-foreground">Loading your trips...</p>
              </div>
            ) : error ? (
              <div className="card-3d p-12 text-center">
                <p className="text-destructive mb-4">{error}</p>
                <Button variant="outline" onClick={() => window.location.reload()}>
                  Try Again
                </Button>
              </div>
            ) : filteredTrips.length > 0 ? (
              <div className={`grid gap-6 ${viewMode === "grid" ? "sm:grid-cols-2" : "grid-cols-1"}`}>
                {filteredTrips.map((trip) => (
                  <TripCard key={trip._id} {...formatTrip(trip)} />
                ))}
              </div>
            ) : (
              <div className="card-3d p-12 text-center">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <Search className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-lg mb-2">No trips found</h3>
                <p className="text-muted-foreground mb-6">
                  {searchQuery ? "Try adjusting your search" : "Start planning your first adventure!"}
                </p>
                <Button variant="hero" asChild>
                  <Link to="/trip/new">
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Trip
                  </Link>
                </Button>
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Budget Overview */}
            <BudgetCard {...budgetData} />

            {/* Recommendations */}
            <RecommendedDestinations />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
