import { Switch } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import NotFound from "@/pages/not-found";
import { AuthProvider } from "@/hooks/use-auth";
import { TrialProvider } from "@/context/TrialContext";
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
import AdminDashboardPage from "@/pages/admin/dashboard-page";
import AdminUsersPage from "@/pages/admin/users-page";
import AdminFinancialPage from "@/pages/admin/financial-page";
import AdminSystemPage from "@/pages/admin/system-page";
import AdminCustomersPage from "@/pages/admin/customers-page";
import OnboardingPage from "@/pages/admin/onboarding-page";
import AdminAnalyticsPage from "@/pages/admin/analytics-page";
import AdminReportsPage from "@/pages/admin/reports-page";
import { Route } from "wouter";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={DashboardPage} />
      <ProtectedRoute path="/reviews" component={ReviewsPage} />
      <ProtectedRoute path="/alerts" component={AlertsPage} />
      <ProtectedRoute path="/responses" component={ResponsesPage} />
      <ProtectedRoute path="/analytics" component={AnalyticsPage} />
      <ProtectedRoute path="/review-requests" component={ReviewRequestsPage} />
      <ProtectedRoute path="/competitors" component={CompetitorsPage} />
      <ProtectedRoute path="/integrations" component={IntegrationsPage} />
      <ProtectedRoute path="/settings" component={SettingsPage} />
      <ProtectedRoute path="/profile" component={ProfilePage} />
      <ProtectedRoute path="/subscription" component={SubscriptionPage} />
      <ProtectedRoute path="/help" component={HelpPage} />
      <ProtectedRoute path="/admin" component={AdminDashboardPage} requiredRole="admin" />
      <ProtectedRoute path="/admin/users" component={AdminUsersPage} requiredRole="admin" />
      <ProtectedRoute path="/admin/financial" component={AdminFinancialPage} requiredRole="admin" />
      <ProtectedRoute path="/admin/system" component={AdminSystemPage} requiredRole="admin" />
      <ProtectedRoute path="/admin/customers" component={AdminCustomersPage} requiredRole="admin" />
      <ProtectedRoute path="/admin/onboarding" component={OnboardingPage} requiredRole="admin" />
      <ProtectedRoute path="/admin/analytics" component={AdminAnalyticsPage} requiredRole="admin" />
      <ProtectedRoute path="/admin/reports" component={AdminReportsPage} requiredRole="admin" />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary showError={process.env.NODE_ENV === 'development'}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TrialProvider>
            <TooltipProvider>
              <Toaster />
              <Router />
            </TooltipProvider>
          </TrialProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
