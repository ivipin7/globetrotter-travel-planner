import { useState } from "react";
import {
  Plus,
  GripVertical,
  Calendar,
  MapPin,
  Trash2,
  ChevronDown,
  ChevronUp,
  Clock,
  IndianRupee,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Activity {
  id: string;
  name: string;
  time: string;
  duration: string;
  cost: number;
  category: string;
}

interface TripStop {
  id: string;
  cityName: string;
  country: string;
  startDate: string;
  endDate: string;
  activities: Activity[];
  isExpanded: boolean;
}

interface ItineraryBuilderProps {
  initialStops?: TripStop[];
  onSave?: (stops: TripStop[]) => void;
}

export function ItineraryBuilder({ initialStops = [], onSave }: ItineraryBuilderProps) {
  const [stops, setStops] = useState<TripStop[]>(initialStops);
  const [isAddingStop, setIsAddingStop] = useState(false);
  const [newCity, setNewCity] = useState("");
  const [newCountry, setNewCountry] = useState("");
  const [newStartDate, setNewStartDate] = useState("");
  const [newEndDate, setNewEndDate] = useState("");

  const toggleStopExpansion = (stopId: string) => {
    setStops(
      stops.map((stop) =>
        stop.id === stopId ? { ...stop, isExpanded: !stop.isExpanded } : stop
      )
    );
  };

  const addStop = () => {
    if (!newCity || !newStartDate || !newEndDate) return;

    const newStop: TripStop = {
      id: `stop-${Date.now()}`,
      cityName: newCity,
      country: newCountry,
      startDate: newStartDate,
      endDate: newEndDate,
      activities: [],
      isExpanded: true,
    };

    setStops([...stops, newStop]);
    setNewCity("");
    setNewCountry("");
    setNewStartDate("");
    setNewEndDate("");
    setIsAddingStop(false);
  };

  const removeStop = (stopId: string) => {
    setStops(stops.filter((stop) => stop.id !== stopId));
  };

  const addActivity = (stopId: string, activity: Activity) => {
    setStops(
      stops.map((stop) =>
        stop.id === stopId
          ? { ...stop, activities: [...stop.activities, activity] }
          : stop
      )
    );
  };

  const removeActivity = (stopId: string, activityId: string) => {
    setStops(
      stops.map((stop) =>
        stop.id === stopId
          ? {
              ...stop,
              activities: stop.activities.filter((a) => a.id !== activityId),
            }
          : stop
      )
    );
  };

  const getTotalCost = () => {
    return stops.reduce(
      (total, stop) =>
        total + stop.activities.reduce((sum, activity) => sum + activity.cost, 0),
      0
    );
  };

  const getTotalDays = () => {
    if (stops.length === 0) return 0;
    const startDate = new Date(stops[0].startDate);
    const endDate = new Date(stops[stops.length - 1].endDate);
    return Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4 card-3d hover:scale-105 transition-transform">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <MapPin className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stops.length}</p>
              <p className="text-xs text-muted-foreground">Destinations</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 card-3d hover:scale-105 transition-transform">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
              <Calendar className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold">{getTotalDays()}</p>
              <p className="text-xs text-muted-foreground">Days</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 card-3d hover:scale-105 transition-transform">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
              <IndianRupee className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold">₹{getTotalCost().toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Est. Cost</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Stops List */}
      <div className="space-y-4">
        {stops.map((stop, index) => (
          <Card
            key={stop.id}
            className="overflow-hidden card-3d hover:shadow-lg transition-all"
          >
            {/* Stop Header */}
            <div
              className="p-4 flex items-center justify-between cursor-pointer hover:bg-muted/30 transition-colors"
              onClick={() => toggleStopExpansion(stop.id)}
            >
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <GripVertical className="h-4 w-4 cursor-grab" />
                  <Badge
                    variant="outline"
                    className="h-6 w-6 rounded-full p-0 flex items-center justify-center font-semibold"
                  >
                    {index + 1}
                  </Badge>
                </div>

                <div>
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    {stop.cityName}
                    <span className="text-muted-foreground font-normal text-sm">
                      {stop.country}
                    </span>
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(stop.startDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}{" "}
                      -{" "}
                      {new Date(stop.endDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {stop.activities.length} activities
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeStop(stop.id);
                  }}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                {stop.isExpanded ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
            </div>

            {/* Activities Section */}
            {stop.isExpanded && (
              <div className="border-t border-border p-4 bg-muted/20">
                {stop.activities.length > 0 ? (
                  <div className="space-y-3 mb-4">
                    {stop.activities.map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-card border border-border/50 hover:shadow-md transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <Badge variant="secondary" className="text-xs">
                            {activity.category}
                          </Badge>
                          <div>
                            <p className="font-medium">{activity.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {activity.time} • {activity.duration}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-success">
                            ${activity.cost}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeActivity(stop.id, activity.id)}
                            className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No activities yet. Add your first activity!
                  </p>
                )}

                <AddActivityDialog
                  onAdd={(activity) => addActivity(stop.id, activity)}
                />
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Add Stop Button */}
      <Dialog open={isAddingStop} onOpenChange={setIsAddingStop}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="w-full h-14 border-dashed border-2 hover:border-primary hover:bg-primary/5 transition-all group"
          >
            <Plus className="h-5 w-5 mr-2 group-hover:rotate-90 transition-transform" />
            Add Destination
          </Button>
        </DialogTrigger>
        <DialogContent className="glass-card">
          <DialogHeader>
            <DialogTitle>Add New Destination</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>City</Label>
                <Input
                  placeholder="Tokyo"
                  value={newCity}
                  onChange={(e) => setNewCity(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Country</Label>
                <Input
                  placeholder="Japan"
                  value={newCountry}
                  onChange={(e) => setNewCountry(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={newStartDate}
                  onChange={(e) => setNewStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={newEndDate}
                  onChange={(e) => setNewEndDate(e.target.value)}
                />
              </div>
            </div>
            <Button onClick={addStop} className="w-full">
              Add Destination
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Save Button */}
      {stops.length > 0 && onSave && (
        <Button
          onClick={() => onSave(stops)}
          className="w-full h-12 text-lg font-semibold shadow-lg hover:shadow-xl"
        >
          Save Itinerary
        </Button>
      )}
    </div>
  );
}

// Add Activity Dialog Component
function AddActivityDialog({ onAdd }: { onAdd: (activity: Activity) => void }) {
  const [name, setName] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState("");
  const [cost, setCost] = useState("");
  const [category, setCategory] = useState("Sightseeing");
  const [isOpen, setIsOpen] = useState(false);

  const handleAdd = () => {
    if (!name) return;

    onAdd({
      id: `activity-${Date.now()}`,
      name,
      time: time || "All day",
      duration: duration || "2 hours",
      cost: Number(cost) || 0,
      category,
    });

    setName("");
    setTime("");
    setDuration("");
    setCost("");
    setCategory("Sightseeing");
    setIsOpen(false);
  };

  const categories = [
    "Sightseeing",
    "Food & Dining",
    "Adventure",
    "Culture",
    "Shopping",
    "Transport",
    "Relaxation",
  ];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Add Activity
        </Button>
      </DialogTrigger>
      <DialogContent className="glass-card">
        <DialogHeader>
          <DialogTitle>Add Activity</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label>Activity Name</Label>
            <Input
              placeholder="Visit Tokyo Tower"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Time</Label>
              <Input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Duration</Label>
              <Input
                placeholder="2 hours"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <select
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Cost ($)</Label>
              <Input
                type="number"
                placeholder="50"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
              />
            </div>
          </div>
          <Button onClick={handleAdd} className="w-full">
            Add Activity
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
