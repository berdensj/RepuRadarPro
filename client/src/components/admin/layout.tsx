import { ReactNode, useState } from "react";
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
  ClipboardCheck
} from "lucide-react";
import { useLocation } from "wouter";
import { useIsMobile } from "@/hooks/use-mobile";

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { user, logoutMutation } = useAuth();
  const [location, navigate] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();
  
  const adminNavItems = [
    { icon: LayoutDashboard, label: "Admin Dashboard", href: "/admin" },
    { icon: UserCog, label: "Customer Management", href: "/admin/customers" },
    { icon: ClipboardCheck, label: "Customer Onboarding", href: "/admin/onboarding" },
    { icon: Users, label: "User Management", href: "/admin/users" },
    { icon: DollarSign, label: "Financial", href: "/admin/financial" },
    { icon: Server, label: "System Health", href: "/admin/system" },
    { icon: Home, label: "Return to Dashboard", href: "/" },
    // Disabled menu items - these pages aren't implemented yet
    // { icon: BarChart2, label: "Analytics", href: "/admin/analytics" },
    // { icon: BellRing, label: "Notifications", href: "/admin/notifications" },
    // { icon: FileText, label: "Reports", href: "/admin/reports" },
    // { icon: Settings, label: "Admin Settings", href: "/admin/settings" },
    // { icon: BadgeCheck, label: "Subscription Plans", href: "/admin/plans" },
  ];
  
  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Admin Sidebar */}
      <aside className={cn("w-full lg:w-64 bg-primary text-primary-foreground border-r border-primary/20 z-10")}>
        <div className="sticky top-0 p-4 flex flex-col h-screen">
          {/* Mobile Menu Toggle */}
          <div className="flex items-center justify-between lg:hidden mb-4">
            <div className="text-primary-foreground text-xl font-bold flex items-center">
              <ChartLine className="h-5 w-5 mr-2" />
              Admin Panel
            </div>
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
                className="mr-1 text-primary-foreground hover:text-white hover:bg-primary-foreground/10"
              >
                <LogOut className="h-5 w-5" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={toggleMobileMenu}
                className="text-primary-foreground hover:text-white hover:bg-primary-foreground/10"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
          
          {/* Desktop Logo */}
          <div className="hidden lg:flex items-center mb-8 mt-2">
            <div className="text-primary-foreground text-xl font-bold flex items-center">
              <ChartLine className="h-5 w-5 mr-2" />
              Admin Panel
            </div>
          </div>
          
          {/* Nav Links */}
          <nav className={cn("lg:block flex-grow", isMobile && !mobileMenuOpen && "hidden")}>
            <ul className="space-y-2">
              {adminNavItems.map((item) => {
                const isActive = location === item.href;
                const Icon = item.icon;
                
                return (
                  <li key={item.href}>
                    <a 
                      href={item.href} 
                      className={cn(
                        "py-2 px-4 flex items-center text-sm font-medium rounded-md transition-colors",
                        isActive 
                          ? "bg-white/10 text-white" 
                          : "text-primary-foreground/80 hover:bg-white/10 hover:text-white"
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
          <div className={cn("mt-auto pt-4 border-t border-primary-foreground/20", isMobile && !mobileMenuOpen && "hidden")}>
            <div className="flex items-center px-4 py-2">
              <Avatar className="h-9 w-9 mr-3 border border-primary-foreground/20">
                {user?.profilePicture ? (
                  <AvatarImage src={user.profilePicture} alt={user.fullName || ''} />
                ) : (
                  <AvatarFallback>{user?.fullName?.charAt(0) || "A"}</AvatarFallback>
                )}
              </Avatar>
              <div>
                <p className="text-sm font-medium text-white truncate">{user?.fullName}</p>
                <p className="text-xs text-primary-foreground/70 truncate">Administrator</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2 w-full justify-start text-primary-foreground hover:text-white bg-transparent border-primary-foreground/20 hover:bg-primary-foreground/10"
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
            >
              <LogOut className="h-4 w-4 mr-2" />
              {logoutMutation.isPending ? "Signing out..." : "Sign out"}
            </Button>
          </div>
        </div>
      </aside>
      
      {/* Main Content */}
      <main className="flex-1">
        <div className="container px-4 py-6 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}