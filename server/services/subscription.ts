import { addDays } from 'date-fns';
import { db } from '../db';
import { subscriptionPlans, users } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { storage } from '../storage';

/**
 * Creates a new trial subscription for a user
 * @param userId The ID of the user to create the trial for
 * @param planName The name of the plan to use for the trial ('Basic', 'Pro', 'Enterprise')
 * @returns The updated user
 */
export async function startTrial(userId: number, planName = 'Pro') {
  // Default to 14 days trial
  const trialDays = 14;
  const trialEndDate = addDays(new Date(), trialDays);
  
  // Update user with trial information
  return storage.updateUser(userId, {
    plan: planName,
    subscriptionStatus: 'trial',
    trialEndsAt: trialEndDate,
  });
}

/**
 * Updates a user's subscription plan
 * @param userId The ID of the user to update
 * @param planId The ID of the subscription plan
 * @param isAnnual Whether the subscription is annual or monthly
 * @returns The updated user with subscription details
 */
export async function updateSubscription(userId: number, planId: number, isAnnual = false) {
  // Get the subscription plan
  const [plan] = await db.select().from(subscriptionPlans).where(eq(subscriptionPlans.id, planId));
  
  if (!plan) {
    throw new Error('Subscription plan not found');
  }
  
  // If plan is free, update user without payment
  if (plan.price === 0) {
    return storage.updateUser(userId, {
      plan: plan.name,
      subscriptionStatus: 'active',
      trialEndsAt: null,
    });
  }
  
  // For paid plans, integration with Stripe would go here
  // This is a placeholder for demonstration
  const subscriptionEndDate = addDays(new Date(), isAnnual ? 365 : 30);
  
  return storage.updateUser(userId, {
    plan: plan.name,
    subscriptionStatus: 'active',
    trialEndsAt: null,
    subscriptionEndsAt: subscriptionEndDate,
  });
}

/**
 * Cancels a user's subscription
 * @param userId The ID of the user to cancel the subscription for
 * @returns The updated user
 */
export async function cancelSubscription(userId: number) {
  return storage.updateUser(userId, {
    subscriptionStatus: 'canceled',
  });
}

/**
 * Initializes subscription plans in the database
 * This would normally be part of a database seed or migration
 */
export async function initializeSubscriptionPlans() {
  // Check if plans already exist
  const existingPlans = await db.select().from(subscriptionPlans);
  if (existingPlans.length > 0) {
    return existingPlans;
  }
  
  // Insert default subscription plans
  const plans = [
    {
      name: 'Free',
      displayName: 'Free Plan',
      description: 'Basic reputation monitoring to get started',
      price: 0,
      features: [
        '1 business location',
        'Google reviews only',
        '20 AI replies/month',
        'Manual reply approval only',
        'No analytics, SMS, or integrations',
        'Review history limited to 7 days',
        '"Powered by RepuRadarPro" branding',
        'Email support'
      ],
      maxLocations: 1,
      maxUsers: 1,
      isPopular: false,
    },
    {
      name: 'Starter',
      displayName: 'Starter',
      description: 'For small businesses managing their online presence',
      price: 2900, // $29/month
      annualPrice: 27840, // $232/year = $29 * 12 * 0.8 (20% discount)
      features: [
        '1 location',
        'Google reviews',
        '100 AI replies/month',
        'Basic analytics',
        'Scheduled/manual replies',
        'Email support'
      ],
      maxLocations: 1,
      maxUsers: 1,
      isPopular: false,
      stripePriceId: 'price_starter_monthly',
      stripeAnnualPriceId: 'price_starter_annual',
    },
    {
      name: 'Growth',
      displayName: 'Growth',
      description: 'For growing businesses with multiple locations',
      price: 7900, // $79/month
      annualPrice: 75840, // $632/year = $79 * 12 * 0.8 (20% discount)
      features: [
        '5 locations included',
        'Google, Yelp, Facebook integrations',
        'Unlimited AI replies',
        'Full analytics dashboard',
        'SMS/email requests (250/month)',
        'Auto-replies + 3 team users',
        '$10/location overage'
      ],
      maxLocations: 5,
      maxUsers: 3,
      isPopular: true,
      stripePriceId: 'price_growth_monthly',
      stripeAnnualPriceId: 'price_growth_annual',
    },
    {
      name: 'Agency',
      displayName: 'Agency',
      description: 'For agencies managing multiple clients',
      price: 24900, // $249/month
      annualPrice: 239040, // $1,992/year = $249 * 12 * 0.8 (20% discount)
      features: [
        '15 locations included',
        'White-labeling + client reports',
        'Role-based access (admin/client)',
        'API access',
        '$7/location overage'
      ],
      maxLocations: 15,
      maxUsers: 10,
      isPopular: false,
      stripePriceId: 'price_agency_monthly',
      stripeAnnualPriceId: 'price_agency_annual',
    },
    {
      name: 'Enterprise',
      displayName: 'Enterprise',
      description: 'Custom solutions for large organizations',
      price: 79900, // $799/month
      annualPrice: 767040, // $6,392/year = $799 * 12 * 0.8 (20% discount)
      features: [
        '50 locations included',
        'SSO + advanced permissions',
        'CRM integrations (Salesforce, Slack, etc.)',
        'Custom AI tone tuning',
        'Dedicated onboarding & support',
        'Volume discounts ($5/$3 per extra location)'
      ],
      maxLocations: 50,
      maxUsers: 25,
      isPopular: false,
      stripePriceId: 'price_enterprise_monthly',
      stripeAnnualPriceId: 'price_enterprise_annual',
    }
  ];
  
  // Insert the plans and return the results
  return Promise.all(
    plans.map(plan => 
      db.insert(subscriptionPlans)
        .values({
          ...plan,
          features: JSON.stringify(plan.features),
          trialDays: 14,
          isAvailable: true,
        })
        .returning()
    )
  );
}

