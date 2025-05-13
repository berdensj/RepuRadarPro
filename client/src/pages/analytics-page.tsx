import DashboardLayout from "@/components/dashboard/layout";
import { useState, useEffect } from "react";

import { TrendGraph } from "@/components/dashboard/trend-graph";
import { Helmet } from "react-helmet";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { 
  BarChart, LineChart, PieChart, CandlestickChart, BarChart2, TrendingUp, Building2,
  Star, MessageSquare, ThumbsUp, ArrowUpRight, Download, Mail, Calendar, 
  Filter, Clock, AlertCircle, MessageSquareText, Copy, Wand2, Loader2
} from "lucide-react";
import { 
  Chart as ChartJS, 
  ArcElement, 
  Legend, 
  CategoryScale, 
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
} from 'chart.js';
import { Tooltip } from 'chart.js';
import { Pie, Bar, Line } from 'react-chartjs-2';
import { useQuery, useMutation } from "@tanstack/react-query";
import { Location, Review } from "@shared/schema";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { generateReply } from "@/lib/openai";
import { apiRequest, queryClient } from "@/lib/queryClient";

ChartJS.register(
  ArcElement, 
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title
);

export default function AnalyticsPage() {
  const [periodFilter, setPeriodFilter] = useState("30");
  const [selectedLocationId, setSelectedLocationId] = useState<string>("all");
  const [sentimentFilter, setSentimentFilter] = useState("all");
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });
  
  // Type definition from react-day-picker
  type DateRange = {
    from: Date | undefined;
    to?: Date | undefined;
  };
  
  // Type-safe handler for date range selection
  const handleDateRangeSelect = (range: DateRange | undefined) => {
    if (range) {
      setDateRange({
        from: range.from,
        to: range.to ?? undefined
      });
    }
  };
  const [isCustomDate, setIsCustomDate] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const reviewsPerPage = 5;
  
  // Review response state
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [isResponseModalOpen, setIsResponseModalOpen] = useState(false);
  const [responseText, setResponseText] = useState("");
  const [responseTone, setResponseTone] = useState("professional");
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const { toast } = useToast();
  
  // Fetch locations for the current user
  const { data: locations = [], isLoading: isLoadingLocations } = useQuery<Location[]>({
    queryKey: ["/api/locations"],
  });
  
  // Handle date filter changes
  const handleDateFilterChange = (value: string) => {
    setIsCustomDate(value === "custom");
    setPeriodFilter(value);
    // Reset custom date range when switching to preset periods
    if (value !== "custom") {
      setDateRange({ from: undefined, to: undefined });
    }
  };
  
  // Prepare date parameters for API
  const getDateParams = () => {
    if (isCustomDate && dateRange.from && dateRange.to) {
      return `&startDate=${dateRange.from.toISOString()}&endDate=${dateRange.to.toISOString()}`;
    }
    return `&period=${periodFilter}`;
  };
  
  // Fetch analytics data based on selected location and period
  const { data: analyticsData, isLoading: isLoadingAnalytics } = useQuery({
    queryKey: ["/api/reviews/trends", selectedLocationId, periodFilter, dateRange, isCustomDate],
    queryFn: async () => {
      const locationParam = selectedLocationId !== "all" ? `&locationId=${selectedLocationId}` : "";
      const dateParams = getDateParams();
      const res = await fetch(`/api/reviews/trends?${dateParams}${locationParam}`);
      if (!res.ok) throw new Error("Failed to fetch analytics data");
      return res.json();
    }
  });
  
  // Fetch recent reviews for the table
  const { data: recentReviews = [], isLoading: isLoadingReviews } = useQuery<Review[]>({
    queryKey: ["/api/reviews", selectedLocationId, periodFilter, sentimentFilter, dateRange, isCustomDate],
    queryFn: async () => {
      const locationParam = selectedLocationId !== "all" ? `&locationId=${selectedLocationId}` : "";
      const sentimentParam = sentimentFilter !== "all" ? `&sentiment=${sentimentFilter}` : "";
      const dateParams = getDateParams();
      const res = await fetch(`/api/reviews?${dateParams}${locationParam}${sentimentParam}&limit=100`);
      if (!res.ok) throw new Error("Failed to fetch reviews");
      return res.json();
    }
  });
  
  // Use appropriate title based on selected location
  const getLocationName = () => {
    if (selectedLocationId === "all") return "All Locations";
    const location = locations.find(loc => loc.id.toString() === selectedLocationId);
    return location ? location.name : "Selected Location";
  };
  
  // Handle opening the response modal
  const handleOpenResponseModal = (review: Review) => {
    setSelectedReview(review);
    setResponseText(review.response || "");
    setIsResponseModalOpen(true);
  };
  
  // Save response mutation
  const saveResponseMutation = useMutation({
    mutationFn: async ({ reviewId, response }: { reviewId: number, response: string }) => {
      const res = await apiRequest("PATCH", `/api/reviews/${reviewId}`, { response });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reviews"] });
      toast({
        title: "Response saved",
        description: "Your response has been saved successfully.",
      });
      setIsResponseModalOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error saving response",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Handle saving the response
  const handleSaveResponse = () => {
    if (selectedReview) {
      saveResponseMutation.mutate({ reviewId: selectedReview.id, response: responseText });
    }
  };
  
  // Generate AI response
  const handleGenerateAIResponse = async () => {
    if (!selectedReview) return;
    
    setIsGeneratingAI(true);
    try {
      const aiSuggestion = await generateReply(selectedReview.id, responseTone);
      setResponseText(aiSuggestion);
      toast({
        title: "AI response generated",
        description: "You can edit the suggestion before saving.",
      });
    } catch (error) {
      toast({
        title: "Error generating response",
        description: "Could not generate AI response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // Calculate KPI metrics
  const calculateMetrics = () => {
    if (isLoadingAnalytics || !analyticsData) {
      return {
        totalReviews: 0,
        averageRating: 0,
        responseRate: 0,
        sentiment: { positive: 0, neutral: 0, negative: 0 }
      };
    }
    
    // Total reviews count
    const totalReviews = analyticsData.total || 0;
    
    // Calculate average rating
    let totalStars = 0;
    let reviewCount = 0;
    if (analyticsData.ratings) {
      Object.entries(analyticsData.ratings).forEach(([rating, count]) => {
        totalStars += Number(rating) * (count as number);
        reviewCount += count as number;
      });
    }
    const averageRating = reviewCount > 0 ? totalStars / reviewCount : 0;
    
    // Calculate response rate
    const responded = analyticsData.responded || 0;
    const responseRate = totalReviews > 0 ? (responded / totalReviews) * 100 : 0;
    
    // Calculate sentiment breakdown
    const sentiment = {
      positive: analyticsData.sentiment?.positive || 0,
      neutral: analyticsData.sentiment?.neutral || 0,
      negative: analyticsData.sentiment?.negative || 0
    };
    
    return {
      totalReviews,
      averageRating,
      responseRate,
      sentiment
    };
  };
  
  const metrics = calculateMetrics();
  
  // Get sentiment class for color coding
  const getSentimentClass = (rating: number) => {
    if (rating >= 4) return "text-green-600";
    if (rating >= 3) return "text-amber-600";
    return "text-red-600";
  };
  
  // Generate a line chart for daily review volume
  const prepareDailyVolumeChart = () => {
    if (isLoadingAnalytics || !analyticsData || !analyticsData.dailyVolume) {
      return {
        labels: [],
        datasets: [{
          label: 'Reviews',
          data: [],
          borderColor: 'rgba(59, 130, 246, 1)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          fill: true,
          tension: 0.4,
        }]
      };
    }
    
    const sortedDates = Object.keys(analyticsData.dailyVolume).sort();
    const volumes = sortedDates.map(date => analyticsData.dailyVolume[date]);
    
    return {
      labels: sortedDates,
      datasets: [{
        label: 'Review Volume',
        data: volumes,
        borderColor: 'rgba(59, 130, 246, 1)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
      }]
    };
  };
  
  const dailyVolumeData = prepareDailyVolumeChart();
  
  // Prepare chart data based on API response or use loading state
  const prepareChartData = () => {
    if (isLoadingAnalytics || !analyticsData) {
      return {
        platformData: {
          labels: [],
          datasets: [{
            label: 'Loading...',
            data: [],
            backgroundColor: [],
            borderColor: [],
            borderWidth: 1,
          }]
        },
        ratingData: {
          labels: [],
          datasets: [{
            label: 'Loading...',
            data: [],
            backgroundColor: [],
            borderColor: [],
            borderWidth: 1,
          }]
        },
        keywordData: {
          labels: [],
          datasets: [{
            label: 'Loading...',
            data: [],
            backgroundColor: 'rgba(54, 162, 235, 0.6)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1,
          }]
        }
      };
    }
    
    // Platforms data
    const platformLabels = Object.keys(analyticsData.platforms || {});
    const platformValues = Object.values(analyticsData.platforms || {}) as number[];
    
    const platformData = {
      labels: platformLabels,
      datasets: [
        {
          label: 'Reviews by Platform',
          data: platformValues,
          backgroundColor: [
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 99, 132, 0.6)',
            'rgba(54, 162, 235, 0.4)',
            'rgba(75, 192, 192, 0.6)',
          ],
          borderColor: [
            'rgba(54, 162, 235, 1)',
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 0.8)',
            'rgba(75, 192, 192, 1)',
          ],
          borderWidth: 1,
        },
      ],
    };

    // Ratings data
    const ratingLabels = Object.keys(analyticsData.ratings || {}).map(r => `${r} Stars`);
    const ratingValues = Object.values(analyticsData.ratings || {}) as number[];
    
    const ratingData = {
      labels: ratingLabels,
      datasets: [
        {
          label: 'Reviews by Rating',
          data: ratingValues,
          backgroundColor: [
            'rgba(75, 192, 192, 0.6)',
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 206, 86, 0.6)',
            'rgba(255, 159, 64, 0.6)',
            'rgba(255, 99, 132, 0.6)',
          ],
          borderColor: [
            'rgba(75, 192, 192, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(255, 159, 64, 1)',
            'rgba(255, 99, 132, 1)',
          ],
          borderWidth: 1,
        },
      ],
    };

    // Keywords data
    const keywordLabels = Object.keys(analyticsData.keywords || {});
    const keywordValues = Object.values(analyticsData.keywords || {}) as number[];
    
    const keywordData = {
      labels: keywordLabels,
      datasets: [
        {
          label: 'Mentioned in Reviews',
          data: keywordValues,
          backgroundColor: 'rgba(54, 162, 235, 0.6)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
        },
      ],
    };
    
    return { platformData, ratingData, keywordData };
  };
  
  // Get chart data
  const { platformData, ratingData, keywordData } = prepareChartData();

  return (
    <>
      <Helmet>
        <title>Analytics | RepuRadar</title>
        <meta name="description" content="Detailed analytics and insights about your online reputation and customer reviews." />
      </Helmet>
      
      <div className="min-h-screen flex flex-col lg:flex-row">
        <Sidebar />
        
        <main className="flex-1 p-4 lg:p-6 bg-slate-50 min-h-screen">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <header className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-slate-800">Analytics</h1>
                <p className="text-slate-500">Insights for {getLocationName()}</p>
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  <span>Download PDF</span>
                </Button>
                
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span>Schedule Report</span>
                </Button>
              </div>
            </header>
            
            {/* KPI Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {/* Total Reviews Card */}
              <Card className="bg-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-500">Total Reviews</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div className="text-2xl font-bold">
                      {isLoadingAnalytics ? (
                        <div className="h-8 w-16 bg-slate-200 animate-pulse rounded"></div>
                      ) : (
                        metrics.totalReviews
                      )}
                    </div>
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <MessageSquare className="h-4 w-4 text-blue-600" />
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    In the selected time period
                  </p>
                </CardContent>
              </Card>
              
              {/* Average Rating Card */}
              <Card className="bg-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-500">Average Rating</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div className="text-2xl font-bold flex items-center">
                      {isLoadingAnalytics ? (
                        <div className="h-8 w-16 bg-slate-200 animate-pulse rounded"></div>
                      ) : (
                        <span className={getSentimentClass(metrics.averageRating)}>
                          {metrics.averageRating.toFixed(1)}
                        </span>
                      )}
                      <Star className={`h-5 w-5 ml-1 ${getSentimentClass(metrics.averageRating)}`} />
                    </div>
                    <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center">
                      <Star className="h-4 w-4 text-amber-600" />
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    Out of 5 stars
                  </p>
                </CardContent>
              </Card>
              
              {/* Response Rate Card */}
              <Card className="bg-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-500">Response Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div className="text-2xl font-bold">
                      {isLoadingAnalytics ? (
                        <div className="h-8 w-16 bg-slate-200 animate-pulse rounded"></div>
                      ) : (
                        `${metrics.responseRate.toFixed(0)}%`
                      )}
                    </div>
                    <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                      <ArrowUpRight className="h-4 w-4 text-green-600" />
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    Replied / Total reviews
                  </p>
                </CardContent>
              </Card>
              
              {/* Sentiment Breakdown Card */}
              <Card className="bg-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-500">Sentiment Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div className="text-sm flex gap-3">
                      {isLoadingAnalytics ? (
                        <div className="h-8 w-16 bg-slate-200 animate-pulse rounded"></div>
                      ) : (
                        <>
                          <div className="flex items-center">
                            <div className="h-3 w-3 rounded-full bg-green-500 mr-1"></div>
                            <span className="text-green-700">{metrics.sentiment.positive}</span>
                          </div>
                          <div className="flex items-center">
                            <div className="h-3 w-3 rounded-full bg-amber-400 mr-1"></div>
                            <span className="text-amber-700">{metrics.sentiment.neutral}</span>
                          </div>
                          <div className="flex items-center">
                            <div className="h-3 w-3 rounded-full bg-red-500 mr-1"></div>
                            <span className="text-red-700">{metrics.sentiment.negative}</span>
                          </div>
                        </>
                      )}
                    </div>
                    <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                      <ThumbsUp className="h-4 w-4 text-indigo-600" />
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    Positive / Neutral / Negative
                  </p>
                </CardContent>
              </Card>
            </div>
            
            {/* Interactive Filters */}
            <div className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
              {/* Location Filter */}
              {locations.length > 1 && (
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-slate-500" />
                  <Select value={selectedLocationId} onValueChange={setSelectedLocationId}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Locations</SelectItem>
                      {locations.map((location) => (
                        <SelectItem key={location.id} value={location.id.toString()}>
                          {location.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              {/* Date Range Filter */}
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-slate-500" />
                <Select value={periodFilter} onValueChange={handleDateFilterChange}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">Last 7 Days</SelectItem>
                    <SelectItem value="30">Last 30 Days</SelectItem>
                    <SelectItem value="90">Last 90 Days</SelectItem>
                    <SelectItem value="365">Last Year</SelectItem>
                    <SelectItem value="custom">Custom Range</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Custom Date Range Selector */}
              {isCustomDate && (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="h-9 px-4 py-2 text-sm">
                      {dateRange.from ? (
                        dateRange.to ? (
                          <>
                            {format(dateRange.from, "MMM d, yyyy")} -{" "}
                            {format(dateRange.to, "MMM d, yyyy")}
                          </>
                        ) : (
                          format(dateRange.from, "MMM d, yyyy")
                        )
                      ) : (
                        <span>Select date range</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="center">
                    <CalendarComponent
                      initialFocus
                      mode="range"
                      defaultMonth={dateRange.from}
                      selected={dateRange}
                      onSelect={handleDateRangeSelect}
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>
              )}
              
              {/* Sentiment Filter */}
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-slate-500" />
                <Select value={sentimentFilter} onValueChange={setSentimentFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Sentiment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sentiment</SelectItem>
                    <SelectItem value="positive">Positive Only</SelectItem>
                    <SelectItem value="neutral">Neutral Only</SelectItem>
                    <SelectItem value="negative">Negative Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Main Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Review Volume Trend Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Review Volume Trend</CardTitle>
                </CardHeader>
                <CardContent className="h-72">
                  <div className="relative h-full">
                    {isLoadingAnalytics && (
                      <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
                        <div className="flex flex-col items-center">
                          <div className="h-8 w-8 border-4 border-slate-200 border-t-primary rounded-full animate-spin"></div>
                        </div>
                      </div>
                    )}
                    <Line 
                      data={dailyVolumeData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'top',
                          },
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                            title: {
                              display: true,
                              text: 'Number of Reviews'
                            }
                          }
                        }
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
              
              {/* Rating Distribution Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Rating Distribution</CardTitle>
                </CardHeader>
                <CardContent className="h-72">
                  <div className="relative h-full flex items-center justify-center">
                    {isLoadingAnalytics && (
                      <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
                        <div className="flex flex-col items-center">
                          <div className="h-8 w-8 border-4 border-slate-200 border-t-primary rounded-full animate-spin"></div>
                        </div>
                      </div>
                    )}
                    <div className="w-full max-w-xs mx-auto">
                      <Pie data={ratingData} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Original Trend Graph */}
            <div className="relative mb-6">
              {isLoadingAnalytics && (
                <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
                  <div className="flex flex-col items-center">
                    <div className="h-8 w-8 border-4 border-slate-200 border-t-primary rounded-full animate-spin"></div>
                    <span className="mt-2 text-sm text-slate-500">Loading data...</span>
                  </div>
                </div>
              )}
              <TrendGraph data={analyticsData?.datasets} labels={analyticsData?.labels} />
            </div>

            {/* Reviews and AI Analysis Section */}
            <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Reviews List - Left column */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader className="pb-3 flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">Recent Reviews</CardTitle>
                      <CardDescription>Showing {recentReviews.length} of {analyticsData?.total || 0} total reviews</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-slate-400" />
                      <span className="text-sm text-slate-600">Last updated: {new Date().toLocaleTimeString()}</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {isLoadingReviews ? (
                      // Loading state for reviews
                      <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="border rounded-lg p-4 space-y-3">
                            <div className="flex items-center space-x-2">
                              <div className="h-10 w-10 bg-slate-200 rounded-full animate-pulse"></div>
                              <div className="space-y-2 flex-1">
                                <div className="h-4 bg-slate-200 rounded w-1/4 animate-pulse"></div>
                                <div className="h-3 bg-slate-200 rounded w-1/3 animate-pulse"></div>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="h-3 bg-slate-200 rounded w-full animate-pulse"></div>
                              <div className="h-3 bg-slate-200 rounded w-full animate-pulse"></div>
                              <div className="h-3 bg-slate-200 rounded w-3/4 animate-pulse"></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : recentReviews.length === 0 ? (
                      // Empty state for reviews
                      <div className="text-center py-8 space-y-3">
                        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                          <AlertCircle className="h-6 w-6 text-slate-500" />
                        </div>
                        <h3 className="text-lg font-medium">No reviews found</h3>
                        <p className="text-sm text-slate-500 max-w-sm mx-auto">
                          There are no reviews matching your current filters. Try adjusting your filters or check back later.
                        </p>
                      </div>
                    ) : (
                      // Reviews list
                      <div className="space-y-4">
                        {recentReviews.slice((currentPage - 1) * reviewsPerPage, currentPage * reviewsPerPage).map((review) => (
                          <div key={review.id} className="border rounded-lg p-4 hover:border-primary/50 hover:bg-slate-50 transition-colors">
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex items-center gap-2">
                                <div className="text-sm font-semibold">{review.reviewerName || 'Anonymous'}</div>
                                <Badge className="text-xs" variant={
                                  review.rating >= 4 ? "default" : 
                                  review.rating >= 3 ? "secondary" : "destructive"
                                }>
                                  {review.rating} ★
                                </Badge>
                              </div>
                              <div className="text-xs text-slate-500">
                                {new Date(review.date).toLocaleDateString()}
                              </div>
                            </div>
                            <p className="text-sm text-slate-700 mb-3">{review.reviewText}</p>
                            <div className="flex justify-between items-center">
                              <Badge variant="outline" className="text-xs">
                                {review.platform}
                              </Badge>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="text-xs h-7"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleOpenResponseModal(review);
                                }}
                              >
                                {review.response ? "Edit Response" : "Respond"}
                              </Button>
                            </div>
                          </div>
                        ))}
                        
                        {/* Pagination */}
                        {recentReviews.length > reviewsPerPage && (
                          <div className="flex items-center justify-center space-x-2 mt-4">
                            <Button 
                              variant="outline" 
                              size="sm"
                              disabled={currentPage === 1}
                              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            >
                              Previous
                            </Button>
                            
                            <div className="text-sm text-slate-600">
                              Page {currentPage} of {Math.ceil(recentReviews.length / reviewsPerPage)}
                            </div>
                            
                            <Button 
                              variant="outline" 
                              size="sm"
                              disabled={currentPage >= Math.ceil(recentReviews.length / reviewsPerPage)}
                              onClick={() => setCurrentPage(p => p + 1)}
                            >
                              Next
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
              
              {/* Analytics Tabs - Right column */}
              <div className="lg:col-span-1">
                <Tabs defaultValue="sentimentAnalysis" className="w-full">
                  <TabsList className="mb-4 flex flex-wrap">
                    <TabsTrigger value="sentimentAnalysis" className="flex items-center">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Sentiment
                    </TabsTrigger>
                    <TabsTrigger value="platforms" className="flex items-center">
                      <BarChart className="h-4 w-4 mr-2" />
                      Platforms
                    </TabsTrigger>
                    <TabsTrigger value="keywords" className="flex items-center">
                      <BarChart2 className="h-4 w-4 mr-2" />
                      Keywords
                    </TabsTrigger>
                  </TabsList>
                  
                  {/* Sentiment Analysis Tab */}
                  <TabsContent value="sentimentAnalysis">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Sentiment Trends</CardTitle>
                        <CardDescription>Customer sentiment over time</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {isLoadingAnalytics ? (
                          <div className="h-64 flex items-center justify-center">
                            <div className="h-8 w-8 border-4 border-slate-200 border-t-primary rounded-full animate-spin"></div>
                          </div>
                        ) : (
                          <>
                            <div className="h-64">
                              <Line
                                data={{
                                  labels: analyticsData?.labels || [],
                                  datasets: [
                                    {
                                      label: 'Positive',
                                      data: analyticsData?.sentimentTrend?.positive || [],
                                      borderColor: 'rgba(34, 197, 94, 1)',
                                      backgroundColor: 'rgba(34, 197, 94, 0.1)',
                                      fill: true,
                                      tension: 0.4,
                                    },
                                    {
                                      label: 'Neutral',
                                      data: analyticsData?.sentimentTrend?.neutral || [],
                                      borderColor: 'rgba(234, 179, 8, 1)',
                                      backgroundColor: 'rgba(234, 179, 8, 0.1)',
                                      fill: true,
                                      tension: 0.4,
                                    },
                                    {
                                      label: 'Negative',
                                      data: analyticsData?.sentimentTrend?.negative || [],
                                      borderColor: 'rgba(239, 68, 68, 1)',
                                      backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                      fill: true,
                                      tension: 0.4,
                                    }
                                  ],
                                }}
                                options={{
                                  responsive: true,
                                  maintainAspectRatio: false,
                                  scales: {
                                    y: {
                                      beginAtZero: true,
                                      stacked: true,
                                      title: {
                                        display: true,
                                        text: 'Review Count'
                                      }
                                    }
                                  },
                                  plugins: {
                                    legend: {
                                      position: 'top',
                                    }
                                  }
                                }}
                              />
                            </div>
                            
                            <div className="mt-6 space-y-3">
                              <div>
                                <div className="text-sm font-medium mb-1">Common Positive Phrases:</div>
                                <div className="flex flex-wrap gap-2">
                                  {analyticsData?.positiveKeywords && 
                                   Array.isArray(analyticsData.positiveKeywords) ? 
                                   analyticsData.positiveKeywords.slice(0, 5).map((keyword: string, i: number) => (
                                    <Badge key={i} variant="outline" className="bg-green-50 text-green-700 hover:bg-green-100">
                                      {keyword}
                                    </Badge>
                                  )) : (
                                    <span className="text-sm text-slate-500">No data available</span>
                                  )}
                                </div>
                              </div>
                              
                              <div>
                                <div className="text-sm font-medium mb-1">Common Negative Phrases:</div>
                                <div className="flex flex-wrap gap-2">
                                  {analyticsData?.negativeKeywords && 
                                   Array.isArray(analyticsData.negativeKeywords) ? 
                                   analyticsData.negativeKeywords.slice(0, 5).map((keyword: string, i: number) => (
                                    <Badge key={i} variant="outline" className="bg-red-50 text-red-700 hover:bg-red-100">
                                      {keyword}
                                    </Badge>
                                  )) : (
                                    <span className="text-sm text-slate-500">No data available</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  {/* Platforms Tab */}
                  <TabsContent value="platforms">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Reviews by Platform</CardTitle>
                        <CardDescription>Distribution across review platforms</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="h-64 flex items-center justify-center">
                          <div className="w-full max-w-md mx-auto">
                            <Pie data={platformData} />
                          </div>
                        </div>
                        
                        <div className="mt-6">
                          <Table>
                            <TableCaption>Platform distribution</TableCaption>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Platform</TableHead>
                                <TableHead className="text-right">Count</TableHead>
                                <TableHead className="text-right">Avg. Rating</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {analyticsData?.platforms && Object.entries(analyticsData.platforms).map(([platform, data]: [string, any]) => (
                                <TableRow key={platform}>
                                  <TableCell>{platform}</TableCell>
                                  <TableCell className="text-right">{data.count || 0}</TableCell>
                                  <TableCell className="text-right">{(data.avgRating || 0).toFixed(1)}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  {/* Keywords Tab */}
                  <TabsContent value="keywords">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Top Keywords</CardTitle>
                        <CardDescription>Most mentioned terms in reviews</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="h-64">
                          <Bar 
                            data={keywordData}
                            options={{
                              maintainAspectRatio: false,
                              scales: {
                                y: {
                                  beginAtZero: true,
                                  title: {
                                    display: true,
                                    text: 'Mention Count'
                                  }
                                }
                              }
                            }}
                          />
                        </div>
                        
                        <div className="mt-6">
                          <div className="text-sm font-medium mb-2">Keyword Cloud:</div>
                          <div className="flex flex-wrap gap-2">
                            {analyticsData?.keywords && typeof analyticsData.keywords === 'object' && Object.entries(analyticsData.keywords)
                              .sort((a, b) => (b[1] as number) - (a[1] as number))
                              .slice(0, 20)
                              .map(([keyword, count]: [string, unknown]) => (
                                <Badge 
                                  key={keyword} 
                                  variant="outline" 
                                  className="hover:bg-slate-100"
                                  style={{
                                    fontSize: `${Math.max(0.7, Math.min(1.3, 0.8 + (count as number) / 10))}rem`
                                  }}
                                >
                                  {keyword} ({String(count)})
                                </Badge>
                              ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </main>
      </div>
      
      {/* AI Review Response Modal */}
      <Dialog open={isResponseModalOpen} onOpenChange={setIsResponseModalOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquareText className="h-5 w-5" />
              {selectedReview ? (
                <>Respond to {selectedReview.reviewerName}'s Review</>
              ) : (
                <>Respond to Review</>
              )}
            </DialogTitle>
            <DialogDescription>
              Craft a professional response or use AI to generate a suggested reply
            </DialogDescription>
          </DialogHeader>
          
          {selectedReview && (
            <div className="grid gap-6 py-4">
              {/* Original Review Display */}
              <Card className="bg-slate-50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
                    <Star className="h-4 w-4 text-amber-500" />
                    Original Review ({selectedReview.rating}/5)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-700">"{selectedReview.reviewText}"</p>
                  <div className="flex justify-between items-center mt-2 text-xs text-slate-500">
                    <span>{selectedReview.reviewerName} • {selectedReview.platform}</span>
                    <span>{new Date(selectedReview.date).toLocaleDateString()}</span>
                  </div>
                </CardContent>
              </Card>
              
              {/* AI Response Generation */}
              <div className="flex gap-3 items-start">
                <Select value={responseTone} onValueChange={setResponseTone}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Select tone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="friendly">Friendly</SelectItem>
                    <SelectItem value="apologetic">Apologetic</SelectItem>
                    <SelectItem value="formal">Formal</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button 
                  onClick={handleGenerateAIResponse}
                  className="gap-2"
                  disabled={isGeneratingAI}
                  variant="outline"
                >
                  {isGeneratingAI ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-4 w-4" />
                      Generate AI Response
                    </>
                  )}
                </Button>
                
                {responseText && (
                  <Button 
                    onClick={() => {
                      navigator.clipboard.writeText(responseText);
                      toast({
                        title: "Copied to clipboard",
                        description: "Response text copied to clipboard",
                      });
                    }}
                    variant="ghost"
                    size="sm"
                    className="gap-1"
                  >
                    <Copy className="h-3 w-3" />
                    Copy
                  </Button>
                )}
              </div>
              
              {/* Response Text Area */}
              <div className="grid gap-2">
                <label htmlFor="response" className="text-sm font-medium">
                  Your Response
                </label>
                <Textarea
                  id="response"
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  placeholder="Write your response here or use the AI to generate one..."
                  className="min-h-[150px] resize-none"
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsResponseModalOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveResponse}
              disabled={saveResponseMutation.isPending}
              className="gap-2"
            >
              {saveResponseMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  Save Response
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}