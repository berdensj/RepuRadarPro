import React, { useState, useCallback } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { CheckCircle, Circle, ArrowRight, ArrowLeft, Building2, Link, Send, X } from 'lucide-react';
import { useAuth } from '../hooks/use-auth';
import { useToast } from '../hooks/use-toast';

interface OnboardingData {
  businessName: string;
  businessType: string;
  googleBusinessUrl: string;
  firstInviteEmail: string;
  firstInviteMessage: string;
}

interface OnboardingStepperProps {
  onComplete: () => void;
  onSkip?: () => void;
}

const businessTypes = [
  'Restaurant',
  'Retail Store', 
  'Professional Services',
  'Healthcare',
  'Beauty & Wellness',
  'Automotive',
  'Real Estate',
  'Technology',
  'Other'
];

const steps = [
  {
    id: 1,
    title: 'Business Details',
    description: 'Tell us about your business',
    icon: Building2,
  },
  {
    id: 2,
    title: 'Google Business',
    description: 'Connect your Google Business Profile',
    icon: Link,
  },
  {
    id: 3,
    title: 'First Invite',
    description: 'Send your first review invitation',
    icon: Send,
  },
];

export function OnboardingStepper({ onComplete, onSkip }: OnboardingStepperProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<OnboardingData>({
    businessName: '',
    businessType: '',
    googleBusinessUrl: '',
    firstInviteEmail: '',
    firstInviteMessage: 'Hi! We hope you had a great experience with us. Would you mind leaving us a review? It would mean a lot to our business. Thank you!',
  });

  const { user } = useAuth();
  const { toast } = useToast();

  const updateData = useCallback((updates: Partial<OnboardingData>) => {
    setData(prev => ({ ...prev, ...updates }));
  }, []);

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return data.businessName.trim() !== '' && data.businessType !== '';
      case 2:
        return data.googleBusinessUrl.trim() !== '';
      case 3:
        return data.firstInviteEmail.trim() !== '';
      default:
        return false;
    }
  };

  const handleNext = async () => {
    if (!validateStep(currentStep)) {
      toast({
        title: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (currentStep < steps.length) {
      setCurrentStep(prev => prev + 1);
    } else {
      await handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      // Simulate API call to save onboarding data
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Welcome aboard! 🎉",
        description: "Your account has been set up successfully.",
      });

      onComplete();
    } catch (error) {
      toast({
        title: "Something went wrong",
        description: "Please try again or contact support.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {steps.map((step, index) => {
        const isCompleted = currentStep > step.id;
        const isCurrent = currentStep === step.id;
        const StepIcon = step.icon;

        return (
          <div key={step.id} className="flex items-center">
            {/* Step Circle */}
            <div className="flex flex-col items-center">
              <div
                className={`
                  w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all
                  ${isCompleted 
                    ? 'bg-green-500 border-green-500 text-white' 
                    : isCurrent 
                    ? 'bg-blue-500 border-blue-500 text-white' 
                    : 'bg-gray-100 border-gray-300 text-gray-400'
                  }
                `}
              >
                {isCompleted ? (
                  <CheckCircle className="w-6 h-6" />
                ) : (
                  <StepIcon className="w-6 h-6" />
                )}
              </div>
              <div className="mt-2 text-center">
                <div className={`text-sm font-medium ${isCurrent ? 'text-blue-600' : 'text-gray-500'}`}>
                  {step.title}
                </div>
                <div className="text-xs text-gray-400 hidden sm:block">
                  {step.description}
                </div>
              </div>
            </div>

            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div 
                className={`
                  w-16 h-0.5 mx-4 transition-all
                  ${isCompleted ? 'bg-green-500' : 'bg-gray-300'}
                `}
              />
            )}
          </div>
        );
      })}
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="businessName">Business Name *</Label>
              <Input
                id="businessName"
                placeholder="Enter your business name"
                value={data.businessName}
                onChange={(e) => updateData({ businessName: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="businessType">Business Type *</Label>
              <Select value={data.businessType} onValueChange={(value) => updateData({ businessType: value })}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select your business type" />
                </SelectTrigger>
                <SelectContent>
                  {businessTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="googleBusinessUrl">Google Business Profile URL *</Label>
              <Input
                id="googleBusinessUrl"
                placeholder="https://business.google.com/dashboard/locations/..."
                value={data.googleBusinessUrl}
                onChange={(e) => updateData({ googleBusinessUrl: e.target.value })}
                className="mt-1"
              />
              <p className="text-sm text-gray-500 mt-2">
                Find your Google Business Profile URL in your Google My Business dashboard
              </p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">How to find your Google Business URL:</h4>
              <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                <li>Go to business.google.com</li>
                <li>Select your business location</li>
                <li>Copy the URL from your browser</li>
              </ol>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="firstInviteEmail">Customer Email *</Label>
              <Input
                id="firstInviteEmail"
                type="email"
                placeholder="customer@example.com"
                value={data.firstInviteEmail}
                onChange={(e) => updateData({ firstInviteEmail: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="firstInviteMessage">Invitation Message</Label>
              <Textarea
                id="firstInviteMessage"
                rows={4}
                value={data.firstInviteMessage}
                onChange={(e) => updateData({ firstInviteMessage: e.target.value })}
                className="mt-1"
              />
              <p className="text-sm text-gray-500 mt-2">
                This is just a demo - no actual email will be sent
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="text-center relative">
          {onSkip && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onSkip}
              className="absolute right-4 top-4"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
          <CardTitle className="text-2xl">Welcome to Reputation Sentinel!</CardTitle>
          <p className="text-gray-600">Let's get your account set up in just a few steps</p>
        </CardHeader>

        <CardContent className="space-y-8">
          {renderStepIndicator()}
          
          <div className="min-h-[300px]">
            <h3 className="text-xl font-semibold mb-4">
              Step {currentStep}: {steps[currentStep - 1].title}
            </h3>
            {renderStepContent()}
          </div>

          {/* Navigation */}
          <div className="flex justify-between pt-6 border-t">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>

            <div className="flex gap-2">
              {onSkip && (
                <Button variant="ghost" onClick={onSkip}>
                  Skip Setup
                </Button>
              )}
              <Button
                onClick={handleNext}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                {isLoading ? (
                  'Setting up...'
                ) : currentStep === steps.length ? (
                  'Complete Setup'
                ) : (
                  <>
                    Next
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 