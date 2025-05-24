import { useState, useEffect } from 'react';
import { useAuth } from './use-auth';

interface OnboardingState {
  isCompleted: boolean;
  shouldShow: boolean;
  step: number;
}

export function useOnboarding() {
  const { user } = useAuth();
  const [onboardingState, setOnboardingState] = useState<OnboardingState>({
    isCompleted: false,
    shouldShow: false,
    step: 1,
  });

  useEffect(() => {
    if (!user) return;

    // Check if user has completed onboarding via localStorage
    const hasCompletedOnboarding = 
      localStorage.getItem(`onboarding_completed_${user.id}`) === 'true';
    
    const hasSkippedOnboarding = 
      localStorage.getItem(`onboarding_skipped_${user.id}`) === 'true';

    // Show onboarding for new users who haven't completed or skipped it
    const shouldShowOnboarding = !hasCompletedOnboarding && !hasSkippedOnboarding;

    setOnboardingState({
      isCompleted: hasCompletedOnboarding,
      shouldShow: shouldShowOnboarding,
      step: 1,
    });
  }, [user]);

  const completeOnboarding = () => {
    if (user) {
      localStorage.setItem(`onboarding_completed_${user.id}`, 'true');
    }
    setOnboardingState(prev => ({
      ...prev,
      isCompleted: true,
      shouldShow: false,
    }));
  };

  const skipOnboarding = () => {
    if (user) {
      localStorage.setItem(`onboarding_skipped_${user.id}`, 'true');
    }
    setOnboardingState(prev => ({
      ...prev,
      shouldShow: false,
    }));
  };

  const resetOnboarding = () => {
    if (user) {
      localStorage.removeItem(`onboarding_completed_${user.id}`);
      localStorage.removeItem(`onboarding_skipped_${user.id}`);
    }
    setOnboardingState({
      isCompleted: false,
      shouldShow: true,
      step: 1,
    });
  };

  return {
    ...onboardingState,
    completeOnboarding,
    skipOnboarding,
    resetOnboarding,
  };
} 