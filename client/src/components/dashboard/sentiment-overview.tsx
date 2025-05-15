import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface SentimentOverviewProps {
  positive: number;
  neutral: number;
  negative: number;
  showHeader?: boolean;
  showCard?: boolean;
}

export function SentimentOverview({ 
  positive, 
  neutral, 
  negative, 
  showHeader = true,
  showCard = true 
}: SentimentOverviewProps) {
  // Colors for the sentiment types
  const colors = {
    positive: "bg-green-500",
    neutral: "bg-amber-400",
    negative: "bg-red-500",
    positiveLight: "bg-green-100",
    neutralLight: "bg-amber-100",
    negativeLight: "bg-red-100"
  };
  
  // Function to get text color class based on sentiment
  const getTextColor = (sentiment: 'positive' | 'neutral' | 'negative') => {
    if (sentiment === 'positive') return "text-green-600";
    if (sentiment === 'neutral') return "text-amber-600";
    return "text-red-600";
  };

  // Calculate total for counts
  const total = positive + neutral + negative;
  
  // If all values are 0, use equal distribution for visualization
  const normalizedPositive = total === 0 ? 33.33 : positive;
  const normalizedNeutral = total === 0 ? 33.33 : neutral;
  const normalizedNegative = total === 0 ? 33.33 : negative;

  const content = (
    <div className="space-y-6">
      {/* Horizontal bar chart visualization */}
      <div className="w-full h-6 flex rounded-full overflow-hidden">
        <div 
          className={`${colors.positive} h-full`} 
          style={{ width: `${normalizedPositive}%` }}
        ></div>
        <div 
          className={`${colors.neutral} h-full`}
          style={{ width: `${normalizedNeutral}%` }}
        ></div>
        <div 
          className={`${colors.negative} h-full`}
          style={{ width: `${normalizedNegative}%` }}
        ></div>
      </div>
      
      {/* Stats with percentages - enhanced responsive layout */}
      <div className="grid grid-cols-3 gap-1 sm:gap-2">
        <div className="space-y-1">
          <div className="text-xs text-slate-500">Positive</div>
          <div className="flex items-baseline">
            <span className={`text-sm sm:text-xl font-bold ${getTextColor('positive')}`}>
              {positive}%
            </span>
          </div>
          <div className={`w-full h-1 ${colors.positiveLight} rounded-full`}>
            <div 
              className={`h-1 ${colors.positive} rounded-full`} 
              style={{ width: `${normalizedPositive}%` }}
            ></div>
          </div>
        </div>
        
        <div className="space-y-1">
          <div className="text-xs text-slate-500">Neutral</div>
          <div className="flex items-baseline">
            <span className={`text-sm sm:text-xl font-bold ${getTextColor('neutral')}`}>
              {neutral}%
            </span>
          </div>
          <div className={`w-full h-1 ${colors.neutralLight} rounded-full`}>
            <div 
              className={`h-1 ${colors.neutral} rounded-full`} 
              style={{ width: `${normalizedNeutral}%` }}
            ></div>
          </div>
        </div>
        
        <div className="space-y-1">
          <div className="text-xs text-slate-500">Negative</div>
          <div className="flex items-baseline">
            <span className={`text-sm sm:text-xl font-bold ${getTextColor('negative')}`}>
              {negative}%
            </span>
          </div>
          <div className={`w-full h-1 ${colors.negativeLight} rounded-full`}>
            <div 
              className={`h-1 ${colors.negative} rounded-full`} 
              style={{ width: `${normalizedNegative}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );

  // Return as card or just content
  if (showCard) {
    return (
      <Card>
        {showHeader && (
          <CardHeader className="pb-2 sm:pb-6">
            <CardTitle className="text-base sm:text-lg">Sentiment Analysis</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Customer review sentiment breakdown</CardDescription>
          </CardHeader>
        )}
        <CardContent>
          {content}
        </CardContent>
      </Card>
    );
  }
  
  return content;
}