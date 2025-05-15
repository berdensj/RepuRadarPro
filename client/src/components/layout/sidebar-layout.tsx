import { ReactNode, useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useLocation } from "wouter";
import { Sidebar } from "@/components/dashboard/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";

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
    <div className="w-full bg-slate-50 overflow-y-auto">
      {/* ADA compliance: Added skip to main content link */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-1/2 focus:-translate-x-1/2 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded"
      >
        Skip to main content
      </a>
      
      <div className="flex min-h-screen">
        {/* Sidebar - now part of the main scrolling container */}
        <div 
          id="mobile-sidebar"
          className={cn(
            "transition-all duration-300 ease-in-out z-40 bg-white border-r border-slate-200 sticky top-0 h-screen",
            isMobile ? (
              mobileMenuOpen 
                ? "fixed w-[85%] max-w-[300px] shadow-xl left-0 top-0" 
                : "w-0 -translate-x-full"
            ) : (
              sidebarCollapsed ? "w-20" : "w-64"
            )
          )}
        >
          <Sidebar 
            sidebarCollapsed={sidebarCollapsed} 
            onToggleSidebar={toggleSidebar}
          />
        </div>
        
        {/* Main content */}
        <main 
          id="main-content" 
          className={cn(
            "flex-1 transition-all duration-300 ease-in-out",
            isMobile ? "ml-0" : "",
            className
          )}
          role="main"
          aria-label="Main content"
        >
          {/* Mobile header with toggle */}
          {isMobile && (
            <header className="sticky top-0 z-20 flex items-center justify-between p-3 bg-white border-b border-gray-200 shadow-sm" role="banner">
              <div className="flex items-center">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="mr-2" 
                  onClick={toggleMobileMenu}
                  aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
                  aria-expanded={mobileMenuOpen}
                  aria-controls="mobile-sidebar"
                >
                  {mobileMenuOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
                </Button>
                {pageTitle && <h1 className="text-lg font-semibold truncate">{pageTitle}</h1>}
                {!pageTitle && <span className="text-primary text-lg font-semibold">RepuRadar</span>}
              </div>
            </header>
          )}
          
          {/* Desktop header for page title */}
          {!isMobile && pageTitle && (
            <header className="sticky top-0 z-20 flex items-center p-4 bg-white border-b border-gray-200 shadow-sm" role="banner">
              <h1 className="text-xl font-semibold">{pageTitle}</h1>
            </header>
          )}
          
          {/* Content container with improved mobile spacing */}
          <div className="px-3 py-3 sm:px-4 sm:py-4 md:px-6 md:py-6 w-full">
            {children}
          </div>
        </main>
      </div>
      
      {/* Overlay for mobile when sidebar is open */}
      {isMobile && mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30"
          onClick={toggleMobileMenu}
          aria-hidden="true"
          role="presentation"
          tabIndex={-1}
          aria-label="Close sidebar overlay"
        />
      )}
    </div>
  );
}

export default SidebarLayout;