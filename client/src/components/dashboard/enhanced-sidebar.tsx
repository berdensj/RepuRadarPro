import { useState, useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/hooks/use-theme";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { ColorPalettePicker } from "@/components/ui/color-palette-picker";
import { 
  ChartLine, 
  LogOut, 
  Menu, 
  X,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Moon,
  Sun,
  Paintbrush,
  Bell,
  MessageSquare,
  Star,
  Send,
  ChartPieIcon,
  FileText,
  LayoutDashboard,
  Users,
  Settings,
  User,
  CreditCard,
  HelpCircle,
  Code,
  BarChart2
} from "lucide-react";
import { useLocation } from "wouter";
import { useIsMobile } from "@/hooks/use-mobile";

interface SidebarProps {
  className?: string;
}

interface NavItem {
  icon: React.ComponentType<any>;
  label: string;
  href: string;
  badge?: number;
  children?: NavItem[];
}

export function EnhancedSidebar({ className }: SidebarProps) {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  
  // Navigation items - normally this would come from a configuration or API
  const navItems: NavItem[] = [
    {
      icon: BarChart2,
      label: "Dashboard",
      href: "/dashboard",
    },
    {
      icon: Star,
      label: "Reviews",
      href: "/reviews",
      badge: 5, // Unread reviews count
    },
    {
      icon: MessageSquare,
      label: "AI Responses",
      href: "/responses",
    },
    {
      icon: Send,
      label: "Review Requests",
      href: "/review-requests",
    },
    {
      icon: Bell,
      label: "Alerts",
      href: "/alerts",
      badge: 3, // Unread alerts count
    },
    {
      icon: ChartPieIcon,
      label: "Analytics",
      href: "/analytics",
      children: [
        {
          icon: ChartPieIcon,
          label: "Analytics",
          href: "/analytics",
        },
        {
          icon: FileText,
          label: "Reports",
          href: "/reports",
        },
        {
          icon: Users,
          label: "Competitors",
          href: "/competitors",
        },
        {
          icon: LayoutDashboard,
          label: "Dashboard Builder",
          href: "/dashboard-builder",
        }
      ]
    },
    {
      icon: Settings,
      label: "Settings",
      href: "/settings",
    },
    {
      icon: User,
      label: "Profile",
      href: "/profile",
    },
    {
      icon: CreditCard,
      label: "Subscription",
      href: "/subscription",
    },
    {
      icon: HelpCircle,
      label: "Help & Support",
      href: "/help",
    }
  ];
  
  // Find active item
  const isActiveRoute = (href: string) => location === href;
  const hasActiveChild = (item: NavItem) => 
    item.children?.some(child => isActiveRoute(child.href));
  
  // Toggle sidebar on desktop
  const toggleSidebar = () => {
    const newState = !collapsed;
    setCollapsed(newState);
    
    // Save to localStorage
    try {
      localStorage.setItem('sidebar_collapsed', String(newState));
    } catch (e) {
      // Ignore storage errors
    }
    
    // Announce to screen readers
    const announcement = newState
      ? "Sidebar collapsed. Press Alt+S to expand."
      : "Sidebar expanded. Press Alt+S to collapse.";
    
    // Create a visually hidden announcement for screen readers
    const announcer = document.getElementById('sidebar-announcer');
    if (announcer) {
      announcer.textContent = announcement;
    }
  };
  
  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // Toggle sidebar on Alt+S
    if (e.altKey && e.key === 's') {
      e.preventDefault();
      toggleSidebar();
    }
    
    // Close mobile menu on Escape
    if (e.key === 'Escape' && mobileOpen) {
      setMobileOpen(false);
    }
  }, [mobileOpen]);
  
  // Close sidebar on click outside (mobile only)
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        isMobile &&
        mobileOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(e.target as Node)
      ) {
        setMobileOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobile, mobileOpen]);
  
  // Load collapsed state from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('sidebar_collapsed');
      if (saved !== null) {
        setCollapsed(saved === 'true');
      }
    } catch (e) {
      // Ignore storage errors
    }
  }, []);
  
  return (
    <TooltipProvider>
      {/* Screen reader announcer for a11y */}
      <div
        id="sidebar-announcer"
        className="sr-only"
        aria-live="polite"
        aria-atomic="true"
      ></div>
      
      {/* Mobile Menu Button (always visible on mobile) */}
      {isMobile && (
        <Button
          variant="outline"
          size="icon"
          className="fixed left-4 top-4 z-50 lg:hidden"
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      )}
      
      {/* Overlay for mobile */}
      {mobileOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}
      
      {/* The Sidebar */}
      <div
        ref={sidebarRef}
        className={cn(
          "bg-white dark:bg-gray-900 border-r border-slate-200 dark:border-gray-800",
          "z-50 transition-all duration-300",
          "fixed lg:sticky top-0 h-screen",
          collapsed ? "lg:w-16" : "lg:w-64", 
          isMobile
            ? mobileOpen
              ? "w-64 translate-x-0 shadow-xl"
              : "w-0 -translate-x-full"
            : "translate-x-0",
          className
        )}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="flex flex-col h-full">
          {/* Mobile Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-gray-800 lg:hidden">
            <div className="text-primary text-xl font-bold flex items-center">
              <ChartLine className="h-5 w-5 mr-2" />
              RepuRadar
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setMobileOpen(false)} 
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          {/* Desktop Header */}
          <div className={cn(
            "hidden lg:flex items-center p-4 border-b border-slate-200 dark:border-gray-800",
            collapsed ? "justify-center" : "justify-between"
          )}>
            {!collapsed && (
              <div className="text-primary text-xl font-bold flex items-center">
                <ChartLine className="h-5 w-5 mr-2" />
                RepuRadar
              </div>
            )}
            {collapsed && (
              <ChartLine className="h-6 w-6 text-primary" />
            )}
            
            <Button 
              variant="ghost" 
              size="icon" 
              className={cn("h-8 w-8", collapsed && "hidden")}
              onClick={toggleSidebar}
              aria-label="Collapse sidebar"
              title="Collapse sidebar (Alt+S)"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </div>
          
          {/* Toggle button when collapsed */}
          {collapsed && (
            <Button
              variant="ghost"
              size="icon"
              className="hidden lg:flex h-8 w-8 mx-auto mt-2"
              onClick={toggleSidebar}
              aria-label="Expand sidebar"
              title="Expand sidebar (Alt+S)"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          )}
          
          {/* Search bar - only when expanded */}
          {!collapsed && (
            <div className="p-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full pl-8 pr-3 py-1.5 text-sm rounded-md border border-slate-200 dark:border-gray-700 
                    dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>
          )}
          
          {/* Navigation Items */}
          <nav className="flex-grow overflow-y-auto p-2" aria-label="Main">
            <ul className="space-y-1">
              {navItems.map((item) => {
                const isActive = isActiveRoute(item.href);
                const isActiveParent = hasActiveChild(item);
                const Icon = item.icon;
                
                // Regular menu item (no children)
                if (!item.children) {
                  return (
                    <li key={item.href}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <a
                            href={item.href}
                            className={cn(
                              "flex items-center rounded-md transition-colors",
                              collapsed ? "justify-center py-2 px-2" : "py-2 px-3",
                              isActive 
                                ? "bg-primary/10 text-primary font-medium" 
                                : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                            )}
                            aria-current={isActive ? "page" : undefined}
                          >
                            <div className="relative">
                              <Icon className={collapsed ? "h-5 w-5" : "h-4 w-4 mr-3"} />
                              {item.badge && (
                                <span
                                  className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white"
                                  aria-label={`${item.badge} unread ${item.label.toLowerCase()}`}
                                >
                                  {item.badge}
                                </span>
                              )}
                            </div>
                            {!collapsed && (
                              <span className="text-sm">{item.label}</span>
                            )}
                          </a>
                        </TooltipTrigger>
                        {collapsed && (
                          <TooltipContent side="right">
                            <div className="flex flex-col">
                              <span>{item.label}</span>
                              {item.badge && (
                                <span className="text-xs text-gray-500">
                                  {item.badge} unread
                                </span>
                              )}
                            </div>
                          </TooltipContent>
                        )}
                      </Tooltip>
                    </li>
                  );
                }
                
                // Expandable menu item with children
                // Note: This is a simplified implementation that doesn't track expanded state
                // You would need to add state tracking for expanded groups
                return (
                  <li key={item.href}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div>
                          <button
                            className={cn(
                              "flex items-center w-full rounded-md transition-colors",
                              collapsed ? "justify-center py-2 px-2" : "justify-between py-2 px-3",
                              (isActive || isActiveParent)
                                ? "bg-primary/10 text-primary font-medium" 
                                : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                            )}
                            aria-expanded={isActiveParent}
                            aria-controls={`${item.label.toLowerCase()}-submenu`}
                          >
                            <div className="flex items-center">
                              <div className="relative">
                                <Icon className={collapsed ? "h-5 w-5" : "h-4 w-4 mr-3"} />
                                {item.badge && (
                                  <span
                                    className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white"
                                    aria-label={`${item.badge} unread ${item.label.toLowerCase()}`}
                                  >
                                    {item.badge}
                                  </span>
                                )}
                              </div>
                              {!collapsed && (
                                <span className="text-sm">{item.label}</span>
                              )}
                            </div>
                            {!collapsed && (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </button>
                          
                          {/* Children submenu - would normally toggle with the expanded state */}
                          {!collapsed && (
                            <ul
                              id={`${item.label.toLowerCase()}-submenu`}
                              className="mt-1 ml-9 space-y-1 border-l border-gray-200 dark:border-gray-700 pl-2"
                            >
                              {item.children.map((child) => (
                                <li key={child.href}>
                                  <a
                                    href={child.href}
                                    className={cn(
                                      "flex items-center py-1.5 px-3 rounded-md transition-colors text-sm",
                                      isActiveRoute(child.href)
                                        ? "bg-primary/10 text-primary font-medium" 
                                        : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                                    )}
                                    aria-current={isActiveRoute(child.href) ? "page" : undefined}
                                  >
                                    <child.icon className="h-3.5 w-3.5 mr-2" />
                                    <span>{child.label}</span>
                                  </a>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </TooltipTrigger>
                      {collapsed && (
                        <TooltipContent side="right">
                          <div className="flex flex-col">
                            <span>{item.label}</span>
                            {item.badge && (
                              <span className="text-xs text-gray-500">
                                {item.badge} unread
                              </span>
                            )}
                          </div>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </li>
                );
              })}
            </ul>
          </nav>
          
          {/* Footer with user info and theme toggle */}
          <div className="mt-auto border-t border-slate-200 dark:border-gray-800 p-4">
            <div className={cn("flex", collapsed ? "flex-col items-center" : "items-center space-x-3")}>
              <div className="flex-shrink-0">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Avatar className={cn("h-8 w-8", collapsed && "cursor-pointer mb-2")}>
                      <AvatarImage src={user?.profilePicture || ""} alt={user?.fullName || "User"} />
                      <AvatarFallback>
                        {user?.fullName?.charAt(0) || user?.email?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </TooltipTrigger>
                  {collapsed && (
                    <TooltipContent side="right">
                      <div className="flex flex-col">
                        <span>{user?.fullName || user?.email}</span>
                        <span className="text-xs text-gray-500">{user?.plan || "Free"} Plan</span>
                      </div>
                    </TooltipContent>
                  )}
                </Tooltip>
              </div>
              
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {user?.fullName || user?.email}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {user?.plan || "Free"} Plan
                  </p>
                </div>
              )}
              
              <div className={cn("flex", collapsed ? "flex-col space-y-2" : "space-x-1")}>
                <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-7 w-7" aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
                  {theme === 'dark' ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
                </Button>
                
                <Button variant="ghost" size="icon" className="h-7 w-7" aria-label="Customize theme">
                  <Paintbrush className="h-3.5 w-3.5" />
                </Button>
                
                <Button variant="ghost" size="icon" onClick={() => logoutMutation.mutate()} className="h-7 w-7" aria-label="Sign out">
                  <LogOut className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}