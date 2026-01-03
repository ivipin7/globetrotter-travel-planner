import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  Map,
  TrendingUp,
  IndianRupee,
  Globe,
  Shield,
  LogOut,
  BarChart3,
  Activity,
  Eye,
  UserCheck,
  UserX,
  Search,
  MoreHorizontal,
  Calendar,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

// Mock data for admin dashboard
const statsData = {
  totalUsers: 1247,
  activeUsers: 892,
  totalTrips: 3456,
  publicTrips: 567,
  popularCities: 45,
  totalRevenue: 125000,
};

const mockUsers = [
  { id: "1", fullName: "John Doe", email: "john@example.com", role: "user", trips: 5, status: "active", joinedAt: "2025-12-15" },
  { id: "2", fullName: "Jane Smith", email: "jane@example.com", role: "user", trips: 12, status: "active", joinedAt: "2025-11-20" },
  { id: "3", fullName: "Bob Wilson", email: "bob@example.com", role: "user", trips: 3, status: "inactive", joinedAt: "2025-10-05" },
  { id: "4", fullName: "Alice Brown", email: "alice@example.com", role: "admin", trips: 8, status: "active", joinedAt: "2025-09-10" },
  { id: "5", fullName: "Charlie Davis", email: "charlie@example.com", role: "user", trips: 15, status: "active", joinedAt: "2025-08-22" },
];

const mockTrips = [
  { id: "1", name: "Summer in Japan", user: "John Doe", destinations: 4, status: "public", views: 234, createdAt: "2025-12-20" },
  { id: "2", name: "European Adventure", user: "Jane Smith", destinations: 6, status: "public", views: 567, createdAt: "2025-12-18" },
  { id: "3", name: "Bali Retreat", user: "Charlie Davis", destinations: 2, status: "private", views: 0, createdAt: "2025-12-15" },
  { id: "4", name: "NYC Weekend", user: "Alice Brown", destinations: 1, status: "public", views: 123, createdAt: "2025-12-10" },
];

