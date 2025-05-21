import { useState } from "react";
import { SummaryMetrics } from "@/components/dashboard/summary-metrics";
import { TrendGraph } from "@/components/dashboard/trend-graph";
import { ReviewFeed } from "@/components/dashboard/review-feed";
import { AlertCenter } from "@/components/dashboard/alert-center";
import { TrialStatus } from "@/components/dashboard/trial-status";
import { WeeklySummary } from "@/components/dashboard/weekly-summary";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Download } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Review } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Helmet } from "react-helmet";
// Import our optimized AI reply panel
import AIReplyPanel from "@/components/dashboard/ai-reply-panel";

export default function DashboardPage() {
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const { data: reviews } = useQuery<Review[]>({
    queryKey: ["/api/reviews/recent"],
  });

  // Add proper typing for the user data
  const { data: userData } = useQuery<{ id: number; username: string; email: string }>({
    queryKey: ["/api/user"],
  });

  const updateReviewMutation = useMutation({
    mutationFn: async ({ reviewId, data }: { reviewId: number; data: Partial<Review> }) => {
      await apiRequest("PATCH", `/api/reviews/${reviewId}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reviews/recent"] });
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

  // Function to apply AI-generated reply to a review
  const handleApplyReply = (reply: string) => {
    if (!selectedReview) return;
    
    updateReviewMutation.mutate({
      reviewId: selectedReview.id,
      data: { response: reply },
    });
  };

  return (
    <>
      <Helmet>
        <title>Dashboard | Reputation Sentinel</title>
        <meta name="description" content="Monitor and manage your professional reviews with Reputation Sentinel's comprehensive dashboard. Track metrics, respond to reviews, and analyze trends." />
      </Helmet>
      
      <div className="p-4 lg:p-6">
        {/* Header */}
        <header className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-slate-500">Monitor and manage your professional reviews</p>
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
        
        {/* Trial Status Banner */}
        <TrialStatus />
        
        {/* Weekly Summary (New!) */}
        <div className="mb-6">
          {userData && userData.id ? (
            <WeeklySummary userId={userData.id} />
          ) : (
            <div className="bg-white p-4 rounded-lg shadow mb-6">
              <div className="animate-pulse">
                <div className="h-6 bg-slate-200 rounded w-1/3 mb-4"></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="h-24 bg-slate-100 rounded"></div>
                  <div className="h-24 bg-slate-100 rounded"></div>
                  <div className="h-24 bg-slate-100 rounded"></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Summary Metrics */}
        <SummaryMetrics />

        {/* Improved responsive grid layout with better spacing on small screens */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Left Column (2/3 width on large screens, full width on smaller screens) */}
          <div className="md:col-span-2 space-y-4 sm:space-y-6">
            {/* Trend Graph - better padding on mobile */}
            <div className="p-2 sm:p-0">
              <TrendGraph />
            </div>

            {/* Review Feed - better padding on mobile */}
            <div className="p-2 sm:p-0">
              <ReviewFeed />
            </div>
          </div>

          {/* Right Column (1/3 width on large screens, full width on mobile) */}
          <div className="space-y-4 sm:space-y-6">
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
                      handleApplyReply(textarea?.value || '');
                    }}
                    disabled={updateReviewMutation.isPending}
                  >
                    {updateReviewMutation.isPending ? 'Saving...' : 'Apply Reply'}
                  </Button>
                </div>
              </div>
            ) : (
              <AlertCenter />
            )}
          </div>
        </div>
      </div>
    </>
  );
}