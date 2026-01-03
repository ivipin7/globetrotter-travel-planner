import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Clock,
  MapPin,
  IndianRupee,
  Check,
  Trash2,
  Edit2,
  GripVertical,
  Plane,
  Hotel,
  Utensils,
  Camera,
  ShoppingBag,
  Bus,
  MoreHorizontal,
  Loader2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Save,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { itineraryApi, Activity, ItineraryDay } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const categoryIcons: Record<string, React.ReactNode> = {
  transport: <Bus className="h-4 w-4" />,
  accommodation: <Hotel className="h-4 w-4" />,
  food: <Utensils className="h-4 w-4" />,
  activity: <Camera className="h-4 w-4" />,
  sightseeing: <Camera className="h-4 w-4" />,
  shopping: <ShoppingBag className="h-4 w-4" />,
  other: <MoreHorizontal className="h-4 w-4" />,
};

const categoryColors: Record<string, string> = {
  transport: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  accommodation: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  food: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  activity: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  sightseeing: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
  shopping: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  other: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400",
};

const categoryLabels: Record<string, string> = {
  transport: "Transport",
  accommodation: "Accommodation",
  food: "Food & Dining",
  activity: "Activity",
  sightseeing: "Sightseeing",
  shopping: "Shopping",
  other: "Other",
};

interface ItineraryData {
  tripId: string;
  tripName: string;
  destination?: string;
  startDate: string;
  endDate: string;
  dayCount: number;
  itinerary: ItineraryDay[];
}

const defaultActivity: Partial<Activity> = {
  title: "",
  description: "",
  location: "",
  startTime: "",
  endTime: "",
  category: "activity",
  cost: undefined,
  notes: "",
};

