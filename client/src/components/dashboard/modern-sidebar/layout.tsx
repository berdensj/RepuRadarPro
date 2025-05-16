import { ReactNode, useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/hooks/use-theme";
import { ModernSidebar } from "./index";
import { cn } from "@/lib/utils";

interface ModernLayoutProps {
  children: ReactNode;
  pageTitle?: string;
}

export function ModernLayout({ children, pageTitle }: ModernLayoutProps) {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const { theme, toggleTheme } = useTheme();
  
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
      {/* Skip to content for accessibility */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:z-[100] bg-white dark:bg-gray-800 px-4 py-2 top-2 left-2 focus:outline-none focus:ring-2 focus:ring-primary"
      >
        Skip to main content
      </a>
      
      {/* Modern sidebar */}
      <ModernSidebar 
        onNavigate={handleNavigation}
        activeRoute={location}
        userName={user?.fullName || user?.username || "User"}
        userEmail={user?.email || ""}
        avatarUrl={user?.profilePicture || ""}
        onLogout={handleLogout}
        onToggleTheme={toggleTheme}
        isDarkMode={theme === "dark"}
      />
      
      {/* Main content */}
      <main 
        id="main-content"
        className="flex-1 overflow-auto"
      >
        {/* Page header */}
        {pageTitle && (
          <header className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{pageTitle}</h1>
            </div>
          </header>
        )}
        
        {/* Page content */}
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}