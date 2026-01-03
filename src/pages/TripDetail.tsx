import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  IndianRupee,
  Share2,
  Edit,
  Trash2,
  Globe,
  Lock,
  Copy,
  Check,
  Loader2,
  Plus,
  Clock,
  Users,
  Package
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { WeatherWidget } from "@/components/weather/WeatherWidget";
import { tripApi, Trip } from "@/lib/api";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function TripDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [trip, setTrip] = useState<Trip | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchTrip = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        setError(null);
        const response = await tripApi.getById(id);
        setTrip(response.data);
        setIsOwner(response.isOwner);
      } catch (err: any) {
        console.error('Failed to fetch trip:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTrip();
  }, [id]);

  const handleDelete = async () => {
    if (!id) return;
    
    try {
      setDeleting(true);
      await tripApi.delete(id);
      navigate('/trips');
    } catch (err: any) {
      console.error('Failed to delete trip:', err);
      alert(err.message);
    } finally {
      setDeleting(false);
    }
  };

  const handleDuplicate = async () => {
    if (!id) return;
    
    try {
      const response = await tripApi.duplicate(id);
      navigate(`/trip/${response.data._id}`);
    } catch (err: any) {
      console.error('Failed to duplicate trip:', err);
      alert(err.message);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'ongoing': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'completed': return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
      case 'draft': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      default: return '';
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDuration = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    return `${diff} ${diff === 1 ? 'day' : 'days'}`;
  };

  if (loading) {
    return (
      <DashboardLayout title="Loading...">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !trip) {
    return (
      <DashboardLayout title="Error">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <p className="text-destructive mb-4">{error || 'Trip not found'}</p>
          <Button variant="outline" asChild>
            <Link to="/trips">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Trips
            </Link>
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const owner = typeof trip.userId === 'object' ? trip.userId : null;

  return (
    <DashboardLayout title={trip.name}>
      <div className="p-6 lg:p-8">
        {/* Back Button */}
        <Button variant="ghost" asChild className="mb-6">
          <Link to="/trips">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Trips
          </Link>
        </Button>

        {/* Hero Section */}
        <div className="relative rounded-2xl overflow-hidden mb-8">
          <div className="aspect-[3/1] min-h-[300px]">
            <img
              src={trip.coverImageUrl || `https://source.unsplash.com/1200x400/?travel,${encodeURIComponent(trip.name)}`}
              alt={trip.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          </div>
          
          <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <Badge className={`${getStatusColor(trip.status)} capitalize`}>
                    {trip.status}
                  </Badge>
                  {trip.isPublic ? (
                    <Badge variant="outline" className="bg-white/10 text-white border-white/20">
                      <Globe className="h-3 w-3 mr-1" />
                      Public
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-white/10 text-white border-white/20">
                      <Lock className="h-3 w-3 mr-1" />
                      Private
                    </Badge>
                  )}
                </div>
                <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">{trip.name}</h1>
                {owner && (
                  <p className="text-white/70">
                    Created by {owner.name}
                  </p>
                )}
              </div>
              
              <div className="flex items-center gap-3">
                <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20" onClick={copyLink}>
                  {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                  {copied ? 'Copied!' : 'Share'}
                </Button>
                
                {isOwner && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link to={`/trip/${id}/edit`}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Trip
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleDuplicate}>
                        <Copy className="h-4 w-4 mr-2" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className="text-destructive"
                        onClick={() => setShowDelete(true)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Trip
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Trip Info Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="card-3d p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Start Date</p>
                <p className="font-medium">{formatDate(trip.startDate)}</p>
              </div>
            </div>
          </div>
          
          <div className="card-3d p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">End Date</p>
                <p className="font-medium">{formatDate(trip.endDate)}</p>
              </div>
            </div>
          </div>
          
          <div className="card-3d p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Clock className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Duration</p>
                <p className="font-medium">{getDuration(trip.startDate, trip.endDate)}</p>
              </div>
            </div>
          </div>
          
          <div className="card-3d p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-500/10">
                <IndianRupee className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Budget</p>
                <p className="font-medium">
                  {trip.totalBudget ? `₹${trip.totalBudget.toLocaleString()}` : 'Not set'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        {trip.description && (
          <div className="card-3d p-6 mb-8">
            <h2 className="text-lg font-semibold mb-3">About this trip</h2>
            <p className="text-muted-foreground whitespace-pre-wrap">{trip.description}</p>
          </div>
        )}

        {/* Weather Widget - Show if destination is set */}
        {trip.destination && (
          <div className="mb-8">
            <WeatherWidget 
              destination={trip.destination} 
              startDate={trip.startDate}
            />
          </div>
        )}

        {/* Itinerary Placeholder */}
        <div className="card-3d p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">Itinerary</h2>
            {isOwner && (
              <Button variant="outline" size="sm" asChild>
                <Link to={`/trip/${id}/itinerary`}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Activities
                </Link>
              </Button>
            )}
          </div>
          
          <div className="text-center py-12">
            <MapPin className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="font-medium text-lg mb-2">No activities yet</h3>
            <p className="text-muted-foreground mb-4">
              Start building your itinerary by adding destinations and activities
            </p>
            {isOwner && (
              <Button variant="hero" asChild>
                <Link to={`/trip/${id}/itinerary`}>
                  <Plus className="h-4 w-4 mr-2" />
                  Build Itinerary
                </Link>
              </Button>
            )}
          </div>
        </div>

        {/* Packing List */}
        <div className="card-3d p-6 mt-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">Packing List</h2>
            {isOwner && (
              <Button variant="outline" size="sm" asChild>
                <Link to={`/trip/${id}/packing`}>
                  <Package className="h-4 w-4 mr-2" />
                  Manage Items
                </Link>
              </Button>
            )}
          </div>
          
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="font-medium text-lg mb-2">No items packed yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your packing checklist so you don't forget anything
            </p>
            {isOwner && (
              <Button variant="hero" asChild>
                <Link to={`/trip/${id}/packing`}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Packing List
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={showDelete} onOpenChange={setShowDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Trip</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{trip.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleting}
            >
              {deleting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
