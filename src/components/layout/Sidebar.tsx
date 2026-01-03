import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Map,
  PlusCircle,
  Compass,
  Calendar,
  Users,
  User,
  Settings,
  ChevronLeft,
  ChevronRight,
  Globe,
  Shield,
  LogOut,
  IndianRupee,
  Heart,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface NavItem {
  icon: React.ElementType;
  label: string;
  href: string;
  badge?: string;
  adminOnly?: boolean;
}

const mainNavItems: NavItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: Map, label: "My Trips", href: "/trips" },
  { icon: PlusCircle, label: "Create Trip", href: "/trip/new" },
  { icon: Compass, label: "Discover", href: "/discover" },
  { icon: Calendar, label: "Calendar", href: "/calendar" },
  { icon: IndianRupee, label: "Budget", href: "/budget" },
];

const secondaryNavItems: NavItem[] = [
  { icon: Users, label: "Community", href: "/community" },
  { icon: Heart, label: "Saved", href: "/saved" },
];

const bottomNavItems: NavItem[] = [
  { icon: User, label: "Profile", href: "/profile" },
  { icon: Settings, label: "Settings", href: "/settings" },
  { icon: Shield, label: "Admin Panel", href: "/admin", adminOnly: true },
];

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { user, logout, isAdmin } = useAuth();

  const NavLink = ({ item }: { item: NavItem }) => {
    const isActive = location.pathname === item.href || 
                     (item.href !== "/dashboard" && location.pathname.startsWith(item.href));
    const Icon = item.icon;

    // Hide admin-only items for non-admins
    if (item.adminOnly && !isAdmin) return null;

    const link = (
      <Link
        to={item.href}
        className={cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
          "hover:bg-primary/10 hover:text-primary",
          isActive 
            ? "bg-primary/15 text-primary font-medium shadow-sm" 
            : "text-muted-foreground",
          collapsed && "justify-center px-2"
        )}
      >
        <Icon className={cn("h-5 w-5 flex-shrink-0", isActive && "text-primary")} />
        {!collapsed && (
          <>
            <span className="flex-1 truncate">{item.label}</span>
            {item.badge && (
              <span className="px-2 py-0.5 text-xs bg-primary/20 text-primary rounded-full">
                {item.badge}
              </span>
            )}
          </>
        )}
      </Link>
    );

    if (collapsed) {
      return (
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>{link}</TooltipTrigger>
          <TooltipContent side="right" className="flex items-center gap-2">
            {item.label}
            {item.badge && (
              <span className="px-1.5 py-0.5 text-xs bg-primary/20 text-primary rounded-full">
                {item.badge}
              </span>
            )}
          </TooltipContent>
        </Tooltip>
      );
    }

    return link;
  };

  return (
    <aside
      className={cn(
        "flex flex-col h-screen bg-card border-r border-border/50 transition-all duration-300",
        collapsed ? "w-[70px]" : "w-[260px]",
        className
      )}
    >
      {/* Logo */}
      <div className={cn(
        "flex items-center h-16 px-4 border-b border-border/50",
        collapsed ? "justify-center" : "justify-between"
      )}>
        <Link to="/" className="flex items-center gap-2">
          <Globe className="h-8 w-8 text-primary" />
          {!collapsed && (
            <span className="text-lg font-bold">
              Globe<span className="text-primary">Trotter</span>
            </span>
          )}
        </Link>
        <Button
          variant="ghost"
          size="icon"
          className={cn("h-8 w-8", collapsed && "hidden")}
          onClick={() => setCollapsed(!collapsed)}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>

      {/* Expand button when collapsed */}
      {collapsed && (
        <Button
          variant="ghost"
          size="icon"
          className="mx-auto mt-2 h-8 w-8"
          onClick={() => setCollapsed(false)}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      )}

      {/* User Info */}
      <div className={cn(
        "p-4 border-b border-border/50",
        collapsed && "px-2 py-3"
      )}>
        <div className={cn(
          "flex items-center gap-3",
          collapsed && "justify-center"
        )}>
          <Avatar className="h-10 w-10 border-2 border-primary/20">
            <AvatarImage src={user?.profilePhotoUrl} />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {user?.fullName?.charAt(0).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{user?.fullName || "User"}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        <div className="space-y-1">
          {!collapsed && (
            <p className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Main
            </p>
          )}
          {mainNavItems.map((item) => (
            <NavLink key={item.href} item={item} />
          ))}
        </div>

        <Separator className="my-4" />

        <div className="space-y-1">
          {!collapsed && (
            <p className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Social
            </p>
          )}
          {secondaryNavItems.map((item) => (
            <NavLink key={item.href} item={item} />
          ))}
        </div>

        <Separator className="my-4" />

        <div className="space-y-1">
          {!collapsed && (
            <p className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Account
            </p>
          )}
          {bottomNavItems.map((item) => (
            <NavLink key={item.href} item={item} />
          ))}
        </div>
      </nav>

      {/* Logout Button */}
      <div className="p-3 border-t border-border/50">
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10",
            collapsed && "justify-center px-2"
          )}
          onClick={logout}
        >
          <LogOut className="h-5 w-5" />
          {!collapsed && <span>Logout</span>}
        </Button>
      </div>
    </aside>
  );
}
