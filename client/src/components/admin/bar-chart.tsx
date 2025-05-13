import { useEffect, useRef, useState } from 'react';
import { BarChart as LucideBarChart, Info } from 'lucide-react';
import { 
  BarChart as RechartsBarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  TooltipProps
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export interface ChartDataItem {
  date: string;
  value: number;
  count?: number;
  [key: string]: any;
}

interface BarChartProps {
  data: ChartDataItem[];
  title: string;
  description?: string;
  className?: string;
  valueSuffix?: string;
  valuePrefix?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  barColor?: string;
  height?: number;
  emptyMessage?: string;
  loading?: boolean;
  onBarClick?: (item: ChartDataItem) => void;
  tooltipFormatter?: (value: number) => string;
}

// Custom tooltip component
const CustomTooltip = ({ 
  active, 
  payload, 
  label,
  valueSuffix,
  valuePrefix
}: TooltipProps<number, string> & { valueSuffix?: string, valuePrefix?: string }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as ChartDataItem;
    const value = data.value;
    const count = data.count;
    
    return (
      <div className="bg-white p-3 shadow-md rounded-md border border-gray-200">
        <p className="font-medium text-sm">{format(new Date(label), 'MMM d, yyyy')}</p>
        <p className="text-primary font-bold">
          {valuePrefix || ''}{value.toLocaleString()}{valueSuffix || ''}
        </p>
        {count !== undefined && (
          <p className="text-sm text-gray-500">
            {count} {count === 1 ? 'review' : 'reviews'}
          </p>
        )}
      </div>
    );
  }

  return null;
};

export function BarChart({
  data,
  title,
  description,
  className,
  valueSuffix = '',
  valuePrefix = '',
  xAxisLabel = 'Date',
  yAxisLabel = 'Value',
  barColor = '#3b82f6',
  height = 300,
  emptyMessage = 'No data available',
  loading = false,
  onBarClick,
  tooltipFormatter
}: BarChartProps) {
  const [chartWidth, setChartWidth] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Update chart width on resize
  useEffect(() => {
    if (!containerRef.current) return;
    
    const updateWidth = () => {
      if (containerRef.current) {
        setChartWidth(containerRef.current.clientWidth);
      }
    };
    
    // Initial update
    updateWidth();
    
    // Add resize listener
    const resizeObserver = new ResizeObserver(updateWidth);
    resizeObserver.observe(containerRef.current);
    
    return () => {
      if (containerRef.current) {
        resizeObserver.unobserve(containerRef.current);
      }
    };
  }, []);
  
  // Format date for x-axis
  const formatXAxis = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'MMM d');
    } catch (e) {
      return dateStr;
    }
  };
  
  // Format value for y-axis
  const formatYAxis = (value: number) => {
    if (tooltipFormatter) {
      return tooltipFormatter(value);
    }
    return value.toLocaleString();
  };
  
  // Custom bar click handler
  const handleBarClick = (entry: any) => {
    if (onBarClick) {
      onBarClick(entry.payload);
    }
  };
  
  // Render empty state when no data
  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center h-[200px] text-gray-400">
      <LucideBarChart className="h-16 w-16 mb-2 opacity-30" />
      <p>{emptyMessage}</p>
    </div>
  );
  
  // Render loading state
  const renderLoadingState = () => (
    <div className="flex flex-col items-center justify-center h-[200px] text-gray-400">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      <p className="mt-4">Loading data...</p>
    </div>
  );
  
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center space-x-2">
          <span>{title}</span>
          {description && (
            <span className="relative group">
              <Info className="h-4 w-4 text-muted-foreground cursor-help" />
              <div className="absolute z-10 invisible group-hover:visible bottom-full left-1/2 transform -translate-x-1/2 w-64 p-3 bg-white shadow-lg rounded-md border text-sm">
                {description}
              </div>
            </span>
          )}
        </CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent ref={containerRef} className="p-0">
        {loading ? (
          renderLoadingState()
        ) : data.length === 0 ? (
          renderEmptyState()
        ) : (
          <div style={{ width: '100%', height }}>
            <ResponsiveContainer width="100%" height="100%">
              <RechartsBarChart
                data={data}
                margin={{ top: 20, right: 30, left: 25, bottom: 45 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={formatXAxis} 
                  label={{ 
                    value: xAxisLabel, 
                    position: 'insideBottom', 
                    offset: -10,
                    fill: '#6b7280',
                    fontSize: 12
                  }}
                  dy={10}
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                />
                <YAxis 
                  tickFormatter={formatYAxis} 
                  label={{ 
                    value: yAxisLabel, 
                    angle: -90, 
                    position: 'insideLeft',
                    fill: '#6b7280',
                    fontSize: 12,
                    dy: 60
                  }}
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                />
                <Tooltip 
                  content={<CustomTooltip valueSuffix={valueSuffix} valuePrefix={valuePrefix} />} 
                />
                <Legend />
                <Bar 
                  dataKey="value" 
                  name={yAxisLabel} 
                  fill={barColor} 
                  onClick={handleBarClick}
                  cursor={onBarClick ? 'pointer' : undefined}
                  activeBar={{ stroke: '#1e40af', strokeWidth: 2 }}
                />
              </RechartsBarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default BarChart;