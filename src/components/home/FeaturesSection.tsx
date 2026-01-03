import { 
  Route, 
  Wallet, 
  Calendar, 
  MapPin, 
  Share2, 
  Sparkles,
  ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";

const features = [
  {
    icon: Route,
    title: "Smart Itinerary Builder",
    description: "Drag-and-drop interface to craft your perfect journey. Organize cities, activities, and timelines with ease.",
    color: "primary",
    gradient: "from-primary/20 to-primary/5",
  },
  {
    icon: Wallet,
    title: "Budget Tracking",
    description: "Real-time cost breakdown across transport, stays, activities, and meals. Never exceed your budget.",
    color: "success",
    gradient: "from-success/20 to-success/5",
  },
  {
    icon: Calendar,
    title: "Visual Timeline",
    description: "See your entire trip at a glance with our beautiful calendar view. Plan day by day effortlessly.",
    color: "accent",
    gradient: "from-accent/20 to-accent/5",
  },
  {
    icon: MapPin,
    title: "Destination Discovery",
    description: "Explore thousands of destinations with cost indexes, popularity scores, and insider tips.",
    color: "sky",
    gradient: "from-sky/20 to-sky/5",
  },
  {
    icon: Share2,
    title: "Trip Sharing",
    description: "Share your itineraries with friends and family. Collaborate in real-time or publish for others to copy.",
    color: "ocean",
    gradient: "from-ocean/20 to-ocean/5",
  },
  {
    icon: Sparkles,
    title: "AI Recommendations",
    description: "Get personalized suggestions based on your preferences, budget, and travel style.",
    color: "sunset",
    gradient: "from-sunset/20 to-sunset/5",
  },
];

const colorMap: Record<string, string> = {
  primary: "text-primary bg-primary/10 group-hover:bg-primary/20",
  success: "text-success bg-success-light group-hover:bg-success/20",
  accent: "text-accent bg-accent-light group-hover:bg-accent/20",
  sky: "text-sky bg-sky-light group-hover:bg-sky/20",
  ocean: "text-ocean bg-ocean/10 group-hover:bg-ocean/20",
  sunset: "text-sunset bg-sunset/10 group-hover:bg-sunset/20",
};

export function FeaturesSection() {
  return (
    <section className="py-24 bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 mb-6 hover:bg-secondary/70 transition-colors">
            <Sparkles className="h-4 w-4 text-primary animate-pulse" />
            <span className="text-sm font-medium text-foreground">Powerful Features</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            Everything you need to
            <span className="text-gradient-primary block">plan amazing trips</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            From inspiration to itinerary, GlobeTrotter has you covered with tools designed to make travel planning a joy.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group card-3d p-6 lg:p-8 cursor-pointer"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Icon */}
              <div className={cn(
                "w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-all duration-300",
                colorMap[feature.color]
              )}>
                <feature.icon className="h-7 w-7" />
              </div>

              {/* Content */}
              <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                {feature.description}
              </p>

              {/* Learn More Link */}
              <div className="flex items-center text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                Learn more
                <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
