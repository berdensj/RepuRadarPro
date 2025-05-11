import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { StarRating } from "@/components/ui/star-rating";
import { Alert } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { ExternalLink, TrendingUp, ArrowUpIcon, ArrowDownIcon } from "lucide-react";

export function AlertCenter() {
  const { data: negativeReviews, isLoading: isLoadingNegative } = useQuery<any[]>({
    queryKey: ["/api/reviews/negative"],
  });

  const { data: alerts, isLoading: isLoadingAlerts } = useQuery<Alert[]>({
    queryKey: ["/api/alerts"],
  });

  // Parse keyword trends from alerts
  const keywordTrends = alerts 
    ? alerts
        .filter(alert => alert.alertType === "keyword_trend")
        .map(alert => {
          try {
            return JSON.parse(alert.content);
          } catch (e) {
            return null;
          }
        })
        .filter(Boolean)
    : [];

  const renderPlatformIcon = (platform: string) => {
    if (platform.toLowerCase() === "google") {
      return (
        <span className="bg-slate-100 p-1 rounded-full mr-2 text-blue-500 text-[10px]">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 1.95c-5.52 0-10 4.48-10 10s4.48 10 10 10h5v-2h-5c-4.34 0-8-3.66-8-8s3.66-8 8-8 8 3.66 8 8v1.43c0 .79-.71 1.57-1.5 1.57s-1.5-.78-1.5-1.57v-1.43c0-2.76-2.24-5-5-5s-5 2.24-5 5 2.24 5 5 5c1.38 0 2.64-.56 3.54-1.47.65.89 1.77 1.47 2.96 1.47 1.97 0 3.5-1.6 3.5-3.57v-1.43c0-5.52-4.48-10-10-10zm0 13c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z" fill="currentColor" />
          </svg>
        </span>
      );
    } else if (platform.toLowerCase() === "yelp") {
      return (
        <span className="bg-slate-100 p-1 rounded-full mr-2 text-red-500 text-[10px]">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
            <path d="M21.111 18.226c-.141.969-2.119 3.483-3.029 3.847-.311.124-.611.094-.85-.09-.154-.12-.314-.365-1.447-2.269-.346-.578-.659-1.103-.77-1.245-.424-.554-.546-1.207-.325-1.833.221-.62.78-1.001 1.513-1.021.76-.021 1.23.445 1.759 1.7.059.142.15.374.225.589.16.481.414 1.229.918 1.104.344-.085.464-.44.464-.92 0-.482-.129-1.63-.151-1.795-.045-.335.06-.763.45-.927.796-.339 1.756.397 1.756 1.012 0 .516-.05 1.02-.026 1.527.024.507.1.92.1 1.031 0 .24-.11.404-.213.481-.161.117-.379.112-.374.091zm-7.727-8.493c.06-1.637 1.064-4.863 1.669-5.323.365-.278.695-.266.949-.073.161.123.404.398 1.255 3.745.183.747.36 1.604.435 2.018.258 1.406.124 1.814-.392 2.352-.501.521-1.208.763-1.947.679-.737-.083-1.144-.514-1.516-1.666-.045-.139-.104-.377-.158-.568-.115-.409-.265-.994-.427-1.449-.342-.933-.262-.847-.868-.715m2.242-8.671c.042-.997.665-2.608 1.209-3.131.349-.333.652-.413.913-.313.174.066.471.261.705 2.171.045.369.097.952.136 1.342.09.913.178 1.858.135 2.576-.095 1.535-.979 1.233-1.343 1.112-.9-.3-1.109-.604-1.155-1.085-.023-.246.051-.573.099-1.082.026-.283.054-.614.067-.885.041-.839-.184-.606-.766-.705m-2.233 1.9c-.3-1.105-.317-5.119.07-5.933.307-.645.666-.796 1.019-.679.23.077.519.337 1.027 2.156.153.551.336 1.543.426 2.018.248 1.318.36 2.828-.496 3.351-.835.512-1.439.262-1.777.163-.745-.219-.953-1.076-.269-1.076m-8.393 5.281c.658-.669 2.164-1.637 2.873-1.623.402.008.699.133.865.358.109.146.226.47-.474 2.161-.16.387-.34.776-.44.986-.396.871-.604 1.541-1.195 1.673-.597.133-1.168-.159-1.584-.701-.422-.548-.548-1.051-.338-1.701.062-.193.185-.491.293-.713.233-.48.422-.882.342-1.044-.143-.288-.447-.126-.673-.045-.226.081-.507.024-.607-.204-.107-.239-.04-.599.538-.147m4.069-1.898c0-.22.3-.669.75-.539.45.131 1.054.694 1.261 1.126.207.432 1.533 2.387 2.009 3.103.173.261.441.666.441.942 0 .728-1.125.824-1.5.822-.375-.001-.789-.193-1.124-.7-.561-.848-1.336-2.938-1.426-3.338-.09-.399-.411-1.191-.411-1.416z" fill="currentColor" />
          </svg>
        </span>
      );
    }
    return null;
  };

  // Sample keyword trends data for display
  const sampleKeywordTrends = [
    { 
      keyword: "Billing Issues", 
      percentage: 43, 
      trend: "increasing",
      description: "Mentions of billing problems have increased significantly in the last 30 days."
    },
    { 
      keyword: "Wait Times", 
      percentage: 27, 
      trend: "increasing",
      description: "Complaints about long wait times are trending upward."
    },
    { 
      keyword: "Staff Friendliness", 
      percentage: 18, 
      trend: "increasing",
      description: "Positive mentions of staff friendliness have increased."
    }
  ];

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">Alert Center</CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-5">
        {/* Negative Reviews Alert */}
        <div>
          <h3 className="font-medium text-sm text-slate-600 mb-2">Recent Negative Reviews</h3>
          
          {isLoadingNegative ? (
            <div className="space-y-2">
              {[1, 2].map(i => (
                <div key={i} className="p-3 bg-red-50 rounded-md border-l-4 border-red-500">
                  <div className="flex justify-between items-start">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <Skeleton className="h-4 w-20 my-1" />
                  <Skeleton className="h-8 w-full mt-2" />
                </div>
              ))}
            </div>
          ) : negativeReviews && negativeReviews.length > 0 ? (
            <div className="space-y-2">
              {negativeReviews.map(review => (
                <div key={review.id} className="p-3 bg-red-50 rounded-md border-l-4 border-red-500">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center">
                        {renderPlatformIcon(review.platform)}
                        <span className="text-sm font-medium">{review.reviewerName}</span>
                      </div>
                      <StarRating rating={review.rating} size="sm" className="mt-1" />
                    </div>
                    <span className="text-xs text-slate-500">
                      {formatDistanceToNow(new Date(review.date), { addSuffix: true })}
                    </span>
                  </div>
                  <div className="mt-2">
                    <p className="text-xs text-slate-700 line-clamp-2">{review.reviewText}</p>
                  </div>
                  <a href="#" className="text-xs text-primary hover:text-blue-700 mt-1 inline-block">
                    View details
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-3 bg-slate-50 rounded-md text-center text-sm text-slate-500">
              No negative reviews found
            </div>
          )}
        </div>
        
        {/* Keyword Trend Detection */}
        <div>
          <h3 className="font-medium text-sm text-slate-600 mb-2">Keyword Trends Detected</h3>
          
          {isLoadingAlerts ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="p-3 bg-slate-50 rounded-md border-l-4 border-slate-300">
                  <div className="flex justify-between">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <Skeleton className="h-4 w-full mt-2" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {sampleKeywordTrends.map((trend, index) => (
                <div 
                  key={index} 
                  className={`p-3 rounded-md border-l-4 ${
                    trend.keyword === "Staff Friendliness" 
                      ? "bg-green-50 border-green-500" 
                      : "bg-amber-50 border-amber-500"
                  }`}
                >
                  <div className="flex justify-between">
                    <span className="text-sm font-medium flex items-center">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      {trend.keyword}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      trend.keyword === "Staff Friendliness"
                        ? "bg-green-200 text-green-800"
                        : "bg-amber-200 text-amber-800"
                    }`}>
                      {trend.trend === "increasing" ? "+" : "-"}{trend.percentage}%
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 mt-1">{trend.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Improvement Tips */}
        <div>
          <h3 className="font-medium text-sm text-slate-600 mb-2">Improvement Tips</h3>
          <div className="space-y-3">
            <div className="flex items-start">
              <div className="bg-blue-100 p-2 rounded-full text-primary mr-3 mt-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="8" x2="16" y1="12" y2="12"></line>
                  <line x1="12" x2="12" y1="16" y2="8"></line>
                  <circle cx="12" cy="12" r="10"></circle>
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-medium">Address Billing Concerns</h3>
                <p className="text-sm text-slate-600 mt-1">Review your billing processes and provide staff training to ensure accurate charges.</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="bg-blue-100 p-2 rounded-full text-primary mr-3 mt-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="8" x2="16" y1="12" y2="12"></line>
                  <line x1="12" x2="12" y1="16" y2="8"></line>
                  <circle cx="12" cy="12" r="10"></circle>
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-medium">Improve Appointment Scheduling</h3>
                <p className="text-sm text-slate-600 mt-1">Consider adjusting your scheduling system to reduce patient wait times.</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="bg-blue-100 p-2 rounded-full text-primary mr-3 mt-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="8" x2="16" y1="12" y2="12"></line>
                  <line x1="12" x2="12" y1="16" y2="8"></line>
                  <circle cx="12" cy="12" r="10"></circle>
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-medium">Respond to Negative Reviews</h3>
                <p className="text-sm text-slate-600 mt-1">Promptly address negative feedback to demonstrate your commitment to improvement.</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
