import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
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
  Code,
  ChevronDown,
  ChevronRight,
  Users,
  BadgeDollarSign,
  Package
} from "lucide-react";
import { useLocation } from "wouter";
import { useIsMobile } from "@/hooks/use-mobile";

interface SidebarProps {
  className?: string;
}

// Base navigation item
interface NavItemBase {
  icon: React.ComponentType<any>;
  label: string;
  tooltip?: string;
}

// Simple navigation item
interface SimpleNavItem extends NavItemBase {
  type: 'item';
  href: string;
}

// Group navigation item with children
interface GroupNavItem extends NavItemBase {
  type: 'group';
  children: SimpleNavItem[];
  expanded?: boolean;
}

// Separator item
interface SeparatorItem {
  type: 'separator';
  label: string;
}

// Union type for all navigation item types
type NavItem = SimpleNavItem | GroupNavItem | SeparatorItem;

// Role type
type UserRole = 'admin' | 'staff' | 'user' | 'location_manager';

export function Sidebar({ className }: SidebarProps) {
  const { user, permissions, logoutMutation } = useAuth();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const isMobile = useIsMobile();
  const sidebarRef = useRef<HTMLElement>(null);
  
  // Track expanded groups state
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    reviews: false,
    analytics: false,
    management: false,
    config: false,
    account: false,
    admin: false
  });
  
  // Toggle a group's expanded state
  const toggleGroup = (groupName: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupName]: !prev[groupName]
    }));
  };
  
  // Group: Dashboard & Main
  const mainNavItems: NavItem[] = [
    {
      type: 'item',
      icon: BarChart2,
      label: "Dashboard",
      href: "/",
      tooltip: "View your main dashboard"
    }
  ];
  
  // Group: Reviews & Feedback
  const reviewsNavItems: GroupNavItem = {
    type: 'group',
    icon: Star,
    label: "Reviews",
    tooltip: "Manage all your reviews",
    expanded: expandedGroups.reviews,
    children: [
      {
        type: 'item',
        icon: Star,
        label: "All Reviews",
        href: "/reviews",
        tooltip: "View all your reviews"
      },
      {
        type: 'item',
        icon: MessageSquare,
        label: "AI Responses",
        href: "/responses",
        tooltip: "AI-generated response suggestions"
      },
      {
        type: 'item',
        icon: Send,
        label: "Review Requests",
        href: "/review-requests",
        tooltip: "Manage review requests"
      }
    ]
  };
  
  // Group: Alerts & Notifications
  const alertsNavItem: NavItem = {
    type: 'item',
    icon: Bell,
    label: "Alerts",
    href: "/alerts",
    tooltip: "Review notifications and alerts"
  };
  
  // Group: Analytics & Reports
  const analyticsNavItems: GroupNavItem = {
    type: 'group',
    icon: ChartPieIcon,
    label: "Analytics",
    tooltip: "Performance insights and reports",
    expanded: expandedGroups.analytics,
    children: [
      {
        type: 'item',
        icon: ChartPieIcon,
        label: "Analytics",
        href: "/analytics",
        tooltip: "Detailed analytics and metrics"
      },
      {
        type: 'item',
        icon: FileText,
        label: "Reports",
        href: "/reports",
        tooltip: "Custom and scheduled reports"
      },
      {
        type: 'item',
        icon: UsersRound,
        label: "Competitors",
        href: "/competitors",
        tooltip: "Monitor competitor performance"
      },
      {
        type: 'item',
        icon: LayoutDashboard,
        label: "Dashboard Builder",
        href: "/dashboard-builder",
        tooltip: "Create custom dashboards"
      }
    ]
  };
  
  // Group: Management
  const managementNavItems: GroupNavItem = {
    type: 'group',
    icon: Settings,
    label: "Management",
    tooltip: "Manage platform operations",
    expanded: expandedGroups.management,
    children: [
      {
        type: 'item',
        icon: MessageSquare,
        label: "Communications",
        href: "/communications",
        tooltip: "Communication templates and history"
      },
      {
        type: 'item',
        icon: Import,
        label: "Import/Export",
        href: "/import-export",
        tooltip: "Import or export platform data"
      },
      {
        type: 'item',
        icon: Workflow,
        label: "Workflows",
        href: "/workflows",
        tooltip: "Automated workflow management"
      },
      {
        type: 'item',
        icon: Clock,
        label: "Activity Logs",
        href: "/activity-logs",
        tooltip: "User and system activity logs"
      },
      {
        type: 'item',
        icon: FileCog,
        label: "Templates",
        href: "/templates",
        tooltip: "Manage response templates"
      }
    ]
  };
  
  // Group: Configuration & Settings
  const configNavItems: GroupNavItem = {
    type: 'group',
    icon: Settings,
    label: "Configuration",
    tooltip: "Platform configuration",
    expanded: expandedGroups.config,
    children: [
      {
        type: 'item',
        icon: Code,
        label: "API Access",
        href: "/api-access",
        tooltip: "API keys and documentation"
      },
      {
        type: 'item',
        icon: Paintbrush,
        label: "White Label",
        href: "/white-label",
        tooltip: "White label settings"
      },
      {
        type: 'item',
        icon: Plug,
        label: "Integrations",
        href: "/integrations",
        tooltip: "Third-party integrations"
      },
      {
        type: 'item',
        icon: Settings,
        label: "Settings",
        href: "/settings",
        tooltip: "Platform settings"
      }
    ]
  };
  
  // Group: Account & Profile
  const accountNavItems: GroupNavItem = {
    type: 'group',
    icon: User,
    label: "Account",
    tooltip: "Manage your account",
    expanded: expandedGroups.account,
    children: [
      {
        type: 'item',
        icon: User,
        label: "Profile",
        href: "/profile",
        tooltip: "Your profile settings"
      },
      {
        type: 'item',
        icon: CreditCard,
        label: "Subscription",
        href: "/subscription",
        tooltip: "Manage your subscription"
      },
      {
        type: 'item',
        icon: HelpCircle,
        label: "Help & Support",
        href: "/help",
        tooltip: "Get help and support"
      }
    ]
  };
  
  // Admin-only navigation items
  const adminNavItems: GroupNavItem = {
    type: 'group',
    icon: ShieldCheck,
    label: "Admin",
    tooltip: "Administration tools",
    expanded: expandedGroups.admin,
    children: [
      {
        type: 'item',
        icon: Users,
        label: "Users",
        href: "/admin/users",
        tooltip: "Manage users"
      },
      {
        type: 'item',
        icon: BadgeDollarSign,
        label: "Billing",
        href: "/admin/billing",
        tooltip: "Manage billing"
      },
      {
        type: 'item',
        icon: Package,
        label: "Subscriptions",
        href: "/admin/subscriptions",
        tooltip: "Manage subscriptions"
      }
    ]
  };
  
  // Create separator items
  const analyticsSeparator: SeparatorItem = { type: 'separator', label: 'Analytics' };
  const managementSeparator: SeparatorItem = { type: 'separator', label: 'Management' };
  const configSeparator: SeparatorItem = { type: 'separator', label: 'Configuration' };
  const accountSeparator: SeparatorItem = { type: 'separator', label: 'Account' };
  const adminSeparator: SeparatorItem = { type: 'separator', label: 'Administration' };
  
  // Combine all navigation items for rendering based on user role and permissions
  const baseNavItems: NavItem[] = [
    ...mainNavItems,
    reviewsNavItems,
    alertsNavItem,
    analyticsSeparator,
    analyticsNavItems,
    managementSeparator,
    managementNavItems,
    configSeparator,
    configNavItems,
    accountSeparator,
    accountNavItems,
  ];
  
  // Add admin items based on permissions
  let roleBasedNavItems: NavItem[] = [...baseNavItems];
  
  if (permissions?.canManageUsers) {
    roleBasedNavItems = [
      ...roleBasedNavItems,
      adminSeparator,
      adminNavItems
    ];
  }
  
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
  
  // Auto-open group when an item in the group is active
  useEffect(() => {
    // Check if the current location matches any child item
    const checkAndOpenGroup = (groupName: string, children: SimpleNavItem[]) => {
      const isActive = children.some(item => item.href === location);
      if (isActive) {
        setExpandedGroups(prev => ({
          ...prev,
          [groupName]: true
        }));
      }
    };
    
    checkAndOpenGroup('reviews', reviewsNavItems.children);
    checkAndOpenGroup('analytics', analyticsNavItems.children);
    checkAndOpenGroup('management', managementNavItems.children);
    checkAndOpenGroup('config', configNavItems.children);
    checkAndOpenGroup('account', accountNavItems.children);
    checkAndOpenGroup('admin', adminNavItems.children);
  }, [location]);
  
  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);
  const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed);
  
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
                            <Icon className={cn("flex-shrink-0", 
                              sidebarCollapsed ? "w-6 h-6" : "w-5 h-5 mr-3"
                            )} />
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
