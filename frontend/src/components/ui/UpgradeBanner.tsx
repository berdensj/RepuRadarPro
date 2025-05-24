import React, { useState } from 'react';
import { Button } from './button';
import { useTrialContext } from '../../context/TrialContext';
import { X, Crown, ArrowRight } from 'lucide-react';

interface UpgradeBannerProps {
  className?: string;
  persistDismissal?: boolean; // If true, saves dismissal to localStorage
}

export function UpgradeBanner({ className = '', persistDismissal = false }: UpgradeBannerProps) {
  const { isTrial, daysLeft, upgradeUrl, isExpired } = useTrialContext();
  const [isDismissed, setIsDismissed] = useState(() => {
    if (persistDismissal) {
      return localStorage.getItem('upgrade-banner-dismissed') === 'true';
    }
    return false;
  });

  // Don't show banner if not on trial, expired, or dismissed
  if (!isTrial || isExpired || isDismissed) {
    return null;
  }

  const handleDismiss = () => {
    setIsDismissed(true);
    if (persistDismissal) {
      localStorage.setItem('upgrade-banner-dismissed', 'true');
    }
  };

  const isUrgent = daysLeft <= 3;
  const bannerBg = isUrgent ? 'bg-orange-100 border-orange-300' : 'bg-yellow-100 border-yellow-300';
  const textColor = isUrgent ? 'text-orange-900' : 'text-yellow-900';
  const iconColor = isUrgent ? 'text-orange-600' : 'text-yellow-600';

  return (
    <div className={`relative border rounded-lg p-4 ${bannerBg} ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Crown className={`h-6 w-6 ${iconColor}`} />
          <div>
            <p className={`font-medium ${textColor}`}>
              You have <span className="font-bold">{daysLeft} {daysLeft === 1 ? 'day' : 'days'}</span> left in your trial.
            </p>
            <p className={`text-sm ${textColor} opacity-90`}>
              Upgrade now to unlock full automation.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* CTA Button */}
          <Button asChild className={isUrgent ? 'bg-orange-600 hover:bg-orange-700' : 'bg-yellow-600 hover:bg-yellow-700'}>
            <a href={upgradeUrl} className="flex items-center gap-2">
              Upgrade Now
              <ArrowRight className="h-4 w-4" />
            </a>
          </Button>

          {/* Close Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className={`${textColor} hover:bg-white/20`}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Progress indicator for urgent cases */}
      {isUrgent && (
        <div className="mt-3">
          <div className="w-full bg-orange-200 rounded-full h-1">
            <div 
              className="bg-orange-600 h-1 rounded-full transition-all duration-300"
              style={{ width: `${(daysLeft / 7) * 100}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
} 