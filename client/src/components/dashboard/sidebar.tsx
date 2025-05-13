import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  ChartLine, 
  LogOut, 
  Menu, 
  X,
  ChevronDown,
  ChevronRight,
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
}

export function Sidebar({ className }: SidebarProps) {
  const { user, permissions, logoutMutation } = useAuth();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();
  const sidebarRef = useRef<HTMLElement>(null);
  
  // Use custom hooks for sidebar state management
  const { expandedGroups, toggleGroup } = useSidebarGroups();
  const { sidebarCollapsed, toggleSidebar } = useSidebarCollapsed();
  
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
          "bg-white border-r border-slate-200 z-20 transition-all duration-300",
          sidebarCollapsed ? "lg:w-20" : "lg:w-64", 
          isMobile ? "fixed h-full shadow-xl" : "relative",
          mobileMenuOpen ? "w-64 translate-x-0" : "w-0 -translate-x-full lg:translate-x-0 lg:w-auto",
          className
        )}
      >
        <div className="sticky top-0 flex flex-col h-full">
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
          
          {/* Navigation */}
          <nav className="flex-grow overflow-y-auto py-2 px-2">
            <ul className="space-y-1">
              {roleBasedNavItems.map((item, index) => {
                // Display separator
                if (item.type === 'separator') {
                  return (
                    <li key={`separator-${index}`} className={cn(
                      "pt-3 pb-1",
                      sidebarCollapsed && "hidden"
                    )}>
                      <div className="mx-2">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          {item.label}
                        </p>
                        <div className="mt-1 border-t border-slate-200"></div>
                      </div>
                    </li>
                  );
                }
                
                // Display regular nav item
                if (item.type === 'item') {
                  const isActive = isRouteActive(item.href);
                  const Icon = item.icon;
                  
                  return (
                    <li key={`item-${item.href}`}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <a 
                            href={item.href} 
                            className={cn(
                              "flex items-center rounded-md transition-colors py-2",
                              sidebarCollapsed ? "justify-center px-2" : "px-3",
                              isActive 
                                ? "bg-primary/10 text-primary" 
                                : "text-slate-700 hover:bg-slate-100"
                            )}
                          >
                            <div className="relative">
                              <Icon className={cn("flex-shrink-0", 
                                sidebarCollapsed ? "w-6 h-6" : "w-5 h-5 mr-3"
                              )} />
                              {/* Notification badge - shown for certain menu items */}
                              {(item.label === "Alerts" || item.label === "Reviews") && (
                                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                                  {item.label === "Alerts" ? "3" : "5"}
                                </span>
                              )}
                            </div>
                            {!sidebarCollapsed && (
                              <span className="text-sm font-medium truncate">{item.label}</span>
                            )}
                            {isActive && !sidebarCollapsed && (
                              <div className="absolute left-0 w-1 h-8 bg-primary rounded-r-full" />
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
                                "w-full flex justify-center items-center rounded-md py-2 px-2",
                                hasActiveChild 
                                  ? "bg-primary/10 text-primary" 
                                  : "text-slate-700 hover:bg-slate-100"
                              )}
                              onClick={() => toggleGroup(item.label.toLowerCase())}
                            >
                              <Icon className="w-6 h-6" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="right" className="z-50">
                            {item.tooltip || item.label}
                          </TooltipContent>
                        </Tooltip>
                        
                        {/* Floating submenu for collapsed sidebar */}
                        {isGroupExpanded && (
                          <div className="fixed left-20 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                            <div className="py-1" role="menu" aria-orientation="vertical">
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
                                >
                                  <div className="flex items-center">
                                    <child.icon className="w-4 h-4 mr-2" />
                                    {child.label}
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
                        className={cn(
                          "w-full flex justify-between items-center rounded-md py-2 px-3 text-sm font-medium",
                          hasActiveChild 
                            ? "bg-primary/10 text-primary" 
                            : "text-slate-700 hover:bg-slate-100"
                        )}
                        onClick={() => toggleGroup(item.label.toLowerCase())}
                      >
                        <div className="flex items-center">
                          <Icon className="w-5 h-5 mr-3" />
                          <span>{item.label}</span>
                        </div>
                        <ChevronDown 
                          className={cn(
                            "w-4 h-4 transition-transform",
                            isGroupExpanded ? "transform rotate-180" : ""
                          )} 
                        />
                      </button>
                      
                      {/* Group children */}
                      {isGroupExpanded && (
                        <ul className="pl-8 mt-1 space-y-1">
                          {item.children.map((child) => {
                            const isChildActive = isRouteActive(child.href);
                            const ChildIcon = child.icon;
                            
                            return (
                              <li key={`child-${child.href}`}>
                                <a
                                  href={child.href}
                                  className={cn(
                                    "flex items-center py-2 px-3 rounded-md text-sm transition-colors",
                                    isChildActive
                                      ? "bg-primary/10 text-primary"
                                      : "text-slate-600 hover:bg-slate-100"
                                  )}
                                >
                                  <ChildIcon className="w-4 h-4 mr-2" />
                                  <span>{child.label}</span>
                                  {isChildActive && (
                                    <div className="absolute left-0 w-1 h-8 bg-primary rounded-r-full" />
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
            "mt-auto border-t border-slate-200 p-4",
            sidebarCollapsed && "flex flex-col items-center"
          )}>
            {!sidebarCollapsed ? (
              // Full user profile section
              <div className="flex items-center">
                <Avatar className="h-9 w-9 mr-3">
                  {user?.profilePicture ? (
                    <AvatarImage src={user.profilePicture} alt={user.fullName || ''} />
                  ) : (
                    <AvatarFallback>{user?.fullName?.charAt(0) || "U"}</AvatarFallback>
                  )}
                </Avatar>
                <div className="flex-grow min-w-0">
                  <p className="text-sm font-medium truncate">{user?.fullName}</p>
                  <p className="text-xs text-slate-500 truncate">{user?.plan || "Free"} Plan</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleLogout}
                  disabled={logoutMutation.isPending}
                  aria-label="Sign out"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              // Collapsed user profile section
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex flex-col items-center">
                    <Avatar className="h-10 w-10 mb-2">
                      {user?.profilePicture ? (
                        <AvatarImage src={user.profilePicture} alt={user.fullName || ''} />
                      ) : (
                        <AvatarFallback>{user?.fullName?.charAt(0) || "U"}</AvatarFallback>
                      )}
                    </Avatar>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={handleLogout}
                      disabled={logoutMutation.isPending}
                      aria-label="Sign out"
                    >
                      <LogOut className="h-4 w-4" />
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
