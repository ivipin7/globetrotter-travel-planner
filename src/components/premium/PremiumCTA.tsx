import { ArrowRight, Sparkles, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const benefits = [
  "Free forever for basic features",
  "No credit card required",
  "Unlimited trip planning",
  "Export to PDF & share anywhere",
];

export function PremiumCTA() {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 gradient-primary opacity-5" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px]" />

      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl float" />
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-accent/10 rounded-full blur-3xl float-delayed" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Card */}
          <div className="glass-card p-8 md:p-12 rounded-3xl shadow-2xl relative overflow-hidden">
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
            
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 text-center">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30 text-primary mb-6">
                <Sparkles className="h-4 w-4" />
                <span className="text-sm font-semibold">Start Your Journey Today</span>
              </div>

              {/* Heading */}
              <h2 className="text-3xl md:text-5xl font-bold mb-6">
                Ready to plan your{" "}
                <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent bg-[length:200%_100%] animate-gradient">
                  dream adventure?
                </span>
              </h2>

              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Join thousands of travelers who use GlobeTrotter to create
                unforgettable experiences. Start planning for free today.
              </p>

              {/* Benefits */}
              <div className="flex flex-wrap justify-center gap-4 mb-8">
                {benefits.map((benefit) => (
                  <div
                    key={benefit}
                    className="flex items-center gap-2 text-sm text-muted-foreground"
                  >
                    <div className="h-5 w-5 rounded-full bg-success/20 flex items-center justify-center">
                      <Check className="h-3 w-3 text-success" />
                    </div>
                    {benefit}
                  </div>
                ))}
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/signup">
                  <Button
                    size="lg"
                    className="h-14 px-8 text-lg font-semibold shadow-xl hover:shadow-2xl hover:shadow-primary/50 transition-all duration-300 hover:scale-105 group"
                  >
                    Get Started Free
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <Link to="/discover">
                  <Button
                    variant="outline"
                    size="lg"
                    className="h-14 px-8 text-lg font-semibold border-2 hover:bg-primary/5 transition-all duration-300"
                  >
                    Explore Destinations
                  </Button>
                </Link>
              </div>

              {/* Trust Badge */}
              <p className="mt-8 text-sm text-muted-foreground">
                🔒 No credit card required • 🌍 Available worldwide • ⭐ 4.9/5 rating
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
