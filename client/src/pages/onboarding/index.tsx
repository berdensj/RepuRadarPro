import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ChartLine, ChevronLeft, ChevronRight } from "lucide-react";
import WelcomePage from "./welcome-page";
import BusinessInfoPage from "./business-info-page";
import AddLocationPage from "./add-location-page";
import ConnectPlatformsPage from "./connect-platforms-page";
import AiPreferencesPage from "./ai-preferences-page";
import { useQuery } from "@tanstack/react-query";

export default function OnboardingIndex() {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [, navigate] = useLocation();
  
  // Onboarding data
  const [onboardingData, setOnboardingData] = useState({
    businessInfo: {
      businessName: "",
      industry: "",
      contactName: "",
      contactEmail: "",
      contactPhone: "",
      logo: null as File | null,
    },
    locations: [] as {
      name: string;
      address: string;
      city: string;
      state: string;
      zip: string;
      email: string;
      phone: string;
    }[],
    platforms: {
      google: false,
      yelp: false,
      facebook: false,
    },
    aiPreferences: {
      defaultTone: "professional",
      autoReplyToFiveStars: false,
      notificationFrequency: "daily",
    }
  });

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  // Check if onboarding is complete
  const { data: onboardingComplete } = useQuery({
    queryKey: ['/api/user/onboarding/status'],
    enabled: !!user,
  });

  // Redirect to dashboard if onboarding is complete
  useEffect(() => {
    if (onboardingComplete) {
      navigate("/");
    }
  }, [onboardingComplete, navigate]);

  const steps = [
    { name: "Welcome", component: WelcomePage },
    { name: "Business Info", component: BusinessInfoPage },
    { name: "Add Location", component: AddLocationPage },
    { name: "Connect Platforms", component: ConnectPlatformsPage },
    { name: "AI Preferences", component: AiPreferencesPage },
  ];

  const CurrentStepComponent = steps[currentStep].component;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete onboarding and navigate to dashboard
      navigate("/");
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleUpdateData = (section: string, data: any) => {
    setOnboardingData((prev) => ({
      ...prev,
      [section]: data,
    }));
  };

  // Calculate progress percentage
  const progressPercentage = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header with logo and progress */}
      <header className="bg-white border-b border-slate-200 p-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="text-primary text-xl font-bold flex items-center">
            <ChartLine className="h-5 w-5 mr-2" />
            RepuRadar
          </div>
          <div className="hidden sm:block w-1/2">
            <div className="flex items-center justify-between mb-1 text-sm text-slate-500">
              <span>Getting Started</span>
              <span>{currentStep + 1} of {steps.length}</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-grow flex items-start justify-center p-4 sm:p-8">
        <div className="w-full max-w-3xl bg-white rounded-lg shadow-sm p-6 sm:p-8">
          <CurrentStepComponent 
            data={onboardingData}
            updateData={handleUpdateData}
            goNext={handleNext}
          />
        </div>
      </main>

      {/* Footer with navigation buttons */}
      <footer className="bg-white border-t border-slate-200 p-4">
        <div className="max-w-3xl mx-auto flex justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <Button
            onClick={handleNext}
          >
            {currentStep === steps.length - 1 ? "Finish Setup" : "Continue"}
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </footer>
    </div>
  );
}