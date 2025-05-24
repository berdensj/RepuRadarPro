import React, { useState } from 'react';
import { WeeklyReviewChart } from './WeeklyReviewChart';
import { SimpleWeeklyChart } from './SimpleWeeklyChart';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { BarChart2, Layers } from 'lucide-react';

export function WeeklyChartDemo() {
  const [chartType, setChartType] = useState<'recharts' | 'tailwind'>('recharts');

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BarChart2 className="h-5 w-5" />
            Weekly Review Analysis
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant={chartType === 'recharts' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setChartType('recharts')}
              className="flex items-center gap-1"
            >
              <BarChart2 className="h-4 w-4" />
              Chart.js
            </Button>
            <Button
              variant={chartType === 'tailwind' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setChartType('tailwind')}
              className="flex items-center gap-1"
            >
              <Layers className="h-4 w-4" />
              Tailwind
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {chartType === 'recharts' ? (
          <WeeklyReviewChart />
        ) : (
          <SimpleWeeklyChart />
        )}
      </CardContent>
    </Card>
  );
} 