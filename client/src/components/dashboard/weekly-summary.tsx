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

// Define types that match our API response
interface WeeklySummaryData {
  reportType: string;
  generatedAt: string;
  metrics: {
    totalReviews: number;
    averageRating: number;
    responseRate: number;
    sentimentBreakdown: {
      positive: number;
      neutral: number;
      negative: number;
    };
  };
  topPerformers: {
    location: {
      name: string;
      rating: number;
    } | null;
  };
  locationPerformance: Array<{
    name: string;
    reviewCount: number;
    avgRating: number;
  }>;
  highlightedReviews: {
    positive: {
      reviewerName: string;
      platform: string;
      rating: number;
      reviewText: string;
      sentiment: string;
    } | null;
    negative: {
      reviewerName: string;
      platform: string;
      rating: number;
      reviewText: string;
      sentiment: string;
    } | null;
  };
}

export function WeeklySummary({ userId }: WeeklySummaryProps) {
  const [expanded, setExpanded] = useState(false);
  
  const { data, isLoading, error, isError } = useQuery<WeeklySummaryData>({
    queryKey: ["/api/reports/weekly-summary", userId],
    queryFn: async ({ queryKey }) => {
      const response = await fetch(queryKey[0] as string, {
        credentials: "include", // This is crucial for including auth cookies
      });
      if (!response.ok) {
        throw new Error("Failed to fetch weekly summary");
      }
      return response.json();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: userId > 0, // Only fetch if we have a valid userId
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
  
  // Use actual API data, or a placeholder if data is missing
  const summary = data || {
    reportType: "weekly_summary",
    generatedAt: new Date().toISOString(),
    metrics: {
      totalReviews: 0,
      averageRating: 0,
      responseRate: 0,
      sentimentBreakdown: {
        positive: 0,
        neutral: 0,
        negative: 0
      }
    },
    topPerformers: {
      location: null
    },
    locationPerformance: [],
    highlightedReviews: {
      positive: null,
      negative: null
    }
  };
  
  return (
    <Card className="shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <span>Weekly Performance Summary</span>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="font-normal">
              <Calendar className="h-3 w-3 mr-1" />
              Last 7 days
            </Badge>
            <Button variant="ghost" size="sm" onClick={toggleExpanded}>
              <ChevronDown className={`h-4 w-4 transition-transform ${expanded ? 'transform rotate-180' : ''}`} />
              <span className="sr-only">{expanded ? 'Collapse' : 'Expand'}</span>
            </Button>
          </div>
        </CardTitle>
        <CardDescription>
          Generated on {new Date(summary.generatedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground">Reviews</span>
            <div className="flex items-baseline">
              <span className="text-2xl font-bold">{summary.metrics.totalReviews}</span>
            </div>
          </div>
          
          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground">Avg. Rating</span>
            <div className="flex items-baseline">
              <span className="text-2xl font-bold">{summary.metrics.averageRating || "N/A"}</span>
              {summary.metrics.averageRating > 0 && (
                <Star className="h-4 w-4 text-yellow-500 ml-1" />
              )}
            </div>
          </div>
          
          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground">Response Rate</span>
            <div className="flex items-baseline">
              <span className="text-2xl font-bold">{summary.metrics.responseRate}%</span>
            </div>
          </div>
          
          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground">Sentiment</span>
            <div className="flex items-baseline">
              <span className="text-2xl font-bold">
                {summary.metrics.sentimentBreakdown.positive}% Positive
              </span>
            </div>
          </div>
        </div>
        
        {expanded && (
          <div className="mt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="col-span-2">
                <h3 className="font-medium mb-3">Sentiment Overview</h3>
                <SentimentOverview 
                  positive={summary.metrics.sentimentBreakdown.positive} 
                  neutral={summary.metrics.sentimentBreakdown.neutral} 
                  negative={summary.metrics.sentimentBreakdown.negative} 
                />
              </div>
              
              <div>
                <h3 className="font-medium mb-3">Top Locations</h3>
                {summary.locationPerformance.length > 0 ? (
                  <div className="space-y-3">
                    {summary.locationPerformance.map((location, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{location.name}</p>
                          <p className="text-sm text-muted-foreground">{location.reviewCount} reviews</p>
                        </div>
                        <div className="flex items-center">
                          <span className="font-medium mr-1">{location.avgRating}</span>
                          <Star className="h-4 w-4 text-yellow-500" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No location data available</p>
                )}
              </div>
            </div>
            
            {(summary.highlightedReviews.positive || summary.highlightedReviews.negative) && (
              <div>
                <h3 className="font-medium mb-3">Highlighted Reviews</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {summary.highlightedReviews.positive && (
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center">
                          <Badge className="bg-green-100 text-green-800 mr-2">Positive</Badge>
                          {summary.highlightedReviews.positive.platform}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex items-center mb-2">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span className="ml-1 font-medium">{summary.highlightedReviews.positive.rating}</span>
                          <span className="mx-2">·</span>
                          <span className="text-sm">{summary.highlightedReviews.positive.reviewerName}</span>
                        </div>
                        <p className="text-sm">{summary.highlightedReviews.positive.reviewText}</p>
                      </CardContent>
                    </Card>
                  )}
                  
                  {summary.highlightedReviews.negative && (
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center">
                          <Badge className="bg-red-100 text-red-800 mr-2">Negative</Badge>
                          {summary.highlightedReviews.negative.platform}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex items-center mb-2">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span className="ml-1 font-medium">{summary.highlightedReviews.negative.rating}</span>
                          <span className="mx-2">·</span>
                          <span className="text-sm">{summary.highlightedReviews.negative.reviewerName}</span>
                        </div>
                        <p className="text-sm">{summary.highlightedReviews.negative.reviewText}</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="border-t pt-4">
        <div className="flex items-center justify-between w-full">
          <p className="text-xs text-muted-foreground">
            Last updated {formatDistanceToNow(new Date(summary.generatedAt), { addSuffix: true })}
          </p>
          <Button variant="outline" size="sm" className="text-xs">
            <Download className="h-3 w-3 mr-1" />
            Download Report
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}