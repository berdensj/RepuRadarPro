import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Clock, CheckCircle2 } from "lucide-react";
import WelcomePage from "@/pages/onboarding/welcome-page";
import BusinessInfoPage from "@/pages/onboarding/business-info-page";
import BusinessTypePage from "@/pages/onboarding/business-type-page";
import AddLocationPage from "@/pages/onboarding/add-location-page";
import ConnectPlatformsPage from "@/pages/onboarding/connect-platforms-page";
import AiPreferencesPage from "@/pages/onboarding/ai-preferences-page";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

export default function OnboardingIndex() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Check if user has already completed onboarding
  const { data: onboardingStatus, isLoading } = useQuery({
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
    
    // Pre-fill data from onboarding status if available
    if (onboardingStatus?.businessInfo) {
      setOnboardingData(prev => ({
        ...prev,
        businessInfo: onboardingStatus.businessInfo
      }));
    }
  }, [onboardingStatus, setLocation]);
  
  // Steps in the onboarding process
  const steps = [
    "Welcome",
    "Business Info",
    "Business Type",
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
  
  // Format remaining trial days for display
  const formatTrialStatus = () => {
    if (!onboardingStatus?.trialStatus) return null;
    
    const { active, daysRemaining } = onboardingStatus.trialStatus;
    
    if (!active) return "Trial expired";
    
    if (daysRemaining === 0) return "Trial expires today";
    if (daysRemaining === 1) return "1 day remaining in trial";
    return `${daysRemaining} days remaining in trial`;
  };
  
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
      // Submit all data collected during onboarding
      const response = await fetch("/api/user/onboarding/complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(onboardingData)
      });
      
      if (!response.ok) {
        throw new Error("Failed to complete onboarding");
      }
      
      toast({
        title: "Onboarding complete!",
        description: "Your account is now fully set up and ready to use.",
      });
      
      // Redirect to dashboard
      setLocation("/");
    } catch (error) {
      console.error("Error completing onboarding:", error);
      toast({
        title: "Error completing onboarding",
        description: "Please try again or contact support if the problem persists.",
        variant: "destructive"
      });
    }
  };
  
  // Render current step
  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <WelcomePage goNext={goNext} trialDays={onboardingStatus?.trialStatus?.daysRemaining} />;
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
          <BusinessTypePage 
            data={onboardingData} 
            updateData={updateData} 
            goNext={goNext} 
          />
        );
      case 3:
        return (
          <AddLocationPage 
            data={onboardingData} 
            updateData={updateData} 
            goNext={goNext} 
          />
        );
      case 4:
        return (
          <ConnectPlatformsPage 
            data={onboardingData} 
            updateData={updateData} 
            goNext={goNext} 
          />
        );
      case 5:
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
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-8">
        {/* Trial status banner */}
        {onboardingStatus?.trialStatus && (
          <Alert className="mb-6 bg-blue-50 border-blue-100">
            <Clock className="h-4 w-4 text-blue-600" />
            <AlertTitle className="text-blue-700">
              {onboardingStatus.plan} Trial
            </AlertTitle>
            <AlertDescription className="text-blue-600">
              {formatTrialStatus()} - Access to all premium features
            </AlertDescription>
          </Alert>
        )}
        
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