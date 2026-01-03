import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  gradient?: string;
  delay?: number;
}

export function FeatureCard({
  icon: Icon,
  title,
  description,
  gradient = "from-primary/10 to-transparent",
  delay = 0,
}: FeatureCardProps) {
  return (
    <Card
      className="group relative overflow-hidden card-3d p-6 hover:scale-105 transition-all duration-300"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Background Gradient */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
      />

      <div className="relative z-10">
        {/* Icon */}
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center mb-5 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
          <Icon className="h-7 w-7 text-white" />
        </div>

        {/* Content */}
        <h3 className="text-lg font-semibold mb-2 text-foreground group-hover:text-primary transition-colors">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {description}
        </p>
      </div>

      {/* Hover Glow */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-accent/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity blur-xl -z-10" />
    </Card>
  );
}