const popularDestinations = [
  { name: "Tokyo", country: "Japan", trips: 234, trend: "+15%" },
  { name: "Paris", country: "France", trips: 189, trend: "+8%" },
  { name: "Bali", country: "Indonesia", trips: 156, trend: "+22%" },
  { name: "New York", country: "USA", trips: 145, trend: "+5%" },
  { name: "Santorini", country: "Greece", trips: 98, trend: "+18%" },
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "trips" | "analytics">("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const { user, logout } = useAuth();
  const { toast } = useToast();

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged out",
      description: "You have been logged out successfully.",
    });
  };

  const handleToggleUserStatus = (userId: string, currentStatus: string) => {
    toast({
      title: `User ${currentStatus === 'active' ? 'deactivated' : 'activated'}`,
      description: `User status has been updated.`,
    });
  };

  const StatCard = ({ title, value, icon: Icon, trend, color }: any) => (
    <Card className="relative overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="h-4 w-4 text-white" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {trend && (
          <p className="text-xs text-muted-foreground mt-1">
            <span className="text-green-500">{trend}</span> from last month
          </p>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Header */}
      <header className="sticky top-0 z-50 bg-slate-900 text-white">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/" className="flex items-center gap-2">
                <Globe className="h-7 w-7 text-primary" />
                <span className="text-lg font-semibold">
                  Globe<span className="text-primary">Trotter</span>
                </span>
              </Link>
              <Badge variant="outline" className="bg-orange-500/20 text-orange-400 border-orange-500/50">
                <Shield className="h-3 w-3 mr-1" />
                Admin
              </Badge>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-300">
                Welcome, {user?.fullName}
              </span>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="text-slate-300 hover:text-white hover:bg-slate-800">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4">
          <nav className="flex gap-6">
            {[
              { id: "overview", label: "Overview", icon: BarChart3 },
              { id: "users", label: "Users", icon: Users },
              { id: "trips", label: "Trips", icon: Map },
              { id: "analytics", label: "Analytics", icon: Activity },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-4 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <StatCard
                title="Total Users"
                value={statsData.totalUsers.toLocaleString()}
                icon={Users}
                trend="+12%"
                color="bg-blue-500"
              />
              <StatCard
                title="Active Users"
                value={statsData.activeUsers.toLocaleString()}
                icon={UserCheck}
                trend="+8%"
                color="bg-green-500"
              />
              <StatCard
                title="Total Trips"
                value={statsData.totalTrips.toLocaleString()}
                icon={Map}
                trend="+23%"
                color="bg-purple-500"
              />
              <StatCard
                title="Public Trips"
                value={statsData.publicTrips.toLocaleString()}
                icon={Eye}
                trend="+15%"
                color="bg-orange-500"
              />
            </div>

            {/* Quick Stats Row */}
            <div className="grid gap-4 md:grid-cols-2">
              {/* Popular Destinations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Trending Destinations
                  </CardTitle>
                  <CardDescription>Most popular travel destinations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {popularDestinations.map((dest, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                            {i + 1}
                          </div>
                          <div>
                            <p className="font-medium">{dest.name}</p>
                            <p className="text-sm text-muted-foreground">{dest.country}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{dest.trips} trips</p>
                          <p className="text-sm text-green-500">{dest.trend}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary" />
                    Recent Activity
                  </CardTitle>
                  <CardDescription>Latest platform activity</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { action: "New user registered", user: "Mike Johnson", time: "2 mins ago" },
                      { action: "Trip published", user: "Sarah Lee", time: "15 mins ago" },
                      { action: "Trip shared", user: "John Doe", time: "1 hour ago" },
                      { action: "User upgraded", user: "Emily Chen", time: "2 hours ago" },
                      { action: "New review added", user: "Alex Kim", time: "3 hours ago" },
                    ].map((activity, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="w-2 h-2 mt-2 rounded-full bg-primary" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{activity.action}</p>
                          <p className="text-xs text-muted-foreground">
                            by {activity.user} • {activity.time}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">User Management</h2>
                <p className="text-muted-foreground">Manage all registered users</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users..."
                    className="pl-9 w-64"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Trips</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockUsers
                    .filter(u => 
                      u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      u.email.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map((u) => (
                    <TableRow key={u.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{u.fullName}</p>
                          <p className="text-sm text-muted-foreground">{u.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={u.role === "admin" ? "default" : "secondary"}>
                          {u.role === "admin" && <Shield className="h-3 w-3 mr-1" />}
                          {u.role}
                        </Badge>
                      </TableCell>
                      <TableCell>{u.trips}</TableCell>
                      <TableCell>
                        <Badge variant={u.status === "active" ? "default" : "destructive"} className={u.status === "active" ? "bg-green-500" : ""}>
                          {u.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{u.joinedAt}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>View Profile</DropdownMenuItem>
                            <DropdownMenuItem>View Trips</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleToggleUserStatus(u.id, u.status)}
                              className={u.status === "active" ? "text-red-500" : "text-green-500"}
                            >
                              {u.status === "active" ? (
                                <>
                                  <UserX className="h-4 w-4 mr-2" />
                                  Deactivate
                                </>
                              ) : (
                                <>
                                  <UserCheck className="h-4 w-4 mr-2" />
                                  Activate
                                </>
                              )}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </div>
        )}

        {/* Trips Tab */}
        {activeTab === "trips" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Trip Management</h2>
                <p className="text-muted-foreground">Manage and moderate user trips</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search trips..."
                    className="pl-9 w-64"
                  />
                </div>
              </div>
            </div>

            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Trip Name</TableHead>
                    <TableHead>Created By</TableHead>
                    <TableHead>Destinations</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Views</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockTrips.map((trip) => (
                    <TableRow key={trip.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Map className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{trip.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{trip.user}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          {trip.destinations}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={trip.status === "public" ? "default" : "secondary"}>
                          {trip.status === "public" && <Eye className="h-3 w-3 mr-1" />}
                          {trip.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{trip.views}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {trip.createdAt}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>View Details</DropdownMenuItem>
                            <DropdownMenuItem>View Public Page</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-500">
                              Remove from Public
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === "analytics" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
              <p className="text-muted-foreground">Platform insights and statistics</p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Avg. Trip Duration</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">7.5 days</div>
                  <p className="text-xs text-muted-foreground">+0.5 days from last month</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Avg. Budget</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">$3,245</div>
                  <p className="text-xs text-muted-foreground">+$200 from last month</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Destinations/Trip</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">3.2</div>
                  <p className="text-xs text-muted-foreground">+0.3 from last month</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Monthly Growth</CardTitle>
                <CardDescription>User and trip growth over time</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px] flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Charts will be displayed here</p>
                  <p className="text-sm">Integration with Recharts ready</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
