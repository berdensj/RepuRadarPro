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

interface BarChartProps<TData extends Record<string, any> = Record<string, any>> {
  data: TData[];
  xKey?: keyof TData | string;
  yKeys?: (keyof TData | string)[];
  xField?: keyof TData | string;
  yField?: keyof TData | string;
  color?: string;
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
  xField,
  yField,
  color,
  labels,
  colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'],
  title,
  height = 300,
  className = '',
  showLegend = true,
  stacked = false,
  xFormatter = (value) => value.toString(),
  yFormatter = (value) => value.toString(),
}: BarChartProps<Record<string, any>>) {
  const chartData = useMemo<ChartData<'bar'>>(() => {
    const actualXKey = (xField || xKey || 'x') as keyof TData;
    
    const xLabels = data.map(item => xFormatter(item[actualXKey]));
    
    const getDatasets = (): ChartData<'bar'>['datasets'] => {
      if (yKeys && yKeys.length > 0) {
        return yKeys.map((key, index) => ({
          label: labels && labels.length > index ? labels[index] : String(key),
          data: data.map(item => {
            const val = item[key as keyof TData];
            return typeof val === 'number' ? val : 0;
          }),
          backgroundColor: colors[index % colors.length],
          borderColor: colors[index % colors.length],
          borderWidth: 1,
        }));
      } else if (yField) {
        const barColor = color || colors[0];
        return [{
          label: String(yField),
          data: data.map(item => {
            const val = item[yField as keyof TData];
            return typeof val === 'number' ? val : 0;
          }),
          backgroundColor: barColor,
          borderColor: barColor,
          borderWidth: 1,
        }];
      } else {
        return [{
          label: 'No data',
          data: [],
          backgroundColor: colors[0],
          borderColor: colors[0],
          borderWidth: 1,
        }];
      }
    };
    
    const datasets = getDatasets();
    
    return {
      labels: xLabels,
      datasets,
    };
  }, [data, xKey, xField, yKeys, yField, color, labels, colors, xFormatter]);
  
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