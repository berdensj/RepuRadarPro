import React from 'react';
import { Card, CardContent } from "../ui/card";
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

// FIXED: Defined a more specific type for chart datasets
interface ChartDataset {
  label?: string;
  data: number[];
  borderColor?: string;
  backgroundColor?: string;
  tension?: number;
  fill?: boolean;
  yAxisID?: string;
  // Add other Chart.js dataset properties if needed
}

interface TrendGraphProps {
  data?: ChartDataset[]; // Expect an array of dataset objects
  labels?: string[];
  // isLoading prop is available but not used for internal skeleton, parent handles loading
  // isLoading?: boolean; 
}

export function TrendGraph({ data, labels }: TrendGraphProps) {
  const defaultLabels = ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'];
  const defaultReviewsDataset: ChartDataset = {
    label: 'Number of Reviews',
    data: [25, 34, 42, 38, 56, 64],
    borderColor: 'hsl(var(--primary))',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    tension: 0.4,
    fill: true,
    yAxisID: 'y',
  };
  const defaultRatingsDataset: ChartDataset = {
    label: 'Average Rating',
    data: [4.2, 4.1, 4.3, 4.4, 4.5, 4.6],
    borderColor: '#10b981',
    backgroundColor: 'transparent',
    tension: 0.4,
    yAxisID: 'y1',
  };
  
  const chartData = {
    labels: labels && labels.length > 0 ? labels : defaultLabels,
    datasets: [
      // Use the first dataset passed in props, or default
      data?.[0] ? { ...defaultReviewsDataset, ...data[0] } : defaultReviewsDataset,
      // Use the second dataset passed in props, or default
      data?.[1] ? { ...defaultRatingsDataset, ...data[1] } : defaultRatingsDataset,
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
