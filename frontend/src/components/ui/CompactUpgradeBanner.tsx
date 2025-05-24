import React, { useState } from 'react';
import { Button } from './button';
import { useTrialContext } from '../../context/TrialContext';
import { X, Crown } from 'lucide-react';

interface CompactUpgradeBannerProps {
  className?: string;
}

export function CompactUpgradeBanner({ className = '' }: CompactUpgradeBannerProps) {
  const { isTrial, daysLeft, upgradeUrl, isExpired } = useTrialContext();
  const [isDismissed, setIsDismissed] = useState(false);

  // Don't show banner if not on trial, expired, or dismissed
  if (!isTrial || isExpired || isDismissed) {
    return null;
  }

  const isUrgent = daysLeft <= 3;
  const bannerBg = isUrgent ? 'bg-orange-50 border-orange-200' : 'bg-yellow-50 border-yellow-200';
  const textColor = isUrgent ? 'text-orange-800' : 'text-yellow-800';

  return (
    <div className={`flex items-center justify-between p-3 border rounded-md ${bannerBg} ${className}`}>
      <div className="flex items-center space-x-2">
        <Crown className={`h-4 w-4 ${textColor}`} />
        <span className={`text-sm font-medium ${textColor}`}>
          {daysLeft} {daysLeft === 1 ? 'day' : 'days'} left in trial
        </span>
      </div>

      <div className="flex items-center space-x-2">
        <Button size="sm" asChild>
          <a href={upgradeUrl}>Upgrade</a>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsDismissed(true)}
          className="h-6 w-6 p-0"
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
} 