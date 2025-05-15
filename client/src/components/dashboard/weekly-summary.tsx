import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowUp, ArrowDown, BarChart3, Calendar, ChevronDown, Download, Loader2, Star, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { SentimentOverview } from "./sentiment-overview";

interface WeeklySummaryProps {
  userId: number;
}

export function WeeklySummary({ userId }: WeeklySummaryProps) {
  const [expanded, setExpanded] = useState(false);
  
  const { data, isLoading, error, isError } = useQuery({
    queryKey: ["/api/reports/weekly-summary", userId],
    queryFn: async () => {
      const response = await fetch("/api/reports/weekly-summary");
      if (!response.ok) {
        throw new Error("Failed to fetch weekly summary");
      }
      return response.json();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  const toggleExpanded = () => {
    setExpanded(!expanded);
  };
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between">
            <span>Weekly Performance Summary</span>
          </CardTitle>
          <CardDescription>Loading your weekly data...</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (isError) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between">
            <span>Weekly Performance Summary</span>
          </CardTitle>
          <CardDescription>Error loading weekly data</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <AlertCircle className="h-8 w-8 text-red-500 mb-2" />
            <p className="text-sm text-muted-foreground mb-4">{error instanceof Error ? error.message : "An error occurred"}</p>
            <Button variant="outline" size="sm">Retry</Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  const summary = data || {
    period: {
      start: "2025-05-08",
      end: "2025-05-15"
    },
    metrics: {
      totalReviews: 24,
      averageRating: 4.2,
      reviewGrowth: 8.5,
      ratingChange: 0.3,
      responsesGenerated: 18,
      responseRate: 75
    },
    sentiment: {
      positive: 68,
      neutral: 21,
      negative: 11,
      trend: "stable"
    },
    topLocations: [
      {
        name: "Downtown Office",
        reviewCount: 12,
        avgRating: 4.5
      },
      {
        name: "Westside Branch",
        reviewCount: 8,
        avgRating: 4.0
      }
    ],
    topKeywords: ["professional", "friendly", "clean", "helpful", "responsive"]
  };
  
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between">
            <span>Weekly Performance Summary</span>
            <Badge variant="outline" className="ml-2 text-xs">
              <Calendar className="w-3 h-3 mr-1" />
              {formatDistanceToNow(new Date(summary.period.end), { addSuffix: true })}
            </Badge>
          </CardTitle>
          <CardDescription>
            {new Date(summary.period.start).toLocaleDateString()} - {new Date(summary.period.end).toLocaleDateString()}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Total Reviews</p>
              <div className="flex items-end">
                <p className="text-2xl font-bold">{summary.metrics.totalReviews}</p>
                {summary.metrics.reviewGrowth > 0 ? (
                  <Badge className="ml-2 bg-green-500">
                    <ArrowUp className="h-3 w-3 mr-1" />
                    {summary.metrics.reviewGrowth}%
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="ml-2">
                    <ArrowDown className="h-3 w-3 mr-1" />
                    {Math.abs(summary.metrics.reviewGrowth)}%
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Average Rating</p>
              <div className="flex items-end">
                <p className="text-2xl font-bold">{summary.metrics.averageRating.toFixed(1)}</p>
                <Star className="h-4 w-4 text-yellow-400 ml-1" />
                {summary.metrics.ratingChange > 0 ? (
                  <Badge className="ml-2 bg-green-500">
                    <ArrowUp className="h-3 w-3 mr-1" />
                    {summary.metrics.ratingChange}
                  </Badge>
                ) : summary.metrics.ratingChange < 0 ? (
                  <Badge variant="destructive" className="ml-2">
                    <ArrowDown className="h-3 w-3 mr-1" />
                    {Math.abs(summary.metrics.ratingChange)}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="ml-2">
                    —
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Responses</p>
              <div className="flex items-end">
                <p className="text-2xl font-bold">{summary.metrics.responsesGenerated}</p>
                <span className="ml-2 text-xs text-muted-foreground">
                  ({summary.metrics.responseRate}%)
                </span>
              </div>
            </div>
            
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Sentiment</p>
              <div className="flex items-end">
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-green-500 mr-1"></div>
                  <span className="text-xs">{summary.sentiment.positive}%</span>
                </div>
                <div className="flex items-center ml-2">
                  <div className="w-2 h-2 rounded-full bg-yellow-500 mr-1"></div>
                  <span className="text-xs">{summary.sentiment.neutral}%</span>
                </div>
                <div className="flex items-center ml-2">
                  <div className="w-2 h-2 rounded-full bg-red-500 mr-1"></div>
                  <span className="text-xs">{summary.sentiment.negative}%</span>
                </div>
              </div>
            </div>
          </div>
          
          {expanded && (
            <div className="mt-6 pt-6 border-t border-border">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium mb-3">Top Performing Locations</h4>
                  <div className="space-y-3">
                    {summary.topLocations.map((location, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">{location.name}</p>
                          <div className="flex items-center text-xs text-muted-foreground">
                            <span>{location.reviewCount} reviews</span>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <span className="font-medium mr-1">{location.avgRating.toFixed(1)}</span>
                          <Star className="h-3 w-3 text-yellow-400" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-3">Top Customer Keywords</h4>
                  <div className="flex flex-wrap gap-2">
                    {summary.topKeywords.map((keyword, index) => (
                      <Badge key={index} variant="secondary">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="pt-0 flex justify-between">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs"
            onClick={toggleExpanded}
          >
            {expanded ? "Show Less" : "Show More"}
            <ChevronDown className={`h-4 w-4 ml-1 transition-transform ${expanded ? "rotate-180" : ""}`} />
          </Button>
          
          <Button variant="outline" size="sm" className="text-xs">
            <Download className="h-3 w-3 mr-1" />
            Download Report
          </Button>
        </CardFooter>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SentimentOverview />
        
        <Card>
          <CardHeader>
            <CardTitle>Rating Trends</CardTitle>
            <CardDescription>30-day average rating analysis</CardDescription>
          </CardHeader>
          <CardContent className="h-[240px] flex items-center justify-center">
            <BarChart3 className="h-16 w-16 text-muted-foreground/30" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}