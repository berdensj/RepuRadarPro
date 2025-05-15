import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery, useMutation } from "@tanstack/react-query";
import { StarRating } from "@/components/ui/star-rating";
import { Button } from "@/components/ui/button";
import {
  Check,
  CheckCircle,
  Filter,
  Loader2,
  MessageSquareText,
} from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Review } from "@shared/schema";
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDistanceToNow } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function ReviewFeed() {
  const [platform, setPlatform] = useState<string | null>(null);

  const { data: reviews, isLoading, error } = useQuery<Review[]>({
    queryKey: ["/api/reviews/recent"],
  });

  const resolveReviewMutation = useMutation({
    mutationFn: async (reviewId: number) => {
      await apiRequest("POST", `/api/reviews/${reviewId}/resolve`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reviews/recent"] });
    },
  });

  const generateReplyMutation = useMutation({
    mutationFn: async (reviewId: number) => {
      const response = await apiRequest(
        "POST",
        `/api/ai/reply`,
        { 
          reviewId,
          tone: "professional" 
        }
      );
      return response.json();
    },
  });

  // Ensure reviews is an array with error handling
  const reviewsArray = Array.isArray(reviews) ? reviews : [];
  
  // Apply platform filtering if needed
  const filteredReviews = platform
    ? reviewsArray.filter((review) => review.platform === platform)
    : reviewsArray;

  const handlePlatformChange = (value: string) => {
    setPlatform(value === "all" ? null : value);
  };

  const handleGenerateReply = (reviewId: number) => {
    generateReplyMutation.mutate(reviewId);
  };

  const handleMarkResolved = (reviewId: number) => {
    resolveReviewMutation.mutate(reviewId);
  };

  const renderPlatformIcon = (platform: string) => {
    if (platform.toLowerCase() === "google") {
      return (
        <span className="bg-slate-100 p-1 rounded-full mr-2 text-blue-500">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path
              d="M12 1.95c-5.52 0-10 4.48-10 10s4.48 10 10 10h5v-2h-5c-4.34 0-8-3.66-8-8s3.66-8 8-8 8 3.66 8 8v1.43c0 .79-.71 1.57-1.5 1.57s-1.5-.78-1.5-1.57v-1.43c0-2.76-2.24-5-5-5s-5 2.24-5 5 2.24 5 5 5c1.38 0 2.64-.56 3.54-1.47.65.89 1.77 1.47 2.96 1.47 1.97 0 3.5-1.6 3.5-3.57v-1.43c0-5.52-4.48-10-10-10zm0 13c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z"
              fill="currentColor"
            />
          </svg>
        </span>
      );
    } else if (platform.toLowerCase() === "yelp") {
      return (
        <span className="bg-slate-100 p-1 rounded-full mr-2 text-red-500">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path
              d="M21.111 18.226c-.141.969-2.119 3.483-3.029 3.847-.311.124-.611.094-.85-.09-.154-.12-.314-.365-1.447-2.269-.346-.578-.659-1.103-.77-1.245-.424-.554-.546-1.207-.325-1.833.221-.62.78-1.001 1.513-1.021.76-.021 1.23.445 1.759 1.7.059.142.15.374.225.589.16.481.414 1.229.918 1.104.344-.085.464-.44.464-.92 0-.482-.129-1.63-.151-1.795-.045-.335.06-.763.45-.927.796-.339 1.756.397 1.756 1.012 0 .516-.05 1.02-.026 1.527.024.507.1.92.1 1.031 0 .24-.11.404-.213.481-.161.117-.379.112-.374.091zm-7.727-8.493c.06-1.637 1.064-4.863 1.669-5.323.365-.278.695-.266.949-.073.161.123.404.398 1.255 3.745.183.747.36 1.604.435 2.018.258 1.406.124 1.814-.392 2.352-.501.521-1.208.763-1.947.679-.737-.083-1.144-.514-1.516-1.666-.045-.139-.104-.377-.158-.568-.115-.409-.265-.994-.427-1.449-.342-.933-.262-.847-.868-.715m2.242-8.671c.042-.997.665-2.608 1.209-3.131.349-.333.652-.413.913-.313.174.066.471.261.705 2.171.045.369.097.952.136 1.342.09.913.178 1.858.135 2.576-.095 1.535-.979 1.233-1.343 1.112-.9-.3-1.109-.604-1.155-1.085-.023-.246.051-.573.099-1.082.026-.283.054-.614.067-.885.041-.839-.184-.606-.766-.705m-2.233 1.9c-.3-1.105-.317-5.119.07-5.933.307-.645.666-.796 1.019-.679.23.077.519.337 1.027 2.156.153.551.336 1.543.426 2.018.248 1.318.36 2.828-.496 3.351-.835.512-1.439.262-1.777.163-.745-.219-.953-1.076-.269-1.076m-8.393 5.281c.658-.669 2.164-1.637 2.873-1.623.402.008.699.133.865.358.109.146.226.47-.474 2.161-.16.387-.34.776-.44.986-.396.871-.604 1.541-1.195 1.673-.597.133-1.168-.159-1.584-.701-.422-.548-.548-1.051-.338-1.701.062-.193.185-.491.293-.713.233-.48.422-.882.342-1.044-.143-.288-.447-.126-.673-.045-.226.081-.507.024-.607-.204-.107-.239-.04-.599.538-.147m4.069-1.898c0-.22.3-.669.75-.539.45.131 1.054.694 1.261 1.126.207.432 1.533 2.387 2.009 3.103.173.261.441.666.441.942 0 .728-1.125.824-1.5.822-.375-.001-.789-.193-1.124-.7-.561-.848-1.336-2.938-1.426-3.338-.09-.399-.411-1.191-.411-1.416z"
              fill="currentColor"
            />
          </svg>
        </span>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
            <Skeleton className="h-6 w-32 mb-2 sm:mb-0" />
            <Skeleton className="h-8 w-64" />
          </div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="border border-slate-200 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-5 w-28" />
              </div>
              <Skeleton className="h-16 w-full mb-3" />
              <div className="flex gap-2">
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-8 w-32" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-5 text-center text-red-500">
          Error loading reviews: {error.message}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-800">Latest Reviews</h2>
          <div className="flex items-center space-x-2 mt-2 sm:mt-0">
            <Button
              variant="outline"
              size="sm"
              className="text-sm"
            >
              <Filter className="h-4 w-4 mr-1" /> Filter
            </Button>
            <Select
              onValueChange={handlePlatformChange}
              defaultValue="all"
            >
              <SelectTrigger className="w-[160px] h-8 text-sm">
                <SelectValue placeholder="All Platforms" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">All Platforms</SelectItem>
                  <SelectItem value="Google">Google</SelectItem>
                  <SelectItem value="Yelp">Yelp</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>

        {filteredReviews.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            No reviews available
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReviews.map((review) => (
              <div
                key={review.id}
                className="border border-slate-200 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    {renderPlatformIcon(review.platform)}
                    <h3 className="font-medium">{review.reviewerName}</h3>
                  </div>
                  <div className="flex items-center">
                    <StarRating
                      rating={review.rating}
                      className="mr-2"
                    />
                    <span className="text-sm text-slate-500">
                      {formatDistanceToNow(new Date(review.date), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                </div>
                <p className="text-sm mb-3">{review.reviewText}</p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs bg-blue-100 text-primary hover:bg-blue-200 border-transparent"
                    onClick={() => handleGenerateReply(review.id)}
                    disabled={generateReplyMutation.isPending}
                  >
                    {generateReplyMutation.isPending ? (
                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    ) : (
                      <MessageSquareText className="h-3 w-3 mr-1" />
                    )}
                    Generate Reply
                  </Button>
                  
                  {!review.isResolved ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs bg-green-100 text-success hover:bg-green-200 border-transparent"
                      onClick={() => handleMarkResolved(review.id)}
                      disabled={resolveReviewMutation.isPending}
                    >
                      {resolveReviewMutation.isPending ? (
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                      ) : (
                        <Check className="h-3 w-3 mr-1" />
                      )}
                      Mark as Resolved
                    </Button>
                  ) : (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs bg-slate-100 text-slate-500 hover:bg-slate-200 border-transparent"
                            disabled
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Resolved
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>This review has been marked as resolved</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredReviews.length > 0 && (
          <div className="mt-4 flex justify-center">
            <Button variant="link" size="sm" className="text-primary">
              Load more reviews
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
