import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface BarChartProps {
  data: any[];
  xKey: string;
  yKeys: string[];
  labels?: string[];
  colors?: string[];
  title?: string;
  height?: number;
  className?: string;
  showLegend?: boolean;
  stacked?: boolean;
  xFormatter?: (value: any) => string;
  yFormatter?: (value: any) => string;
}

export default function BarChart({
  data,
  xKey,
  yKeys,
  labels,
  colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'],
  title,
  height = 300,
  className = '',
  showLegend = true,
  stacked = false,
  xFormatter = (value) => value.toString(),
  yFormatter = (value) => value.toString(),
}: BarChartProps) {
  const chartData = useMemo<ChartData<'bar'>>(() => {
    // Extract x-axis labels
    const xLabels = data.map(item => xFormatter(item[xKey]));
    
    // Create datasets for each y-key
    const datasets = yKeys.map((key, index) => ({
      label: labels ? labels[index] : key,
      data: data.map(item => item[key]),
      backgroundColor: colors[index % colors.length],
      borderColor: colors[index % colors.length],
      borderWidth: 1,
    }));
    
    return {
      labels: xLabels,
      datasets,
    };
  }, [data, xKey, yKeys, labels, colors, xFormatter]);
  
  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: showLegend,
        position: 'top' as const,
      },
      title: {
        display: !!title,
        text: title || '',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            return `${label}: ${yFormatter(value)}`;
          }
        }
      }
    },
    scales: {
      x: {
        stacked: stacked,
      },
      y: {
        stacked: stacked,
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return yFormatter(value);
          }
        }
      }
    },
  };

  return (
    <div style={{ height, position: 'relative' }} className={className}>
      <Bar data={chartData} options={options} />
    </div>
  );
}