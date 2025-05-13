import { Switch } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import { SidebarLayout } from "@/components/layout/sidebar-layout";
import DashboardPage from "@/pages/dashboard-page";
import AuthPage from "@/pages/auth-page";
import ReviewsPage from "@/pages/reviews-page";
import AlertsPage from "@/pages/alerts-page";
import ResponsesPage from "@/pages/responses-page";
import AnalyticsPage from "@/pages/analytics-page";
import SettingsPage from "@/pages/settings-page";
import IntegrationsPage from "@/pages/integrations-page";
import CompetitorsPage from "@/pages/competitors-page";
import ReviewRequestsPage from "@/pages/review-requests-page";
import ProfilePage from "@/pages/profile-page";
import HelpPage from "@/pages/help-page";
import SubscriptionPage from "@/pages/subscription-page";
import ReportsPage from "@/pages/reports-page";
import WorkflowsPage from "@/pages/workflows-page";
import TemplatesPage from "@/pages/templates-page";
import ImportExportPage from "@/pages/import-export-page";
import ActivityLogsPage from "@/pages/activity-logs-page";
import CommunicationsPage from "@/pages/communications-page";
import ApiAccessPage from "@/pages/api-access-page";
import WhiteLabelPage from "@/pages/white-label-page";
import DashboardBuilderPage from "@/pages/dashboard-builder-page";
import AdminDashboardPage from "@/pages/admin/dashboard-page";
import AdminUsersPage from "@/pages/admin/users-page";
import AdminFinancialPage from "@/pages/admin/financial-page";
import AdminSystemPage from "@/pages/admin/system-page";
import AdminCustomersPage from "@/pages/admin/customers-page";
import OnboardingPage from "@/pages/admin/onboarding-page";
import AdminAnalyticsPage from "@/pages/admin/analytics-page";
import AdminReportsPage from "@/pages/admin/reports-page";
import UserOnboardingPage from "@/pages/onboarding";
import ClientAdminUsersPage from "@/pages/client-admin/users-page";
import { Route } from "wouter";

// Function to wrap a component with the SidebarLayout
const withSidebarLayout = (Component: React.ComponentType, pageTitle?: string) => {
  return function WrappedComponent() {
    return (
      <SidebarLayout pageTitle={pageTitle}>
        <Component />
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
      <ProtectedRoute path="/profile" component={withSidebarLayout(ProfilePage, "Profile")} />
      <ProtectedRoute path="/subscription" component={withSidebarLayout(SubscriptionPage, "Subscription")} />
      <ProtectedRoute path="/help" component={withSidebarLayout(HelpPage, "Help & Support")} />
      <ProtectedRoute path="/onboarding" component={UserOnboardingPage} />
      
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
      
      {/* Public routes */}
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
