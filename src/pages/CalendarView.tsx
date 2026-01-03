import { useState } from "react";
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus,
  MapPin
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

// Mock trip data with dates
const trips = [
  { id: "1", name: "Summer in Japan", startDate: "2026-01-15", endDate: "2026-01-29", color: "bg-blue-500" },
  { id: "2", name: "European Adventure", startDate: "2026-02-01", endDate: "2026-02-21", color: "bg-purple-500" },
  { id: "3", name: "Bali Retreat", startDate: "2026-01-10", endDate: "2026-01-17", color: "bg-green-500" },
  { id: "4", name: "NYC Weekend", startDate: "2026-01-20", endDate: "2026-01-23", color: "bg-orange-500" },
];

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export default function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 0, 1)); // January 2026

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    return { daysInMonth, startingDay };
  };

  const { daysInMonth, startingDay } = getDaysInMonth(currentDate);

  const getTripsForDate = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return trips.filter(trip => {
      return dateStr >= trip.startDate && dateStr <= trip.endDate;
    });
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date(2026, 0, 1)); // Reset to January 2026 for demo
  };

  const renderCalendarDays = () => {
    const days = [];
    
    // Empty cells for days before the first day of month
    for (let i = 0; i < startingDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 lg:h-32 bg-muted/30 rounded-lg" />);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const tripsOnDay = getTripsForDate(day);
      const isToday = day === 3 && currentDate.getMonth() === 0 && currentDate.getFullYear() === 2026;

      days.push(
        <div
          key={day}
          className={cn(
            "h-24 lg:h-32 p-2 rounded-lg border transition-colors",
            isToday ? "border-primary bg-primary/5" : "border-border/50 hover:border-primary/50",
            "overflow-hidden"
          )}
        >
          <div className={cn(
            "text-sm font-medium mb-1",
            isToday && "text-primary"
          )}>
            {day}
          </div>
          <div className="space-y-1">
            {tripsOnDay.slice(0, 2).map((trip) => (
              <Link
                key={trip.id}
                to={`/trip/${trip.id}`}
                className={cn(
                  "block text-xs px-2 py-1 rounded truncate text-white",
                  trip.color
                )}
              >
                {trip.name}
              </Link>
            ))}
            {tripsOnDay.length > 2 && (
              <div className="text-xs text-muted-foreground pl-2">
                +{tripsOnDay.length - 2} more
              </div>
            )}
          </div>
        </div>
      );
    }

    return days;
  };

  return (
    <DashboardLayout title="Calendar" showSearch={false}>
      <div className="p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-semibold">Trip Calendar</h1>
            <p className="text-muted-foreground">View your trips on a calendar</p>
          </div>
          <Button variant="hero" asChild>
            <Link to="/trip/new">
              <Plus className="h-4 w-4 mr-2" />
              New Trip
            </Link>
          </Button>
        </div>

        {/* Calendar Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={prevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={nextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="ghost" onClick={goToToday}>
              Today
            </Button>
          </div>
          <h2 className="text-xl font-semibold">
            {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
        </div>

        {/* Calendar Grid */}
        <Card>
          <CardContent className="p-4">
            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-2 mb-2">
              {DAYS.map(day => (
                <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-2">
              {renderCalendarDays()}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Trips Legend */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3">This Month's Trips</h3>
            <div className="space-y-2">
              {trips.filter(trip => {
                const tripMonth = new Date(trip.startDate).getMonth();
                return tripMonth === currentDate.getMonth();
              }).map(trip => (
                <Link
                  key={trip.id}
                  to={`/trip/${trip.id}`}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className={cn("w-3 h-3 rounded-full", trip.color)} />
                  <div className="flex-1">
                    <div className="font-medium">{trip.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
                    </div>
                  </div>
                  <Badge variant="outline">
                    <MapPin className="h-3 w-3 mr-1" />
                    View
                  </Badge>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
