import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { CheckCheck, Star, Calendar } from "lucide-react";
import { format, addDays } from "date-fns";

interface WelcomePageProps {
  data: any;
  updateData: (section: string, data: any) => void;
  goNext: () => void;
}

export default function WelcomePage({ goNext }: WelcomePageProps) {
  const { user } = useAuth();
  const [trialEndDate, setTrialEndDate] = useState<Date | null>(null);

  // Calculate trial end date (14 days from now or from user's trialEndsAt)
  useEffect(() => {
    if (user && user.trialEndsAt) {
      setTrialEndDate(new Date(user.trialEndsAt));
    } else {
      // Default to 14 days from now if not set in user profile
      setTrialEndDate(addDays(new Date(), 14));
    }
  }, [user]);

  return (
    <div className="text-center space-y-6">
      <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 text-primary mb-4">
        <Star className="h-8 w-8" />
      </div>
      
      <h1 className="text-3xl font-bold text-slate-800">
        Welcome to RepuRadarPro!
      </h1>
      
      <p className="text-lg text-slate-600 max-w-md mx-auto">
        Your 14-day free trial has started. Let's set up your account to get the most out of our AI-powered reputation management platform.
      </p>
      
      {trialEndDate && (
        <div className="bg-blue-50 p-4 rounded-lg inline-flex items-center space-x-3 text-blue-700">
          <Calendar className="h-5 w-5" />
          <span>Your trial ends on {format(trialEndDate, "MMMM d, yyyy")}</span>
        </div>
      )}
      
      <div className="pt-4 space-y-4 text-left max-w-lg mx-auto">
        <div className="flex items-start space-x-3">
          <div className="mt-1 bg-primary/10 p-1 rounded text-primary">
            <CheckCheck className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-medium">All Features Unlocked</h3>
            <p className="text-sm text-slate-600">
              During your trial, you have access to all premium features.
            </p>
          </div>
        </div>
        
        <div className="flex items-start space-x-3">
          <div className="mt-1 bg-primary/10 p-1 rounded text-primary">
            <CheckCheck className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-medium">No Credit Card Required</h3>
            <p className="text-sm text-slate-600">
              Try everything with no commitment during your trial period.
            </p>
          </div>
        </div>
        
        <div className="flex items-start space-x-3">
          <div className="mt-1 bg-primary/10 p-1 rounded text-primary">
            <CheckCheck className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-medium">Easy Setup Process</h3>
            <p className="text-sm text-slate-600">
              It only takes a few minutes to get your account ready.
            </p>
          </div>
        </div>
      </div>
      
      <div className="pt-6">
        <Button onClick={goNext} size="lg" className="w-full sm:w-auto">
          Let's Get Started
        </Button>
      </div>
    </div>
  );
}