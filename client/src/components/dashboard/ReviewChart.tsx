import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { format, parseISO } from 'date-fns';

interface ReviewSummary {
  date: string;
  count: number;
  averageRating: number;
}

interface ReviewChartProps {
  data: ReviewSummary[];
  isLoading: boolean;
}

export function ReviewChart({ data, isLoading }: ReviewChartProps) {
  if (isLoading) {
    return (
      <div className="h-64 bg-slate-50 rounded-lg flex items-center justify-center">
        <p className="text-slate-500">Loading chart data...</p>
      </div>
    );
  }

  if (!data?.length) {
    return (
      <div className="h-64 bg-slate-50 rounded-lg flex items-center justify-center">
        <p className="text-slate-500">No data available</p>
      </div>
    );
  }

  const formattedData = data.map(item => ({
    ...item,
    formattedDate: format(parseISO(item.date), 'MMM d'),
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={formattedData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="formattedDate"
          tick={{ fontSize: 12 }}
        />
        <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
        <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
        <Tooltip />
        <Bar
          yAxisId="left"
          dataKey="count"
          fill="#3b82f6"
          radius={[4, 4, 0, 0]}
          name="Review Count"
        />
        <Bar
          yAxisId="right"
          dataKey="averageRating"
          fill="#22c55e"
          radius={[4, 4, 0, 0]}
          name="Average Rating"
        />
      </BarChart>
    </ResponsiveContainer>
  );
} 