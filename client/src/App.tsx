import { Suspense, lazy } from "react";
import { Switch } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { AuthProvider } from "@/hooks/use-auth";
import { ThemeProvider } from "@/hooks/use-theme";
import { ProtectedRoute } from "@/lib/protected-route";
import { SidebarLayout } from "@/components/layout/sidebar-layout";
import { Route } from "wouter";
import { Loader2 } from "lucide-react";

// Non-lazy load for not-found page to prevent hydration issues
import NotFoundPage from "@/pages/not-found";
import TestSidebarPage from "@/pages/test-sidebar-page";
import TestEnhancedSidebarPage from "@/pages/test-enhanced-sidebar";
import ModernSidebarDemo from "@/pages/modern-sidebar-demo";
import EnhancedSidebarDemo from "@/pages/enhanced-sidebar-demo";
import AccessibleSidebarDemo from "@/pages/accessible-sidebar-demo";

// Lazy load components for better performance
// Using dynamic imports with proper typing
const DashboardPage = lazy(() => import("@/pages/dashboard-page").then(module => ({ default: module.default })));
const AuthPage = lazy(() => import("@/pages/auth-page").then(module => ({ default: module.default })));
const ReviewsPage = lazy(() => import("@/pages/reviews-page").then(module => ({ default: module.default })));
const AlertsPage = lazy(() => import("@/pages/alerts-page").then(module => ({ default: module.default })));
const ResponsesPage = lazy(() => import("@/pages/responses-page").then(module => ({ default: module.default })));
const AnalyticsPage = lazy(() => import("@/pages/analytics-page").then(module => ({ default: module.default })));
const SettingsPage = lazy(() => import("@/pages/settings-page").then(module => ({ default: module.default })));
const IntegrationsPage = lazy(() => import("@/pages/integrations-page-simple").then(module => ({ default: module.default })));
const CompetitorsPage = lazy(() => import("@/pages/competitors-page").then(module => ({ default: module.default })));
const ReviewRequestsPage = lazy(() => import("@/pages/review-requests-page").then(module => ({ default: module.default })));
const ProfilePage = lazy(() => import("@/pages/profile-page").then(module => ({ default: module.default })));
const HelpPage = lazy(() => import("@/pages/help-page").then(module => ({ default: module.default })));
const SubscriptionPage = lazy(() => import("@/pages/subscription-page").then(module => ({ default: module.default })));
const ReportsPage = lazy(() => import("@/pages/reports-page").then(module => ({ default: module.default })));
const WorkflowsPage = lazy(() => import("@/pages/workflows-page").then(module => ({ default: module.default })));
const TemplatesPage = lazy(() => import("@/pages/templates-page").then(module => ({ default: module.default })));
const ImportExportPage = lazy(() => import("@/pages/import-export-page").then(module => ({ default: module.default })));
const ActivityLogsPage = lazy(() => import("@/pages/activity-logs-page").then(module => ({ default: module.default })));
const CommunicationsPage = lazy(() => import("@/pages/communications-page").then(module => ({ default: module.default })));
const ApiAccessPage = lazy(() => import("@/pages/api-access-page").then(module => ({ default: module.default })));
const WhiteLabelPage = lazy(() => import("@/pages/white-label-page").then(module => ({ default: module.default })));
const DashboardBuilderPage = lazy(() => import("@/pages/dashboard-builder-page").then(module => ({ default: module.default })));
const HealthcareSettingsPage = lazy(() => import("@/pages/healthcare-settings-page").then(module => ({ default: module.default })));
const AdminDashboardPage = lazy(() => import("@/pages/admin/dashboard-page").then(module => ({ default: module.default })));
const AdminUsersPage = lazy(() => import("@/pages/admin/users-page").then(module => ({ default: module.default })));
const AdminFinancialPage = lazy(() => import("@/pages/admin/financial-page").then(module => ({ default: module.default })));
const AdminSystemPage = lazy(() => import("@/pages/admin/system-page").then(module => ({ default: module.default })));
const AdminCustomersPage = lazy(() => import("@/pages/admin/customers-page").then(module => ({ default: module.default })));
const OnboardingPage = lazy(() => import("@/pages/admin/onboarding-page").then(module => ({ default: module.default })));
const AdminAnalyticsPage = lazy(() => import("@/pages/admin/analytics-page").then(module => ({ default: module.default })));
const AdminReportsPage = lazy(() => import("@/pages/admin/reports-page").then(module => ({ default: module.default })));
const UserOnboardingPage = lazy(() => import("@/pages/onboarding").then(module => ({ default: module.default })));
const ClientAdminUsersPage = lazy(() => import("@/pages/client-admin/users-page").then(module => ({ default: module.default })));

