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
  Loader2,
  RefreshCw,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  UserPlus,
  Plane,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { adminApi, tripApi, AdminStats, AdminUser, Trip, City } from "@/lib/api";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "trips" | "analytics">("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const { user, logout } = useAuth();
  const { toast } = useToast();

  // Dynamic data states
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [tripStats, setTripStats] = useState<any>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [trendingDestinations, setTrendingDestinations] = useState<City[]>([]);
  const [userPagination, setUserPagination] = useState({ page: 1, total: 0, pages: 0 });
  const [tripPagination, setTripPagination] = useState({ page: 1, total: 0, pages: 0 });

  // Fetch all data
  const fetchData = async (showRefreshToast = false) => {
    if (showRefreshToast) setRefreshing(true);
    else setLoading(true);

    try {
      const [statsRes, tripStatsRes, usersRes, tripsRes, trendingRes] = await Promise.allSettled([
        adminApi.getStats(),
        tripApi.getStats(),
        adminApi.getUsers(1, 20),
        adminApi.getAllTrips(1, 20),
        adminApi.getTrendingDestinations(),
      ]);

      if (statsRes.status === 'fulfilled') setStats(statsRes.value.stats);
      if (tripStatsRes.status === 'fulfilled') setTripStats(tripStatsRes.value.data);
      if (usersRes.status === 'fulfilled') {
        setUsers(usersRes.value.users);
        setUserPagination(usersRes.value.pagination);
      }
      if (tripsRes.status === 'fulfilled') {
        setTrips(tripsRes.value.trips);
        setTripPagination(tripsRes.value.pagination);
      }
      if (trendingRes.status === 'fulfilled') {
        setTrendingDestinations(trendingRes.value.cities.slice(0, 5));
      }

      if (showRefreshToast) {
        toast({ title: "Data refreshed", description: "All statistics updated successfully." });
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast({ title: "Error", description: "Failed to load some data", variant: "destructive" });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleLogout = () => {
    logout();
    toast({ title: "Logged out", description: "You have been logged out successfully." });
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const result = await adminApi.toggleUserStatus(userId);
      setUsers(users.map(u => u._id === userId ? { ...u, isActive: !currentStatus } : u));
      toast({
        title: `User ${result.user.isActive ? 'activated' : 'deactivated'}`,
        description: result.message,
      });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleUpdateRole = async (userId: string, newRole: 'user' | 'admin') => {
    try {
      const result = await adminApi.updateUserRole(userId, newRole);
      setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
      toast({ title: "Role Updated", description: result.message });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  // Filter users by search
  const filteredUsers = users.filter(u =>
    u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Stat Card Component
  const StatCard = ({ title, value, icon: Icon, trend, trendUp, color, subtitle }: any) => (
    <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
      <div className={`absolute inset-0 ${color} opacity-5 group-hover:opacity-10 transition-opacity`} />
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className={`p-2.5 rounded-xl ${color} shadow-lg`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold tracking-tight">{value}</div>
        {trend && (
          <div className="flex items-center gap-1 mt-2">
            {trendUp ? (
              <ArrowUpRight className="h-4 w-4 text-green-500" />
            ) : (
              <ArrowDownRight className="h-4 w-4 text-red-500" />
            )}
            <span className={`text-sm font-medium ${trendUp ? 'text-green-500' : 'text-red-500'}`}>
              {trend}
            </span>
            <span className="text-xs text-muted-foreground ml-1">{subtitle || 'vs last week'}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Admin Header */}
      <header className="sticky top-0 z-50 bg-slate-900 text-white shadow-xl">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <Globe className="h-7 w-7 text-primary" />
                <span className="text-lg font-bold">
                  Globe<span className="text-primary">Trotter</span>
                </span>
              </Link>
              <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 shadow-lg">
                <Shield className="h-3 w-3 mr-1" />
                Admin Panel
              </Badge>
            </div>

            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => fetchData(true)}
                disabled={refreshing}
                className="text-slate-300 hover:text-white hover:bg-slate-800"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
              <div className="h-6 w-px bg-slate-700 hidden sm:block" />
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                    {user?.fullName?.charAt(0) || 'A'}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm text-slate-300 hidden md:inline">
                  {user?.fullName}
                </span>
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="text-slate-300 hover:text-white hover:bg-slate-800">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="border-b bg-white dark:bg-slate-800 shadow-sm">
        <div className="container mx-auto px-4">
          <nav className="flex gap-1 overflow-x-auto">
            {[
              { id: "overview", label: "Overview", icon: BarChart3 },
              { id: "users", label: "Users", icon: Users },
              { id: "trips", label: "Trips", icon: Map },
              { id: "analytics", label: "Analytics", icon: Activity },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-4 border-b-2 transition-all font-medium whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-primary text-primary bg-primary/5"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:bg-slate-50 dark:hover:bg-slate-700"
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
            {/* Welcome Banner */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary via-primary/90 to-accent p-6 md:p-8 text-white shadow-2xl">
              <div className="absolute inset-0 bg-grid-white/10" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-5 w-5" />
                  <span className="text-sm font-medium text-white/80">Admin Dashboard</span>
                </div>
                <h1 className="text-2xl md:text-3xl font-bold mb-2">Welcome back, {user?.fullName?.split(' ')[0]}! 👋</h1>
                <p className="text-white/80 max-w-xl text-sm md:text-base">
                  Monitor your platform's performance, manage users, and track travel trends.
                </p>
              </div>
              <div className="absolute -right-10 -bottom-10 opacity-20">
                <Globe className="h-32 md:h-48 w-32 md:w-48" />
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
              <StatCard
                title="Total Users"
                value={stats?.totalUsers?.toLocaleString() || '0'}
                icon={Users}
                trend={stats?.newUsersThisWeek ? `+${stats.newUsersThisWeek}` : undefined}
                trendUp={true}
                color="bg-blue-500"
                subtitle="new this week"
              />
              <StatCard
                title="Active Users"
                value={stats?.activeUsers?.toLocaleString() || '0'}
                icon={UserCheck}
                trend={stats?.activeToday ? `${stats.activeToday} today` : undefined}
                trendUp={true}
                color="bg-green-500"
                subtitle="online today"
              />
              <StatCard
                title="Total Trips"
                value={tripStats?.totalTrips?.toLocaleString() || tripPagination.total?.toLocaleString() || '0'}
                icon={Plane}
                trend={tripStats?.upcomingCount ? `${tripStats.upcomingCount} upcoming` : undefined}
                trendUp={true}
                color="bg-purple-500"
                subtitle="trips planned"
              />
              <StatCard
                title="Total Budget"
                value={`₹${((tripStats?.totalBudget || 0) / 1000).toFixed(0)}K`}
                icon={IndianRupee}
                color="bg-orange-500"
              />
            </div>

            {/* Quick Stats Row */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Trending Destinations */}
              <Card className="shadow-lg border-0">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <TrendingUp className="h-5 w-5 text-primary" />
                        Trending Destinations
                      </CardTitle>
                      <CardDescription>Most popular travel spots</CardDescription>
                    </div>
                    <Link to="/discover">
                      <Button variant="ghost" size="sm">View All</Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {trendingDestinations.length > 0 ? trendingDestinations.map((dest, i) => (
                      <div key={dest._id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                        <div className={`w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center text-white font-bold shadow-lg text-sm ${
                          i === 0 ? 'bg-gradient-to-br from-yellow-400 to-orange-500' :
                          i === 1 ? 'bg-gradient-to-br from-slate-400 to-slate-500' :
                          i === 2 ? 'bg-gradient-to-br from-orange-600 to-orange-700' :
                          'bg-gradient-to-br from-slate-300 to-slate-400'
                        }`}>
                          {i + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold truncate text-sm md:text-base">{dest.name}</p>
                          <p className="text-xs md:text-sm text-muted-foreground truncate">{dest.country}</p>
                        </div>
                        <div className="text-right hidden sm:block">
                          <Badge variant="secondary" className="mb-1 text-xs">
                            {dest.popularityScore}% Popular
                          </Badge>
                          <div className="flex items-center gap-0.5 justify-end">
                            {Array.from({ length: dest.costIndex }).map((_, j) => (
                              <IndianRupee key={j} className="h-3 w-3 text-green-500" />
                            ))}
                          </div>
                        </div>
                      </div>
                    )) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>No trending destinations yet</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Platform Health */}
              <Card className="shadow-lg border-0">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Activity className="h-5 w-5 text-primary" />
                    Platform Health
                  </CardTitle>
                  <CardDescription>System status and metrics</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">User Engagement</span>
                      <span className="text-sm text-muted-foreground">
                        {stats?.totalUsers ? Math.round((stats.activeUsers / stats.totalUsers) * 100) : 0}%
                      </span>
                    </div>
                    <Progress 
                      value={stats?.totalUsers ? (stats.activeUsers / stats.totalUsers) * 100 : 0} 
                      className="h-2"
                    />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Trip Completion Rate</span>
                      <span className="text-sm text-muted-foreground">
                        {tripStats?.totalTrips ? Math.round((tripStats.completedCount / tripStats.totalTrips) * 100) : 0}%
                      </span>
                    </div>
                    <Progress 
                      value={tripStats?.totalTrips ? (tripStats.completedCount / tripStats.totalTrips) * 100 : 0} 
                      className="h-2"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-4">
                    <div className="text-center p-3 md:p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20">
                      <div className="text-xl md:text-2xl font-bold text-blue-600">{tripStats?.draftCount || 0}</div>
                      <div className="text-xs text-muted-foreground">Draft Trips</div>
                    </div>
                    <div className="text-center p-3 md:p-4 rounded-xl bg-green-50 dark:bg-green-900/20">
                      <div className="text-xl md:text-2xl font-bold text-green-600">{tripStats?.upcomingCount || 0}</div>
                      <div className="text-xs text-muted-foreground">Upcoming</div>
                    </div>
                    <div className="text-center p-3 md:p-4 rounded-xl bg-orange-50 dark:bg-orange-900/20">
                      <div className="text-xl md:text-2xl font-bold text-orange-600">{tripStats?.ongoingCount || 0}</div>
                      <div className="text-xs text-muted-foreground">Ongoing</div>
                    </div>
                    <div className="text-center p-3 md:p-4 rounded-xl bg-purple-50 dark:bg-purple-900/20">
                      <div className="text-xl md:text-2xl font-bold text-purple-600">{tripStats?.completedCount || 0}</div>
                      <div className="text-xs text-muted-foreground">Completed</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Users */}
            <Card className="shadow-lg border-0">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <UserPlus className="h-5 w-5 text-primary" />
                      Recent Users
                    </CardTitle>
                    <CardDescription>Newly registered users</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setActiveTab('users')}>
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {users.slice(0, 5).map((u) => (
                    <div key={u._id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={u.avatar} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {u.fullName?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate text-sm">{u.fullName}</p>
                        <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Badge variant={u.role === 'admin' ? 'default' : 'secondary'} className="text-xs">
                          {u.role}
                        </Badge>
                        <Badge variant={u.isActive ? 'default' : 'destructive'} className={`text-xs ${u.isActive ? 'bg-green-500' : ''}`}>
                          {u.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl md:text-2xl font-bold">User Management</h2>
                <p className="text-muted-foreground text-sm">Manage {userPagination.total} registered users</p>
              </div>
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-initial">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users..."
                    className="pl-9 w-full sm:w-64"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <Card className="shadow-lg border-0 overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50 dark:bg-slate-800">
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead className="hidden md:table-cell">Status</TableHead>
                      <TableHead className="hidden lg:table-cell">Joined</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((u) => (
                      <TableRow key={u._id} className="hover:bg-slate-50 dark:hover:bg-slate-800">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={u.avatar} />
                              <AvatarFallback className="bg-primary/10 text-primary">
                                {u.fullName?.charAt(0) || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className="font-medium truncate">{u.fullName}</p>
                              <p className="text-sm text-muted-foreground truncate max-w-[150px] md:max-w-none">{u.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={u.role === "admin" ? "default" : "secondary"} className="font-medium">
                            {u.role === "admin" && <Shield className="h-3 w-3 mr-1" />}
                            {u.role}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <Badge 
                            variant={u.isActive ? "default" : "destructive"} 
                            className={u.isActive ? "bg-green-500 hover:bg-green-600" : ""}
                          >
                            {u.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {new Date(u.createdAt).toLocaleDateString()}
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
                              <DropdownMenuItem 
                                onClick={() => handleToggleUserStatus(u._id, u.isActive)}
                                className={u.isActive ? "text-red-500" : "text-green-500"}
                              >
                                {u.isActive ? (
                                  <><UserX className="h-4 w-4 mr-2" />Deactivate</>
                                ) : (
                                  <><UserCheck className="h-4 w-4 mr-2" />Activate</>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleUpdateRole(u._id, u.role === 'admin' ? 'user' : 'admin')}
                              >
                                <Shield className="h-4 w-4 mr-2" />
                                Make {u.role === 'admin' ? 'User' : 'Admin'}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {filteredUsers.length === 0 && (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">No users found</p>
                </div>
              )}
            </Card>
          </div>
        )}

        {/* Trips Tab */}
        {activeTab === "trips" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl md:text-2xl font-bold">Trip Management</h2>
                <p className="text-muted-foreground text-sm">Manage {tripPagination.total} user trips</p>
              </div>
            </div>

            <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-0">
                <CardContent className="pt-4 md:pt-6">
                  <div className="text-2xl md:text-3xl font-bold text-blue-600">{tripStats?.draftCount || 0}</div>
                  <p className="text-xs md:text-sm text-blue-600/70">Draft Trips</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-0">
                <CardContent className="pt-4 md:pt-6">
                  <div className="text-2xl md:text-3xl font-bold text-green-600">{tripStats?.upcomingCount || 0}</div>
                  <p className="text-xs md:text-sm text-green-600/70">Upcoming Trips</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-0">
                <CardContent className="pt-4 md:pt-6">
                  <div className="text-2xl md:text-3xl font-bold text-orange-600">{tripStats?.ongoingCount || 0}</div>
                  <p className="text-xs md:text-sm text-orange-600/70">Ongoing Trips</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-0">
                <CardContent className="pt-4 md:pt-6">
                  <div className="text-2xl md:text-3xl font-bold text-purple-600">{tripStats?.completedCount || 0}</div>
                  <p className="text-xs md:text-sm text-purple-600/70">Completed Trips</p>
                </CardContent>
              </Card>
            </div>

            <Card className="shadow-lg border-0 overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50 dark:bg-slate-800">
                      <TableHead>Trip Name</TableHead>
                      <TableHead className="hidden md:table-cell">Destination</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="hidden lg:table-cell">Budget</TableHead>
                      <TableHead className="hidden lg:table-cell">Dates</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {trips.map((trip) => (
                      <TableRow key={trip._id} className="hover:bg-slate-50 dark:hover:bg-slate-800">
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <Plane className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium truncate text-sm">{trip.name}</p>
                              <p className="text-xs text-muted-foreground">{trip.tripType || 'Leisure'}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="flex items-center gap-1 text-sm">
                            <MapPin className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                            <span className="truncate max-w-[100px]">{trip.destination || 'Not set'}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={
                            trip.status === 'completed' ? 'default' :
                            trip.status === 'ongoing' ? 'default' :
                            trip.status === 'upcoming' ? 'secondary' : 'outline'
                          } className={`text-xs ${
                            trip.status === 'completed' ? 'bg-purple-500' :
                            trip.status === 'ongoing' ? 'bg-orange-500' :
                            trip.status === 'upcoming' ? 'bg-green-500 text-white' : ''
                          }`}>
                            {trip.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <div className="flex items-center gap-1 text-sm">
                            <IndianRupee className="h-3 w-3" />
                            {trip.totalBudget?.toLocaleString() || '0'}
                          </div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {new Date(trip.startDate).toLocaleDateString()}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {trips.length === 0 && (
                <div className="text-center py-12">
                  <Map className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">No trips found</p>
                </div>
              )}
            </Card>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === "analytics" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl md:text-2xl font-bold">Analytics Dashboard</h2>
              <p className="text-muted-foreground text-sm">Platform insights and statistics</p>
            </div>

            <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
              <Card className="shadow-lg border-0">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">Avg. Trip Duration</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl md:text-3xl font-bold">5.2 <span className="text-sm md:text-lg font-normal text-muted-foreground">days</span></div>
                  <div className="flex items-center gap-1 mt-2 text-xs md:text-sm text-green-500">
                    <ArrowUpRight className="h-3 w-3 md:h-4 md:w-4" />
                    +0.5 from last month
                  </div>
                </CardContent>
              </Card>
              <Card className="shadow-lg border-0">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">Avg. Budget</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl md:text-3xl font-bold">₹{Math.round((tripStats?.totalBudget || 0) / Math.max(tripStats?.totalTrips || 1, 1)).toLocaleString()}</div>
                  <div className="flex items-center gap-1 mt-2 text-xs md:text-sm text-green-500">
                    <ArrowUpRight className="h-3 w-3 md:h-4 md:w-4" />
                    Per trip average
                  </div>
                </CardContent>
              </Card>
              <Card className="shadow-lg border-0">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">New Users/Week</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl md:text-3xl font-bold">{stats?.newUsersThisWeek || 0}</div>
                  <div className="flex items-center gap-1 mt-2 text-xs md:text-sm text-green-500">
                    <UserPlus className="h-3 w-3 md:h-4 md:w-4" />
                    This week
                  </div>
                </CardContent>
              </Card>
              <Card className="shadow-lg border-0">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">Active Today</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl md:text-3xl font-bold">{stats?.activeToday || 0}</div>
                  <div className="flex items-center gap-1 mt-2 text-xs md:text-sm text-muted-foreground">
                    <Clock className="h-3 w-3 md:h-4 md:w-4" />
                    Online today
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="text-lg">User Distribution</CardTitle>
                  <CardDescription>Breakdown by role and status</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 md:p-6 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
                      <Users className="h-6 w-6 md:h-8 md:w-8 text-blue-500 mx-auto mb-2" />
                      <div className="text-2xl md:text-3xl font-bold text-blue-600">{(stats?.totalUsers || 0) - (stats?.adminUsers || 0)}</div>
                      <div className="text-xs md:text-sm text-blue-600/70">Regular Users</div>
                    </div>
                    <div className="text-center p-4 md:p-6 rounded-xl bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20">
                      <Shield className="h-6 w-6 md:h-8 md:w-8 text-orange-500 mx-auto mb-2" />
                      <div className="text-2xl md:text-3xl font-bold text-orange-600">{stats?.adminUsers || 0}</div>
                      <div className="text-xs md:text-sm text-orange-600/70">Administrators</div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-3">
                      <span className="font-medium text-sm">Active vs Inactive</span>
                      <span className="text-muted-foreground text-sm">
                        {stats?.activeUsers || 0} / {stats?.totalUsers || 0}
                      </span>
                    </div>
                    <div className="h-3 md:h-4 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full transition-all duration-500"
                        style={{ width: `${stats?.totalUsers ? (stats.activeUsers / stats.totalUsers) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="text-lg">Trip Status Breakdown</CardTitle>
                  <CardDescription>Current trip statistics</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { label: 'Draft', count: tripStats?.draftCount || 0, color: 'bg-slate-500', bg: 'bg-slate-100' },
                    { label: 'Upcoming', count: tripStats?.upcomingCount || 0, color: 'bg-green-500', bg: 'bg-green-100' },
                    { label: 'Ongoing', count: tripStats?.ongoingCount || 0, color: 'bg-orange-500', bg: 'bg-orange-100' },
                    { label: 'Completed', count: tripStats?.completedCount || 0, color: 'bg-purple-500', bg: 'bg-purple-100' },
                  ].map((item) => (
                    <div key={item.label}>
                      <div className="flex justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${item.color}`} />
                          <span className="font-medium text-sm">{item.label}</span>
                        </div>
                        <span className="font-semibold text-sm">{item.count}</span>
                      </div>
                      <div className={`h-2 rounded-full ${item.bg} dark:bg-slate-700 overflow-hidden`}>
                        <div 
                          className={`h-full ${item.color} rounded-full transition-all duration-500`}
                          style={{ width: `${tripStats?.totalTrips ? (item.count / tripStats.totalTrips) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
