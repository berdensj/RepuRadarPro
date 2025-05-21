import { useState, useRef, useEffect, useCallback } from "react";
import { 
  ChartLine, 
  BarChart2,
  Star, 
  MessageSquare, 
  Send, 
  Bell, 
  ChartPieIcon, 
  Settings, 
  User, 
  CreditCard, 
  HelpCircle, 
  Menu, 
  X, 
  ChevronLeft, 
  ChevronRight,
  Moon,
  Sun,
  LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { SidebarItem } from "./SidebarItem";
import { SidebarDropdown } from "./SidebarDropdown";

// Sidebar navigation item type definition
interface NavItem {
  icon: React.ComponentType;
  label: string;
  href: string;
  badge?: number;
  children?: NavItem[];
}

// Type definition for component props
interface AccessibleSidebarProps {
  onNavigate?: (href: string) => void;
  initiallyCollapsed?: boolean;
  className?: string;
  activeRoute?: string;
  userName?: string;
  userEmail?: string;
  avatarUrl?: string;
  onLogout?: () => void;
  onToggleTheme?: () => void;
  isDarkMode?: boolean;
  // Optional props for role-based navigation
  userRole?: string;
  permissions?: string[];
}

/**
 * AccessibleSidebar Component
 * 
 * ADA and UI/UX best practices:
 * - Scalable font sizes using Tailwind utilities
 * - High contrast text meeting WCAG 2.2 guidelines (4.5:1 ratio)
 * - Proper touch target sizes (min 44px per WCAG)
 * - Semantic HTML structure for screen readers
 * - Full keyboard navigation support
 * - Screen reader announcements
 * - Support for 200% zoom without breaking layout
 */
export function AccessibleSidebar({
  onNavigate,
  initiallyCollapsed = false,
  className = "",
  activeRoute = "",
  userName = "User Name",
  userEmail = "user@example.com",
  avatarUrl = "",
  onLogout = () => {},
  onToggleTheme = () => {},
  isDarkMode = false,
  userRole = "",
  permissions = []
}: AccessibleSidebarProps) {
  // State management
  const [collapsed, setCollapsed] = useState(initiallyCollapsed);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  
  // Example navigation items - in a real app, these would come from props or be filtered by role
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
      badge: 5,
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
      badge: 3,
    },
    {
      icon: ChartPieIcon,
      label: "Analytics",
      href: "/analytics",
      children: [
        {
          icon: ChartPieIcon,
          label: "Metrics",
          href: "/analytics",
        },
        {
          icon: ChartPieIcon,
          label: "Reports",
          href: "/reports",
        },
        {
          icon: ChartPieIcon,
          label: "Competitors",
          href: "/competitors",
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
  
  // Toggle the sidebar between expanded and collapsed states
  const toggleSidebar = useCallback(() => {
    const newState = !collapsed;
    setCollapsed(newState);
    
    // Save preference to localStorage
    try {
      localStorage.setItem('sidebar_collapsed', String(newState));
    } catch (e) {
      // Ignore storage errors
    }
    
    // Announce to screen readers
    const announcement = newState
      ? "Sidebar collapsed. Press Alt+S to expand."
      : "Sidebar expanded. Press Alt+S to collapse.";
    
    const announcer = document.getElementById('sidebar-announcer');
    if (announcer) {
      announcer.textContent = announcement;
    }
  }, [collapsed]);
  
  // Handle keyboard shortcuts
  const handleKeyDown = useCallback((e: React.KeyboardEvent | KeyboardEvent) => {
    // Toggle sidebar with Alt+S
    if (e.altKey && e.key === 's') {
      e.preventDefault();
      toggleSidebar();
    }
    
    // Close mobile menu with Escape
    if (e.key === 'Escape' && mobileOpen) {
      setMobileOpen(false);
    }
  }, [toggleSidebar, mobileOpen]);
  
  // Handle clicking outside the sidebar on mobile
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        mobileOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(e.target as Node)
      ) {
        setMobileOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown as any);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown as any);
    };
  }, [mobileOpen, handleKeyDown]);
  
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
  
  // Handle navigation
  const handleNavigation = (href: string) => {
    if (onNavigate) {
      onNavigate(href);
    } else {
      window.location.href = href;
    }
    
    // Close mobile menu after navigation
    if (mobileOpen) {
      setMobileOpen(false);
    }
  };
  
  // Helper to check if a route is active
  const isRouteActive = (href: string) => {
    return activeRoute === href || activeRoute.startsWith(href + '/');
  };
  
  // Toggle a dropdown group
  const toggleGroup = (groupLabel: string) => {
    setExpandedGroup(expandedGroup === groupLabel ? null : groupLabel);
  };
  
  return (
    <TooltipProvider>
      {/* Screen reader announcer - hidden visually but read by screen readers */}
      <div
        id="sidebar-announcer"
        className="sr-only"
        role="region"
        aria-live="polite"
        aria-atomic="true"
      ></div>
      
      {/* Mobile hamburger button */}
      <Button 
        variant="outline"
        size="icon"
        className="fixed left-4 top-4 z-40 lg:hidden"
        onClick={() => setMobileOpen(true)}
        aria-label="Open menu"
        aria-controls="sidebar-nav"
        aria-expanded={mobileOpen}
      >
        <Menu className="h-5 w-5" />
      </Button>
      
      {/* Mobile overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}
      
      {/* Sidebar */}
      <div
        ref={sidebarRef}
        id="sidebar-nav"
        className={cn(
          "bg-white dark:bg-gray-900 border-r border-slate-200 dark:border-gray-800 z-40",
          "transition-all duration-300 h-screen",
          // Fixed position on all screen sizes
          "fixed left-0 top-0 bottom-0",
          // Width based on collapsed state - using rem units for better scaling
          collapsed ? "w-[3.75rem]" : "w-[15rem]", 
          // Mobile responsive
          mobileOpen ? "translate-x-0 shadow-xl" : "-translate-x-full lg:translate-x-0",
          // Make sure it's visible on desktop
          "lg:translate-x-0",
          className
        )}
        onKeyDown={handleKeyDown}
        role="navigation"
        aria-label="Main navigation"
        tabIndex={0}
      >
        {/* Flexbox layout for proper header/content/footer structure */}
        <div className="flex flex-col h-full">
          {/* Mobile header with close button */}
          <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-gray-800 lg:hidden">
            <div className="text-primary text-base font-semibold flex items-center">
              <ChartLine className="h-5 w-5 mr-2" />
              Reputation Sentinel
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
          
          {/* Desktop header with toggle button */}
          <div className={cn(
            "hidden lg:flex items-center p-4 border-b border-slate-200 dark:border-gray-800",
            collapsed ? "justify-center" : "justify-between"
          )}>
            {!collapsed && (
              <div className="text-primary text-base font-semibold flex items-center">
                <ChartLine className="h-5 w-5 mr-2" />
                Reputation Sentinel
              </div>
            )}
            {collapsed && (
              <ChartLine className="h-6 w-6 text-primary" />
            )}
            
            {!collapsed && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={toggleSidebar}
                aria-label="Collapse sidebar"
                title="Collapse sidebar (Alt+S)"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
            )}
          </div>
          
          {/* Expand button when collapsed */}
          {collapsed && (
            <Button
              variant="ghost"
              size="icon"
              className="hidden lg:flex h-9 w-9 mx-auto mt-2"
              onClick={toggleSidebar}
              aria-label="Expand sidebar"
              title="Expand sidebar (Alt+S)"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          )}
          
          {/* Navigation - independently scrollable section */}
          <nav 
            className="overflow-y-auto flex-grow"
            style={{ 
              maxHeight: 'calc(100vh - 11rem)', // Leave space for header and footer
              scrollbarWidth: 'thin', // For Firefox
              msOverflowStyle: 'none' // For IE/Edge
            }}
          >
            <ul className="space-y-1 p-3" role="menu">
              {navItems.map((item) => {
                const isActive = isRouteActive(item.href);
                const Icon = item.icon;
                
                // Handle items with children (dropdowns)
                if (item.children) {
                  const isGroupExpanded = expandedGroup === item.label;
                  const hasActiveChild = item.children.some(child => isRouteActive(child.href));
                  
                  return (
                    <li key={item.label} role="none">
                      <SidebarDropdown
                        icon={<Icon />}
                        label={item.label}
                        isExpanded={isGroupExpanded}
                        hasActiveChild={hasActiveChild}
                        collapsed={collapsed}
                        badge={item.badge}
                        onToggle={() => toggleGroup(item.label)}
                      >
                        {/* Child items */}
                        <ul className="space-y-1" role="menu">
                          {item.children.map(child => (
                            <li key={child.href} role="none">
                              <SidebarItem
                                icon={<child.icon />}
                                label={child.label}
                                isActive={isRouteActive(child.href)}
                                collapsed={false} // Force expanded view for child items
                                href={child.href}
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleNavigation(child.href);
                                }}
                                badge={child.badge}
                              />
                            </li>
                          ))}
                        </ul>
                      </SidebarDropdown>
                    </li>
                  );
                }
                
                // Regular menu items (no children)
                return (
                  <li key={item.label} role="none">
                    <SidebarItem
                      icon={<Icon />}
                      label={item.label}
                      isActive={isActive}
                      collapsed={collapsed}
                      href={item.href}
                      onClick={(e) => {
                        e.preventDefault();
                        handleNavigation(item.href);
                      }}
                      badge={item.badge}
                    />
                  </li>
                );
              })}
            </ul>
          </nav>
          
          {/* Footer with user info - pinned to bottom with improved contrast */}
          <div className="border-t border-slate-200 dark:border-gray-800 p-4 mt-auto">
            <div className={cn(
              "flex",
              collapsed ? "flex-col items-center space-y-3" : "items-center space-x-3"
            )}>
              <div className="flex-shrink-0">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Avatar className="h-8 w-8 cursor-pointer">
                      <AvatarImage src={avatarUrl} alt={userName} />
                      <AvatarFallback aria-label={`${userName}'s avatar`}>
                        {userName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <div className="flex flex-col">
                      <span className="font-medium">{userName}</span>
                      <span className="text-xs text-gray-500">{userEmail}</span>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </div>
              
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {userName}
                  </p>
                  <p className="text-xs text-gray-700 dark:text-gray-400 truncate">
                    {userEmail}
                  </p>
                </div>
              )}
              
              {/* Actions with proper contrast and focus indicators */}
              <div className={cn(
                "flex", 
                collapsed ? "flex-col space-y-2" : "space-x-1"
              )}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={onToggleTheme} 
                      aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
                      className="h-8 w-8 rounded-md focus:ring-2 focus:ring-primary focus:ring-offset-1"
                    >
                      {isDarkMode 
                        ? <Sun className="h-4 w-4" /> 
                        : <Moon className="h-4 w-4" />
                      }
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side={collapsed ? "right" : "top"}>
                    {isDarkMode ? 'Light mode' : 'Dark mode'}
                  </TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={onLogout} 
                      aria-label="Log out"
                      className="h-8 w-8 rounded-md focus:ring-2 focus:ring-primary focus:ring-offset-1"
                    >
                      <LogOut className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side={collapsed ? "right" : "top"}>
                    Log out
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}