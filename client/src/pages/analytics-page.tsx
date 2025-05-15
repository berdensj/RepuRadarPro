import { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { TrendGraph } from "@/components/dashboard/trend-graph";
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

// Register the ChartJS components we need
ChartJS.register(
  ArcElement, 
  Tooltip, 
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
);

export default function AnalyticsPage() {
  // States for filters
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
  
  // State for selected review and response modal
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [isResponseModalOpen, setIsResponseModalOpen] = useState(false);
  const [responseText, setResponseText] = useState("");
  const [isGeneratingResponse, setIsGeneratingResponse] = useState(false);
  const [selectedTone, setSelectedTone] = useState("professional");
  const { toast } = useToast();
  
  // Define interfaces for data types
  interface Location {
    id: number;
    name: string;
    address: string;
    userId: number;
  }
  
  interface Review {
    id: number;
    userId: number;
    locationId: number;
    customerName: string;
    reviewText: string;
    rating: number;
    platform: string;
    reviewDate: string;
    date: string; // Alias for reviewDate used in some components
    responseStatus: string;
    responseText?: string;
    responseDate?: string;
    sentimentScore?: number;
    aiReplied?: boolean;
  }
  
  // Fetch locations for filter dropdown
  const { data: locations = [] } = useQuery<Location[]>({
    queryKey: ['/api/locations'],
    retry: 1,
  });
  
  // Fetch reviews based on filters
  const { data: reviews = [], isLoading: isLoadingReviews } = useQuery<Review[]>({
    queryKey: ['/api/reviews', selectedLocationId, periodFilter, sentimentFilter],
    retry: 1,
  });
  
  // Function to get chart data based on sentiment values
  const getChartData = () => {
    if (!reviews) return {
      labels: ['Positive', 'Neutral', 'Negative'],
      datasets: [{
        data: [0, 0, 0],
        backgroundColor: ['#10b981', '#6366f1', '#ef4444'],
      }]
    };
    
    const positive = reviews.filter(r => typeof r.sentimentScore === 'number' && r.sentimentScore >= 0.67).length;
    const neutral = reviews.filter(r => typeof r.sentimentScore === 'number' && r.sentimentScore >= 0.33 && r.sentimentScore < 0.67).length;
    const negative = reviews.filter(r => typeof r.sentimentScore === 'number' && r.sentimentScore < 0.33).length;
    
    return {
      labels: ['Positive', 'Neutral', 'Negative'],
      datasets: [{
        data: [positive, neutral, negative],
        backgroundColor: ['#10b981', '#6366f1', '#ef4444'],
      }]
    };
  };
  
  // Function to get rating distribution chart data
  const getRatingDistribution = () => {
    if (!reviews) return {
      labels: ['1★', '2★', '3★', '4★', '5★'],
      datasets: [{
        label: 'Reviews',
        data: [0, 0, 0, 0, 0],
        backgroundColor: '#3b82f6',
      }]
    };
    
    const ratings = {
      '1': reviews.filter(r => r.rating === 1).length,
      '2': reviews.filter(r => r.rating === 2).length,
      '3': reviews.filter(r => r.rating === 3).length,
      '4': reviews.filter(r => r.rating === 4).length,
      '5': reviews.filter(r => r.rating === 5).length,
    };
    
    return {
      labels: ['1★', '2★', '3★', '4★', '5★'],
      datasets: [{
        label: 'Reviews',
        data: [ratings['1'], ratings['2'], ratings['3'], ratings['4'], ratings['5']],
        backgroundColor: '#3b82f6',
      }]
    };
  };
  
  // Function to calculate average rating
  const getAverageRating = () => {
    if (!reviews || reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };
  
  // Function to get trend data for chart
  const getTrendData = () => {
    return {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [
        {
          label: 'Average Rating',
          data: [4.2, 4.3, 4.1, 4.4, 4.5, 4.6],
          borderColor: '#3b82f6',
          tension: 0.3,
          fill: false,
        },
      ],
    };
  };
  
  // Function to handle review response
  const handleOpenResponseModal = (review: Review) => {
    setSelectedReview(review);
    setResponseText(""); // Clear previous response
    setIsResponseModalOpen(true);
  };
  
  // Function to generate AI response
  const handleGenerateResponse = async () => {
    if (!selectedReview) return;
    
    setIsGeneratingResponse(true);
    
    try {
      const generatedText = await generateReply(selectedReview.id, selectedTone);
      setResponseText(generatedText);
      toast({
        title: "Response Generated",
        description: "AI has crafted a response based on the review content",
      });
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "There was an error generating the response",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingResponse(false);
    }
  };
  
  // Function to save the response
  const handleSaveResponse = async () => {
    if (!selectedReview || !responseText) return;
    
    try {
      await apiRequest('POST', '/api/reviews/response', {
        reviewId: selectedReview.id,
        responseText,
      });
      
      toast({
        title: "Response Saved",
        description: "Your response has been saved and will be posted",
      });
      
      // Close modal and refresh data
      setIsResponseModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/reviews'] });
    } catch (error) {
      toast({
        title: "Failed to Save",
        description: "There was an error saving your response",
        variant: "destructive",
      });
    }
  };
  
  return (
    <>
      <Helmet>
        <title>Analytics | RepuRadar</title>
        <meta name="description" content="Detailed analytics of your online reviews and reputation metrics" />
      </Helmet>
      
      <div className="p-4 lg:p-6">
        {/* Header */}
        <header className="mb-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4">
            <div>
              <p className="text-slate-500">Monitor your reputation performance over time</p>
            </div>
            
            <div className="flex flex-wrap gap-2 mt-3 sm:mt-0">
              <Button variant="outline" size="sm" className="gap-1">
                <Download className="h-4 w-4" />
                <span className="hidden md:inline">Export</span>
              </Button>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1">
                    <Calendar className="h-4 w-4" />
                    <span className="hidden md:inline">Date Range</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <CalendarComponent
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange.from}
                    selected={dateRange}
                    onSelect={(value: DateRange | undefined) => {
                      if (value) {
                        setDateRange({
                          from: value.from,
                          to: value.to || value.from
                        });
                      }
                    }}
                    numberOfMonths={2}
                  />
                  <div className="p-3 border-t border-slate-200 flex justify-between">
                    <Button 
                      variant="ghost"
                      size="sm"
                      onClick={() => setDateRange({ from: undefined, to: undefined })}
                    >
                      Clear
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={() => console.log("Applying date filter:", dateRange)}
                    >
                      Apply
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
              
              <div>
                <Select 
                  value={periodFilter} 
                  onValueChange={setPeriodFilter}
                >
                  <SelectTrigger className="w-[120px] h-9">
                    <Clock className="h-4 w-4 mr-1" />
                    <SelectValue placeholder="Period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">Last 7 days</SelectItem>
                    <SelectItem value="30">Last 30 days</SelectItem>
                    <SelectItem value="90">Last 90 days</SelectItem>
                    <SelectItem value="365">Last year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Select 
                  value={selectedLocationId} 
                  onValueChange={setSelectedLocationId}
                >
                  <SelectTrigger className="w-[140px] h-9">
                    <Building2 className="h-4 w-4 mr-1" />
                    <SelectValue placeholder="Location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    {locations?.map((location: Location) => (
                      <SelectItem key={location.id} value={location.id.toString()}>
                        {location.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </header>
        
        {/* Main Analytics Dashboard */}
        <main>
          <div className="max-w-7xl mx-auto">
            <div>
              {/* Summary Stats Cards */}
              <div className="flex gap-2">
                <h2 className="text-lg font-medium mb-3">Overall Performance</h2>
                <Select 
                  value={sentimentFilter} 
                  onValueChange={setSentimentFilter}
                >
                  <SelectTrigger className="ml-auto w-[160px] h-8">
                    <Filter className="h-3.5 w-3.5 mr-1" />
                    <SelectValue placeholder="Filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All reviews</SelectItem>
                    <SelectItem value="positive">Positive only</SelectItem>
                    <SelectItem value="negative">Negative only</SelectItem>
                    <SelectItem value="unanswered">Unanswered</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {/* Average Rating Card */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-center">
                      <div className="text-2xl font-bold">
                        {isLoadingReviews ? (
                          <div className="h-8 w-16 bg-slate-200 animate-pulse rounded"></div>
                        ) : (
                          getAverageRating()
                        )}
                        <span className="ml-1 text-lg">/ 5</span>
                      </div>
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <Star className="h-5 w-5 text-blue-600" />
                      </div>
                    </div>
                    <p className="text-sm text-slate-500 mt-1">Average Rating</p>
                    <div className="mt-3 flex items-center text-xs">
                      <span className="flex items-center text-emerald-600">
                        <ArrowUpRight className="h-3 w-3 mr-1" />
                        +0.3
                      </span>
                      <span className="text-slate-400 ml-1.5">vs. previous period</span>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Total Reviews Card */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-center">
                      <div className="text-2xl font-bold flex items-center">
                        {isLoadingReviews ? (
                          <div className="h-8 w-16 bg-slate-200 animate-pulse rounded"></div>
                        ) : (
                          reviews?.length || 0
                        )}
                      </div>
                      <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center">
                        <MessageSquare className="h-5 w-5 text-amber-600" />
                      </div>
                    </div>
                    <p className="text-sm text-slate-500 mt-1">Total Reviews</p>
                    <div className="mt-3 flex items-center text-xs">
                      <span className="flex items-center text-emerald-600">
                        <ArrowUpRight className="h-3 w-3 mr-1" />
                        +12%
                      </span>
                      <span className="text-slate-400 ml-1.5">vs. previous period</span>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Response Rate Card */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-center">
                      <div className="text-2xl font-bold">
                        {isLoadingReviews ? (
                          <div className="h-8 w-16 bg-slate-200 animate-pulse rounded"></div>
                        ) : (
                          '93%'
                        )}
                      </div>
                      <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                        <ThumbsUp className="h-5 w-5 text-green-600" />
                      </div>
                    </div>
                    <p className="text-sm text-slate-500 mt-1">Response Rate</p>
                    <div className="mt-3 flex items-center text-xs">
                      <span className="flex items-center text-emerald-600">
                        <ArrowUpRight className="h-3 w-3 mr-1" />
                        +5%
                      </span>
                      <span className="text-slate-400 ml-1.5">vs. previous period</span>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Pending Actions Card */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-center">
                      <div className="text-sm flex gap-3">
                        {isLoadingReviews ? (
                          <div className="h-8 w-16 bg-slate-200 animate-pulse rounded"></div>
                        ) : (
                          <div className="flex items-center">
                            <span className="text-2xl font-bold">3</span>
                            <Badge className="ml-2 bg-red-100 text-red-700 hover:bg-red-100">
                              Action Needed
                            </Badge>
                          </div>
                        )}
                      </div>
                      <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                        <AlertCircle className="h-5 w-5 text-red-600" />
                      </div>
                    </div>
                    <p className="text-sm text-slate-500 mt-1">Pending Reviews</p>
                    <div className="mt-3">
                      <Button variant="ghost" size="sm" className="text-xs px-2.5 h-7">
                        View all
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Sentiment Distribution */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Sentiment Distribution</CardTitle>
                    <CardDescription>Breakdown of review sentiment</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center">
                      {isLoadingReviews ? (
                        <Loader2 className="h-8 w-8 animate-spin text-slate-300" />
                      ) : (
                        <Pie 
                          data={getChartData()} 
                          options={{
                            plugins: {
                              legend: {
                                position: 'bottom',
                                labels: {
                                  boxWidth: 15,
                                  padding: 15,
                                  font: {
                                    size: 12
                                  }
                                }
                              }
                            }
                          }}
                        />
                      )}
                    </div>
                  </CardContent>
                </Card>
                
                {/* Rating Distribution */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Rating Distribution</CardTitle>
                    <CardDescription>Breakdown by star rating</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center">
                      {isLoadingReviews ? (
                        <Loader2 className="h-8 w-8 animate-spin text-slate-300" />
                      ) : (
                        <Bar 
                          data={getRatingDistribution()} 
                          options={{
                            maintainAspectRatio: false,
                            scales: {
                              y: {
                                beginAtZero: true,
                                ticks: {
                                  precision: 0
                                }
                              }
                            },
                            plugins: {
                              legend: {
                                display: false
                              }
                            }
                          }}
                        />
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Detailed Analysis Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* Trend Analysis */}
                <Card className="lg:col-span-2">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Rating Trend</CardTitle>
                    <CardDescription>Average rating over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-72">
                      {isLoadingReviews ? (
                        <div className="h-full flex items-center justify-center">
                          <Loader2 className="h-8 w-8 animate-spin text-slate-300" />
                        </div>
                      ) : (
                        <Line 
                          data={getTrendData()} 
                          options={{
                            maintainAspectRatio: false,
                            scales: {
                              y: {
                                min: 3,
                                max: 5,
                                ticks: {
                                  stepSize: 0.5
                                }
                              }
                            },
                            plugins: {
                              legend: {
                                display: false
                              }
                            }
                          }}
                        />
                      )}
                    </div>
                  </CardContent>
                </Card>
                
                {/* Sentiment Analysis */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Sentiment Analysis</CardTitle>
                    <CardDescription>Key insights from reviews</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-72 pr-4">
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-sm font-medium text-slate-700 mb-2">Top Positive Keywords</h4>
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="secondary" className="bg-green-50 text-green-700 hover:bg-green-100">
                              Friendly
                            </Badge>
                            <Badge variant="secondary" className="bg-green-50 text-green-700 hover:bg-green-100">
                              Professional
                            </Badge>
                            <Badge variant="secondary" className="bg-green-50 text-green-700 hover:bg-green-100">
                              Knowledgeable
                            </Badge>
                            <Badge variant="secondary" className="bg-green-50 text-green-700 hover:bg-green-100">
                              Clean
                            </Badge>
                            <Badge variant="secondary" className="bg-green-50 text-green-700 hover:bg-green-100">
                              Thorough
                            </Badge>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium text-slate-700 mb-2">Top Negative Keywords</h4>
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="secondary" className="bg-red-50 text-red-700 hover:bg-red-100">
                              Wait time
                            </Badge>
                            <Badge variant="secondary" className="bg-red-50 text-red-700 hover:bg-red-100">
                              Expensive
                            </Badge>
                            <Badge variant="secondary" className="bg-red-50 text-red-700 hover:bg-red-100">
                              Parking
                            </Badge>
                            <Badge variant="secondary" className="bg-red-50 text-red-700 hover:bg-red-100">
                              Rushed
                            </Badge>
                          </div>
                        </div>
                        
                        <div>
                          <div className="text-sm font-medium mb-1">Common Positive Phrases:</div>
                          <ul className="text-xs text-slate-600 space-y-1">
                            <li className="flex items-start">
                              <div className="h-1.5 w-1.5 rounded-full bg-green-500 mt-1 mr-2"></div>
                              "Very professional and knowledgeable staff"
                            </li>
                            <li className="flex items-start">
                              <div className="h-1.5 w-1.5 rounded-full bg-green-500 mt-1 mr-2"></div>
                              "Extremely friendly and welcoming environment"
                            </li>
                            <li className="flex items-start">
                              <div className="h-1.5 w-1.5 rounded-full bg-green-500 mt-1 mr-2"></div>
                              "Excellent service, would highly recommend"
                            </li>
                          </ul>
                        </div>
                        
                        <div>
                          <div className="text-sm font-medium mb-1">Common Negative Phrases:</div>
                          <ul className="text-xs text-slate-600 space-y-1">
                            <li className="flex items-start">
                              <div className="h-1.5 w-1.5 rounded-full bg-red-500 mt-1 mr-2"></div>
                              "Had to wait too long for my appointment"
                            </li>
                            <li className="flex items-start">
                              <div className="h-1.5 w-1.5 rounded-full bg-red-500 mt-1 mr-2"></div>
                              "Parking situation is very inconvenient"
                            </li>
                            <li className="flex items-start">
                              <div className="h-1.5 w-1.5 rounded-full bg-red-500 mt-1 mr-2"></div>
                              "Felt rushed during my visit"
                            </li>
                          </ul>
                        </div>
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
              
              {/* Review Table */}
              <div className="mb-6">
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <CardTitle className="text-lg">Recent Reviews</CardTitle>
                        <CardDescription>Latest customer feedback across all platforms</CardDescription>
                      </div>
                      
                      <div className="mt-3 sm:mt-0">
                        <Select defaultValue="latest">
                          <SelectTrigger className="w-[160px]">
                            <SelectValue placeholder="Sort by" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="latest">Latest first</SelectItem>
                            <SelectItem value="oldest">Oldest first</SelectItem>
                            <SelectItem value="highest">Highest rating</SelectItem>
                            <SelectItem value="lowest">Lowest rating</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {isLoadingReviews ? (
                      <div className="h-64 flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-slate-300" />
                      </div>
                    ) : reviews && reviews.length > 0 ? (
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-48">Date</TableHead>
                              <TableHead>Review</TableHead>
                              <TableHead className="w-24 text-center">Rating</TableHead>
                              <TableHead className="w-32">Platform</TableHead>
                              <TableHead className="w-24 text-center">Sentiment</TableHead>
                              <TableHead className="w-32 text-right">Action</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {reviews.slice(0, 6).map((review: Review) => (
                              <TableRow key={review.id}>
                                <TableCell className="font-medium">
                                  {format(new Date(review.reviewDate), 'MMM d, yyyy')}
                                </TableCell>
                                <TableCell>
                                  <div className="line-clamp-2 text-sm">
                                    {review.reviewText}
                                  </div>
                                </TableCell>
                                <TableCell className="text-center">
                                  <div className="flex items-center justify-center">
                                    <span className="font-medium">{review.rating}</span>
                                    <Star className="h-4 w-4 text-amber-500 ml-1" fill="currentColor" />
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline" className="whitespace-nowrap">
                                    {review.platform}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <div className="flex justify-center">
                                    {review.sentimentScore && review.sentimentScore >= 0.67 ? (
                                      <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                                        Positive
                                      </Badge>
                                    ) : review.sentimentScore && review.sentimentScore >= 0.33 ? (
                                      <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                                        Neutral
                                      </Badge>
                                    ) : (
                                      <Badge className="bg-red-100 text-red-800 hover:bg-red-200">
                                        Negative
                                      </Badge>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell className="text-right">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleOpenResponseModal(review)}
                                  >
                                    <MessageSquareText className="h-4 w-4 mr-1" />
                                    Reply
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <div className="text-center p-8 text-slate-500">
                        No reviews match your current filter criteria
                      </div>
                    )}
                    
                    {reviews && reviews.length > 6 && (
                      <div className="flex justify-center mt-4">
                        <Button variant="outline">
                          View All Reviews
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
              
              {/* Keyword Cloud */}
              <div className="mb-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Keyword Insights</CardTitle>
                    <CardDescription>Most mentioned topics in your reviews</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <div className="text-sm font-medium mb-2">Keyword Cloud:</div>
                        <div className="min-h-48 p-4 bg-slate-50 rounded-lg flex flex-wrap items-center justify-center gap-3">
                          <Badge className="text-lg font-normal bg-blue-100 text-blue-800 hover:bg-blue-200">service</Badge>
                          <Badge className="text-sm font-normal bg-green-100 text-green-800 hover:bg-green-200">professional</Badge>
                          <Badge className="text-xl font-normal bg-purple-100 text-purple-800 hover:bg-purple-200">staff</Badge>
                          <Badge className="text-base font-normal bg-amber-100 text-amber-800 hover:bg-amber-200">appointment</Badge>
                          <Badge className="text-xs font-normal bg-red-100 text-red-800 hover:bg-red-200">parking</Badge>
                          <Badge className="text-base font-normal bg-emerald-100 text-emerald-800 hover:bg-emerald-200">clean</Badge>
                          <Badge className="text-sm font-normal bg-indigo-100 text-indigo-800 hover:bg-indigo-200">helpful</Badge>
                          <Badge className="text-sm font-normal bg-blue-100 text-blue-800 hover:bg-blue-200">quality</Badge>
                          <Badge className="text-lg font-normal bg-green-100 text-green-800 hover:bg-green-200">friendly</Badge>
                          <Badge className="text-xs font-normal bg-orange-100 text-orange-800 hover:bg-orange-200">expensive</Badge>
                          <Badge className="text-sm font-normal bg-pink-100 text-pink-800 hover:bg-pink-200">recommend</Badge>
                          <Badge className="text-sm font-normal bg-violet-100 text-violet-800 hover:bg-violet-200">expertise</Badge>
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-sm font-medium mb-2">Topic Breakdown:</div>
                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm">Service Quality</span>
                              <span className="text-sm font-medium">78%</span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-2">
                              <div className="bg-blue-600 h-2 rounded-full" style={{ width: '78%' }}></div>
                            </div>
                          </div>
                          
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm">Staff Friendliness</span>
                              <span className="text-sm font-medium">92%</span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-2">
                              <div className="bg-green-600 h-2 rounded-full" style={{ width: '92%' }}></div>
                            </div>
                          </div>
                          
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm">Value for Money</span>
                              <span className="text-sm font-medium">64%</span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-2">
                              <div className="bg-amber-600 h-2 rounded-full" style={{ width: '64%' }}></div>
                            </div>
                          </div>
                          
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm">Facility Cleanliness</span>
                              <span className="text-sm font-medium">85%</span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-2">
                              <div className="bg-purple-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                            </div>
                          </div>
                          
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm">Parking/Location</span>
                              <span className="text-sm font-medium">45%</span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-2">
                              <div className="bg-red-600 h-2 rounded-full" style={{ width: '45%' }}></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
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
              Respond to Review
            </DialogTitle>
            <DialogDescription>
              Reply to this customer review with an AI-generated response or craft your own
            </DialogDescription>
          </DialogHeader>
          
          {selectedReview && (
            <>
              <div className="bg-slate-50 p-4 rounded-lg my-2">
                <div className="flex justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {selectedReview.platform}
                    </Badge>
                    <span className="text-sm text-slate-500">
                      {format(new Date(selectedReview.reviewDate), 'MMM d, yyyy')}
                    </span>
                  </div>
                  <div className="flex items-center">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star 
                        key={i} 
                        className={`h-4 w-4 ${i < selectedReview.rating ? 'text-amber-500 fill-amber-500' : 'text-slate-300'}`} 
                      />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-slate-800">{selectedReview.reviewText}</p>
              </div>
              
              <div className="flex items-center gap-2 mb-2">
                <Select 
                  value={selectedTone}
                  onValueChange={setSelectedTone}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Response tone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="friendly">Friendly</SelectItem>
                    <SelectItem value="apologetic">Apologetic</SelectItem>
                    <SelectItem value="thankful">Thankful</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleGenerateResponse}
                  disabled={isGeneratingResponse}
                  className="ml-auto"
                >
                  {isGeneratingResponse ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-4 w-4 mr-2" />
                      Generate Response
                    </>
                  )}
                </Button>
              </div>
              
              <Textarea 
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                placeholder="Type your response here or use the Generate Response button..."
                className="min-h-[160px]"
              />
            </>
          )}
          
          <DialogFooter className="flex justify-between items-center">
            <Button variant="ghost" onClick={() => setIsResponseModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveResponse} disabled={!responseText}>
              {isGeneratingResponse ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
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