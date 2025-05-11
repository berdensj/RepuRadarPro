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
  CreditCard,
  FileText,
  LayoutDashboard,
  FileCog,
  Clock,
  Import,
  Workflow,
  Paintbrush,
  Code
} from "lucide-react";
import { useLocation } from "wouter";
import { useIsMobile } from "@/hooks/use-mobile";

interface SidebarProps {
  className?: string;
}

type NavItemType = {
  icon: React.ComponentType<any>;
  label: string;
  href: string;
};

type SeparatorType = {
  type: 'separator';
  label: string;
};

type NavItem = NavItemType | SeparatorType;

export function Sidebar({ className }: SidebarProps) {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();
  
  // Group navigation items by category
  const mainNavItems = [
    { icon: BarChart2, label: "Dashboard", href: "/" },
    { icon: Star, label: "Reviews", href: "/reviews" },
    { icon: Bell, label: "Alerts", href: "/alerts" },
    { icon: MessageSquare, label: "AI Responses", href: "/responses" },
    { icon: Send, label: "Review Requests", href: "/review-requests" },
  ];
  
  const analyticsItems = [
    { icon: ChartPieIcon, label: "Analytics", href: "/analytics" },
    { icon: FileText, label: "Reports", href: "/reports" },
    { icon: UsersRound, label: "Competitors", href: "/competitors" },
    { icon: LayoutDashboard, label: "Dashboard Builder", href: "/dashboard-builder" },
  ];
  
  const managementItems = [
    { icon: MessageSquare, label: "Communications", href: "/communications" },
    { icon: Import, label: "Import/Export", href: "/import-export" },
    { icon: Workflow, label: "Workflows", href: "/workflows" },
    { icon: Clock, label: "Activity Logs", href: "/activity-logs" },
    { icon: FileCog, label: "Templates", href: "/templates" },
  ];
  
  const configItems = [
    { icon: Code, label: "API Access", href: "/api-access" },
    { icon: Paintbrush, label: "White Label", href: "/white-label" },
    { icon: Plug, label: "Integrations", href: "/integrations" },
    { icon: Settings, label: "Settings", href: "/settings" },
  ];
  
  const accountItems = [
    { icon: User, label: "Profile", href: "/profile" },
    { icon: CreditCard, label: "Subscription", href: "/subscription" },
    { icon: HelpCircle, label: "Help & Support", href: "/help" },
  ];
  
  // Create separator items with the correct type
  const analyticsSeparator: SeparatorType = { type: 'separator', label: 'Analytics' };
  const managementSeparator: SeparatorType = { type: 'separator', label: 'Management' };
  const configSeparator: SeparatorType = { type: 'separator', label: 'Configuration' };
  const accountSeparator: SeparatorType = { type: 'separator', label: 'Account' };
  
  // Combine all navigation items for rendering
  const baseNavItems: NavItem[] = [
    ...mainNavItems,
    analyticsSeparator,
    ...analyticsItems,
    managementSeparator,
    ...managementItems,
    configSeparator,
    ...configItems,
    accountSeparator,
    ...accountItems,
  ];
  
  // Admin-only navigation items
  const adminNavItems = [
    { icon: ShieldCheck, label: "Admin Dashboard", href: "/admin" },
  ];
  
  // Combine nav items based on user role
  const navItems: NavItem[] = user?.role === 'admin' 
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
        <nav className={cn("lg:block flex-grow overflow-y-auto", isMobile && !mobileMenuOpen && "hidden")}>
          <ul className="space-y-1">
            {navItems.map((item, index) => {
              // Function to check if item is a separator
              const isSeparator = (item: NavItem): item is SeparatorType => 
                'type' in item && item.type === 'separator';
              
              // Function to check if item is a navigation item
              const isNavItem = (item: NavItem): item is NavItemType => 
                'href' in item && 'icon' in item;
              
              // Render separator
              if (isSeparator(item)) {
                return (
                  <li key={`separator-${index}`} className="pt-3 pb-1">
                    <div className="mx-4">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        {item.label}
                      </p>
                      <div className="mt-1 border-t border-slate-200"></div>
                    </div>
                  </li>
                );
              }
              
              // Render regular nav item
              if (isNavItem(item)) {
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
              }
              
              return null;
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
