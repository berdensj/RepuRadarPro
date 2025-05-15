import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { Skeleton } from "@/components/ui/skeleton";
import { MessageSquare, AlertTriangle, ThumbsUp } from "lucide-react";

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend);

export function SentimentOverview() {
  const { data: sentimentData, isLoading, error } = useQuery({
    queryKey: ["/api/metrics/sentiment"],
    queryFn: async () => {
      const response = await fetch("/api/metrics/sentiment");
      if (!response.ok) {
        throw new Error("Failed to fetch sentiment data");
      }
      return response.json();
    }
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-6 w-48" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-64" />
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <div className="h-48 w-48">
            <Skeleton className="h-full w-full rounded-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sentiment Analysis</CardTitle>
          <CardDescription>
            Breakdown of review sentiment
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center text-slate-500">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
            <p>Error loading sentiment data</p>
            <p className="text-xs">{error.message}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Default sentiment data if not available from API
  const defaultData = {
    positive: 70,
    neutral: 20,
    negative: 10
  };

  // Use API data if available, otherwise use defaults
  const breakdown = sentimentData?.sentimentBreakdown || defaultData;

  const chartData = {
    labels: ['Positive', 'Neutral', 'Negative'],
    datasets: [
      {
        data: [breakdown.positive, breakdown.neutral, breakdown.negative],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)', // green for positive
          'rgba(234, 179, 8, 0.8)',  // yellow for neutral
          'rgba(239, 68, 68, 0.8)',  // red for negative
        ],
        borderColor: [
          'rgba(34, 197, 94, 1)',
          'rgba(234, 179, 8, 1)',
          'rgba(239, 68, 68, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return `${context.label}: ${context.raw}%`;
          }
        }
      }
    },
    cutout: '70%'
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sentiment Analysis</CardTitle>
        <CardDescription>
          Breakdown of review sentiment
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-52 relative">
          <Doughnut data={chartData} options={chartOptions} />
          <div className="absolute inset-0 flex items-center justify-center flex-col">
            <ThumbsUp className="h-6 w-6 text-green-500 mb-1" />
            <span className="text-2xl font-bold">{breakdown.positive}%</span>
            <span className="text-xs text-slate-500">Positive</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mt-4">
          <div className="border rounded-md p-3 text-center">
            <div className="flex items-center justify-center mb-1">
              <div className="h-3 w-3 rounded-full bg-green-500 mr-1"></div>
              <span className="text-sm font-medium">Positive</span>
            </div>
            <p className="text-xl font-bold">{breakdown.positive}%</p>
          </div>
          
          <div className="border rounded-md p-3 text-center">
            <div className="flex items-center justify-center mb-1">
              <div className="h-3 w-3 rounded-full bg-yellow-500 mr-1"></div>
              <span className="text-sm font-medium">Neutral</span>
            </div>
            <p className="text-xl font-bold">{breakdown.neutral}%</p>
          </div>
          
          <div className="border rounded-md p-3 text-center">
            <div className="flex items-center justify-center mb-1">
              <div className="h-3 w-3 rounded-full bg-red-500 mr-1"></div>
              <span className="text-sm font-medium">Negative</span>
            </div>
            <p className="text-xl font-bold">{breakdown.negative}%</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}