export default function Itinerary() {
  const { tripId } = useParams<{ tripId: string }>();
  const { toast } = useToast();

  const [data, setData] = useState<ItineraryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(1);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [newActivity, setNewActivity] = useState<Partial<Activity>>(defaultActivity);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchItinerary();
  }, [tripId]);

  const fetchItinerary = async () => {
    if (!tripId) return;
    
    setLoading(true);
    try {
      const response = await itineraryApi.getItinerary(tripId);
      setData(response.data);
    } catch (error) {
      console.error("Error fetching itinerary:", error);
      toast({
        title: "Error",
        description: "Failed to load itinerary",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddActivity = async () => {
    if (!tripId || !newActivity.title) {
      toast({
        title: "Error",
        description: "Please enter an activity title",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      await itineraryApi.addActivity(tripId, selectedDay, newActivity);
      await fetchItinerary();
      setIsAddDialogOpen(false);
      setNewActivity(defaultActivity);
      toast({
        title: "Activity added!",
        description: `Added "${newActivity.title}" to Day ${selectedDay}`,
      });
    } catch (error) {
      console.error("Error adding activity:", error);
      toast({
        title: "Error",
        description: "Failed to add activity",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateActivity = async () => {
    if (!tripId || !editingActivity?._id) return;

    setSaving(true);
    try {
      await itineraryApi.updateActivity(
        tripId,
        selectedDay,
        editingActivity._id,
        editingActivity
      );
      await fetchItinerary();
      setIsEditDialogOpen(false);
      setEditingActivity(null);
      toast({
        title: "Activity updated!",
      });
    } catch (error) {
      console.error("Error updating activity:", error);
      toast({
        title: "Error",
        description: "Failed to update activity",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteActivity = async (activityId: string) => {
    if (!tripId) return;

    try {
      await itineraryApi.deleteActivity(tripId, selectedDay, activityId);
      await fetchItinerary();
      toast({
        title: "Activity deleted",
      });
    } catch (error) {
      console.error("Error deleting activity:", error);
      toast({
        title: "Error",
        description: "Failed to delete activity",
        variant: "destructive",
      });
    }
  };

  const handleToggleComplete = async (activityId: string) => {
    if (!tripId) return;

    try {
      await itineraryApi.toggleActivity(tripId, selectedDay, activityId);
      await fetchItinerary();
    } catch (error) {
      console.error("Error toggling activity:", error);
    }
  };

  const currentDay = data?.itinerary.find((d) => d.dayNumber === selectedDay);
  const completedCount = currentDay?.activities.filter((a) => a.isCompleted).length || 0;
  const totalCount = currentDay?.activities.length || 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 nav-glass">
          <div className="container mx-auto px-4">
            <div className="flex h-16 items-center gap-4">
              <Button variant="ghost" size="icon" asChild>
                <Link to="/trips">
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              </Button>
              <span className="font-semibold">Itinerary</span>
            </div>
          </div>
        </header>
        <div className="container mx-auto px-4 py-16 text-center">
          <p className="text-muted-foreground">Trip not found</p>
          <Button asChild className="mt-4">
            <Link to="/trips">Back to Trips</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 nav-glass">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild>
                <Link to={`/trip/${tripId}`}>
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              </Button>
              <div>
                <h1 className="font-semibold">Itinerary</h1>
                <p className="text-xs text-muted-foreground">{data.tripName}</p>
              </div>
            </div>
            <Badge variant="outline">
              <Calendar className="h-3 w-3 mr-1" />
              {data.dayCount} days
            </Badge>
          </div>
        </div>
      </header>

      {/* Day Selector */}
      <div className="border-b bg-card/50">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 py-3">
            <Button
              variant="ghost"
              size="icon"
              disabled={selectedDay === 1}
              onClick={() => setSelectedDay((d) => d - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <ScrollArea className="flex-1">
              <div className="flex gap-2 pb-2">
                {data.itinerary.map((day) => (
                  <Button
                    key={day.dayNumber}
                    variant={selectedDay === day.dayNumber ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedDay(day.dayNumber)}
                    className="shrink-0"
                  >
                    <span className="hidden sm:inline">Day </span>{day.dayNumber}
                    <span className="ml-1 text-xs opacity-70 hidden md:inline">
                      ({format(new Date(day.date), "MMM d")})
                    </span>
                  </Button>
                ))}
              </div>
            </ScrollArea>
            
            <Button
              variant="ghost"
              size="icon"
              disabled={selectedDay === data.dayCount}
              onClick={() => setSelectedDay((d) => d + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Day Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold">
              Day {selectedDay} - {currentDay?.title || format(new Date(currentDay?.date || new Date()), "EEEE")}
            </h2>
            <p className="text-sm text-muted-foreground">
              {currentDay && format(new Date(currentDay.date), "MMMM d, yyyy")}
              {totalCount > 0 && ` • ${completedCount}/${totalCount} completed`}
            </p>
          </div>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Activity
          </Button>
        </div>

        {/* Progress */}
        {totalCount > 0 && (
          <div className="mb-6">
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-success transition-all duration-300"
                style={{ width: `${(completedCount / totalCount) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Activities List */}
        {currentDay?.activities.length === 0 ? (
          <Card className="card-3d">
            <CardContent className="py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold mb-2">No activities planned</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Start adding activities for Day {selectedDay}
              </p>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Activity
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {currentDay?.activities
              .sort((a, b) => a.order - b.order)
              .map((activity, index) => (
                <Card
                  key={activity._id}
                  className={`card-3d transition-all ${
                    activity.isCompleted ? "opacity-60" : ""
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      {/* Drag handle and checkbox */}
                      <div className="flex flex-col items-center gap-2 pt-1">
                        <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                        <Checkbox
                          checked={activity.isCompleted}
                          onCheckedChange={() =>
                            activity._id && handleToggleComplete(activity._id)
                          }
                        />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3
                              className={`font-medium ${
                                activity.isCompleted
                                  ? "line-through text-muted-foreground"
                                  : ""
                              }`}
                            >
                              {activity.title}
                            </h3>
                            {activity.description && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {activity.description}
                              </p>
                            )}
                          </div>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="shrink-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => {
                                  setEditingActivity(activity);
                                  setIsEditDialogOpen(true);
                                }}
                              >
                                <Edit2 className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() =>
                                  activity._id && handleDeleteActivity(activity._id)
                                }
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        {/* Meta info */}
                        <div className="flex flex-wrap items-center gap-2 mt-3">
                          <Badge
                            variant="secondary"
                            className={categoryColors[activity.category]}
                          >
                            {categoryIcons[activity.category]}
                            <span className="ml-1">
                              {categoryLabels[activity.category]}
                            </span>
                          </Badge>

                          {activity.startTime && (
                            <span className="flex items-center text-xs text-muted-foreground">
                              <Clock className="h-3 w-3 mr-1" />
                              {activity.startTime}
                              {activity.endTime && ` - ${activity.endTime}`}
                            </span>
                          )}

                          {activity.location && (
                            <span className="flex items-center text-xs text-muted-foreground">
                              <MapPin className="h-3 w-3 mr-1" />
                              {activity.location}
                            </span>
                          )}

                          {activity.cost && (
                            <span className="flex items-center text-xs text-muted-foreground">
                              <IndianRupee className="h-3 w-3 mr-0.5" />
                              {activity.cost.toLocaleString()}
                            </span>
                          )}
                        </div>

                        {activity.notes && (
                          <p className="text-xs text-muted-foreground mt-2 italic">
                            Note: {activity.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        )}

        {/* Day Summary */}
        {currentDay && currentDay.activities.length > 0 && (
          <Card className="card-3d mt-6">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Day {selectedDay} Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold">{currentDay.activities.length}</p>
                  <p className="text-xs text-muted-foreground">Activities</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{completedCount}</p>
                  <p className="text-xs text-muted-foreground">Completed</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    ₹{currentDay.activities
                      .reduce((sum, a) => sum + (a.cost || 0), 0)
                      .toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">Estimated Cost</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {Math.round((completedCount / totalCount) * 100)}%
                  </p>
                  <p className="text-xs text-muted-foreground">Progress</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Add Activity Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Activity</DialogTitle>
            <DialogDescription>
              Add an activity for Day {selectedDay}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Title *</label>
              <Input
                value={newActivity.title}
                onChange={(e) =>
                  setNewActivity({ ...newActivity, title: e.target.value })
                }
                placeholder="e.g., Visit Taj Mahal"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Category</label>
              <Select
                value={newActivity.category}
                onValueChange={(value) =>
                  setNewActivity({
                    ...newActivity,
                    category: value as Activity["category"],
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(categoryLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      <div className="flex items-center gap-2">
                        {categoryIcons[value]}
                        {label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium">Start Time</label>
                <Input
                  type="time"
                  value={newActivity.startTime}
                  onChange={(e) =>
                    setNewActivity({ ...newActivity, startTime: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium">End Time</label>
                <Input
                  type="time"
                  value={newActivity.endTime}
                  onChange={(e) =>
                    setNewActivity({ ...newActivity, endTime: e.target.value })
                  }
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Location</label>
              <Input
                value={newActivity.location}
                onChange={(e) =>
                  setNewActivity({ ...newActivity, location: e.target.value })
                }
                placeholder="e.g., Agra, India"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Estimated Cost (₹)</label>
              <Input
                type="number"
                value={newActivity.cost || ""}
                onChange={(e) =>
                  setNewActivity({
                    ...newActivity,
                    cost: e.target.value ? parseInt(e.target.value) : undefined,
                  })
                }
                placeholder="0"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={newActivity.description}
                onChange={(e) =>
                  setNewActivity({ ...newActivity, description: e.target.value })
                }
                placeholder="Add details..."
                rows={2}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Notes</label>
              <Input
                value={newActivity.notes}
                onChange={(e) =>
                  setNewActivity({ ...newActivity, notes: e.target.value })
                }
                placeholder="Any reminders or tips"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddActivity} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Add Activity
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Activity Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Activity</DialogTitle>
          </DialogHeader>

          {editingActivity && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Title *</label>
                <Input
                  value={editingActivity.title}
                  onChange={(e) =>
                    setEditingActivity({
                      ...editingActivity,
                      title: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <label className="text-sm font-medium">Category</label>
                <Select
                  value={editingActivity.category}
                  onValueChange={(value) =>
                    setEditingActivity({
                      ...editingActivity,
                      category: value as Activity["category"],
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(categoryLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        <div className="flex items-center gap-2">
                          {categoryIcons[value]}
                          {label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">Start Time</label>
                  <Input
                    type="time"
                    value={editingActivity.startTime || ""}
                    onChange={(e) =>
                      setEditingActivity({
                        ...editingActivity,
                        startTime: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">End Time</label>
                  <Input
                    type="time"
                    value={editingActivity.endTime || ""}
                    onChange={(e) =>
                      setEditingActivity({
                        ...editingActivity,
                        endTime: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Location</label>
                <Input
                  value={editingActivity.location || ""}
                  onChange={(e) =>
                    setEditingActivity({
                      ...editingActivity,
                      location: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <label className="text-sm font-medium">Estimated Cost (₹)</label>
                <Input
                  type="number"
                  value={editingActivity.cost || ""}
                  onChange={(e) =>
                    setEditingActivity({
                      ...editingActivity,
                      cost: e.target.value ? parseInt(e.target.value) : undefined,
                    })
                  }
                />
              </div>

              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={editingActivity.description || ""}
                  onChange={(e) =>
                    setEditingActivity({
                      ...editingActivity,
                      description: e.target.value,
                    })
                  }
                  rows={2}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Notes</label>
                <Input
                  value={editingActivity.notes || ""}
                  onChange={(e) =>
                    setEditingActivity({
                      ...editingActivity,
                      notes: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateActivity} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
