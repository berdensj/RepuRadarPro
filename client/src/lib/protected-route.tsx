import React from 'react';
import { useAuth } from "../hooks/use-auth";
import { Loader2, ShieldAlert } from "lucide-react";
import { Redirect, Route } from "wouter";
import { Layout } from '../components/Layout';

export interface ProtectedRouteProps {
  path: string;
  component: React.ComponentType<any>;
  requiredRole?: string;
}

export function ProtectedRoute({ path, component: Component, requiredRole }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
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

  if (requiredRole === 'admin' && user.role !== 'admin') {
    return (
      <Route path={path}>
        <Layout>
          <div className="flex flex-col items-center justify-center h-full">
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
        </Layout>
      </Route>
    );
  }

  return (
    <Route path={path}>
      <Layout>
        <Component />
      </Layout>
    </Route>
  );
}