/**
 * Checks if a user has access to a specific feature based on their plan
 * @param user The user to check
 * @param feature The feature to check access for
 * @returns Whether the user has access to the feature
 */
export async function hasFeatureAccess(userId: number, feature: string) {
  const user = await storage.getUser(userId);
  if (!user) return false;
  
  // Admin always has access to all features
  if (user.role === 'admin') return true;
  
  // Get the user's plan
  const [plan] = await db
    .select()
    .from(subscriptionPlans)
    .where(eq(subscriptionPlans.name, user.plan));
  
  if (!plan) return false;
  
  // Check if the feature is in the plan's features
  const features = Array.isArray(plan.features) ? plan.features : JSON.parse(String(plan.features));
  return features.includes(feature);
}

/**
 * Checks if a user has reached their location limit
 * @param userId The ID of the user to check
 * @returns Whether the user has reached their location limit
 */
export async function hasReachedLocationLimit(userId: number) {
  const user = await storage.getUser(userId);
  if (!user) return true;
  
  // Admin has no limits
  if (user.role === 'admin') return false;
  
  // Get the user's plan
  const [plan] = await db
    .select()
    .from(subscriptionPlans)
    .where(eq(subscriptionPlans.name, user.plan));
  
  if (!plan) return true;
  
  // Get the number of locations the user has
  const locations = await storage.getLocations(userId);
  
  return locations.length >= plan.maxLocations;
}

/**
 * Checks if a user has a valid subscription
 * @param userId The ID of the user to check
 * @returns Whether the user has a valid subscription
 */
export async function hasValidSubscription(userId: number) {
  const user = await storage.getUser(userId);
  if (!user) return false;
  
  // Admin always has a valid subscription
  if (user.role === 'admin') return true;
  
  // Check if user is in trial period
  if (user.subscriptionStatus === 'trial' && user.trialEndsAt) {
    return new Date(user.trialEndsAt) > new Date();
  }
  
  // Check if user has an active subscription
  if (user.subscriptionStatus === 'active') {
    // If it's a free plan, it's always valid
    if (user.plan === 'Free') return true;
    
    // If the subscription has an end date, check it
    if (user.subscriptionEndsAt) {
      return new Date(user.subscriptionEndsAt) > new Date();
    }
    
    // Otherwise, it's valid
    return true;
  }
  
  return false;
}