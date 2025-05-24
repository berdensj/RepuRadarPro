import { useTrialContext } from '../context/TrialContext';

export interface FeatureAccess {
  canUseAdvancedAnalytics: boolean;
  canManageTeam: boolean;
  canUseAIResponses: boolean;
  canAccessIntegrations: boolean;
  maxProjects: number;
  maxTeamMembers: number;
  hasCustomBranding: boolean;
  canExportData: boolean;
}

export function useFeatureAccess(): FeatureAccess {
  const { isTrial, isExpired } = useTrialContext();

  // If trial is expired, restrict access to most features
  if (isTrial && isExpired) {
    return {
      canUseAdvancedAnalytics: false,
      canManageTeam: false,
      canUseAIResponses: false,
      canAccessIntegrations: false,
      maxProjects: 1,
      maxTeamMembers: 1,
      hasCustomBranding: false,
      canExportData: false,
    };
  }

  // Trial users have some restrictions
  if (isTrial) {
    return {
      canUseAdvancedAnalytics: true,
      canManageTeam: false, // Limited team management
      canUseAIResponses: true,
      canAccessIntegrations: true,
      maxProjects: 2, // Limited projects
      maxTeamMembers: 2, // Limited team size
      hasCustomBranding: false,
      canExportData: true,
    };
  }

  // Full access for paid users
  return {
    canUseAdvancedAnalytics: true,
    canManageTeam: true,
    canUseAIResponses: true,
    canAccessIntegrations: true,
    maxProjects: -1, // Unlimited
    maxTeamMembers: -1, // Unlimited
    hasCustomBranding: true,
    canExportData: true,
  };
}

// Helper hook for specific feature checks
export function useFeatureCheck() {
  const featureAccess = useFeatureAccess();
  const { upgradeUrl } = useTrialContext();

  return {
    ...featureAccess,
    upgradeUrl,
    checkFeature: (feature: keyof FeatureAccess) => featureAccess[feature],
  };
} 