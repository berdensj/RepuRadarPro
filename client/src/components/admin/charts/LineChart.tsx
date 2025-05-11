import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface LineChartProps {
  data: any[];
  xKey: string;
  yKeys: string[];
  labels?: string[];
  colors?: string[];
  title?: string;
  height?: number;
  className?: string;
  showLegend?: boolean;
  xFormatter?: (value: any) => string;
  yFormatter?: (value: any) => string;
}

export default function LineChart({
  data,
  xKey,
  yKeys,
  labels,
  colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'],
  title,
  height = 300,
  className = '',
  showLegend = true,
  xFormatter = (value) => value.toString(),
  yFormatter = (value) => value.toString(),
}: LineChartProps) {
  const chartData = useMemo<ChartData<'line'>>(() => {
    // Extract x-axis labels
    const xLabels = data.map(item => xFormatter(item[xKey]));
    
    // Create datasets for each y-key
    const datasets = yKeys.map((key, index) => ({
      label: labels ? labels[index] : key,
      data: data.map(item => item[key]),
      borderColor: colors[index % colors.length],
      backgroundColor: `${colors[index % colors.length]}20`,
      tension: 0.2,
      fill: true,
    }));
    
    return {
      labels: xLabels,
      datasets,
    };
  }, [data, xKey, yKeys, labels, colors, xFormatter]);
  
  const options: ChartOptions<'line'> = {
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
      y: {
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
      <Line data={chartData} options={options} />
    </div>
  );
}