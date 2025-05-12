import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import WelcomePage from "@/pages/onboarding/welcome-page";
import BusinessInfoPage from "@/pages/onboarding/business-info-page";
import AddLocationPage from "@/pages/onboarding/add-location-page";
import ConnectPlatformsPage from "@/pages/onboarding/connect-platforms-page";
import AiPreferencesPage from "@/pages/onboarding/ai-preferences-page";
import { useQuery } from "@tanstack/react-query";

export default function OnboardingIndex() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  
  // Check if user has already completed onboarding
  const { data: onboardingStatus } = useQuery({
    queryKey: ["/api/user/onboarding/status"],
    queryFn: async () => {
      const res = await fetch("/api/user/onboarding/status");
      if (!res.ok) throw new Error("Failed to fetch onboarding status");
      return res.json();
    },
  });
  
  useEffect(() => {
    // If user has completed onboarding, redirect to dashboard
    if (onboardingStatus?.onboardingComplete) {
      setLocation("/");
    }
  }, [onboardingStatus, setLocation]);
  
  // Steps in the onboarding process
  const steps = [
    "Welcome",
    "Business Info",
    "Locations",
    "Connect Platforms",
    "AI Preferences"
  ];
  
  const [currentStep, setCurrentStep] = useState(0);
  const [onboardingData, setOnboardingData] = useState({
    businessInfo: {},
    locations: [],
    platforms: {},
    aiPreferences: {}
  });
  
  // Update data for a specific section
  const updateData = (section: string, data: any) => {
    setOnboardingData(prev => ({
      ...prev,
      [section]: data
    }));
  };
  
  // Go to next step
  const goNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // If last step, complete onboarding and redirect
      completeOnboarding();
    }
  };
  
  // Go to previous step
  const goPrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  // Calculate progress percentage
  const progressPercentage = ((currentStep + 1) / steps.length) * 100;
  
  // Complete onboarding and submit all data
  const completeOnboarding = async () => {
    try {
      // Mark onboarding as complete
      await fetch("/api/user/onboarding/complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        }
      });
      
      // Redirect to dashboard
      setLocation("/");
    } catch (error) {
      console.error("Error completing onboarding:", error);
    }
  };
  
  // Render current step
  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <WelcomePage goNext={goNext} />;
      case 1:
        return (
          <BusinessInfoPage 
            data={onboardingData} 
            updateData={updateData} 
            goNext={goNext} 
          />
        );
      case 2:
        return (
          <AddLocationPage 
            data={onboardingData} 
            updateData={updateData} 
            goNext={goNext} 
          />
        );
      case 3:
        return (
          <ConnectPlatformsPage 
            data={onboardingData} 
            updateData={updateData} 
            goNext={goNext} 
          />
        );
      case 4:
        return (
          <AiPreferencesPage 
            data={onboardingData} 
            updateData={updateData} 
            goNext={goNext} 
          />
        );
      default:
        return null;
    }
  };
  
  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-8">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-slate-500">
              Step {currentStep + 1} of {steps.length}
            </span>
            <span className="text-sm font-medium text-slate-500">
              {steps[currentStep]}
            </span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>
        
        {/* Step content */}
        <div className="py-6">
          {renderStep()}
        </div>
        
        {/* Navigation buttons - only show on steps after welcome */}
        {currentStep > 0 && (
          <div className="flex justify-between mt-8 pt-4 border-t border-slate-100">
            <Button 
              variant="outline" 
              onClick={goPrevious}
              className="flex items-center gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            
            <Button 
              variant="ghost" 
              onClick={() => setLocation("/")}
              className="text-slate-500"
            >
              Skip for now
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}