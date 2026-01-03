import { Plus, Sparkles, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";

interface DashboardHeaderProps {
  userName: string;
  tripCount: number;
  totalSpent: number;
  upcomingTrips: number;
}

export function DashboardHeader({
  userName,
  tripCount,
  totalSpent,
  upcomingTrips,
}: DashboardHeaderProps) {
  const currentHour = new Date().getHours();
  const greeting =
    currentHour < 12
      ? "Good Morning"
      : currentHour < 18
      ? "Good Afternoon"
      : "Good Evening";

  return (
    <div className="relative overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 pointer-events-none" />
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                {greeting}, {userName}! 👋
              </h1>
              <p className="text-muted-foreground">
                Ready to plan your next adventure?
              </p>
            </div>
          </div>

          {/* Primary CTA */}
          <Link to="/trips/create">
            <Button
              size="lg"
              className="group h-14 px-8 text-lg font-semibold shadow-xl hover:shadow-2xl hover:shadow-primary/50 transition-all duration-300 hover:scale-105 relative overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                <Plus className="h-5 w-5 transition-transform group-hover:rotate-90" />
                Plan New Trip
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-primary opacity-0 group-hover:opacity-100 transition-opacity bg-[length:200%_100%] animate-gradient" />
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Total Trips */}
          <Card className="card-3d p-6 hover:scale-105 transition-transform relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
              </div>
              <p className="text-3xl font-bold text-foreground mb-1">{tripCount}</p>
              <p className="text-sm text-muted-foreground">Total Trips Planned</p>
            </div>
          </Card>

          {/* Upcoming Trips */}
          <Card className="card-3d p-6 hover:scale-105 transition-transform relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center">
                  <svg className="h-6 w-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                {upcomingTrips > 0 && (
                  <div className="flex items-center gap-1 text-success text-xs font-medium">
                    <TrendingUp className="h-3 w-3" />
                    Active
                  </div>
                )}
              </div>
              <p className="text-3xl font-bold text-foreground mb-1">{upcomingTrips}</p>
              <p className="text-sm text-muted-foreground">Upcoming Adventures</p>
            </div>
          </Card>

          {/* Total Spent */}
          <Card className="card-3d p-6 hover:scale-105 transition-transform relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-success/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="h-12 w-12 rounded-xl bg-success/10 flex items-center justify-center">
                  <svg className="h-6 w-6 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-3xl font-bold text-foreground mb-1">
                ₹{totalSpent.toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">Total Budget Planned</p>
            </div>
          </Card>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl pointer-events-none" />
    </div>
  );
}
