import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  BarChart2, 
  Bell, 
  ChartPieIcon, 
  ChartLine, 
  LogOut, 
  Menu, 
  MessageSquare, 
  Settings, 
  Star, 
  X,
  Plug,
  Send,
  UsersRound,
  User,
  HelpCircle,
  ShieldCheck,
  CreditCard
} from "lucide-react";
import { useLocation } from "wouter";
import { useIsMobile } from "@/hooks/use-mobile";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();
  
  const baseNavItems = [
    { icon: BarChart2, label: "Dashboard", href: "/" },
    { icon: Star, label: "Reviews", href: "/reviews" },
    { icon: Bell, label: "Alerts", href: "/alerts" },
    { icon: MessageSquare, label: "AI Responses", href: "/responses" },
    { icon: Send, label: "Review Requests", href: "/review-requests" },
    { icon: UsersRound, label: "Competitors", href: "/competitors" },
    { icon: ChartPieIcon, label: "Analytics", href: "/analytics" },
    { icon: Plug, label: "Integrations", href: "/integrations" },
    { icon: Settings, label: "Settings", href: "/settings" },
    { icon: User, label: "Profile", href: "/profile" },
    { icon: CreditCard, label: "Subscription", href: "/subscription" },
    { icon: HelpCircle, label: "Help & Support", href: "/help" },
  ];
  
  // Admin-only navigation items
  const adminNavItems = [
    { icon: ShieldCheck, label: "Admin Dashboard", href: "/admin" },
  ];
  
  // Combine nav items based on user role
  const navItems = user?.role === 'admin' 
    ? [...baseNavItems, ...adminNavItems] 
    : baseNavItems;
  
  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  return (
    <aside className={cn("w-full lg:w-64 bg-white border-r border-slate-200 z-10", className)}>
      <div className="sticky top-0 p-4 flex flex-col h-full">
        {/* Mobile Menu Toggle */}
        <div className="flex items-center justify-between lg:hidden mb-4">
          <div className="text-primary text-xl font-bold flex items-center">
            <ChartLine className="h-5 w-5 mr-2" />
            RepuRadar
          </div>
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
              className="mr-1"
            >
              <LogOut className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="sm" onClick={toggleMobileMenu}>
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
        
        {/* Desktop Logo */}
        <div className="hidden lg:flex items-center mb-8 mt-2">
          <div className="text-primary text-xl font-bold flex items-center">
            <ChartLine className="h-5 w-5 mr-2" />
            RepuRadar
          </div>
        </div>
        
        {/* Nav Links */}
        <nav className={cn("lg:block flex-grow", isMobile && !mobileMenuOpen && "hidden")}>
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = location === item.href;
              const Icon = item.icon;
              
              return (
                <li key={item.href}>
                  <a 
                    href={item.href} 
                    className={cn(
                      "py-2 px-4 flex items-center text-sm font-medium rounded-md transition-colors",
                      isActive 
                        ? "bg-slate-100 text-primary" 
                        : "text-slate-700 hover:bg-slate-100"
                    )}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {item.label}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
        
        {/* User Profile */}
        <div className={cn("mt-auto pt-4 border-t border-slate-200", isMobile && !mobileMenuOpen && "hidden")}>
          <div className="flex items-center px-4 py-2">
            <Avatar className="h-9 w-9 mr-3">
              {user?.profilePicture ? (
                <AvatarImage src={user.profilePicture} alt={user.fullName || ''} />
              ) : (
                <AvatarFallback>{user?.fullName?.charAt(0) || "U"}</AvatarFallback>
              )}
            </Avatar>
            <div>
              <p className="text-sm font-medium truncate">{user?.fullName}</p>
              <p className="text-xs text-slate-500 truncate">{user?.plan || "Free"} Plan</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="mt-2 w-full justify-start text-slate-600 hover:text-primary"
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
          >
            <LogOut className="h-4 w-4 mr-2" />
            {logoutMutation.isPending ? "Signing out..." : "Sign out"}
          </Button>
        </div>
      </div>
    </aside>
  );
}
