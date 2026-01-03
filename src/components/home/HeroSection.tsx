import { ArrowRight, MapPin, Calendar, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden gradient-hero pt-16">
      {/* Floating Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Large floating circle */}
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl float" />
        <div className="absolute top-1/2 -left-32 w-80 h-80 bg-sky/10 rounded-full blur-3xl float-delayed" />
        <div className="absolute -bottom-20 right-1/3 w-72 h-72 bg-accent/10 rounded-full blur-3xl float-slow" />
        
        {/* Decorative floating cards */}
        <div className="absolute top-32 right-[15%] glass-card p-4 float hidden lg:block">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center">
              <MapPin className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Next destination</p>
              <p className="text-sm font-medium">Tokyo, Japan</p>
            </div>
          </div>
        </div>

        <div className="absolute bottom-40 left-[10%] glass-card p-4 float-delayed hidden lg:block">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
              <Calendar className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Trip duration</p>
              <p className="text-sm font-medium">15 days adventure</p>
            </div>
          </div>
        </div>

        <div className="absolute top-1/2 left-[8%] glass-card p-4 float-slow hidden xl:block">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Budget saved</p>
              <p className="text-sm font-medium text-success">$2,500</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8 animate-slide-up">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">AI-Powered Travel Planning</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6 animate-slide-up" style={{ animationDelay: "0.1s" }}>
            Plan your perfect trip
            <span className="block text-gradient-primary mt-2 bg-clip-text">with confidence</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-slide-up leading-relaxed" style={{ animationDelay: "0.2s" }}>
            Create stunning itineraries, manage budgets, and discover hidden gems. 
            GlobeTrotter makes travel planning <span className="text-primary font-semibold">effortless and delightful</span>.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: "0.3s" }}>
            <Button variant="hero" size="xl" asChild className="w-full sm:w-auto shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <Link to="/dashboard">
                Start Planning Free
                <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button variant="hero-outline" size="xl" asChild className="w-full sm:w-auto">
              <Link to="/discover">
                Explore Destinations
              </Link>
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="mt-16 animate-slide-up" style={{ animationDelay: "0.4s" }}>
            <p className="text-sm text-muted-foreground mb-4">Trusted by travelers worldwide</p>
            <div className="flex flex-wrap items-center justify-center gap-8">
              <div className="text-center">
                <p className="text-2xl font-semibold text-foreground">55K+</p>
                <p className="text-xs text-muted-foreground">Trips Planned</p>
              </div>
              <div className="w-px h-10 bg-border hidden sm:block" />
              <div className="text-center">
                <p className="text-2xl font-semibold text-foreground">125+</p>
                <p className="text-xs text-muted-foreground">Countries</p>
              </div>
              <div className="w-px h-10 bg-border hidden sm:block" />
              <div className="text-center">
                <p className="text-2xl font-semibold text-foreground">4.9</p>
                <p className="text-xs text-muted-foreground">User Rating</p>
              </div>
              <div className="w-px h-10 bg-border hidden sm:block" />
              <div className="text-center">
                <p className="text-2xl font-semibold text-success">$2M+</p>
                <p className="text-xs text-muted-foreground">Savings</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
