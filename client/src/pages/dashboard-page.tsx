import { useState, useEffect } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";
import { SummaryMetrics } from "@/components/dashboard/summary-metrics";
import { TrendGraph } from "@/components/dashboard/trend-graph";
import { ReviewFeed } from "@/components/dashboard/review-feed";
import { AIReplyPanel } from "@/components/dashboard/ai-reply-panel";
import { AlertCenter } from "@/components/dashboard/alert-center";
import { TrialStatus } from "@/components/dashboard/trial-status";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Download } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Review } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Helmet } from "react-helmet";

export default function DashboardPage() {
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const isMobile = useIsMobile();
  const { toast } = useToast();

  const { data: reviews } = useQuery<Review[]>({
    queryKey: ["/api/reviews/recent"],
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

  const handleApplyReply = (reviewId: number, reply: string) => {
    updateReviewMutation.mutate({
      reviewId,
      data: { response: reply },
    });
  };

  return (
    <>
      <Helmet>
        <title>Dashboard | RepuRadar</title>
        <meta name="description" content="Monitor and manage your professional reviews with RepuRadar's comprehensive dashboard. Track metrics, respond to reviews, and analyze trends." />
      </Helmet>
      
      <div className="min-h-screen flex flex-col lg:flex-row">
        <Sidebar />
        
        <div className="flex-1 flex flex-col">
          <Header className="sticky top-0 z-10" />
          <main className="flex-1 p-4 lg:p-6 bg-slate-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
              {/* Header */}
              <header className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <h1 className="text-2xl font-semibold text-slate-800">Dashboard</h1>
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

              {/* Summary Metrics */}
              <SummaryMetrics />

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column (2/3 width on large screens) */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Trend Graph */}
                  <TrendGraph />

                  {/* Review Feed */}
                  <ReviewFeed />
                </div>

                {/* Right Column (1/3 width on large screens) */}
                <div className="space-y-6">
                  {/* AI Reply Generator Panel (shown when a review is selected) */}
                  {selectedReview ? (
                    <AIReplyPanel
                      review={selectedReview}
                      onClose={() => setSelectedReview(null)}
                      onApplyReply={handleApplyReply}
                    />
                  ) : (
                    <AlertCenter />
                  )}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}