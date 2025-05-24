import React, { useState } from 'react';
import { OnboardingStepper } from './OnboardingStepper';
import { useOnboarding } from '../hooks/use-onboarding';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Settings } from 'lucide-react';

export function OnboardingDemo() {
  const { shouldShow, completeOnboarding, skipOnboarding, resetOnboarding } = useOnboarding();

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Onboarding Demo
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Use the buttons below to test the onboarding wizard:
          </p>
          <div className="flex gap-2">
            <Button onClick={resetOnboarding} variant="outline">
              Show Onboarding
            </Button>
            <Button onClick={skipOnboarding} variant="outline">
              Skip Onboarding
            </Button>
            <Button onClick={completeOnboarding} variant="outline">
              Complete Onboarding
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Current state: {shouldShow ? 'Should show onboarding' : 'Onboarding hidden'}
          </p>
        </div>

        {/* Onboarding Modal */}
        {shouldShow && (
          <OnboardingStepper
            onComplete={completeOnboarding}
            onSkip={skipOnboarding}
          />
        )}
      </CardContent>
    </Card>
  );
} 