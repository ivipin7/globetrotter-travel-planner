import {
  Map,
  IndianRupee,
  Calendar,
  Share2,
  Sparkles,
  Globe,
  Clock,
  Users,
} from "lucide-react";
import { FeatureCard } from "@/components/premium/FeatureCard";

const features = [
  {
    icon: Map,
    title: "Multi-City Itineraries",
    description:
      "Plan seamless trips across multiple destinations with smart routing and timing suggestions.",
    gradient: "from-blue-500/10 to-transparent",
  },
  {
    icon: IndianRupee,
    title: "Smart Budget Tracking",
    description:
      "Real-time cost breakdown by category. Stay on budget with AI-powered spending insights.",
    gradient: "from-green-500/10 to-transparent",
  },
  {
    icon: Calendar,
    title: "Day-by-Day Planning",
    description:
      "Organize activities by day with drag-and-drop simplicity. Never miss a moment.",
    gradient: "from-amber-500/10 to-transparent",
  },
  {
    icon: Share2,
    title: "Easy Sharing",
    description:
      "Share itineraries with friends and family. Collaborate in real-time on group trips.",
    gradient: "from-purple-500/10 to-transparent",
  },
  {
    icon: Sparkles,
    title: "AI Recommendations",
    description:
      "Get personalized destination and activity suggestions based on your preferences.",
    gradient: "from-pink-500/10 to-transparent",
  },
  {
    icon: Globe,
    title: "Discover Destinations",
    description:
      "Explore curated destinations worldwide with insider tips and local insights.",
    gradient: "from-cyan-500/10 to-transparent",
  },
  {
    icon: Clock,
    title: "Time Zone Sync",
    description:
      "Automatic time zone adjustments keep your schedule accurate across the globe.",
    gradient: "from-orange-500/10 to-transparent",
  },
  {
    icon: Users,
    title: "Group Planning",
    description:
      "Invite travel companions to contribute ideas and vote on activities together.",
    gradient: "from-indigo-500/10 to-transparent",
  },
];

export function PremiumFeatures() {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-64 h-64 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary mb-6">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-medium">Powerful Features</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Everything you need to{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              plan perfectly
            </span>
          </h2>
          <p className="text-lg text-muted-foreground">
            From itinerary building to budget tracking, GlobeTrotter has all the
            tools you need to create unforgettable travel experiences.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <FeatureCard
              key={feature.title}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              gradient={feature.gradient}
              delay={index * 100}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
