import { ReactNode, useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  BarChart2, 
  FileText, 
  ChartLine, 
  LogOut, 
  Menu, 
  Settings, 
  X,
  Users,
  DollarSign,
  Server,
  Home,
  LayoutDashboard,
  BellRing,
  BadgeCheck,
  UserCog,
  ClipboardCheck,
  Shield,
  AlertTriangle,
  LucideIcon,
  ChevronRight,
  Moon,
  Sun,
  PanelLeft,
  MessageSquarePlus,
  Eye
} from "lucide-react";
import { useLocation } from "wouter";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

interface AdminLayoutProps {
  children: ReactNode;
  pageTitle?: string;
}

type NavItemGroupType = {
  title: string;
  items: {
    icon: LucideIcon;
    label: string;
    href: string;
    badge?: {
      text: string;
      variant?: "default" | "outline" | "secondary" | "destructive";
    };
  }[];
};

export function AdminLayout({ children, pageTitle }: AdminLayoutProps) {
  const { user, logoutMutation } = useAuth();
  const [location, navigate] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const isMobile = useIsMobile();
  
  // Update document with dark mode class
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);
  
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };
  
  // Grouped nav items for better organization
  const adminNavGroups: NavItemGroupType[] = [
    {
      title: "Dashboard",
      items: [
        { icon: LayoutDashboard, label: "Admin Dashboard", href: "/admin" },
      ]
    },
    {
      title: "User Management",
      items: [
        { icon: UserCog, label: "Customers", href: "/admin/customers" },
        { icon: Users, label: "User Management", href: "/admin/users", badge: { text: "Updated", variant: "default" } },
        { icon: ClipboardCheck, label: "Onboarding", href: "/admin/onboarding" },
      ]
    },
    {
      title: "Monitoring",
      items: [
        { icon: BarChart2, label: "Analytics", href: "/admin/analytics" },
        { icon: FileText, label: "Reports", href: "/admin/reports" },
        { icon: AlertTriangle, label: "Review Oversight", href: "/admin/reviews" },
      ]
    },
    {
      title: "System",
      items: [
        { icon: DollarSign, label: "Financial", href: "/admin/financial" },
        { icon: Server, label: "System Health", href: "/admin/system", badge: { text: "Updated", variant: "default" } },
        { icon: Shield, label: "Access Control", href: "/admin/roles" },
        { icon: MessageSquarePlus, label: "Feedback", href: "/admin/feedback" },
      ]
    },
    // Show the "Return to Dashboard" button for all admin users
    {
      title: "Navigation",
      items: [
        { icon: Home, label: "Return to Dashboard", href: "/dashboard" },
      ]
    }
  ];
  
  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  // Get current page path segments for breadcrumb
  const pathSegments = location.split('/').filter(Boolean);
  
  // Generate page title for breadcrumb
  const generatePageTitle = () => {
    if (pageTitle) return pageTitle;
    
    // Default logic to generate page title from URL
    if (pathSegments.length === 0) return "Dashboard";
    
    if (pathSegments.length === 1 && pathSegments[0] === "admin") {
      return "Admin Dashboard";
    }
    
    if (pathSegments.length > 1) {
      // Find the active nav item based on current location
      let activeItem = null;
      
      adminNavGroups.forEach(group => {
        group.items.forEach(item => {
          if (item.href === location) {
            activeItem = item;
          }
        });
      });
      
      if (activeItem) return activeItem?.label;
      
      // Fallback: capitalize the last segment
      const lastSegment = pathSegments[pathSegments.length - 1];
      return lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1);
    }
    
    return "Dashboard";
  };
  
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Admin Sidebar */}
      <aside 
        className={cn(
          "transition-all duration-300 ease-in-out border-r border-gray-200 dark:border-gray-800 z-20 bg-white dark:bg-gray-950 text-gray-800 dark:text-gray-200",
          sidebarCollapsed ? "w-16" : "w-full lg:w-64",
          "fixed lg:sticky top-0 h-screen"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Mobile Menu Header */}
          <div className="flex items-center justify-between p-4 lg:hidden">
            <div className={cn("font-bold flex items-center", sidebarCollapsed && "hidden")}>
              <ChartLine className="h-5 w-5 mr-2 text-primary" />
              Admin Panel
            </div>
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
                className="mr-1 gap-1"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">{logoutMutation.isPending ? "Signing out..." : "Sign out"}</span>
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={toggleMobileMenu}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
          
          {/* Desktop Header */}
          <div className={cn(
            "hidden lg:flex items-center p-4 border-b border-gray-200 dark:border-gray-800",
            sidebarCollapsed && "justify-center p-2"
          )}>
            {sidebarCollapsed ? (
              <ChartLine className="h-6 w-6 text-primary" />
            ) : (
              <div className="flex justify-between w-full items-center">
                <div className="font-bold flex items-center text-lg">
                  <ChartLine className="h-5 w-5 mr-2 text-primary" />
                  Admin Portal
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleLogout}
                  disabled={logoutMutation.isPending}
                  className="gap-1"
                >
                  <LogOut className="h-4 w-4" />
                  {!sidebarCollapsed && (logoutMutation.isPending ? "Signing out..." : "Sign out")}
                </Button>
              </div>
            )}
          </div>

          {/* Sidebar Collapse Button (Desktop only) */}
          <div className="hidden lg:flex justify-end p-1 border-b border-gray-200 dark:border-gray-800">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSidebar}
              className="h-7 w-7 p-0"
            >
              <PanelLeft className="h-4 w-4" />
              <span className="sr-only">
                {sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
              </span>
            </Button>
          </div>
          
          {/* Navigation */}
          <nav className={cn(
            "flex-grow overflow-y-auto",
            isMobile && !mobileMenuOpen && "hidden lg:block",
            "scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700"
          )}>
            <div className="p-2">
              {adminNavGroups.map((group, groupIndex) => (
                <div key={groupIndex} className={cn("mb-4", sidebarCollapsed && "flex flex-col items-center")}>
                  {/* Group Title */}
                  {!sidebarCollapsed && (
                    <p className="px-3 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {group.title}
                    </p>
                  )}
                  
                  {/* Group Items */}
                  <ul className={cn("mt-1 space-y-1", sidebarCollapsed && "flex flex-col items-center")}>
                    {group.items.map((item) => {
                      const isActive = location === item.href;
                      const Icon = item.icon;
                      
                      return (
                        <li key={item.href} className={cn("relative", sidebarCollapsed && "w-full flex justify-center")}>
                          <a 
                            href={item.href} 
                            className={cn(
                              "flex items-center text-sm font-medium rounded-md transition-colors",
                              isActive 
                                ? "bg-primary/10 text-primary dark:bg-primary/20" 
                                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800",
                              sidebarCollapsed
                                ? "justify-center p-2 mx-auto"
                                : "px-3 py-2"
                            )}
                            title={sidebarCollapsed ? item.label : undefined}
                          >
                            <Icon className={cn("flex-shrink-0", sidebarCollapsed ? "w-6 h-6" : "w-5 h-5 mr-3")} />
                            {!sidebarCollapsed && item.label}
                            {!sidebarCollapsed && item.badge && (
                              <Badge 
                                variant={item.badge.variant || "default"} 
                                className="ml-auto text-xs"
                              >
                                {item.badge.text}
                              </Badge>
                            )}
                          </a>
                          {/* Badge indicator for collapsed sidebar */}
                          {sidebarCollapsed && item.badge && (
                            <div className="absolute top-0 right-1.5 h-2 w-2 rounded-full bg-primary" />
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </nav>
          
          {/* Footer */}
          <div className={cn(
            "mt-auto border-t border-gray-200 dark:border-gray-800 p-4",
            sidebarCollapsed && "px-2 py-4",
            isMobile && !mobileMenuOpen && "hidden lg:block"
          )}>
            {/* Dark Mode Toggle */}
            <div className={cn("flex items-center mb-3", sidebarCollapsed && "justify-center")}>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleDarkMode}
                className={cn(
                  "gap-2",
                  sidebarCollapsed && "w-10 h-10 p-0 rounded-full"
                )}
              >
                {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                {!sidebarCollapsed && (isDarkMode ? "Light Mode" : "Dark Mode")}
              </Button>
            </div>
            
            {/* User Profile */}
            <div className={cn(
              "flex items-center",
              sidebarCollapsed && "flex-col"
            )}>
              {sidebarCollapsed ? (
                <div className="flex flex-col items-center">
                  <Avatar className="h-9 w-9 mb-1 border border-gray-200 dark:border-gray-700">
                    {user?.profilePicture ? (
                      <AvatarImage src={user.profilePicture} alt={user.fullName || ''} />
                    ) : (
                      <AvatarFallback>{user?.fullName?.charAt(0) || "A"}</AvatarFallback>
                    )}
                  </Avatar>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-8 h-8 mt-1 p-0"
                    onClick={handleLogout}
                    title="Sign out"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <>
                  <Avatar className="h-9 w-9 mr-3 border border-gray-200 dark:border-gray-700">
                    {user?.profilePicture ? (
                      <AvatarImage src={user.profilePicture} alt={user.fullName || ''} />
                    ) : (
                      <AvatarFallback>{user?.fullName?.charAt(0) || "A"}</AvatarFallback>
                    )}
                  </Avatar>
                  <div className="flex-grow min-w-0">
                    <p className="text-sm font-medium truncate">{user?.fullName}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">Administrator</p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="ml-1 h-8 w-8 p-0">
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => navigate("/admin/profile")}>
                        <UserCog className="mr-2 h-4 w-4" />
                        Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate("/admin/settings")}>
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleLogout} disabled={logoutMutation.isPending}>
                        <LogOut className="mr-2 h-4 w-4" />
                        {logoutMutation.isPending ? "Signing out..." : "Sign out"}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              )}
            </div>
          </div>
        </div>
      </aside>
      
      {/* Main Content */}
      <main className={cn(
        "flex-1 transition-all duration-300 ease-in-out bg-gray-50 dark:bg-gray-900",
        sidebarCollapsed ? "lg:ml-16" : "lg:ml-64",
      )}>
        {/* Breadcrumb navigation */}
        <div className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-4 py-3">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/admin">Admin</BreadcrumbLink>
              </BreadcrumbItem>
              
              {pathSegments.length > 1 && pathSegments.slice(1, -1).map((segment, index) => (
                <BreadcrumbItem key={index}>
                  <BreadcrumbLink href={`/admin/${pathSegments.slice(1, index + 2).join('/')}`}>
                    {segment.charAt(0).toUpperCase() + segment.slice(1)}
                  </BreadcrumbLink>
                </BreadcrumbItem>
              ))}
              
              {pathSegments.length > 1 && (
                <BreadcrumbItem>
                  <BreadcrumbPage>{generatePageTitle()}</BreadcrumbPage>
                </BreadcrumbItem>
              )}
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        
        <div className="p-4 md:p-6 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}