import React, { useState } from 'react';
import { MessageSquare, Star, Clock, BarChart2 } from 'lucide-react';
import { StatCard } from './StatCard';
import { ReviewActivityCard } from './ReviewActivityCard';
import { ReviewChart } from './ReviewChart';
import { WeeklyChartDemo } from './WeeklyChartDemo';
import { TrialBanner } from '../ui/TrialBanner';
import { UpgradeBannerDemo } from '../ui/UpgradeBannerDemo';
import { OnboardingDemo } from '../OnboardingDemo';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { useAuth } from '../../hooks/use-auth';
import { useDashboardData } from '../../hooks/use-dashboard-data';
import { useTrialContext } from '../../context/TrialContext';
import { Skeleton } from '../ui/skeleton';

export function Dashboard() {
  const { user } = useAuth();
  const { isTrial, daysLeft, upgradeUrl } = useTrialContext();
  const [timeRange, setTimeRange] = useState<'week' | 'month'>('week');
  const {
    stats,
    isLoadingStats,
    activities,
    isLoadingActivities,
    summary,
    isLoadingSummary,
  } = useDashboardData(timeRange);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Welcome Message */}
      <h1 className="text-3xl font-bold mb-8">
        Welcome back, {user?.fullName || 'User'}!
      </h1>

      {/* Trial Banner */}
      <TrialBanner className="mb-8" />

      {/* Upgrade Banner Demo */}
      <UpgradeBannerDemo />

      {/* Onboarding Demo */}
      <OnboardingDemo />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {isLoadingStats ? (
          <>
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </>
        ) : (
          <>
            <StatCard
              title="Total Reviews This Week"
              value={stats?.totalReviews || 0}
              icon={<MessageSquare className="h-6 w-6" />}
              trend={{ value: stats?.trends.reviews || 0, isPositive: (stats?.trends.reviews || 0) > 0 }}
            />
            <StatCard
              title="AI Replies Sent"
              value={stats?.aiRepliesSent || 0}
              icon={<MessageSquare className="h-6 w-6" />}
              trend={{ value: stats?.trends.replies || 0, isPositive: (stats?.trends.replies || 0) > 0 }}
            />
            <StatCard
              title="Open Review Requests"
              value={stats?.openRequests || 0}
              icon={<Clock className="h-6 w-6" />}
            />
            <StatCard
              title="Average Star Rating"
              value={stats?.averageRating?.toFixed(1) || '0.0'}
              icon={<Star className="h-6 w-6" />}
              trend={{ value: stats?.trends.rating || 0, isPositive: (stats?.trends.rating || 0) > 0 }}
            />
          </>
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AI Activity Feed */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent AI Responses</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingActivities ? (
                <div className="space-y-4">
                  <Skeleton className="h-24" />
                  <Skeleton className="h-24" />
                  <Skeleton className="h-24" />
                </div>
              ) : activities?.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No recent activities</p>
              ) : (
                <div className="space-y-4">
                  {activities?.map((activity) => (
                    <ReviewActivityCard
                      key={activity.id}
                      customerName={activity.customerName}
                      rating={activity.rating}
                      replySnippet={activity.replySnippet}
                      date={new Date(activity.date)}
                      platformIcon={<img src={`/icons/${activity.platform}.svg`} alt={activity.platform} className="h-4 w-4" />}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Charts */}
        <div className="lg:col-span-1 space-y-6">
          {/* Weekly Review Chart */}
          <WeeklyChartDemo />

          {/* Review Summary Chart */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Review Summary</CardTitle>
              <div className="space-x-2">
                <Button
                  variant={timeRange === 'week' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTimeRange('week')}
                >
                  This Week
                </Button>
                <Button
                  variant={timeRange === 'month' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTimeRange('month')}
                >
                  Last 30 Days
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ReviewChart data={summary || []} isLoading={isLoadingSummary} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 