// Loading spinner component with accessibility improvements
const LoadingSpinner = () => (
  <div 
    className="flex items-center justify-center min-h-screen"
    role="status"
    aria-live="polite"
    aria-busy="true"
  >
    <Loader2 className="h-10 w-10 animate-spin text-primary" aria-hidden="true" />
    <span className="sr-only">Loading content, please wait...</span>
  </div>
);

// Function to wrap a component with the SidebarLayout and Suspense
// Using a more direct approach to avoid type errors
const withSidebarLayout = (LazyComponent: any, pageTitle?: string) => {
  return function WrappedComponent() {
    return (
      <SidebarLayout pageTitle={pageTitle}>
        <Suspense fallback={<LoadingSpinner />}>
          <LazyComponent />
        </Suspense>
      </SidebarLayout>
    );
  };
};

function Router() {
  return (
    <Switch>
      {/* Client Dashboard Routes - All wrapped with SidebarLayout */}
      <ProtectedRoute path="/" component={withSidebarLayout(DashboardPage, "Dashboard")} />
      <ProtectedRoute path="/dashboard" component={withSidebarLayout(DashboardPage, "Dashboard")} />
      <ProtectedRoute path="/reviews" component={withSidebarLayout(ReviewsPage, "Reviews")} />
      <ProtectedRoute path="/alerts" component={withSidebarLayout(AlertsPage, "Alerts")} />
      <ProtectedRoute path="/responses" component={withSidebarLayout(ResponsesPage, "AI Responses")} />
      <ProtectedRoute path="/analytics" component={withSidebarLayout(AnalyticsPage, "Analytics")} />
      <ProtectedRoute path="/review-requests" component={withSidebarLayout(ReviewRequestsPage, "Review Requests")} />
      <ProtectedRoute path="/competitors" component={withSidebarLayout(CompetitorsPage, "Competitors")} />
      <ProtectedRoute path="/integrations" component={withSidebarLayout(IntegrationsPage, "Integrations")} />
      <ProtectedRoute path="/reports" component={withSidebarLayout(ReportsPage, "Reports")} />
      <ProtectedRoute path="/communications" component={withSidebarLayout(CommunicationsPage, "Communications")} />
      <ProtectedRoute path="/import-export" component={withSidebarLayout(ImportExportPage, "Import/Export")} />
      <ProtectedRoute path="/workflows" component={withSidebarLayout(WorkflowsPage, "Workflows")} />
      <ProtectedRoute path="/activity-logs" component={withSidebarLayout(ActivityLogsPage, "Activity Logs")} />
      <ProtectedRoute path="/dashboard-builder" component={withSidebarLayout(DashboardBuilderPage, "Dashboard Builder")} />
      <ProtectedRoute path="/templates" component={withSidebarLayout(TemplatesPage, "Templates")} />
      <ProtectedRoute path="/api-access" component={withSidebarLayout(ApiAccessPage, "API Access")} />
      <ProtectedRoute path="/white-label" component={withSidebarLayout(WhiteLabelPage, "White Label")} />
      <ProtectedRoute path="/settings" component={withSidebarLayout(SettingsPage, "Settings")} />
      <ProtectedRoute path="/healthcare-settings" component={withSidebarLayout(HealthcareSettingsPage, "Healthcare Settings")} />
      <ProtectedRoute path="/profile" component={withSidebarLayout(ProfilePage, "Profile")} />
      <ProtectedRoute path="/subscription" component={withSidebarLayout(SubscriptionPage, "Subscription")} />
      <ProtectedRoute path="/help" component={withSidebarLayout(HelpPage, "Help & Support")} />
      <ProtectedRoute path="/onboarding">
        <Suspense fallback={<LoadingSpinner />}>
          <UserOnboardingPage />
        </Suspense>
      </ProtectedRoute>
      
      {/* Client Admin Section */}
      <ProtectedRoute 
        path="/client-admin" 
        component={withSidebarLayout(ClientAdminUsersPage, "Admin - Users")} 
        requiredPermission="canManageUsers" 
      />
      <ProtectedRoute 
        path="/client-admin/users" 
        component={withSidebarLayout(ClientAdminUsersPage, "Admin - Users")} 
        requiredPermission="canManageUsers" 
      />
      <ProtectedRoute 
        path="/client-admin/dashboard" 
        component={withSidebarLayout(ClientAdminUsersPage, "Admin - Dashboard")} 
        requiredPermission="canManageUsers" 
      />
      
      {/* System Admin Section - Only accessible to system admin users */}
      <ProtectedRoute 
        path="/admin" 
        component={withSidebarLayout(AdminDashboardPage, "System Admin")} 
        requiredRole="systemAdmin" 
      />
      <ProtectedRoute 
        path="/admin/users" 
        component={withSidebarLayout(AdminUsersPage, "System Admin - Users")} 
        requiredRole="systemAdmin" 
      />
      <ProtectedRoute 
        path="/admin/financial" 
        component={withSidebarLayout(AdminFinancialPage, "System Admin - Financial")} 
        requiredRole="systemAdmin" 
      />
      <ProtectedRoute 
        path="/admin/system" 
        component={withSidebarLayout(AdminSystemPage, "System Admin - System Health")} 
        requiredRole="systemAdmin" 
      />
      <ProtectedRoute 
        path="/admin/customers" 
        component={withSidebarLayout(AdminCustomersPage, "System Admin - Customers")} 
        requiredRole="systemAdmin" 
      />
      <ProtectedRoute 
        path="/admin/onboarding" 
        component={withSidebarLayout(OnboardingPage, "System Admin - Onboarding")} 
        requiredRole="systemAdmin" 
      />
      <ProtectedRoute 
        path="/admin/analytics" 
        component={withSidebarLayout(AdminAnalyticsPage, "System Admin - Analytics")} 
        requiredRole="systemAdmin" 
      />
      <ProtectedRoute 
        path="/admin/reports" 
        component={withSidebarLayout(AdminReportsPage, "System Admin - Reports")} 
        requiredRole="systemAdmin" 
      />
      
      {/* Public routes with proper Suspense handling */}
      <Route path="/auth">
        {() => (
          <Suspense fallback={<LoadingSpinner />}>
            <AuthPage />
          </Suspense>
        )}
      </Route>
      <Route path="/test-sidebar">
        {() => <TestSidebarPage />}
      </Route>
      <Route path="/enhanced-sidebar">
        {() => <TestEnhancedSidebarPage />}
      </Route>
      <Route path="/modern-sidebar">
        {() => <ModernSidebarDemo />}
      </Route>
      <Route path="/enhanced-sidebar-demo">
        {() => <EnhancedSidebarDemo />}
      </Route>
      <Route path="/accessible-sidebar">
        {() => <AccessibleSidebarDemo />}
      </Route>
      <Route>
        {() => <NotFoundPage />}
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <TooltipProvider>
            {/* Screen reader announcements container */}
            <div 
              className="sr-only" 
              aria-live="polite" 
              id="aria-live-announcer"
            ></div>
            
            <Toaster />
            <Router />
          </TooltipProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
