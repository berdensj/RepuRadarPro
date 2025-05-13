import { ReactNode, useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useLocation } from "wouter";
import { Sidebar } from "@/components/dashboard/sidebar";

// Custom hook for mobile detection
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Initial check
    checkIfMobile();
    
    // Add event listener
    window.addEventListener('resize', checkIfMobile);
    
    // Clean up
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);
  
  return isMobile;
}

interface SidebarLayoutProps {
  children: ReactNode;
  className?: string;
  pageTitle?: string;
  hideSidebarFor?: string[];
}

export function SidebarLayout({ 
  children, 
  className, 
  pageTitle,
  hideSidebarFor = ['/auth', '/login', '/signup', '/onboarding'] 
}: SidebarLayoutProps) {
  const { user } = useAuth();
  const [location] = useLocation();
  const isMobile = useIsMobile();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Check if sidebar should be hidden for this route
  const shouldHideSidebar = hideSidebarFor.some(path => 
    location === path || location.startsWith(path + '/')
  );
  
  // Handle sidebar toggle
  const toggleSidebar = () => {
    const newState = !sidebarCollapsed;
    setSidebarCollapsed(newState);
    // Save preference in localStorage for persistence
    localStorage.setItem('sidebar_collapsed', newState.toString());
  };

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Initialize sidebar state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem('sidebar_collapsed');
    if (savedState !== null) {
      setSidebarCollapsed(savedState === 'true');
    }
  }, []);
  
  // If on a route where sidebar should be hidden, just render children
  if (shouldHideSidebar || !user) {
    return <>{children}</>;
  }
  
  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden">
      {/* Sidebar - fixed on mobile, relative on desktop */}
      <div className={cn(
        "transition-all duration-300 ease-in-out z-30 bg-white border-r border-slate-200",
        isMobile ? (
          mobileMenuOpen 
            ? "fixed left-0 top-0 h-full w-64 shadow-xl" 
            : "fixed left-0 top-0 h-full w-0 -translate-x-full"
        ) : (
          sidebarCollapsed ? "w-20" : "w-64"
        )
      )}>
        <Sidebar 
          sidebarCollapsed={sidebarCollapsed} 
          onToggleSidebar={toggleSidebar}
        />
      </div>
      
      {/* Main content */}
      <main className={cn(
        "flex-1 overflow-auto transition-all duration-300 ease-in-out",
        !isMobile && (sidebarCollapsed ? "ml-20" : "ml-64"),
        className
      )}>
        {/* Mobile header with toggle */}
        {isMobile && (
          <div className="sticky top-0 z-20 flex items-center justify-between p-4 bg-white border-b border-gray-200">
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                size="icon" 
                className="mr-2" 
                onClick={toggleMobileMenu}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
              {pageTitle && <h1 className="text-xl font-semibold">{pageTitle}</h1>}
            </div>
          </div>
        )}
        
        {/* Content container - removed container class to fix spacing */}
        <div className="px-4 py-4 md:px-6 md:py-6 w-full">
          {children}
        </div>
      </main>
      
      {/* Overlay for mobile when sidebar is open */}
      {isMobile && mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20"
          onClick={toggleMobileMenu}
          aria-hidden="true"
        />
      )}
    </div>
  );
}

export default SidebarLayout;