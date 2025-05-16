import { ReactNode, useEffect, useState } from 'react';
import { cn } from "@/lib/utils";
import { useIsMobile } from '@/hooks/use-mobile';
import { EnhancedSidebar } from './enhanced-sidebar';

interface DashboardLayoutProps {
  children: ReactNode;
  pageTitle?: string;
}

export function EnhancedDashboardLayout({ children, pageTitle }: DashboardLayoutProps) {
  const isMobile = useIsMobile();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // Load sidebar state from localStorage on mount
  useEffect(() => {
    try {
      const savedState = localStorage.getItem('sidebar_collapsed');
      if (savedState !== null) {
        setSidebarCollapsed(savedState === 'true');
      }
    } catch (e) {
      // Ignore storage errors
    }
  }, []);
  
  return (
    <div className="h-screen flex flex-col lg:flex-row bg-gray-50 dark:bg-gray-900">
      {/* Add a skip link for keyboard accessibility */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:z-[100] bg-white dark:bg-gray-800 px-4 py-2 top-2 left-2 focus:outline-none focus:ring-2 focus:ring-primary"
      >
        Skip to main content
      </a>
      
      {/* Enhanced sidebar */}
      <EnhancedSidebar />
      
      {/* Main content */}
      <main 
        id="main-content"
        className={cn(
          "flex-1 transition-all duration-300 overflow-auto",
          isMobile ? "w-full" : (sidebarCollapsed ? "lg:ml-16" : "lg:ml-64")
        )}
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