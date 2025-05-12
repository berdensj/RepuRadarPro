import { useState, useEffect } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { TrendGraph } from "@/components/dashboard/trend-graph";
import { useIsMobile } from "@/hooks/use-mobile";
import { Helmet } from "react-helmet";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { 
  BarChart, LineChart, PieChart, CandlestickChart, BarChart2, TrendingUp, Building2,
  Star, MessageSquare, ThumbsUp, ArrowUpRight, Download, Mail, Calendar, 
  Filter, Clock, AlertCircle
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
import { useQuery } from "@tanstack/react-query";
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
  const isMobile = useIsMobile();
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
  const [isCustomDate, setIsCustomDate] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const reviewsPerPage = 5;
  
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
              
              <div className="mt-4 md:mt-0 flex flex-wrap items-center gap-4">
                {locations.length > 1 && (
                  <div className="flex items-center space-x-2">
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
                
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-slate-600">Period:</span>
                  <Select value={periodFilter} onValueChange={setPeriodFilter}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">Last 30 Days</SelectItem>
                      <SelectItem value="90">Last 90 Days</SelectItem>
                      <SelectItem value="365">Last Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </header>

            {/* Trend Graph */}
            <div className="relative">
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

            {/* Analytics Tabs */}
            <div className="mt-6">
              <Tabs defaultValue="distribution" className="w-full">
                <TabsList className="mb-4 flex flex-wrap">
                  <TabsTrigger value="distribution" className="flex items-center">
                    <PieChart className="h-4 w-4 mr-2" />
                    Distribution
                  </TabsTrigger>
                  <TabsTrigger value="platforms" className="flex items-center">
                    <BarChart className="h-4 w-4 mr-2" />
                    Platforms
                  </TabsTrigger>
                  <TabsTrigger value="keywords" className="flex items-center">
                    <BarChart2 className="h-4 w-4 mr-2" />
                    Keywords
                  </TabsTrigger>
                  <TabsTrigger value="trends" className="flex items-center">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Trends
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="distribution">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Reviews by Rating</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80 flex items-center justify-center">
                        <div className="w-full max-w-md mx-auto">
                          <Pie data={ratingData} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="platforms">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Reviews by Platform</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80 flex items-center justify-center">
                        <div className="w-full max-w-md mx-auto">
                          <Pie data={platformData} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="keywords">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Top Keywords in Reviews</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80">
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
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="trends">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Sentiment Trends</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80 flex flex-col items-center justify-center text-slate-500">
                        <CandlestickChart className="h-16 w-16 mb-4 text-slate-300" />
                        <p>Sentiment trend analysis will be available soon</p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}