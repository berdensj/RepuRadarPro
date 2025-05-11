import { Card, CardContent } from "@/components/ui/card";
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend, 
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface TrendGraphProps {
  data?: any[];
  labels?: string[];
  isLoading?: boolean;
}

export function TrendGraph({ data, labels, isLoading = false }: TrendGraphProps) {
  // Default data if props are not provided
  const defaultLabels = ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'];
  const defaultReviewsData = [25, 34, 42, 38, 56, 64];
  const defaultRatingsData = [4.2, 4.1, 4.3, 4.4, 4.5, 4.6];
  
  // Chart data configuration
  const chartData = {
    labels: labels || defaultLabels,
    datasets: [
      {
        label: 'Number of Reviews',
        data: data?.[0]?.data || defaultReviewsData,
        borderColor: 'hsl(var(--primary))',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
        yAxisID: 'y',
      },
      {
        label: 'Average Rating',
        data: data?.[1]?.data || defaultRatingsData,
        borderColor: '#10b981',
        backgroundColor: 'transparent',
        tension: 0.4,
        yAxisID: 'y1',
      }
    ],
  };
  
  // Chart options
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Number of Reviews'
        }
      },
      y1: {
        position: 'right' as const,
        beginAtZero: false,
        min: 1,
        max: 5,
        title: {
          display: true,
          text: 'Rating'
        },
        grid: {
          drawOnChartArea: false,
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    },
    plugins: {
      legend: {
        position: 'top' as const,
        align: 'end' as const,
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        padding: 12,
        bodyFont: {
          size: 13
        },
        titleFont: {
          size: 14,
          weight: 'bold' as const
        }
      }
    }
  };
  
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-800">Review Trends</h2>
        </div>
        <div className="h-72">
          <Line data={chartData} options={options} />
        </div>
      </CardContent>
    </Card>
  );
}
