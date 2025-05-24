import React from 'react';
import { useState } from 'react';
import { useAuth } from '../hooks/use-auth';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '../lib/queryClient';
import { useToast } from '../hooks/use-toast';
import { Switch } from '../components/ui/switch';
import { useLocation } from 'wouter';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { CheckCircle2, AlertCircle, ChevronRight } from 'lucide-react';

// Types
interface SubscriptionPlan {
  id: number;
  name: string;
  displayName: string;
  description: string;
  price: number;
  annualPrice: number | null;
  trialDays: number;
  features: string[];
  maxLocations: number;
  maxUsers: number;
  isPopular: boolean;
  isAvailable: boolean;
  stripePriceId: string | null;
  stripeAnnualPriceId: string | null;
}

interface User {
  id: number;
  username: string;
  plan: string;
  subscriptionStatus: string;
  trialEndsAt: string | null;
  subscriptionEndsAt: string | null;
}

const SubscriptionPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isAnnual, setIsAnnual] = useState(false);
  const [, navigate] = useLocation();

  // Fetch subscription plans
  const { data: plans = [], isLoading: plansLoading } = useQuery({
    queryKey: ['/api/subscription-plans'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/subscription-plans');
      return res.json();
    }
  });

  // Start a trial or change subscription
  const subscribeMutation = useMutation({
    mutationFn: async ({ planId, isAnnual }: { planId: number; isAnnual: boolean }) => {
      const res = await apiRequest('POST', '/api/subscribe', { planId, isAnnual });
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Subscription updated",
        description: "Your subscription has been updated successfully.",
      });
      
      // If Stripe checkout URL is returned, redirect to it
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        // Otherwise refresh user data
        queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Subscription error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Helper to format currency
  const formatCurrency = (amount: number) => {
    // TODO: Confirm that all price values are in cents. If not, remove division by 100.
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount / 100);
  };

  // Get current user's subscription status
  const getUserPlanName = () => {
    // FIXED: Always default to 'Free' if user.plan is missing or falsy
    return user?.plan && user.plan.trim() ? user.plan : 'Free';
  };

  const getTrialEndDate = () => {
    if (!user?.trialEndsAt) return null;
    return new Date(user.trialEndsAt).toLocaleDateString();
  };

  const isUserInTrial = () => {
    return user?.subscriptionStatus === 'trial';
  };

  // Determine button text based on current status and selected plan
  const getButtonText = (plan: SubscriptionPlan) => {
    if (plan.name === getUserPlanName() && !isUserInTrial()) {
      return 'Current Plan';
    }
    
    if (plan.name === 'Free') {
      return 'Downgrade to Free';
    }
    
    if (plan.price === 0) {
      return 'Get Started';
    }
    
    if (isUserInTrial()) {
      return 'Select Plan';
    }
    
    if (plan.name === 'Basic' || plan.name === 'Pro' || plan.name === 'Enterprise') {
      if (getUserPlanName() === 'Free') {
        return 'Upgrade';
      }
      
      // If current plan costs less than this plan
      const currentPlan = plans.find((p: SubscriptionPlan) => p.name === getUserPlanName());
      if (currentPlan && currentPlan.price < plan.price) {
        return 'Upgrade';
      } else if (currentPlan && currentPlan.price > plan.price) {
        return 'Downgrade';
      }
    }
    
    return 'Select Plan';
  };

  // Handle subscription selection
  const handleSelectPlan = (plan: SubscriptionPlan) => {
    // FIXED: Prevent crash if user or plans are missing
    if (!user || !plans || plans.length === 0) {
      toast({
        title: "Error",
        description: "User or plan data is missing. Please refresh the page or contact support.",
        variant: "destructive",
      });
      return;
    }
    // If it's the current plan and not in trial, don't do anything
    if (plan.name === getUserPlanName() && !isUserInTrial()) {
      return;
    }
    // TODO: Add more robust backend/API error handling for subscription changes
    subscribeMutation.mutate({ 
      planId: plan.id, 
      isAnnual 
    });
  };

  if (plansLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="text-4xl font-bold tracking-tight">Choose Your Plan</h1>
        <p className="mt-4 text-xl text-muted-foreground">
          Select the plan that fits your needs. All plans include a 14-day trial with full features.
        </p>
        
        {isUserInTrial() && (
          <div className="mt-6 p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
              <p className="text-sm text-yellow-700">
                {isUserInTrial()
                  ? "Your trial has ended. Please select a plan to continue using Reputation Sentinel."
                  : `Your trial ends on ${getTrialEndDate()}. Select a plan to continue using Reputation Sentinel.`}
              </p>
            </div>
          </div>
        )}
        
        <div className="flex items-center justify-center mt-8 space-x-2">
          <span className={`text-sm ${!isAnnual ? 'font-medium' : 'text-muted-foreground'}`}>
            Monthly
          </span>
          <Switch
            checked={isAnnual}
            onCheckedChange={setIsAnnual}
            aria-label="Toggle annual billing"
          />
          <span className={`text-sm ${isAnnual ? 'font-medium' : 'text-muted-foreground'}`}>
            Annual <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">Save 20%</span>
          </span>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {plans.filter((plan: SubscriptionPlan) => plan.isAvailable).map((plan: SubscriptionPlan) => (
          <Card 
            key={plan.id} 
            className={`flex flex-col ${plan.isPopular ? 'border-primary shadow-lg relative' : ''}`}
          >
            {plan.isPopular && (
              <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-2">
                <Badge variant="default" className="bg-primary text-white">
                  Popular
                </Badge>
              </div>
            )}
            <CardHeader>
              <CardTitle className="text-2xl">{plan.displayName}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
              <div className="mt-4">
                <span className="text-3xl font-bold">
                  {formatCurrency(isAnnual && plan.annualPrice ? plan.annualPrice / 12 : plan.price)}
                </span>
                <span className="text-muted-foreground ml-1">/month</span>
                
                {isAnnual && plan.annualPrice && (
                  <div className="text-sm text-muted-foreground mt-1">
                    Billed {formatCurrency(plan.annualPrice)} annually
                  </div>
                )}
              </div>
              <div className="mt-4">
                <Button 
                  variant={plan.isPopular ? "default" : "outline"}
                  className="w-full"
                  disabled={plan.name === getUserPlanName() && !isUserInTrial()}
                  aria-disabled={plan.name === getUserPlanName() && !isUserInTrial()}
                  onClick={() => handleSelectPlan(plan)}
                >
                  {getButtonText(plan)}
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="flex-grow">
              <div className="space-y-4">
                <div className="font-medium">Includes:</div>
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
            
            <CardFooter className="border-t pt-4 mt-auto">
              <div className="text-sm text-muted-foreground">
                <div>Up to {plan.maxLocations} location{plan.maxLocations !== 1 && 's'}</div>
                <div>Up to {plan.maxUsers} user{plan.maxUsers !== 1 && 's'}</div>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
      
      <div className="mt-16 text-center max-w-2xl mx-auto">
        <h3 className="text-lg font-medium">Need something custom?</h3>
        <p className="mt-2 text-muted-foreground">
          Contact our sales team for custom enterprise solutions tailored to your business.
        </p>
        <Button variant="outline" className="mt-4" aria-label="Contact Sales">
          Contact Sales
        </Button>
      </div>
    </div>
  );
};

export default SubscriptionPage;