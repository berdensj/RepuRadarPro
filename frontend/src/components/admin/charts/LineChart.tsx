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
  xKey?: string;
  yKeys?: string[];
  xField?: string;
  yField?: string;
  categories?: string[];
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
  xField,
  yField,
  categories,
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
    // Handle both prop formats (supporting legacy and new usage)
    const actualXKey = xField || xKey || 'x';
    
    // Extract x-axis labels
    const xLabels = data.map(item => xFormatter(item[actualXKey]));
    
    // Create datasets based on which props are provided
    const getDatasets = (): ChartData<'line'>['datasets'] => {
      if (yKeys && yKeys.length > 0) {
        // Multi-series chart with explicit fields
        return yKeys.map((key, index) => ({
          label: labels && labels.length > index ? labels[index] : key,
          data: data.map(item => item[key]),
          borderColor: colors[index % colors.length],
          backgroundColor: `${colors[index % colors.length]}20`,
          tension: 0.2,
          fill: true,
        }));
      } else if (yField && categories && categories.length > 0) {
        // Multi-series chart where categories are used as keys
        return categories.map((category, index) => ({
          label: category,
          data: data.map(item => item[category as keyof typeof item] !== undefined 
            ? item[category as keyof typeof item]
            : 0),
          borderColor: colors[index % colors.length],
          backgroundColor: `${colors[index % colors.length]}20`,
          tension: 0.2,
          fill: true,
        }));
      } else if (yField) {
        // Single series chart
        return [{
          label: yField,
          data: data.map(item => item[yField as keyof typeof item] !== undefined 
            ? item[yField as keyof typeof item]
            : 0),
          borderColor: colors[0],
          backgroundColor: `${colors[0]}20`,
          tension: 0.2,
          fill: true,
        }];
      } else {
        // Fallback to empty dataset to avoid errors
        return [{
          label: 'No data',
          data: [],
          borderColor: colors[0],
          backgroundColor: `${colors[0]}20`,
          tension: 0.2,
          fill: true,
        }];
      }
    };
    
    const datasets = getDatasets();
    
    return {
      labels: xLabels,
      datasets,
    };
  }, [data, xKey, xField, yKeys, yField, categories, labels, colors, xFormatter]);
  
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