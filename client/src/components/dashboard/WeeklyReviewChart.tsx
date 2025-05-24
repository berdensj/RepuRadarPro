import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { format, subDays, startOfDay } from 'date-fns';

interface DayReviewData {
  date: string;
  day: string;
  totalReviews: number;
  positiveReviews: number;
  negativeReviews: number;
  neutralReviews: number;
  sentimentScore: number; // 0-100, higher is more positive
}

interface WeeklyReviewChartProps {
  data?: DayReviewData[];
  className?: string;
}

// Generate dummy data for the past 7 days
const generateDummyData = (): DayReviewData[] => {
  const data: DayReviewData[] = [];
  
  for (let i = 6; i >= 0; i--) {
    const date = startOfDay(subDays(new Date(), i));
    const totalReviews = Math.floor(Math.random() * 15) + 5; // 5-20 reviews per day
    const positiveReviews = Math.floor(totalReviews * (0.6 + Math.random() * 0.3)); // 60-90% positive
    const negativeReviews = Math.floor(totalReviews * (Math.random() * 0.2)); // 0-20% negative
    const neutralReviews = totalReviews - positiveReviews - negativeReviews;
    
    const sentimentScore = Math.round((positiveReviews / totalReviews) * 100);
    
    data.push({
      date: format(date, 'yyyy-MM-dd'),
      day: format(date, 'EEE'),
      totalReviews,
      positiveReviews,
      negativeReviews,
      neutralReviews,
      sentimentScore,
    });
  }
  
  return data;
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-medium text-gray-900">{label}</p>
        <div className="mt-2 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Total Reviews:</span>
            <span className="font-medium">{data.totalReviews}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-green-600">Positive:</span>
            <span className="font-medium text-green-600">{data.positiveReviews}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Neutral:</span>
            <span className="font-medium text-gray-600">{data.neutralReviews}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-red-600">Negative:</span>
            <span className="font-medium text-red-600">{data.negativeReviews}</span>
          </div>
          <div className="pt-1 border-t">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Sentiment:</span>
              <span className="font-medium">{data.sentimentScore}%</span>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export function WeeklyReviewChart({ data, className = '' }: WeeklyReviewChartProps) {
  const chartData = data || generateDummyData();

  const getBarColor = (sentimentScore: number) => {
    if (sentimentScore >= 80) return '#10b981'; // Green
    if (sentimentScore >= 60) return '#f59e0b'; // Yellow
    return '#ef4444'; // Red
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis 
              dataKey="day" 
              tick={{ fontSize: 12, fill: '#64748b' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              tick={{ fontSize: 12, fill: '#64748b' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="totalReviews" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry.sentimentScore)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-green-600 uppercase tracking-wide">Positive</p>
              <p className="text-lg font-bold text-green-900">
                {chartData.reduce((sum, day) => sum + day.positiveReviews, 0)}
              </p>
            </div>
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          </div>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Neutral</p>
              <p className="text-lg font-bold text-gray-900">
                {chartData.reduce((sum, day) => sum + day.neutralReviews, 0)}
              </p>
            </div>
            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-red-600 uppercase tracking-wide">Negative</p>
              <p className="text-lg font-bold text-red-900">
                {chartData.reduce((sum, day) => sum + day.negativeReviews, 0)}
              </p>
            </div>
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Weekly Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-blue-900">This Week's Performance</h4>
            <p className="text-xs text-blue-700">
              {chartData.reduce((sum, day) => sum + day.totalReviews, 0)} total reviews
            </p>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-blue-900">
              {Math.round(
                chartData.reduce((sum, day) => sum + day.sentimentScore, 0) / chartData.length
              )}%
            </div>
            <p className="text-xs text-blue-700">Avg. Sentiment</p>
          </div>
        </div>
      </div>
    </div>
  );
} 