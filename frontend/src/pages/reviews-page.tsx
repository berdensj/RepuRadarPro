import React from 'react';
import { useState } from "react";
import { ReviewFeed } from '../components/dashboard/review-feed';
import { AIReplyPanel } from '../components/dashboard/ai-reply-panel';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Search, Download } from "lucide-react";
import { useIsMobile } from '../hooks/use-mobile';
import { useQuery, useMutation } from "@tanstack/react-query";
import { Review } from '../../../shared/schema';
import { apiRequest, queryClient } from '../lib/queryClient';
import { useToast } from '../hooks/use-toast';
import { Helmet } from "react-helmet";

export default function ReviewsPage() {
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const isMobile = useIsMobile();
  const { toast } = useToast();

  const { data: reviews } = useQuery<Review[]>({
    queryKey: ["/api/reviews"],
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
      
      <div className="max-w-7xl mx-auto">
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
            
            <Button className="h-10" aria-label="Export reviews">
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
              <AIReplyPanel
                review={selectedReview}
                onClose={() => setSelectedReview(null)}
                onApplyReply={handleApplyReply}
              />
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
      </div>
    </>
  );
}