import React, { createContext, useContext, useMemo, ReactNode } from 'react';
import { useAuth } from '../hooks/use-auth';

interface TrialContextType {
  isTrial: boolean;
  daysLeft: number;
  upgradeUrl: string;
  isExpired: boolean;
  trialEndDate: Date | null;
}

interface TrialProviderProps {
  children: ReactNode;
}

// Create the context
const TrialContext = createContext<TrialContextType | null>(null);

// Custom hook to use the trial context
export function useTrialContext(): TrialContextType {
  const context = useContext(TrialContext);
  if (!context) {
    throw new Error('useTrialContext must be used within a TrialProvider');
  }
  return context;
}

// Provider component
export function TrialProvider({ children }: TrialProviderProps) {
  const { user } = useAuth();

  const trialData = useMemo((): TrialContextType => {
    if (!user) {
      return {
        isTrial: false,
        daysLeft: 0,
        upgradeUrl: '/pricing',
        isExpired: false,
        trialEndDate: null,
      };
    }

    const isTrial = user.plan === 'trial' || user.subscriptionStatus === 'trial';
    const trialEndDate = user.trialEndsAt ? new Date(user.trialEndsAt) : null;
    
    let daysLeft = 0;
    let isExpired = false;

    if (isTrial && trialEndDate) {
      const now = new Date();
      const timeDiff = trialEndDate.getTime() - now.getTime();
      daysLeft = Math.max(0, Math.ceil(timeDiff / (1000 * 60 * 60 * 24)));
      isExpired = timeDiff <= 0;
    }

    return {
      isTrial,
      daysLeft,
      upgradeUrl: '/pricing',
      isExpired,
      trialEndDate,
    };
  }, [user]);

  return (
    <TrialContext.Provider value={trialData}>
      {children}
    </TrialContext.Provider>
  );
}

// Optional: Export context for advanced use cases
export { TrialContext }; 