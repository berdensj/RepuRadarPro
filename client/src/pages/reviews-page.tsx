import { useState } from "react";
import { ReviewFeed } from "@/components/dashboard/review-feed";
import AIReplyPanel from "@/components/dashboard/ai-reply-panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Download } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Review } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Helmet } from "react-helmet";

export default function ReviewsPage() {
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  // Optimized reviews query with better caching and prefetching
  const { data: reviews } = useQuery<Review[]>({
    queryKey: ["/api/reviews"],
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    select: (data) => {
      // You can add transformations here if needed
      return data;
    }
  });

  const updateReviewMutation = useMutation({
    mutationFn: async ({ reviewId, data }: { reviewId: number; data: Partial<Review> }) => {
      await apiRequest("PATCH", `/api/reviews/${reviewId}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reviews"] });
      toast({
        title: "Success",
        description: "Response saved successfully",
      });
      setSelectedReview(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to save response: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleApplyReply = (reviewId: number, reply: string) => {
    updateReviewMutation.mutate({
      reviewId,
      data: { response: reply },
    });
  };

  return (
    <>
      <Helmet>
        <title>Reviews | Reputation Sentinel</title>
        <meta name="description" content="View and manage all your customer reviews in one place. Filter by platform, rating, and more." />
      </Helmet>
      
      {/* Header */}
      <header className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Reviews</h1>
          <p className="text-slate-500">Manage and respond to all your customer reviews</p>
        </div>
        
        <div className="mt-4 md:mt-0 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search reviews..."
              className="pl-9 pr-4 h-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Button className="h-10">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2/3 width on large screens) */}
        <div className="lg:col-span-2">
          {/* Review Feed */}
          <ReviewFeed />
        </div>

        {/* Right Column (1/3 width on large screens) */}
        <div>
          {/* AI Reply Generator Panel (shown when a review is selected) */}
          {selectedReview ? (
            <div className="relative">
              <Button 
                variant="ghost" 
                size="sm" 
                className="absolute top-2 right-2 z-10 h-8 w-8 p-0 rounded-full"
                onClick={() => setSelectedReview(null)}
              >
                <span className="sr-only">Close</span>
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                </svg>
              </Button>
              
              <AIReplyPanel
                reviewId={selectedReview.id}
                reviewContent={selectedReview.reviewText}
                reviewRating={selectedReview.rating}
                className="min-h-[300px]"
              />
              
              <div className="mt-4 flex justify-end">
                <Button 
                  onClick={() => {
                    const textarea = document.getElementById('ai-reply') as HTMLTextAreaElement;
                    if (textarea && selectedReview) {
                      handleApplyReply(selectedReview.id, textarea.value);
                    }
                  }}
                  disabled={updateReviewMutation.isPending}
                >
                  {updateReviewMutation.isPending ? 'Saving...' : 'Apply Reply'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-white border rounded-lg p-5 h-full flex flex-col items-center justify-center text-center">
              <div className="mb-4 p-4 bg-blue-50 rounded-full">
                <Search className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-medium mb-2">Select a Review</h3>
              <p className="text-sm text-slate-500 max-w-md">
                Click on any review to generate an AI-powered response or mark it as resolved.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}