import { useQuery } from '@tanstack/react-query';
import { getQueryFn } from '../lib/queryClient';

interface DashboardStats {
  totalReviews: number;
  aiRepliesSent: number;
  openRequests: number;
  averageRating: number;
  trends: {
    reviews: number;
    replies: number;
    rating: number;
  };
}

interface ReviewActivity {
  id: string;
  customerName: string;
  rating: number;
  replySnippet: string;
  date: string;
  platform: string;
}

interface ReviewSummary {
  date: string;
  count: number;
  averageRating: number;
}

export function useDashboardData(timeRange: 'week' | 'month') {
  const statsQuery = useQuery({
    queryKey: [`/api/dashboard/stats?timeRange=${timeRange}`, 'dashboardStats', timeRange],
    queryFn: getQueryFn({ on401: "throw" }),
    retry: 3,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const activitiesQuery = useQuery({
    queryKey: ['/api/dashboard/activities', 'recentActivities'],
    queryFn: getQueryFn({ on401: "throw" }),
    retry: 3,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const summaryQuery = useQuery({
    queryKey: [`/api/dashboard/summary?timeRange=${timeRange}`, 'reviewSummary', timeRange],
    queryFn: getQueryFn({ on401: "throw" }),
    retry: 3,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    stats: statsQuery.data as DashboardStats | undefined,
    isLoadingStats: statsQuery.isLoading,
    errorStats: statsQuery.error,
    activities: activitiesQuery.data as ReviewActivity[] | undefined,
    isLoadingActivities: activitiesQuery.isLoading,
    errorActivities: activitiesQuery.error,
    summary: summaryQuery.data as ReviewSummary[] | undefined,
    isLoadingSummary: summaryQuery.isLoading,
    errorSummary: summaryQuery.error,
  };
} 