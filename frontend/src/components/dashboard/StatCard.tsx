import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendDirection?: 'up' | 'down';
  className?: string;
}

export function StatCard({ title, value, icon: Icon, trend, trendDirection, className }: StatCardProps) {
  return (
    <Card className={cn("shadow-sm hover:shadow-md transition-shadow", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">{title}</CardTitle>
        <Icon className="h-5 w-5 text-slate-500 dark:text-slate-400" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-slate-900 dark:text-slate-50">{value}</div>
        {trend && (
          <p className={cn(
            "text-xs text-slate-500 dark:text-slate-400 mt-1",
            trendDirection === 'up' ? 'text-green-600 dark:text-green-500' : '',
            trendDirection === 'down' ? 'text-red-600 dark:text-red-500' : ''
          )}>
            {trend}
          </p>
        )}
      </CardContent>
    </Card>
  );
} 