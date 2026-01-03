import { ArrowRight, Globe, Plane, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export function CTASection() {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-primary" />
      
      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 left-10 opacity-20">
          <Globe className="h-32 w-32 text-white animate-spin-slow" />
        </div>
        <div className="absolute bottom-10 right-10 opacity-20">
          <Plane className="h-24 w-24 text-white float" />
        </div>
        <div className="absolute top-1/2 right-1/4 opacity-20">
          <MapPin className="h-16 w-16 text-white float-delayed" />
        </div>
        
        {/* Gradient Orbs */}
        <div className="absolute -top-20 -left-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-white mb-6">
            Ready to start your next adventure?
          </h2>
          <p className="text-xl text-white/80 mb-10">
            Join thousands of travelers who plan smarter, save more, and experience more with GlobeTrotter.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button 
              size="xl" 
              className="w-full sm:w-auto bg-white text-primary hover:bg-white/90 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
              asChild
            >
              <Link to="/dashboard">
                Start Planning Now
                <ArrowRight className="h-5 w-5 ml-2" />
              </Link>
            </Button>
            <Button 
              variant="ghost" 
              size="xl" 
              className="w-full sm:w-auto text-white hover:bg-white/10 border-2 border-white/30"
              asChild
            >
              <Link to="/discover">
                Browse Destinations
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
