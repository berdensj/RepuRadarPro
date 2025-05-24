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

interface LineChartProps<TData extends Record<string, any> = Record<string, any>> {
  data: TData[];
  xKey?: keyof TData | string;
  yKeys?: (keyof TData | string)[];
  xField?: keyof TData | string;
  yField?: keyof TData | string;
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

export default function LineChart<TData extends Record<string, any> = Record<string, any>>({
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
}: LineChartProps<TData>) {
  const chartData = useMemo<ChartData<'line'>>(() => {
    const actualXKey = (xField || xKey || 'x') as keyof TData;
    
    const xLabels = data.map(item => xFormatter(item[actualXKey]));
    
    const getDatasets = (): ChartData<'line'>['datasets'] => {
      if (yKeys && yKeys.length > 0) {
        return yKeys.map((key, index) => ({
          label: labels && labels.length > index ? labels[index] : String(key),
          data: data.map(item => {
            const val = item[key as keyof TData];
            return typeof val === 'number' ? val : 0;
          }),
          borderColor: colors[index % colors.length],
          backgroundColor: `${colors[index % colors.length]}20`,
          tension: 0.2,
          fill: true,
        }));
      } else if (yField && categories && categories.length > 0) {
        return categories.map((category, index) => ({
          label: category,
          data: data.map(item => {
            const val = item[category as keyof TData];
            return typeof val === 'number' ? val : 0;
          }),
          borderColor: colors[index % colors.length],
          backgroundColor: `${colors[index % colors.length]}20`,
          tension: 0.2,
          fill: true,
        }));
      } else if (yField) {
        return [{
          label: String(yField),
          data: data.map(item => {
            const val = item[yField as keyof TData];
            return typeof val === 'number' ? val : 0;
          }),
          borderColor: colors[0],
          backgroundColor: `${colors[0]}20`,
          tension: 0.2,
          fill: true,
        }];
      } else {
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