import { useQuery } from "@tanstack/react-query";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Clock, CreditCard, InfoIcon } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

export function TrialStatus() {
  const [dismissed, setDismissed] = useState(false);
  
  const { data: onboardingStatus, isLoading } = useQuery({
    queryKey: ["/api/user/onboarding/status"],
    queryFn: async () => {
      const res = await fetch("/api/user/onboarding/status");
      if (!res.ok) throw new Error("Failed to fetch onboarding status");
      return res.json();
    },
  });
  
  if (isLoading || dismissed || !onboardingStatus) return null;
  
  const { trialStatus, plan } = onboardingStatus;
  
  // Don't show if not in trial mode
  if (!trialStatus?.active || onboardingStatus.subscriptionStatus !== "trial") {
    return null;
  }
  
  // Format days remaining
  const daysText = trialStatus.daysRemaining === 1 
    ? "1 day"
    : `${trialStatus.daysRemaining} days`;
  
  return (
    <Alert className="mb-6 bg-blue-50 border-blue-100">
      <div className="flex items-start justify-between">
        <div className="flex">
          <Clock className="h-4 w-4 text-blue-600 mr-2 mt-0.5" />
          <div>
            <AlertTitle className="text-blue-700">
              Your {plan} Trial
            </AlertTitle>
            <AlertDescription className="text-blue-600">
              {daysText} remaining in your trial - Upgrade to keep access to all premium features
            </AlertDescription>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            className="text-blue-600 border-blue-200 hover:bg-blue-100"
            onClick={() => setDismissed(true)}
          >
            Dismiss
          </Button>
          <Button 
            size="sm"
            className="bg-blue-600 hover:bg-blue-700"
            asChild
          >
            <Link href="/subscription">
              <CreditCard className="h-4 w-4 mr-1" />
              Upgrade
            </Link>
          </Button>
        </div>
      </div>
    </Alert>
  );
}