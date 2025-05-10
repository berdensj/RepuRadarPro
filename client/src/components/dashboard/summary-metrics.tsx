import { Card, CardContent } from "@/components/ui/card";
import { StarRating } from "@/components/ui/star-rating";
import { useQuery } from "@tanstack/react-query";
import { ArrowDownIcon, ArrowUpIcon, MessageSquare, Star, ThumbsUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function SummaryMetrics() {
  const { data: metrics, isLoading, error } = useQuery({
    queryKey: ["/api/metrics"],
  });

  if (isLoading) {
    return (
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="w-full">
                  <Skeleton className="h-5 w-24 mb-2" />
                  <Skeleton className="h-8 w-32 mb-3" />
                  <Skeleton className="h-4 w-48" />
                </div>
                <Skeleton className="h-12 w-12 rounded-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </section>
    );
  }

  if (error) {
    return (
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="col-span-3">
          <CardContent className="p-5 text-center text-red-500">
            Error loading metrics: {error.message}
          </CardContent>
        </Card>
      </section>
    );
  }

  // Calculate difference from previous period (placeholder logic)
  const avgRatingDiff = 0.2;
  const reviewsAddedThisMonth = 24;
  const positivePercentageDiff = 3;

  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {/* Average Rating */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Average Rating</p>
              <div className="flex items-center mt-1">
                <span className="text-2xl font-semibold mr-2">
                  {metrics?.averageRating?.toFixed(1) || "0.0"}
                </span>
                <StarRating rating={metrics?.averageRating || 0} />
              </div>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center text-primary">
              <Star className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-center text-sm">
            {avgRatingDiff > 0 ? (
              <span className="text-success font-medium flex items-center">
                <ArrowUpIcon className="h-3 w-3 mr-1" /> {avgRatingDiff.toFixed(1)}
              </span>
            ) : (
              <span className="text-danger font-medium flex items-center">
                <ArrowDownIcon className="h-3 w-3 mr-1" /> {Math.abs(avgRatingDiff).toFixed(1)}
              </span>
            )}
            <span className="text-slate-500 ml-2">from last month</span>
          </div>
        </CardContent>
      </Card>
      
      {/* Total Reviews */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Total Reviews</p>
              <p className="text-2xl font-semibold mt-1">{metrics?.totalReviews || 0}</p>
            </div>
            <div className="h-12 w-12 bg-indigo-100 rounded-full flex items-center justify-center text-secondary">
              <MessageSquare className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-center text-sm">
            <span className="text-success font-medium flex items-center">
              <ArrowUpIcon className="h-3 w-3 mr-1" /> {reviewsAddedThisMonth}
            </span>
            <span className="text-slate-500 ml-2">new this month</span>
          </div>
        </CardContent>
      </Card>
      
      {/* Positive Reviews */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Positive Reviews</p>
              <p className="text-2xl font-semibold mt-1">
                {metrics?.positivePercentage?.toFixed(0) || 0}%
              </p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center text-success">
              <ThumbsUp className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-center text-sm">
            <span className="text-success font-medium flex items-center">
              <ArrowUpIcon className="h-3 w-3 mr-1" /> {positivePercentageDiff}%
            </span>
            <span className="text-slate-500 ml-2">from last month</span>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
