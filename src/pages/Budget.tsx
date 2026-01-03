import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  IndianRupee,
  TrendingUp,
  TrendingDown,
  PieChart,
  Target,
  Calendar,
  MapPin,
  Loader2,
  Plus,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { tripApi, Trip } from "@/lib/api";

// Budget categories with colors
const categoryColors: Record<string, string> = {
  flights: "#3b82f6",
  accommodation: "#8b5cf6",
  food: "#f59e0b",
  activities: "#10b981",
  transport: "#06b6d4",
  shopping: "#ec4899",
  other: "#6b7280",
};

interface BudgetSummary {
  totalBudget: number;
  totalSpent: number;
  remaining: number;
  tripCount: number;
  categories: {
    name: string;
    amount: number;
    percentage: number;
    color: string;
  }[];
}

export default function Budget() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [budgetSummary, setBudgetSummary] = useState<BudgetSummary>({
    totalBudget: 0,
    totalSpent: 0,
    remaining: 0,
    tripCount: 0,
    categories: [],
  });

  useEffect(() => {
    const fetchBudgetData = async () => {
      try {
        const response = await tripApi.getMyTrips();
        const tripsData = response.data;
        setTrips(tripsData);

        // Calculate budget summary from trips
        const totalBudget = tripsData.reduce((sum, trip) => sum + (trip.totalBudget || 0), 0);
        
        // Mock spent data (in real app, this would come from expenses)
        const mockSpentPercentage = 0.35; // 35% spent
        const totalSpent = Math.round(totalBudget * mockSpentPercentage);
        
        // Mock category breakdown
        const categories = [
          { name: "Flights", amount: Math.round(totalSpent * 0.35), percentage: 35, color: categoryColors.flights },
          { name: "Accommodation", amount: Math.round(totalSpent * 0.25), percentage: 25, color: categoryColors.accommodation },
          { name: "Food & Dining", amount: Math.round(totalSpent * 0.20), percentage: 20, color: categoryColors.food },
          { name: "Activities", amount: Math.round(totalSpent * 0.12), percentage: 12, color: categoryColors.activities },
          { name: "Transport", amount: Math.round(totalSpent * 0.05), percentage: 5, color: categoryColors.transport },
          { name: "Shopping", amount: Math.round(totalSpent * 0.03), percentage: 3, color: categoryColors.shopping },
        ];

        setBudgetSummary({
          totalBudget,
          totalSpent,
          remaining: totalBudget - totalSpent,
          tripCount: tripsData.length,
          categories,
        });
      } catch (error) {
        console.error("Error fetching budget data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBudgetData();
  }, []);

  const spentPercentage = budgetSummary.totalBudget > 0 
    ? Math.round((budgetSummary.totalSpent / budgetSummary.totalBudget) * 100) 
    : 0;
  const isOverBudget = budgetSummary.remaining < 0;

  if (loading) {
    return (
      <DashboardLayout title="Budget">
        <div className="p-6 lg:p-8 flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Budget">
      <div className="p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-semibold">Budget Overview</h1>
            <p className="text-muted-foreground">
              Track your travel expenses across all trips
            </p>
          </div>
          <Button asChild>
            <Link to="/trip/new">
              <Plus className="h-4 w-4 mr-2" />
              Add Expense
            </Link>
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="card-3d">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Budget</p>
                  <p className="text-2xl font-bold">₹{budgetSummary.totalBudget.toLocaleString()}</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Target className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-1 text-sm text-muted-foreground">
                <span>Across {budgetSummary.tripCount} trips</span>
              </div>
            </CardContent>
          </Card>

          <Card className="card-3d">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Spent</p>
                  <p className="text-2xl font-bold text-orange-500">₹{budgetSummary.totalSpent.toLocaleString()}</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
                  <ArrowUpRight className="h-6 w-6 text-orange-500" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-1 text-sm">
                <span className="text-orange-500 font-medium">{spentPercentage}%</span>
                <span className="text-muted-foreground">of budget used</span>
              </div>
            </CardContent>
          </Card>

          <Card className="card-3d">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Remaining</p>
                  <p className={`text-2xl font-bold ${isOverBudget ? 'text-destructive' : 'text-success'}`}>
                    ₹{Math.abs(budgetSummary.remaining).toLocaleString()}
                  </p>
                </div>
                <div className={`h-12 w-12 rounded-xl ${isOverBudget ? 'bg-destructive/10' : 'bg-success/10'} flex items-center justify-center`}>
                  {isOverBudget ? (
                    <ArrowDownRight className="h-6 w-6 text-destructive" />
                  ) : (
                    <IndianRupee className="h-6 w-6 text-success" />
                  )}
                </div>
              </div>
              <div className="mt-4 flex items-center gap-1 text-sm">
                {isOverBudget ? (
                  <Badge variant="destructive">Over budget</Badge>
                ) : (
                  <Badge variant="secondary" className="bg-success/10 text-success">On track</Badge>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="card-3d">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg. per Trip</p>
                  <p className="text-2xl font-bold">
                    ₹{budgetSummary.tripCount > 0 
                      ? Math.round(budgetSummary.totalBudget / budgetSummary.tripCount).toLocaleString() 
                      : 0}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center">
                  <PieChart className="h-6 w-6 text-accent" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-1 text-sm text-muted-foreground">
                <span>Budget allocation</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Budget Progress */}
          <Card className="card-3d lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Budget Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Overall Progress */}
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Overall Budget Usage</span>
                  <span className={`text-sm font-medium ${isOverBudget ? 'text-destructive' : ''}`}>
                    {spentPercentage}%
                  </span>
                </div>
                <div className="h-4 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isOverBudget ? 'bg-destructive' : 'bg-gradient-to-r from-primary to-accent'
                    }`}
                    style={{ width: `${Math.min(spentPercentage, 100)}%` }}
                  />
                </div>
              </div>

              {/* Category Breakdown */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Spending by Category</h4>
                {budgetSummary.categories.map((category) => (
                  <div key={category.name} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        {category.name}
                      </span>
                      <span className="font-medium">₹{category.amount.toLocaleString()}</span>
                    </div>
                    <Progress value={category.percentage} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Trip Budgets */}
          <Card className="card-3d">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Trip Budgets
              </CardTitle>
            </CardHeader>
            <CardContent>
              {trips.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                    <IndianRupee className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">No trips with budgets yet</p>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/trip/new">Create Trip</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {trips.slice(0, 5).map((trip) => (
                    <Link
                      key={trip._id}
                      to={`/trip/${trip._id}`}
                      className="block p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium text-sm line-clamp-1">{trip.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(trip.startDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} - {new Date(trip.endDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {trip.status}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-success">
                          ₹{(trip.totalBudget || 0).toLocaleString()}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {trip.destination || 'No destination'}
                        </span>
                      </div>
                    </Link>
                  ))}
                  
                  {trips.length > 5 && (
                    <Button variant="ghost" className="w-full" asChild>
                      <Link to="/trips">View All Trips</Link>
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Tips Section */}
        <Card className="card-3d bg-gradient-to-r from-primary/5 to-accent/5">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Budget Tips</h3>
                <p className="text-sm text-muted-foreground">
                  You're spending most on flights (35%). Consider booking in advance or using reward points to save on airfare. 
                  Food expenses are well managed at 20% - great job!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
