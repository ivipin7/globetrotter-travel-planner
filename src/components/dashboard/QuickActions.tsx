import { Plus, Search, Calendar, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const actions = [
  {
    icon: Plus,
    label: "New Trip",
    description: "Start planning a new adventure",
    href: "/trip/new",
    variant: "hero" as const,
  },
  {
    icon: Search,
    label: "Discover",
    description: "Find destinations & activities",
    href: "/discover",
    variant: "outline" as const,
  },
  {
    icon: Calendar,
    label: "Calendar",
    description: "View your travel timeline",
    href: "/calendar",
    variant: "outline" as const,
  },
  {
    icon: Share2,
    label: "Shared",
    description: "Trips shared with you",
    href: "/shared",
    variant: "outline" as const,
  },
];

export function QuickActions() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {actions.map((action) => (
        <Link
          key={action.label}
          to={action.href}
          className="group"
        >
          <div className={`
            card-3d p-5 h-full flex flex-col items-center text-center
            ${action.variant === "hero" ? "bg-gradient-primary text-primary-foreground" : ""}
          `}>
            <div className={`
              w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-transform group-hover:scale-110
              ${action.variant === "hero" ? "bg-white/20" : "bg-primary/10"}
            `}>
              <action.icon className={`h-6 w-6 ${action.variant === "hero" ? "" : "text-primary"}`} />
            </div>
            <h4 className="font-semibold mb-1">{action.label}</h4>
            <p className={`text-xs ${action.variant === "hero" ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
              {action.description}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}
