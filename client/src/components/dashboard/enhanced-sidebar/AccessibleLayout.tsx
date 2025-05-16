import { ReactNode, useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { AccessibleSidebar } from "./AccessibleSidebar";
import { cn } from "@/lib/utils";

interface AccessibleLayoutProps {
  children: ReactNode;
  pageTitle?: string;
}

/**
 * AccessibleLayout Component
 * 
 * Uses the ADA-compliant AccessibleSidebar component and provides a full layout structure
 * with proper content area scrolling and header setup.
 * 
 * Features:
 * - Scalable font sizing using Tailwind utilities
 * - Responsive design with mobile support
 * - Proper content structure with semantic HTML
 * - Skip to content link for accessibility
 * - Dark mode support with contrast meeting WCAG guidelines
 */
export function AccessibleLayout({ children, pageTitle }: AccessibleLayoutProps) {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check if user has a preference saved in localStorage
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('color-theme');
      return savedMode === 'dark' || 
        (!savedMode && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });
  
  // Handle theme toggling
  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    
    // Save to localStorage
    localStorage.setItem('color-theme', newMode ? 'dark' : 'light');
    
    // Update document class
    if (newMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };
  
  // Apply theme class on mount
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);
  
  // Handle route navigation
  const handleNavigation = (href: string) => {
    // Use client-side navigation
    window.history.pushState({}, "", href);
    // Manually trigger a location change event
    const event = new PopStateEvent("popstate");
    window.dispatchEvent(event);
  };
  
  // Handle logout
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  return (
    <div className="h-screen flex flex-col lg:flex-row bg-gray-50 dark:bg-gray-900">
      {/* Skip to content for accessibility - always visible on focus */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:p-4 focus:bg-white dark:focus:bg-gray-800 focus:text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:top-2 focus:left-2"
      >
        Skip to main content
      </a>
      
      {/* Enhanced sidebar with ADA compliance */}
      <AccessibleSidebar 
        onNavigate={handleNavigation}
        activeRoute={location}
        userName={user?.fullName || user?.username || "User"}
        userEmail={user?.email || ""}
        avatarUrl={user?.profilePicture || ""}
        onLogout={handleLogout}
        onToggleTheme={toggleTheme}
        isDarkMode={isDarkMode}
        userRole={user?.role || ""}
      />
      
      {/* Main content area with responsive margin that adapts to sidebar */}
      <main 
        id="main-content"
        className={cn(
          "flex-1 overflow-auto pt-16 lg:pt-0", 
          "lg:ml-[3.75rem] transition-all duration-300",
          "focus:outline-none",
          "bg-gray-50 dark:bg-gray-900"
        )}
        style={{ 
          // Dynamic margin based on sidebar collapsed state
          marginLeft: isDarkMode ? "var(--sidebar-width, 3.75rem)" : "var(--sidebar-width, 3.75rem)",
        }}
        tabIndex={-1} // Make focusable for "skip to content" but not in tab order
      >
        {/* Page header with proper contrast */}
        {pageTitle && (
          <header className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4">
            <div className="flex justify-between items-center">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">{pageTitle}</h1>
            </div>
          </header>
        )}
        
        {/* Page content with consistent padding */}
        <div className="p-4 md:p-6">
          {children}
        </div>
      </main>
    </div>
  );
}