import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Loader2, ShieldAlert } from "lucide-react";
import { Redirect, Route } from "wouter";
import { Suspense, ReactNode } from "react";

interface ProtectedRouteProps {
  path: string;
  component?: React.ComponentType<any>;
  children?: ReactNode;
  requiredRole?: string;
  requiredPermission?: string;
}

export function ProtectedRoute({
  path,
  component: Component,
  children,
  requiredRole,
  requiredPermission,
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  
  // Fetch user permissions
  const { data: permissions, isLoading: permissionsLoading } = useQuery({
    queryKey: ["/api/permissions"],
    enabled: !!user, // Only fetch permissions if user is logged in
  });

  if (isLoading || (requiredPermission && permissionsLoading)) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Route>
    );
  }

  if (!user) {
    return (
      <Route path={path}>
        <Redirect to="/auth" />
      </Route>
    );
  }
  
  // Special case: If this is a client admin (admin role but not system admin) 
  // trying to access the root dashboard, redirect to the reviews page
  if ((path === '/' || path === '/dashboard') && user.role === 'admin') {
    // The isSystemAdmin flag is only set to true for admin users with username "admin"
    // Let's simplify this logic to avoid access issues
    
    // We'll just check if this user is the main system admin
    const isSystemAdmin = user.username === 'admin';
    
    if (!isSystemAdmin) {
      console.log("Client admin detected, redirecting to reviews dashboard");
      // For client admins at root, redirect to reviews page (main dashboard)
      return (
        <Route path={path}>
          <Redirect to="/reviews" />
        </Route>
      );
    }
  }

  // Check for permission-based access
  if (requiredPermission && permissions) {
    // Special case for client-admin routes
    if (path.startsWith('/client-admin')) {
      // Client admins (role = admin) always have access to client-admin routes
      if (user.role === 'admin') {
        // Allow access
        console.log("Client admin accessing admin section - permitted");
      }
      // For others, check specific permissions
      else if (permissions.hasOwnProperty(requiredPermission) && !permissions[requiredPermission as keyof typeof permissions]) {
        return (
          <Route path={path}>
            <AccessDeniedPage />
          </Route>
        );
      }
    }
    // For non-client-admin routes with permission requirements
    else if (permissions.hasOwnProperty(requiredPermission) && !permissions[requiredPermission as keyof typeof permissions]) {
      return (
        <Route path={path}>
          <AccessDeniedPage />
        </Route>
      );
    }
  }

  // Check for role-based access
  if (requiredRole) {
    // Special case: 'systemAdmin' role is only for platform owners
    // This is a pseudo-role that's checked differently
    if (requiredRole === 'systemAdmin') {
      // Instead of using localStorage which might get out of sync,
      // directly check if the user is the system admin by username
      const isSystemAdmin = user.username === 'admin';
      if (!isSystemAdmin) {
        return (
          <Route path={path}>
            <AccessDeniedPage />
          </Route>
        );
      }
    }
    // For all other roles, do a direct comparison
    else if (user.role !== requiredRole) {
      return (
        <Route path={path}>
          <AccessDeniedPage />
        </Route>
      );
    }
  }

  // Handle either component prop or children prop
  return (
    <Route path={path}>
      {Component ? (
        typeof Component === 'function' ? <Component /> : Component
      ) : children}
    </Route>
  );
}

// Separate component for access denied page to avoid duplication
function AccessDeniedPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <ShieldAlert className="h-16 w-16 text-red-500 mb-4" />
      <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
      <p className="text-muted-foreground mb-4">
        You don't have permission to access this page.
      </p>
      <button 
        onClick={() => window.history.back()} 
        className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
      >
        Go Back
      </button>
    </div>
  );
}
