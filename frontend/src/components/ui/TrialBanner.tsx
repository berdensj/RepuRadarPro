import React from 'react';
import { Button } from './button';
import { useTrialContext } from '../../context/TrialContext';
import { AlertTriangle, Clock } from 'lucide-react';

interface TrialBannerProps {
  variant?: 'default' | 'compact';
  className?: string;
}

export function TrialBanner({ variant = 'default', className = '' }: TrialBannerProps) {
  const { isTrial, daysLeft, upgradeUrl, isExpired } = useTrialContext();

  if (!isTrial) return null;

  if (isExpired) {
    return (
      <div className={`p-4 bg-red-50 border border-red-200 rounded-lg ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <p className="text-red-800 font-medium">
              Your trial has expired. Upgrade now to continue using all features.
            </p>
          </div>
          <Button variant="destructive" asChild>
            <a href={upgradeUrl}>Upgrade Now</a>
          </Button>
        </div>
      </div>
    );
  }

  if (daysLeft === 0) return null;

  const isUrgent = daysLeft <= 3;
  const bgColor = isUrgent ? 'bg-orange-50 border-orange-200' : 'bg-yellow-50 border-yellow-200';
  const textColor = isUrgent ? 'text-orange-800' : 'text-yellow-800';
  const iconColor = isUrgent ? 'text-orange-600' : 'text-yellow-600';

  if (variant === 'compact') {
    return (
      <div className={`px-3 py-2 ${bgColor} border rounded-md ${className}`}>
        <div className="flex items-center justify-between">
          <span className={`text-sm ${textColor}`}>
            Trial: {daysLeft}d left
          </span>
          <Button variant="outline" size="sm" asChild>
            <a href={upgradeUrl}>Upgrade</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-4 ${bgColor} border rounded-lg ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className={`h-5 w-5 ${iconColor}`} />
          <p className={textColor}>
            You have {daysLeft} {daysLeft === 1 ? 'day' : 'days'} left in your trial.
            {isUrgent && ' Upgrade soon to avoid service interruption.'}
          </p>
        </div>
        <Button variant={isUrgent ? 'destructive' : 'default'} asChild>
          <a href={upgradeUrl}>Upgrade Now</a>
        </Button>
      </div>
    </div>
  );
} 