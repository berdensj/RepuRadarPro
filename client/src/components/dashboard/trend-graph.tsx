import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
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

type Period = '30' | '90' | '365';

export function TrendGraph() {
  const [period, setPeriod] = useState<Period>('90');
  
  // This would be a real API call in production
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/reviews/trends', period],
  });
  
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
            <Skeleton className="h-6 w-32 mb-2 sm:mb-0" />
            <Skeleton className="h-8 w-64" />
          </div>
          <div className="h-72 flex items-center justify-center">
            <Skeleton className="h-full w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card>
        <CardContent className="p-5">
          <div className="h-72 flex items-center justify-center">
            <p className="text-red-500">Error loading trend data: {error.message}</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Sample data for demonstration
  const labels = ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'];
  const reviewsData = [25, 34, 42, 38, 56, 64];
  const ratingsData = [4.2, 4.1, 4.3, 4.4, 4.5, 4.6];
  
  const chartData = {
    labels,
    datasets: [
      {
        label: 'Number of Reviews',
        data: reviewsData,
        borderColor: 'hsl(var(--primary))',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
        yAxisID: 'y',
      },
      {
        label: 'Average Rating',
        data: ratingsData,
        borderColor: '#10b981',
        backgroundColor: 'transparent',
        tension: 0.4,
        yAxisID: 'y1',
      }
    ],
  };
  
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
          weight: 'bold'
        }
      }
    }
  };
  
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-800">Review Trends</h2>
          <div className="flex items-center space-x-2 mt-2 sm:mt-0">
            <Button 
              variant={period === '30' ? "default" : "outline"} 
              size="sm" 
              onClick={() => setPeriod('30')}
            >
              30 Days
            </Button>
            <Button 
              variant={period === '90' ? "default" : "outline"} 
              size="sm" 
              onClick={() => setPeriod('90')}
            >
              90 Days
            </Button>
            <Button 
              variant={period === '365' ? "default" : "outline"} 
              size="sm" 
              onClick={() => setPeriod('365')}
            >
              1 Year
            </Button>
          </div>
        </div>
        <div className="h-72">
          <Line data={chartData} options={options} />
        </div>
      </CardContent>
    </Card>
  );
}
