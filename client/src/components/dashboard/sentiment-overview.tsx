import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, RefreshCw, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SentimentData {
  sentimentBreakdown: {
    positive: number;
    neutral: number;
    negative: number;
  };
  counts: {
    positive: number;
    neutral: number;
    negative: number;
    total: number;
  };
}

export function SentimentOverview() {
  const { 
    data, 
    isLoading, 
    error, 
    isError, 
    refetch 
  } = useQuery<SentimentData>({
    queryKey: ["/api/metrics/sentiment"],
    queryFn: async () => {
      const response = await fetch("/api/metrics/sentiment");
      if (!response.ok) {
        throw new Error("Failed to fetch sentiment data");
      }
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sentiment Analysis</CardTitle>
          <CardDescription>Customer review sentiment breakdown</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[240px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sentiment Analysis</CardTitle>
          <CardDescription>Customer review sentiment breakdown</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-[240px]">
          <AlertCircle className="h-8 w-8 text-red-500 mb-4" />
          <p className="text-sm text-slate-500 text-center mb-4">
            {error instanceof Error ? error.message : "Failed to load sentiment data"}
          </p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-3 w-3 mr-2" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Fallback to default data if API returns no data
  const sentimentData = data || {
    sentimentBreakdown: {
      positive: 0,
      neutral: 0,
      negative: 0
    },
    counts: {
      positive: 0,
      neutral: 0,
      negative: 0,
      total: 0
    }
  };

  // Calculate percentages to display in the chart
  const { positive, neutral, negative } = sentimentData.sentimentBreakdown;
  
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sentiment Analysis</CardTitle>
        <CardDescription>Customer review sentiment breakdown</CardDescription>
      </CardHeader>
      <CardContent>
        {sentimentData.counts.total === 0 ? (
          <div className="flex flex-col items-center justify-center h-[200px] text-center">
            <p className="text-sm text-slate-500 mb-2">No sentiment data available</p>
            <p className="text-xs text-slate-400">
              Start collecting reviews to see sentiment analysis
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Horizontal bar chart visualization */}
            <div className="w-full h-6 flex rounded-full overflow-hidden">
              <div 
                className={`${colors.positive} h-full`} 
                style={{ width: `${positive}%` }}
              ></div>
              <div 
                className={`${colors.neutral} h-full`}
                style={{ width: `${neutral}%` }}
              ></div>
              <div 
                className={`${colors.negative} h-full`}
                style={{ width: `${negative}%` }}
              ></div>
            </div>
            
            {/* Stats with counts and percentages */}
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1">
                <div className="text-xs text-slate-500">Positive</div>
                <div className="flex items-baseline">
                  <span className={`text-xl font-bold ${getTextColor('positive')}`}>
                    {positive}%
                  </span>
                  <span className="text-xs text-slate-400 ml-1">
                    ({sentimentData.counts.positive})
                  </span>
                </div>
                <div className={`w-full h-1 ${colors.positiveLight} rounded-full`}>
                  <div 
                    className={`h-1 ${colors.positive} rounded-full`} 
                    style={{ width: `${positive}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="text-xs text-slate-500">Neutral</div>
                <div className="flex items-baseline">
                  <span className={`text-xl font-bold ${getTextColor('neutral')}`}>
                    {neutral}%
                  </span>
                  <span className="text-xs text-slate-400 ml-1">
                    ({sentimentData.counts.neutral})
                  </span>
                </div>
                <div className={`w-full h-1 ${colors.neutralLight} rounded-full`}>
                  <div 
                    className={`h-1 ${colors.neutral} rounded-full`} 
                    style={{ width: `${neutral}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="text-xs text-slate-500">Negative</div>
                <div className="flex items-baseline">
                  <span className={`text-xl font-bold ${getTextColor('negative')}`}>
                    {negative}%
                  </span>
                  <span className="text-xs text-slate-400 ml-1">
                    ({sentimentData.counts.negative})
                  </span>
                </div>
                <div className={`w-full h-1 ${colors.negativeLight} rounded-full`}>
                  <div 
                    className={`h-1 ${colors.negative} rounded-full`} 
                    style={{ width: `${negative}%` }}
                  ></div>
                </div>
              </div>
            </div>
            
            {/* Total reviews indicator */}
            <div className="pt-2 text-center border-t border-border">
              <div className="text-xs text-slate-500">
                Based on <span className="font-medium">{sentimentData.counts.total}</span> reviews
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}