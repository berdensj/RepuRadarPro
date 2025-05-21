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
import { Badge } from "@/components/ui/badge";

// Sidebar navigation item type definition
interface NavItem {
  icon: React.ComponentType;
  label: string;
  href: string;
  badge?: number;
  children?: NavItem[];
}

// Type definition for component props
interface EnhancedSidebarProps {
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
 * Enhanced Sidebar Component
 * 
 * Features:
 * - Static positioning on desktop (≥1024px)
 * - Collapsible with toggle between expanded (240px) and collapsed (60px)
 * - Mobile-responsive with off-canvas drawer
 * - Scrollable navigation section
 * - Pinned footer with user info and actions
 * - Keyboard accessible with Alt+S shortcut for toggle
 * - Tooltips for icons in collapsed mode
 * - Notification badges for unread items
 */
export function EnhancedSidebar({
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
}: EnhancedSidebarProps) {
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
      label: "Configuration",
      href: "#",
      children: [
        {
          icon: Settings,
          label: "API Access",
          href: "/api-access",
        },
        {
          icon: Settings,
          label: "White Label",
          href: "/white-label",
        },
        {
          icon: Settings,
          label: "Integrations",
          href: "/integrations",
        },
        {
          icon: Settings,
          label: "Settings",
          href: "/settings",
        }
      ]
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
      {/* Screen reader announcer */}
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
          // Width based on collapsed state - dynamic values
          collapsed ? "w-[60px]" : "w-[240px]", 
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
        <div className="flex flex-col h-full">
          {/* Mobile header with close button */}
          <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-gray-800 lg:hidden">
            <div className="text-primary text-xl font-bold flex items-center">
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
              <div className="text-primary text-xl font-bold flex items-center">
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
              className="hidden lg:flex h-8 w-8 mx-auto mt-2"
              onClick={toggleSidebar}
              aria-label="Expand sidebar"
              title="Expand sidebar (Alt+S)"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          )}
          
          {/* Navigation - scrollable section */}
          <nav 
            className="overflow-y-auto"
            style={{ maxHeight: 'calc(100vh - 180px)' }} // Increased height to prevent cutoff
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
                      {/* Group header with tooltip for collapsed state */}
                      {collapsed ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              className={cn(
                                "flex items-center rounded-md transition-colors py-2 px-3 text-sm font-medium w-full",
                                "justify-center",
                                hasActiveChild 
                                  ? "bg-primary/10 text-primary" 
                                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                              )}
                              onClick={() => toggleGroup(item.label)}
                              aria-expanded={isGroupExpanded}
                              aria-haspopup="true"
                              aria-controls={`${item.label.toLowerCase()}-submenu`}
                              aria-label={`${item.label} menu, ${item.badge ? `${item.badge} unread items,` : ''} ${hasActiveChild ? 'active,' : ''} press to ${isGroupExpanded ? 'collapse' : 'expand'}`}
                              role="menuitem"
                            >
                              <div className="relative">
                                <Icon className="w-5 h-5" />
                                {item.badge && (
                                  <span 
                                    className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white"
                                    aria-hidden="true"
                                  >
                                    {item.badge}
                                  </span>
                                )}
                              </div>
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="right" align="center">
                            <div className="flex flex-col">
                              <span>{item.label}</span>
                              {item.badge && (
                                <span className="text-xs text-gray-500">
                                  {item.badge} unread items
                                </span>
                              )}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        <button
                          className={cn(
                            "flex items-center rounded-md transition-colors py-2 px-3 text-sm font-medium w-full",
                            "justify-between",
                            hasActiveChild 
                              ? "bg-primary/10 text-primary" 
                              : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                          )}
                          onClick={() => toggleGroup(item.label)}
                          aria-expanded={isGroupExpanded}
                          aria-haspopup="true"
                          aria-controls={`${item.label.toLowerCase()}-submenu`}
                          aria-label={`${item.label} menu, ${item.badge ? `${item.badge} unread items,` : ''} ${hasActiveChild ? 'active,' : ''} press to ${isGroupExpanded ? 'collapse' : 'expand'}`}
                          role="menuitem"
                        >
                          <div className="flex items-center">
                            <div className="relative">
                              <Icon className="w-4 h-4 mr-3 flex-shrink-0" />
                              {item.badge && (
                                <span 
                                  className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white"
                                  aria-hidden="true"
                                >
                                  {item.badge}
                                </span>
                              )}
                            </div>
                            <span>{item.label}</span>
                          </div>
                          <ChevronRight 
                            className={cn(
                              "h-4 w-4 transform transition-transform",
                              isGroupExpanded && "rotate-90"
                            )}
                            aria-hidden="true"
                          />
                        </button>
                      )}
                      
                      {/* Submenu */}
                      {isGroupExpanded && (
                        <ul
                          id={`${item.label.toLowerCase()}-submenu`}
                          className={cn(
                            collapsed 
                              ? "absolute left-full top-0 mt-0 ml-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-900 ring-1 ring-gray-200 dark:ring-gray-700 py-1 z-50" 
                              : "mt-1 ml-9 space-y-1 border-l border-gray-200 dark:border-gray-700 pl-2"
                          )}
                          role="menu"
                        >
                          {item.children.map(child => (
                            <li key={child.href} role="none">
                              <a
                                href={child.href}
                                className={cn(
                                  "flex items-center transition-colors py-2 px-3 text-sm rounded-md",
                                  collapsed ? "px-4" : "",
                                  isRouteActive(child.href) 
                                    ? "bg-primary/10 text-primary font-medium" 
                                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                                )}
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleNavigation(child.href);
                                }}
                                role="menuitem"
                                aria-current={isRouteActive(child.href) ? "page" : undefined}
                                aria-label={`${child.label} ${isRouteActive(child.href) ? '(current page)' : ''}`}
                              >
                                <child.icon className="h-4 w-4 mr-2" />
                                <span>{child.label}</span>
                              </a>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  );
                }
                
                // Regular menu items (no children)
                return (
                  <li key={item.label} role="none">
                    {collapsed ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <a
                            href={item.href}
                            className={cn(
                              "flex items-center rounded-md transition-colors py-2 px-3 text-sm font-medium",
                              "justify-center",
                              isActive 
                                ? "bg-primary/10 text-primary" 
                                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                            )}
                            onClick={(e) => {
                              e.preventDefault();
                              handleNavigation(item.href);
                            }}
                            role="menuitem"
                            aria-current={isActive ? "page" : undefined}
                            aria-label={`${item.label} ${item.badge ? `(${item.badge} unread)` : ''} ${isActive ? '(current page)' : ''}`}
                          >
                            <div className="relative">
                              <Icon className="w-5 h-5" />
                              {item.badge && (
                                <span 
                                  className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white"
                                  aria-hidden="true"
                                >
                                  {item.badge}
                                </span>
                              )}
                            </div>
                          </a>
                        </TooltipTrigger>
                        <TooltipContent side="right">
                          <div className="flex flex-col">
                            <span>{item.label}</span>
                            {item.badge && (
                              <span className="text-xs text-gray-500">
                                {item.badge} unread items
                              </span>
                            )}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      <a
                        href={item.href}
                        className={cn(
                          "flex items-center rounded-md transition-colors py-2 px-3 text-sm font-medium",
                          isActive 
                            ? "bg-primary/10 text-primary" 
                            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                        )}
                        onClick={(e) => {
                          e.preventDefault();
                          handleNavigation(item.href);
                        }}
                        role="menuitem"
                        aria-current={isActive ? "page" : undefined}
                        aria-label={`${item.label} ${item.badge ? `(${item.badge} unread)` : ''} ${isActive ? '(current page)' : ''}`}
                      >
                        <div className="relative">
                          <Icon className="w-4 h-4 mr-3 flex-shrink-0" />
                          {item.badge && (
                            <span 
                              className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white"
                              aria-hidden="true"
                            >
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <span>{item.label}</span>
                      </a>
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>
          
          {/* Footer with user info - pinned to bottom */}
          <div className="border-t border-slate-200 dark:border-gray-800 p-4 mt-auto">
            <div className={cn(
              "flex",
              collapsed ? "flex-col items-center space-y-3" : "items-center space-x-3"
            )}>
              <div className="flex-shrink-0">
                {collapsed ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Avatar className="h-8 w-8 cursor-pointer">
                        <AvatarImage src={avatarUrl} alt={userName} />
                        <AvatarFallback>
                          {userName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <div className="flex flex-col">
                        <span>{userName}</span>
                        <span className="text-xs text-gray-500">{userEmail}</span>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={avatarUrl} alt={userName} />
                    <AvatarFallback>
                      {userName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
              
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {userName}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {userEmail}
                  </p>
                </div>
              )}
              
              {/* Actions */}
              <div className={cn(
                "flex", 
                collapsed ? "flex-col space-y-2" : "space-x-1"
              )}>
                {collapsed ? (
                  <>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={onToggleTheme} 
                          className="h-7 w-7" 
                          aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
                        >
                          {isDarkMode 
                            ? <Sun className="h-3.5 w-3.5" /> 
                            : <Moon className="h-3.5 w-3.5" />
                          }
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        {isDarkMode ? 'Light mode' : 'Dark mode'}
                      </TooltipContent>
                    </Tooltip>
                    
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={onLogout} 
                          className="h-7 w-7" 
                          aria-label="Log out"
                        >
                          <LogOut className="h-3.5 w-3.5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="right">Log out</TooltipContent>
                    </Tooltip>
                  </>
                ) : (
                  <>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={onToggleTheme} 
                      className="h-7 w-7" 
                      aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
                    >
                      {isDarkMode 
                        ? <Sun className="h-3.5 w-3.5" /> 
                        : <Moon className="h-3.5 w-3.5" />
                      }
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={onLogout} 
                      className="h-7 w-7" 
                      aria-label="Log out"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}