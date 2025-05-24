import React from 'react';
import { format, subDays, startOfDay } from 'date-fns';

interface DayReviewData {
  date: string;
  day: string;
  totalReviews: number;
  positiveReviews: number;
  negativeReviews: number;
  neutralReviews: number;
  sentimentScore: number;
}

interface SimpleWeeklyChartProps {
  data?: DayReviewData[];
  className?: string;
}

// Generate dummy data for the past 7 days
const generateDummyData = (): DayReviewData[] => {
  const data: DayReviewData[] = [];
  
  for (let i = 6; i >= 0; i--) {
    const date = startOfDay(subDays(new Date(), i));
    const totalReviews = Math.floor(Math.random() * 15) + 5;
    const positiveReviews = Math.floor(totalReviews * (0.6 + Math.random() * 0.3));
    const negativeReviews = Math.floor(totalReviews * (Math.random() * 0.2));
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

export function SimpleWeeklyChart({ data, className = '' }: SimpleWeeklyChartProps) {
  const chartData = data || generateDummyData();
  const maxReviews = Math.max(...chartData.map(d => d.totalReviews));

  const getSentimentColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getSentimentBg = (score: number) => {
    if (score >= 80) return 'bg-green-50 border-green-200';
    if (score >= 60) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Bar Chart */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-gray-600">Daily Review Count</h4>
        <div className="flex items-end justify-between h-32 px-2">
          {chartData.map((day, index) => {
            const height = (day.totalReviews / maxReviews) * 100;
            return (
              <div key={day.date} className="flex flex-col items-center space-y-2">
                <div className="relative group">
                  <div
                    className={`w-8 rounded-t-sm ${getSentimentColor(day.sentimentScore)} transition-all hover:opacity-80`}
                    style={{ height: `${Math.max(height, 8)}%` }}
                  ></div>
                  
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                      {day.totalReviews} reviews<br/>
                      {day.sentimentScore}% positive
                    </div>
                  </div>
                </div>
                
                <div className="text-xs text-gray-500 font-medium">{day.day}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sentiment Summary */}
      <div className="grid grid-cols-7 gap-1">
        {chartData.map((day) => (
          <div
            key={day.date}
            className={`p-2 rounded border ${getSentimentBg(day.sentimentScore)}`}
          >
            <div className="text-center">
              <div className="text-xs font-medium">{day.day}</div>
              <div className="text-lg font-bold">{day.totalReviews}</div>
              <div className="text-xs text-gray-600">{day.sentimentScore}%</div>
            </div>
          </div>
        ))}
      </div>

      {/* Week Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="text-center">
            <div className="text-xs font-medium text-green-600 uppercase tracking-wide">Positive</div>
            <div className="text-lg font-bold text-green-900">
              {chartData.reduce((sum, day) => sum + day.positiveReviews, 0)}
            </div>
          </div>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
          <div className="text-center">
            <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">Neutral</div>
            <div className="text-lg font-bold text-gray-900">
              {chartData.reduce((sum, day) => sum + day.neutralReviews, 0)}
            </div>
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="text-center">
            <div className="text-xs font-medium text-red-600 uppercase tracking-wide">Negative</div>
            <div className="text-lg font-bold text-red-900">
              {chartData.reduce((sum, day) => sum + day.negativeReviews, 0)}
            </div>
          </div>
        </div>
      </div>

      {/* Overall Sentiment */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-blue-900">Weekly Average</div>
            <div className="text-xs text-blue-700">Sentiment Score</div>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold text-blue-900">
              {Math.round(
                chartData.reduce((sum, day) => sum + day.sentimentScore, 0) / chartData.length
              )}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 