import { Switch } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
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

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={DashboardPage} />
      <ProtectedRoute path="/dashboard" component={DashboardPage} />
      <ProtectedRoute path="/reviews" component={ReviewsPage} />
      <ProtectedRoute path="/alerts" component={AlertsPage} />
      <ProtectedRoute path="/responses" component={ResponsesPage} />
      <ProtectedRoute path="/analytics" component={AnalyticsPage} />
      <ProtectedRoute path="/review-requests" component={ReviewRequestsPage} />
      <ProtectedRoute path="/competitors" component={CompetitorsPage} />
      <ProtectedRoute path="/integrations" component={IntegrationsPage} />
      <ProtectedRoute path="/reports" component={ReportsPage} />
      <ProtectedRoute path="/communications" component={CommunicationsPage} />
      <ProtectedRoute path="/import-export" component={ImportExportPage} />
      <ProtectedRoute path="/workflows" component={WorkflowsPage} />
      <ProtectedRoute path="/activity-logs" component={ActivityLogsPage} />
      <ProtectedRoute path="/dashboard-builder" component={DashboardBuilderPage} />
      <ProtectedRoute path="/templates" component={TemplatesPage} />
      <ProtectedRoute path="/api-access" component={ApiAccessPage} />
      <ProtectedRoute path="/white-label" component={WhiteLabelPage} />
      <ProtectedRoute path="/settings" component={SettingsPage} />
      <ProtectedRoute path="/profile" component={ProfilePage} />
      <ProtectedRoute path="/subscription" component={SubscriptionPage} />
      <ProtectedRoute path="/help" component={HelpPage} />
      <ProtectedRoute path="/onboarding" component={UserOnboardingPage} />
      
      {/* Client Admin Section */}
      <ProtectedRoute path="/client-admin" component={ClientAdminUsersPage} requiredPermission="canManageUsers" />
      <ProtectedRoute path="/client-admin/users" component={ClientAdminUsersPage} requiredPermission="canManageUsers" />
      <ProtectedRoute path="/client-admin/dashboard" component={ClientAdminUsersPage} requiredPermission="canManageUsers" />
      
      {/* System Admin Section - Only accessible to system admin users */}
      <ProtectedRoute path="/admin" component={AdminDashboardPage} requiredRole="systemAdmin" />
      <ProtectedRoute path="/admin/users" component={AdminUsersPage} requiredRole="systemAdmin" />
      <ProtectedRoute path="/admin/financial" component={AdminFinancialPage} requiredRole="systemAdmin" />
      <ProtectedRoute path="/admin/system" component={AdminSystemPage} requiredRole="systemAdmin" />
      <ProtectedRoute path="/admin/customers" component={AdminCustomersPage} requiredRole="systemAdmin" />
      <ProtectedRoute path="/admin/onboarding" component={OnboardingPage} requiredRole="systemAdmin" />
      <ProtectedRoute path="/admin/analytics" component={AdminAnalyticsPage} requiredRole="systemAdmin" />
      <ProtectedRoute path="/admin/reports" component={AdminReportsPage} requiredRole="systemAdmin" />
      
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
