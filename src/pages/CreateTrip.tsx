import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Globe,
  Image,
  Calendar,
  MapPin,
  Users,
  IndianRupee,
  Save,
  Sparkles,
  Loader2,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ItineraryBuilder } from "@/components/premium/ItineraryBuilder";
import { tripApi } from "@/lib/api";
import { useAIRecommendations } from "@/hooks/use-ai-recommendations";
import { AIRecommendationsCard, BudgetSuggestion, DurationSuggestion } from "@/components/ai/AIRecommendations";
import { TripPossibilityGauge, TripPossibilityBadge } from "@/components/trip/TripPossibilityGauge";
import { TripOptimizer } from "@/components/trip/TripOptimizer";
import { calculateTripPossibility, TripData, TripDay, Activity, createSampleTripData } from "@/lib/trip-possibility";
import { OptimizedTrip } from "@/lib/trip-optimizer";

interface TripFormData {
  name: string;
  description: string;
  destination: string;
  tripType: 'solo' | 'couple' | 'family' | 'friends' | 'business';
  travelers: string;
  startDate: string;
  endDate: string;
  budget: string;
  coverImage: string;
}

export default function CreateTrip() {
  const navigate = useNavigate();
  const { id: editId } = useParams(); // If editing existing draft
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draftId, setDraftId] = useState<string | null>(editId || null);
  const [lastAutoSaved, setLastAutoSaved] = useState<Date | null>(null);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const [tripData, setTripData] = useState<TripFormData>({
    name: "",
    description: "",
    destination: "",
    tripType: "solo",
    travelers: "1",
    startDate: "",
    endDate: "",
    budget: "",
    coverImage: "",
  });

  // Load existing draft if editing
  useEffect(() => {
    if (editId) {
      loadExistingDraft(editId);
    }
  }, [editId]);

  const loadExistingDraft = async (id: string) => {
    try {
      const response = await tripApi.getById(id);
      const trip = response.data;
      setTripData({
        name: trip.name || "",
        description: trip.description || "",
        destination: trip.destination || "",
        tripType: trip.tripType || "solo",
        travelers: trip.travelers?.toString() || "1",
        startDate: trip.startDate ? trip.startDate.split('T')[0] : "",
        endDate: trip.endDate ? trip.endDate.split('T')[0] : "",
        budget: trip.totalBudget?.toString() || "",
        coverImage: trip.coverImageUrl || "",
      });
      setDraftId(id);
    } catch (err) {
      console.error('Failed to load draft:', err);
    }
  };

  // Auto-save to database as draft
  const autoSaveDraft = useCallback(async (data: TripFormData) => {
    // Only auto-save if user has entered meaningful data
    const hasMinimalData = data.name.trim().length >= 2 || 
                           data.destination.trim().length >= 2 ||
                           (data.startDate && data.endDate);
    
    if (!hasMinimalData) return;

    try {
      setAutoSaving(true);
      
      const tripPayload = {
        name: data.name || "Untitled Trip",
        description: data.description || undefined,
        destination: data.destination || undefined,
        tripType: data.tripType,
        travelers: data.travelers ? parseInt(data.travelers) : 1,
        coverImageUrl: data.coverImage || undefined,
        startDate: data.startDate || new Date().toISOString().split('T')[0],
        endDate: data.endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        totalBudget: data.budget ? parseFloat(data.budget) : undefined,
        status: 'draft' as const,
      };

      if (draftId) {
        // Update existing draft
        await tripApi.update(draftId, tripPayload);
      } else {
        // Create new draft
        const response = await tripApi.create(tripPayload);
        setDraftId(response.data._id);
      }
      
      setLastAutoSaved(new Date());
    } catch (err) {
      console.error('Auto-save failed:', err);
    } finally {
      setAutoSaving(false);
    }
  }, [draftId]);

  // Debounced auto-save when data changes
  useEffect(() => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    autoSaveTimeoutRef.current = setTimeout(() => {
      autoSaveDraft(tripData);
    }, 5000); // Auto-save after 5 seconds of inactivity

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [tripData, autoSaveDraft]);

  // Save draft when user leaves the page
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Sync save on page unload
      const hasMinimalData = tripData.name.trim().length >= 2 || 
                             tripData.destination.trim().length >= 2 ||
                             (tripData.startDate && tripData.endDate);
      if (hasMinimalData) {
        // Use sendBeacon for reliable saving on page close
        const payload = {
          name: tripData.name || "Untitled Trip",
          description: tripData.description || undefined,
          destination: tripData.destination || undefined,
          tripType: tripData.tripType,
          travelers: tripData.travelers ? parseInt(tripData.travelers) : 1,
          startDate: tripData.startDate || new Date().toISOString().split('T')[0],
          endDate: tripData.endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          totalBudget: tripData.budget ? parseFloat(tripData.budget) : undefined,
          status: 'draft',
        };
        
        if (draftId) {
          navigator.sendBeacon(
            `http://localhost:5000/api/trips/${draftId}`,
            JSON.stringify(payload)
          );
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [tripData, draftId]);

  // Calculate trip days
  const tripDays = useMemo(() => {
    if (tripData.startDate && tripData.endDate) {
      const start = new Date(tripData.startDate);
      const end = new Date(tripData.endDate);
      return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    }
    return 0;
  }, [tripData.startDate, tripData.endDate]);

  // Generate Trip Possibility Data (for demo purposes)
  // In production, this would come from the itinerary builder
  const tripPossibilityData = useMemo<TripData>(() => {
    if (!tripDays || tripDays <= 0) {
      return {
        totalBudget: tripData.budget ? parseFloat(tripData.budget) : 50000,
        totalDays: 7,
        cities: tripData.destination ? [tripData.destination] : ['Unknown'],
        days: [],
        currency: 'INR',
      };
    }

    // Create sample trip data for demonstration
    // This simulates what would come from a real itinerary
    const isOverBudget = Math.random() > 0.5; // Randomly simulate issues for demo
    const isOverloaded = Math.random() > 0.4;
    
    return createSampleTripData({
      days: tripDays,
      cities: tripData.destination ? 1 : 0,
      budget: tripData.budget ? parseFloat(tripData.budget) : 50000,
      overloaded: isOverloaded,
      overBudget: isOverBudget,
    });
  }, [tripDays, tripData.budget, tripData.destination]);

  // Calculate Trip Possibility
  const tripPossibility = useMemo(() => {
    return calculateTripPossibility(tripPossibilityData);
  }, [tripPossibilityData]);

  // Handle applying optimized trip
  const handleApplyOptimization = useCallback((optimizedTrip: OptimizedTrip) => {
    // In a real implementation, this would update the itinerary
    console.log('Applying optimization:', optimizedTrip.name);
    // For now, show success message
    alert(`Applied "${optimizedTrip.name}" - Trip feasibility improved to ${optimizedTrip.possibility.percentage}%!`);
  }, []);

  // AI Recommendations
  const {
    recommendations,
    budgetEstimate,
    durationRecommendation,
    completionAnalysis,
    travelTips,
    isLoading: aiLoading,
    aiPowered,
    aiInsights
  } = useAIRecommendations({
    destination: tripData.destination,
    startDate: tripData.startDate ? new Date(tripData.startDate) : undefined,
    endDate: tripData.endDate ? new Date(tripData.endDate) : undefined,
    budget: tripData.budget ? parseFloat(tripData.budget) : 0,
    plannedActivities: 0 // Will be updated when itinerary is built
  });

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  // Handle suggested budget click
  const handleSuggestedBudget = (budget: number) => {
    setTripData({ ...tripData, budget: budget.toString() });
  };

  // Handle suggested duration
  const handleSuggestedDuration = (days: number) => {
    if (tripData.startDate) {
      const start = new Date(tripData.startDate);
      const end = new Date(start);
      end.setDate(start.getDate() + days - 1);
      setTripData({
        ...tripData,
        endDate: end.toISOString().split('T')[0]
      });
    }
  };

  const handleSave = async () => {
    // Validate required fields
    if (!tripData.name || !tripData.startDate || !tripData.endDate) {
      setError("Please fill in trip name, start date, and end date");
      setStep(1);
      return;
    }

    try {
      setSaving(true);
      setError(null);
      
      const tripPayload = {
        name: tripData.name,
        description: tripData.description || undefined,
        destination: tripData.destination || undefined,
        tripType: tripData.tripType,
        travelers: tripData.travelers ? parseInt(tripData.travelers) : 1,
        coverImageUrl: tripData.coverImage || undefined,
        startDate: tripData.startDate,
        endDate: tripData.endDate,
        totalBudget: tripData.budget ? parseFloat(tripData.budget) : undefined,
        status: 'upcoming' as const, // Change to upcoming when saving officially
      };

      let tripId: string;
      
      if (draftId) {
        // Update existing draft and change status to upcoming
        await tripApi.update(draftId, tripPayload);
        tripId = draftId;
      } else {
        // Create new trip
        const response = await tripApi.create(tripPayload);
        tripId = response.data._id;
      }

      // Navigate to the trip detail page
      navigate(`/trip/${tripId}`);
    } catch (err: any) {
      console.error('Failed to create trip:', err);
      setError(err.message || 'Failed to create trip');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 nav-glass border-b border-border/50">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild>
                <Link to="/dashboard">
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              </Button>
              <div className="flex items-center gap-2">
                <Globe className="h-6 w-6 text-primary" />
                <span className="font-semibold">{editId ? 'Edit Draft' : 'Create New Trip'}</span>
              </div>
              {/* Auto-save indicator */}
              {autoSaving && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Auto-saving...
                </span>
              )}
              {lastAutoSaved && !autoSaving && (
                <span className="text-xs text-success flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Saved to drafts
                </span>
              )}
            </div>

            <Button onClick={handleSave} className="gap-2" disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {saving ? 'Saving...' : 'Save Trip'}
            </Button>
          </div>
        </div>
      </header>

      {/* Progress Indicator */}
      <div className="border-b border-border/50 bg-card/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-center gap-4">
            {[
              { num: 1, label: "Basic Info" },
              { num: 2, label: "Itinerary" },
              { num: 3, label: "Review" },
            ].map((s, i) => (
              <div key={s.num} className="flex items-center">
                <button
                  onClick={() => setStep(s.num)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                    step === s.num
                      ? "bg-primary text-primary-foreground"
                      : step > s.num
                      ? "bg-success/20 text-success"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-sm font-semibold">
                    {step > s.num ? "✓" : s.num}
                  </span>
                  <span className="hidden sm:inline font-medium">{s.label}</span>
                </button>
                {i < 2 && (
                  <div
                    className={`w-12 h-0.5 mx-2 ${
                      step > s.num ? "bg-success" : "bg-muted"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-center">
            {error}
          </div>
        )}
        
        {/* Step 1: Basic Info */}
        {step === 1 && (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
                <Sparkles className="h-4 w-4" />
                <span className="text-sm font-medium">Step 1 of 3</span>
              </div>
              <h1 className="text-3xl font-bold mb-2">Tell us about your trip</h1>
              <p className="text-muted-foreground">
                Start by giving your adventure a name and some basic details.
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Main Form */}
              <div className="lg:col-span-2">
                <Card className="card-3d p-6 space-y-6">
                  {/* Trip Name */}
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-base font-medium">
                      Trip Name *
                    </Label>
                    <Input
                      id="name"
                      placeholder="e.g., Goa Beach Vacation 2026"
                      className="h-12 text-lg"
                      value={tripData.name}
                      onChange={(e) =>
                        setTripData({ ...tripData, name: e.target.value })
                      }
                    />
                  </div>

                  {/* Destination */}
                  <div className="space-y-2">
                    <Label htmlFor="destination" className="text-base font-medium">
                      <MapPin className="h-4 w-4 inline mr-2" />
                      Destination
                    </Label>
                    <Input
                      id="destination"
                      placeholder="e.g., Paris, Tokyo, Bali, New York..."
                      className="h-12"
                      value={tripData.destination}
                      onChange={(e) =>
                        setTripData({ ...tripData, destination: e.target.value })
                      }
                    />
                    {tripData.destination.length >= 2 && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Sparkles className="h-3 w-3 text-primary" />
                        AI is analyzing your destination for recommendations...
                      </p>
                    )}
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-base font-medium">
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="Describe your dream trip..."
                      className="min-h-[100px] resize-none"
                      value={tripData.description}
                      onChange={(e) =>
                        setTripData({ ...tripData, description: e.target.value })
                      }
                    />
                  </div>

                  {/* Trip Type & Travelers */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-base font-medium">
                        <Users className="h-4 w-4 inline mr-2" />
                        Trip Type
                      </Label>
                      <Select
                        value={tripData.tripType}
                        onValueChange={(value: 'solo' | 'couple' | 'family' | 'friends' | 'business') =>
                          setTripData({ ...tripData, tripType: value })
                        }
                      >
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="Select trip type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="solo">Solo Trip</SelectItem>
                          <SelectItem value="couple">Couple</SelectItem>
                          <SelectItem value="family">Family</SelectItem>
                          <SelectItem value="friends">Friends</SelectItem>
                          <SelectItem value="business">Business</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="travelers" className="text-base font-medium">
                        <Users className="h-4 w-4 inline mr-2" />
                        Number of Travelers
                      </Label>
                      <Input
                        id="travelers"
                        type="number"
                        min="1"
                        max="50"
                        placeholder="1"
                        className="h-12"
                        value={tripData.travelers}
                        onChange={(e) =>
                          setTripData({ ...tripData, travelers: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  {/* Dates with Duration Suggestion */}
                  <div className="space-y-3">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="startDate" className="text-base font-medium">
                          <Calendar className="h-4 w-4 inline mr-2" />
                          Start Date *
                        </Label>
                        <Input
                          id="startDate"
                          type="date"
                          className="h-12"
                          value={tripData.startDate}
                          onChange={(e) =>
                            setTripData({ ...tripData, startDate: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="endDate" className="text-base font-medium">
                          <Calendar className="h-4 w-4 inline mr-2" />
                          End Date *
                        </Label>
                        <Input
                          id="endDate"
                          type="date"
                          className="h-12"
                          value={tripData.endDate}
                          min={tripData.startDate}
                          onChange={(e) =>
                            setTripData({ ...tripData, endDate: e.target.value })
                          }
                        />
                      </div>
                    </div>
                    {tripDays > 0 && (
                      <p className="text-sm text-muted-foreground">
                        Trip duration: <span className="font-medium text-foreground">{tripDays} days</span>
                      </p>
                    )}
                    {durationRecommendation && tripData.startDate && (
                      <DurationSuggestion
                        durationRecommendation={durationRecommendation}
                        currentDays={tripDays}
                        onSuggestedDurationClick={handleSuggestedDuration}
                      />
                    )}
                  </div>

                  {/* Budget with AI Suggestion */}
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="budget" className="text-base font-medium">
                        <IndianRupee className="h-4 w-4 inline mr-2" />
                        Total Budget
                      </Label>
                      <Input
                        id="budget"
                        type="number"
                        placeholder="Enter your budget"
                        className="h-12"
                        value={tripData.budget}
                        onChange={(e) =>
                          setTripData({ ...tripData, budget: e.target.value })
                        }
                      />
                    </div>
                    {budgetEstimate && tripDays > 0 && (
                      <BudgetSuggestion
                        budgetEstimate={budgetEstimate}
                        currentBudget={tripData.budget ? parseFloat(tripData.budget) : 0}
                        onSuggestedBudgetClick={handleSuggestedBudget}
                      />
                    )}
                  </div>

                  {/* Cover Image */}
                  <div className="space-y-2">
                    <Label htmlFor="coverImage" className="text-base font-medium">
                      <Image className="h-4 w-4 inline mr-2" />
                      Cover Image URL
                    </Label>
                    <Input
                      id="coverImage"
                      placeholder="https://..."
                      className="h-12"
                      value={tripData.coverImage}
                      onChange={(e) =>
                        setTripData({ ...tripData, coverImage: e.target.value })
                      }
                    />
                    {tripData.coverImage && (
                      <div className="mt-2 rounded-lg overflow-hidden h-40">
                        <img
                          src={tripData.coverImage}
                          alt="Cover preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                </Card>
              </div>

              {/* AI Recommendations Sidebar */}
              <div className="lg:col-span-1">
                <div className="sticky top-24 space-y-4">
                  <AIRecommendationsCard
                    recommendations={recommendations}
                    budgetEstimate={budgetEstimate}
                    durationRecommendation={durationRecommendation}
                    completionAnalysis={completionAnalysis}
                    travelTips={travelTips}
                    isLoading={aiLoading}
                    aiPowered={aiPowered}
                    aiInsights={aiInsights}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleNext} size="lg" className="px-8">
                Continue to Itinerary
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Itinerary */}
        {step === 2 && (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
                <Sparkles className="h-4 w-4" />
                <span className="text-sm font-medium">Step 2 of 3</span>
              </div>
              <h1 className="text-3xl font-bold mb-2">Build your itinerary</h1>
              <p className="text-muted-foreground">
                Add destinations and activities to your trip.
              </p>
            </div>

            <ItineraryBuilder />

            <div className="flex justify-between">
              <Button variant="outline" onClick={handleBack} size="lg">
                Back
              </Button>
              <Button onClick={handleNext} size="lg" className="px-8">
                Review Trip
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Review */}
        {step === 3 && (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success/10 text-success mb-4">
                <Sparkles className="h-4 w-4" />
                <span className="text-sm font-medium">Final Step</span>
              </div>
              <h1 className="text-3xl font-bold mb-2">Review your trip</h1>
              <p className="text-muted-foreground">
                Everything looks good? Let's save your adventure!
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Trip Preview */}
              <div className="lg:col-span-2">
                <Card className="card-3d overflow-hidden">
                  {/* Cover Image */}
                  <div className="h-48 bg-gradient-to-br from-primary/20 via-accent/10 to-success/20 relative">
                    {tripData.coverImage ? (
                      <img
                        src={tripData.coverImage}
                        alt={tripData.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Globe className="h-16 w-16 text-primary/30" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-4 left-4 text-white">
                      <h2 className="text-2xl font-bold">
                        {tripData.name || "Untitled Trip"}
                      </h2>
                      {tripData.destination && (
                        <p className="flex items-center gap-1 text-sm opacity-90 mt-1">
                          <MapPin className="h-3 w-3" />
                          {tripData.destination}
                        </p>
                      )}
                      {tripData.startDate && tripData.endDate && (
                        <p className="text-sm opacity-90">
                          {new Date(tripData.startDate).toLocaleDateString("en-US", {
                            month: "long",
                            day: "numeric",
                          })}{" "}
                          -{" "}
                          {new Date(tripData.endDate).toLocaleDateString("en-US", {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          })}
                          {tripDays > 0 && ` (${tripDays} days)`}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="p-6 space-y-4">
                    {tripData.description && (
                      <p className="text-muted-foreground">{tripData.description}</p>
                    )}

                    <div className="flex flex-wrap gap-3">
                      {tripData.budget && (
                        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-success/10">
                          <IndianRupee className="h-4 w-4 text-success" />
                          <span className="font-semibold">
                            {Number(tripData.budget).toLocaleString()} budget
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10">
                        <Users className="h-4 w-4 text-primary" />
                        <span className="font-semibold capitalize">
                          {tripData.tripType} · {tripData.travelers} traveler(s)
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Trip Possibility Score - Flagship Feature */}
              <div className="lg:col-span-1 space-y-4">
                {tripData.destination && tripData.startDate && tripData.endDate ? (
                  <>
                    {/* Trip Possibility Gauge */}
                    <TripPossibilityGauge 
                      result={tripPossibility}
                      showOptimizeButton={tripPossibility.percentage < 85}
                      onOptimize={() => {
                        const optimizerSection = document.getElementById('trip-optimizer');
                        optimizerSection?.scrollIntoView({ behavior: 'smooth' });
                      }}
                    />

                    {/* Reality-Aware Trip Optimizer (RATO) */}
                    {tripPossibility.percentage < 85 && (
                      <div id="trip-optimizer">
                        <TripOptimizer
                          tripData={tripPossibilityData}
                          currentPossibility={tripPossibility}
                          onApplyOptimization={handleApplyOptimization}
                        />
                      </div>
                    )}

                    {/* Legacy AI Analysis - Now Secondary */}
                    {completionAnalysis && (
                      <Card className="p-4 border-muted/30">
                        <div className="flex items-center gap-2 mb-3">
                          <Sparkles className="h-4 w-4 text-muted-foreground" />
                          <h3 className="font-medium text-sm text-muted-foreground">Additional Insights</h3>
                        </div>
                        {completionAnalysis.suggestions.length > 0 && (
                          <div className="space-y-1.5">
                            {completionAnalysis.suggestions.slice(0, 2).map((suggestion, i) => (
                              <p key={i} className="text-xs text-muted-foreground">
                                • {suggestion}
                              </p>
                            ))}
                          </div>
                        )}
                      </Card>
                    )}
                  </>
                ) : (
                  <Card className="p-6">
                    <div className="text-center text-muted-foreground">
                      <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-muted/30 flex items-center justify-center">
                        <Sparkles className="h-8 w-8 opacity-50" />
                      </div>
                      <p className="text-sm font-medium">Trip Possibility Analysis</p>
                      <p className="text-xs mt-1">Add destination and dates to see your trip's feasibility score</p>
                    </div>
                  </Card>
                )}
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={handleBack} size="lg">
                Back to Edit
              </Button>
              <Button
                onClick={handleSave}
                size="lg"
                className="px-8 bg-gradient-to-r from-primary to-accent hover:opacity-90"
                disabled={saving}
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save & View Trip
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
