import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/hooks/use-theme";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ColorPalettePicker } from "@/components/ui/color-palette-picker";
import { 
  ChartLine, 
  LogOut, 
  Menu, 
  X,
  ChevronDown,
  ChevronRight,
  Moon,
  Sun,
  Paintbrush
} from "lucide-react";
import { useLocation } from "wouter";
import { useIsMobile } from "@/hooks/use-mobile";

// Import sidebar configuration and types
import { 
  NavItem, 
  SimpleNavItem, 
  GroupNavItem,
  generateSidebarNavigation
} from './sidebar-config';

// Import sidebar utilities
import { 
  isSeparator, 
  isSimpleNavItem, 
  isGroupNavItem,
  useSidebarGroups,
  useSidebarCollapsed
} from './sidebar-utils';

interface SidebarProps {
  className?: string;
  sidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
}

export function Sidebar({ 
  className,
  sidebarCollapsed: propsSidebarCollapsed,
  onToggleSidebar
}: SidebarProps) {
  const { user, permissions, logoutMutation } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();
  const sidebarRef = useRef<HTMLElement>(null);
  
  // Use custom hooks for sidebar state management
  const { expandedGroups, toggleGroup } = useSidebarGroups();
  const internalSidebarState = useSidebarCollapsed();
  
  // Use either props or internal state for sidebar collapsed state
  const sidebarCollapsed = propsSidebarCollapsed !== undefined 
    ? propsSidebarCollapsed 
    : internalSidebarState.sidebarCollapsed;
    
  // Use either provided toggle function or internal one
  const toggleSidebar = onToggleSidebar || internalSidebarState.toggleSidebar;
  
  // Dark mode is now handled by ThemeProvider context
  
  // Generate navigation structure based on current user permissions
  const roleBasedNavItems = generateSidebarNavigation(expandedGroups, permissions);
  
  // Handle sidebar click outside to close on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isMobile &&
        mobileMenuOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobile, mobileMenuOpen]);
    
  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  // Helper to determine if a route is active
  const isRouteActive = (href: string) => {
    return location === href;
  };
  
  return (
    <TooltipProvider>
      <aside 
        ref={sidebarRef}
        className={cn(
          "bg-white border-r border-slate-200 z-20 transition-all duration-300 h-full overflow-hidden",
          sidebarCollapsed ? "lg:w-20" : "lg:w-64", 
          isMobile ? "shadow-xl" : "relative",
          mobileMenuOpen ? "w-64 translate-x-0" : "w-0 -translate-x-full lg:translate-x-0 lg:w-auto",
          className
        )}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="flex flex-col h-full">
          {/* Mobile Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-200 lg:hidden">
            <div className="text-primary text-xl font-bold flex items-center">
              <ChartLine className="h-5 w-5 mr-2" />
              RepuRadar
            </div>
            <Button variant="ghost" size="icon" onClick={toggleMobileMenu} aria-label="Close menu">
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Desktop Header */}
          <div className={cn(
            "hidden lg:flex items-center p-4 border-b border-slate-200",
            sidebarCollapsed ? "justify-center" : "justify-between"
          )}>
            {!sidebarCollapsed && (
              <div className="text-primary text-xl font-bold flex items-center">
                <ChartLine className="h-5 w-5 mr-2" />
                RepuRadar
              </div>
            )}
            {sidebarCollapsed && (
              <ChartLine className="h-6 w-6 text-primary" />
            )}
            <Button 
              variant="ghost" 
              size="icon" 
              className={cn("h-8 w-8", sidebarCollapsed && "hidden")}
              onClick={toggleSidebar}
              aria-label="Collapse sidebar"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
          
          {/* Expand button when collapsed */}
          {sidebarCollapsed && (
            <Button
              variant="ghost"
              size="icon"
              className="hidden lg:flex h-8 w-8 mx-auto mt-2"
              onClick={toggleSidebar}
              aria-label="Expand sidebar"
            >
              <ChevronRight className="h-5 w-5 rotate-180" />
            </Button>
          )}
          
          {/* Search bar - only visible when sidebar is expanded */}
          {!sidebarCollapsed && (
            <div className="px-4 pt-4 pb-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>
          )}
          
          {/* Navigation */}
          <nav className="flex-grow py-1 px-2 sidebar-nav overflow-visible">
            <ul className="space-y-0.5 text-xs">
              {roleBasedNavItems.map((item, index) => {
                // Display separator
                if (item.type === 'separator') {
                  return (
                    <li key={`separator-${index}`} className={cn(
                      "pt-2 pb-0.5",
                      sidebarCollapsed && "hidden"
                    )}>
                      <div className="mx-2">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          {item.label}
                        </p>
                        <div className="mt-0.5 border-t border-slate-200"></div>
                      </div>
                    </li>
                  );
                }
                
                // Display regular nav item
                if (item.type === 'item') {
                  const isActive = isRouteActive(item.href);
                  const Icon = item.icon;
                  
                  return (
                    <li key={`item-${item.label}-${item.href}`}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <a 
                            href={item.href} 
                            className={cn(
                              "flex items-center rounded-md transition-colors py-1",
                              sidebarCollapsed ? "justify-center px-1.5" : "px-2",
                              isActive 
                                ? "bg-primary/10 text-primary" 
                                : "text-slate-700 hover:bg-slate-100"
                            )}
                            role="menuitem"
                            aria-current={isActive ? "page" : undefined}
                          >
                            <div className="relative">
                              <Icon 
                                className={cn("flex-shrink-0", 
                                  sidebarCollapsed ? "w-5 h-5" : "w-4 h-4 mr-2"
                                )} 
                                aria-hidden="true"
                              />
                              {/* Notification badge - shown for certain menu items */}
                              {(item.label === "Alerts" || item.label === "Reviews") && (
                                <span 
                                  className="absolute -top-1 -right-1 flex h-3 w-3 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white"
                                  aria-label={`${item.label === "Alerts" ? "3" : "5"} new ${item.label.toLowerCase()}`}
                                  role="status"
                                  aria-live="polite"
                                >
                                  <span aria-hidden="true">
                                    {item.label === "Alerts" ? "3" : "5"}
                                  </span>
                                </span>
                              )}
                            </div>
                            {!sidebarCollapsed && (
                              <span className="text-xs font-medium truncate">{item.label}</span>
                            )}
                            {isActive && !sidebarCollapsed && (
                              <div className="absolute left-0 w-1 h-6 bg-primary rounded-r-full" />
                            )}
                          </a>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="z-50">
                          {item.tooltip || item.label}
                        </TooltipContent>
                      </Tooltip>
                    </li>
                  );
                }
                
                // Display group item with children
                if (item.type === 'group') {
                  const Icon = item.icon;
                  const isGroupExpanded = item.expanded;
                  const hasActiveChild = item.children.some(child => 
                    isRouteActive(child.href)
                  );
                  
                  // For collapsed sidebar, show only the group icon
                  if (sidebarCollapsed) {
                    return (
                      <li key={`group-${item.label}`}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              className={cn(
                                "w-full flex justify-center items-center rounded-md py-1 px-1.5",
                                hasActiveChild 
                                  ? "bg-primary/10 text-primary" 
                                  : "text-slate-700 hover:bg-slate-100"
                              )}
                              onClick={() => toggleGroup(item.label === "Configuration" ? "config" : item.label.toLowerCase())}
                              aria-expanded={isGroupExpanded}
                              aria-controls={`${item.label.toLowerCase()}-submenu`}
                              aria-haspopup="true"
                              role="menuitem"
                              aria-label={`${item.label} menu${isGroupExpanded ? ' (expanded)' : ' (collapsed)'}`}
                            >
                              <div className="relative">
                                <Icon className="w-5 h-5" aria-hidden="true" />
                                {/* Group notification badge */}
                                {item.label === "Reviews" && (
                                  <span 
                                    className="absolute -top-1 -right-1 flex h-3 w-3 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white"
                                    aria-label="8 new reviews"
                                    role="status"
                                    aria-live="polite"
                                  >
                                    <span aria-hidden="true">8</span>
                                  </span>
                                )}
                              </div>
                            </button>
                          </TooltipTrigger>
                          <TooltipContent 
                            side="right" 
                            className="z-50"
                            role="tooltip"
                            id={`tooltip-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                          >
                            {item.tooltip || item.label}
                          </TooltipContent>
                        </Tooltip>
                        
                        {/* Floating submenu for collapsed sidebar */}
                        {isGroupExpanded && (
                          <div 
                            id={`${item.label.toLowerCase()}-submenu`}
                            className="fixed left-20 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50"
                            role="menu"
                            aria-labelledby={`${item.label.toLowerCase()}-menu-button`}
                          >
                            <div className="py-1" role="none">
                              {item.children.map((child) => (
                                <a
                                  key={child.href}
                                  href={child.href}
                                  className={cn(
                                    "block px-4 py-2 text-sm",
                                    isRouteActive(child.href)
                                      ? "bg-primary/10 text-primary"
                                      : "text-gray-700 hover:bg-gray-100"
                                  )}
                                  role="menuitem"
                                  aria-current={isRouteActive(child.href) ? "page" : undefined}
                                >
                                  <div className="flex items-center">
                                    <child.icon className="w-3 h-3 mr-1.5" aria-hidden="true" />
                                    <span className="text-xs">{child.label}</span>
                                  </div>
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </li>
                    );
                  }
                  
                  // For expanded sidebar, show group with collapsible children
                  return (
                    <li key={`group-${item.label}`} className="space-y-1">
                      <button
                        id={`${item.label.toLowerCase()}-menu-button`}
                        className={cn(
                          "w-full flex justify-between items-center rounded-md py-1 px-2 text-xs font-medium",
                          hasActiveChild 
                            ? "bg-primary/10 text-primary" 
                            : "text-slate-700 hover:bg-slate-100"
                        )}
                        onClick={() => toggleGroup(item.label === "Configuration" ? "config" : item.label.toLowerCase())}
                        aria-expanded={isGroupExpanded}
                        aria-controls={`${item.label.toLowerCase()}-submenu`}
                        aria-haspopup="true"
                        role="menuitem"
                      >
                        <div className="flex items-center">
                          <div className="relative">
                            <Icon className="w-4 h-4 mr-2" aria-hidden="true" />
                            {/* Group notification badge for expanded view */}
                            {item.label === "Reviews" && (
                              <span 
                                className="absolute -top-1 -right-1 flex h-3 w-3 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white"
                                aria-label="8 new reviews"
                              >
                                8
                              </span>
                            )}
                          </div>
                          <span>{item.label}</span>
                        </div>
                        <ChevronDown 
                          className={cn(
                            "w-4 h-4 transition-transform",
                            isGroupExpanded ? "transform rotate-180" : ""
                          )} 
                          aria-hidden="true"
                        />
                      </button>
                      
                      {/* Group children */}
                      {isGroupExpanded && (
                        <ul 
                          id={`${item.label.toLowerCase()}-submenu`}
                          className="pl-8 mt-1 space-y-1"
                          role="menu"
                          aria-labelledby={`${item.label.toLowerCase()}-menu-button`}
                        >
                          {item.children.map((child) => {
                            const isChildActive = isRouteActive(child.href);
                            const ChildIcon = child.icon;
                            
                            return (
                              <li key={`child-${child.href}`} role="none">
                                <a
                                  href={child.href}
                                  className={cn(
                                    "flex items-center py-1 px-2 rounded-md text-xs transition-colors",
                                    isChildActive
                                      ? "bg-primary/10 text-primary"
                                      : "text-slate-600 hover:bg-slate-100"
                                  )}
                                  role="menuitem"
                                  aria-current={isChildActive ? "page" : undefined}
                                >
                                  <ChildIcon className="w-3 h-3 mr-1.5" aria-hidden="true" />
                                  <span className="text-xs">{child.label}</span>
                                  {isChildActive && (
                                    <div className="absolute left-0 w-1 h-6 bg-primary rounded-r-full" aria-hidden="true" />
                                  )}
                                </a>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </li>
                  );
                }
                
                return null;
              })}
            </ul>
          </nav>
          
          {/* User Profile Section */}
          <div className={cn(
            "mt-auto border-t border-slate-200 p-2",
            sidebarCollapsed && "flex flex-col items-center"
          )}>
            {!sidebarCollapsed ? (
              // Full user profile section
              <div className="flex items-center">
                <Avatar className="h-7 w-7 mr-2">
                  {user?.profilePicture ? (
                    <AvatarImage src={user.profilePicture} alt={user.fullName || ''} />
                  ) : (
                    <AvatarFallback>{user?.fullName?.charAt(0) || "U"}</AvatarFallback>
                  )}
                </Avatar>
                <div className="flex-grow min-w-0">
                  <p className="text-xs font-medium truncate">{user?.fullName}</p>
                  <p className="text-[10px] text-slate-500 truncate">{user?.plan || "Free"} Plan</p>
                </div>
                <div className="flex items-center gap-1">
                  {/* Dark mode toggle */}
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={toggleTheme}
                    aria-label={theme === 'dark' ? "Switch to light mode" : "Switch to dark mode"}
                    className="h-6 w-6"
                  >
                    {theme === 'dark' ? <Sun className="h-3 w-3" /> : <Moon className="h-3 w-3" />}
                  </Button>
                  
                  {/* Color theme picker - using a smaller button */}
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-6 w-6 relative"
                    aria-label="Customize theme colors"
                  >
                    <Paintbrush className="h-3 w-3" aria-hidden="true" />
                  </Button>
                  
                  {/* Logout button */}
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={handleLogout}
                    disabled={logoutMutation.isPending}
                    aria-label="Sign out"
                    className="h-6 w-6"
                  >
                    <LogOut className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ) : (
              // Collapsed user profile section
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex flex-col items-center">
                    <Avatar className="h-8 w-8 mb-1">
                      {user?.profilePicture ? (
                        <AvatarImage src={user.profilePicture} alt={user.fullName || ''} />
                      ) : (
                        <AvatarFallback>{user?.fullName?.charAt(0) || "U"}</AvatarFallback>
                      )}
                    </Avatar>
                    {/* Dark mode toggle */}
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={toggleTheme}
                      aria-label={theme === 'dark' ? "Switch to light mode" : "Switch to dark mode"}
                      className="h-6 w-6 mb-1"
                    >
                      {theme === 'dark' ? <Sun className="h-3 w-3" /> : <Moon className="h-3 w-3" />}
                    </Button>
                    
                    {/* Color theme picker */}
                    <div className="mb-1">
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-6 w-6 relative"
                        aria-label="Customize theme colors"
                      >
                        <Paintbrush className="h-3 w-3" aria-hidden="true" />
                      </Button>
                    </div>
                    
                    {/* Logout button */}
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={handleLogout}
                      disabled={logoutMutation.isPending}
                      aria-label="Sign out"
                    >
                      <LogOut className="h-3 w-3" />
                    </Button>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>{user?.fullName}</p>
                  <p className="text-xs">{user?.plan || "Free"} Plan</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>
      </aside>
      
      {/* Mobile: Hamburger menu and overlay */}
      {isMobile && (
        <>
          <Button 
            variant="outline" 
            size="icon" 
            className="fixed left-4 top-4 z-10 lg:hidden"
            onClick={toggleMobileMenu}
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          {/* Dark overlay when mobile menu is open */}
          {mobileMenuOpen && (
            <div 
              className="fixed inset-0 bg-black/50 z-10 lg:hidden"
              onClick={toggleMobileMenu}
            />
          )}
        </>
      )}
    </TooltipProvider>
  );
}
