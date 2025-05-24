import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

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
    queryKey: ['dashboardStats'],
    queryFn: async (): Promise<DashboardStats> => {
      const { data } = await axios.get('/api/dashboard/stats');
      return data;
    }
  });

  const activitiesQuery = useQuery({
    queryKey: ['recentActivities'],
    queryFn: async (): Promise<ReviewActivity[]> => {
      const { data } = await axios.get('/api/dashboard/activities');
      return data;
    }
  });

  const summaryQuery = useQuery({
    queryKey: ['reviewSummary', timeRange],
    queryFn: async (): Promise<ReviewSummary[]> => {
      const { data } = await axios.get(`/api/dashboard/summary?timeRange=${timeRange}`);
      return data;
    }
  });

  return {
    stats: statsQuery.data,
    isLoadingStats: statsQuery.isLoading,
    activities: activitiesQuery.data,
    isLoadingActivities: activitiesQuery.isLoading,
    summary: summaryQuery.data,
    isLoadingSummary: summaryQuery.isLoading,
  };
} 