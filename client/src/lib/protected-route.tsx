import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Loader2, ShieldAlert } from "lucide-react";
import { Redirect, Route } from "wouter";

export function ProtectedRoute({
  path,
  component: Component,
  requiredRole,
  requiredPermission,
}: {
  path: string;
  component: () => React.JSX.Element;
  requiredRole?: string;
  requiredPermission?: string;
}) {
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

  // Check for permission-based access
  if (requiredPermission && permissions && !permissions[requiredPermission]) {
    return (
      <Route path={path}>
        <AccessDeniedPage />
      </Route>
    );
  }

  // Check for role-based access
  if (requiredRole && user.role !== requiredRole) {
    // Special case: 'systemAdmin' role is only for system-level admin users
    // Regular 'admin' users should not access system admin routes
    if (requiredRole === 'systemAdmin' && user.role === 'admin') {
      return (
        <Route path={path}>
          <AccessDeniedPage />
        </Route>
      );
    }
    
    // If any other role is required, check exact match
    if (user.role !== requiredRole) {
      return (
        <Route path={path}>
          <AccessDeniedPage />
        </Route>
      );
    }
  }

  return <Route path={path} component={Component} />;
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
