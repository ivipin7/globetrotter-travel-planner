import { ArrowRight, Sparkles, Globe, MapPin, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export function PremiumHero() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-16">
      {/* Animated Background */}
      <div className="absolute inset-0 gradient-hero">
        {/* Floating Orbs */}
        <div className="absolute -top-20 -right-20 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl float animate-pulse" />
        <div className="absolute top-1/2 -left-32 w-[400px] h-[400px] bg-sky/10 rounded-full blur-3xl float-delayed" />
        <div className="absolute -bottom-20 right-1/3 w-[350px] h-[350px] bg-accent/10 rounded-full blur-3xl float-slow" />
      </div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      {/* Content Container */}
      <div className="container relative z-10 px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary mb-6 glass-card hover:scale-105 transition-transform">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-medium">AI-Powered Travel Planning</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight">
            <span className="bg-gradient-to-r from-foreground via-foreground to-foreground bg-clip-text text-transparent">
              Plan Your Dream
            </span>
            <br />
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-gradient">
              Adventure Today
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            Create personalized itineraries, manage budgets, and discover amazing destinations with <span className="text-primary font-semibold">GlobeTrotter</span> — your intelligent travel companion.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link to="/signup">
              <Button
                size="lg"
                className="group h-14 px-8 text-lg font-semibold shadow-2xl hover:shadow-primary/50 transition-all duration-300 hover:scale-105"
              >
                <span className="flex items-center gap-2">
                  Start Planning Free
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </span>
              </Button>
            </Link>
            
            <Link to="/discover">
              <Button
                variant="outline"
                size="lg"
                className="h-14 px-8 text-lg font-semibold glass-card border-2 hover:bg-card/80 transition-all duration-300 hover:scale-105"
              >
                Explore Destinations
              </Button>
            </Link>
          </div>

          {/* Feature Pills */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-card/50 backdrop-blur-sm border border-border/50">
              <Globe className="h-4 w-4 text-primary" />
              <span>Multi-City Planning</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-card/50 backdrop-blur-sm border border-border/50">
              <MapPin className="h-4 w-4 text-accent" />
              <span>Smart Recommendations</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-card/50 backdrop-blur-sm border border-border/50">
              <Calendar className="h-4 w-4 text-success" />
              <span>Budget Tracking</span>
            </div>
          </div>
        </div>

        {/* Floating Cards (Desktop) */}
        <div className="hidden lg:block">
          {/* Trip Card 1 */}
          <div className="absolute top-32 right-[10%] glass-card p-4 max-w-xs float shadow-2xl hover:scale-105 transition-transform">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-xl bg-success/20 flex items-center justify-center flex-shrink-0">
                <MapPin className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Next destination</p>
                <p className="text-sm font-semibold text-foreground">Tokyo, Japan</p>
                <p className="text-xs text-muted-foreground mt-1">5 days • $1,200</p>
              </div>
            </div>
          </div>

          {/* Budget Card */}
          <div className="absolute bottom-48 left-[8%] glass-card p-4 max-w-xs float-delayed shadow-2xl hover:scale-105 transition-transform">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Trip duration</p>
                <p className="text-sm font-semibold text-foreground">14 days adventure</p>
                <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full w-3/4 bg-gradient-to-r from-primary to-accent rounded-full" />
                </div>
              </div>
            </div>
          </div>

          {/* Savings Card */}
          <div className="absolute top-1/2 left-[12%] glass-card p-4 max-w-xs float-slow shadow-2xl hover:scale-105 transition-transform">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center flex-shrink-0">
                <Sparkles className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Budget optimized</p>
                <p className="text-sm font-semibold text-success text-xl">$2,400</p>
                <p className="text-xs text-muted-foreground mt-1">Saved with AI</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </section>
  );
}
