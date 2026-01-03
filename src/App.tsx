import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute, PublicRoute, OptionalAuthRoute } from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Discover from "./pages/Discover";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import CreateTrip from "./pages/CreateTrip";
import AdminDashboard from "./pages/AdminDashboard";
import MyTrips from "./pages/MyTrips";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import CalendarView from "./pages/CalendarView";
import Community from "./pages/Community";
import TripDetail from "./pages/TripDetail";
import Budget from "./pages/Budget";
import DestinationDetail from "./pages/DestinationDetail";
import Itinerary from "./pages/Itinerary";
import PackingList from "./pages/PackingList";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Routes>
            {/* Public routes - accessible without login */}
            <Route path="/" element={
              <OptionalAuthRoute>
                <Index />
              </OptionalAuthRoute>
            } />
            
            {/* Auth routes - redirect to dashboard if logged in */}
            <Route path="/login" element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } />
            <Route path="/signup" element={
              <PublicRoute>
                <Signup />
              </PublicRoute>
            } />
            
            {/* Protected user routes - require authentication */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/discover" element={
              <ProtectedRoute>
                <Discover />
              </ProtectedRoute>
            } />
            <Route path="/discover/:id" element={
              <ProtectedRoute>
                <DestinationDetail />
              </ProtectedRoute>
            } />
            <Route path="/trip/new" element={
              <ProtectedRoute>
                <CreateTrip />
              </ProtectedRoute>
            } />
            <Route path="/trips/create" element={
              <ProtectedRoute>
                <CreateTrip />
              </ProtectedRoute>
            } />
            <Route path="/trip/edit/:id" element={
              <ProtectedRoute>
                <CreateTrip />
              </ProtectedRoute>
            } />
            <Route path="/trip/:id" element={
              <ProtectedRoute>
                <TripDetail />
              </ProtectedRoute>
            } />
            <Route path="/trip/:tripId/itinerary" element={
              <ProtectedRoute>
                <Itinerary />
              </ProtectedRoute>
            } />
            <Route path="/trip/:tripId/packing" element={
              <ProtectedRoute>
                <PackingList />
              </ProtectedRoute>
            } />
            <Route path="/trips" element={
              <ProtectedRoute>
                <MyTrips />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="/calendar" element={
              <ProtectedRoute>
                <CalendarView />
              </ProtectedRoute>
            } />
            <Route path="/community" element={
              <ProtectedRoute>
                <Community />
              </ProtectedRoute>
            } />
            <Route path="/budget" element={
              <ProtectedRoute>
                <Budget />
              </ProtectedRoute>
            } />
            <Route path="/saved" element={
              <ProtectedRoute>
                <MyTrips />
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } />
            
            {/* Admin routes - require admin role */}
            <Route path="/admin" element={
              <ProtectedRoute adminOnly>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/*" element={
              <ProtectedRoute adminOnly>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            
            {/* 404 - catch all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
