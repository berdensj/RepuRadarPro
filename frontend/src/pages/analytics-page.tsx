import React from 'react';
import { useState, useEffect } from "react";
import { Sidebar } from "../components/dashboard/sidebar";
import { TrendGraph } from "../components/dashboard/trend-graph";
import { useIsMobile } from "../hooks/use-mobile";
import { Helmet } from "react-helmet";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { BarChart, LineChart, PieChart, CandlestickChart, BarChart2, TrendingUp, Building2 } from "lucide-react";
import { 
  Chart as ChartJS, 
  ArcElement, 
  Legend, 
  CategoryScale, 
  LinearScale,
  BarElement,
  Title,
} from 'chart.js';
import { Tooltip } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { useQuery } from "@tanstack/react-query";
import { Location } from '../../../shared/schema';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";

ChartJS.register(
  ArcElement, 
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

export default function AnalyticsPage() {
  const isMobile = useIsMobile();
  const [periodFilter, setPeriodFilter] = useState("90");
  const [selectedLocationId, setSelectedLocationId] = useState<string>("all");
  
  // Fetch locations for the current user
  const { data: locations = [], isLoading: isLoadingLocations } = useQuery<Location[]>({
    queryKey: ["/api/locations"],
  });
  
  // Fetch analytics data based on selected location and period
  const { data: analyticsData, isLoading: isLoadingAnalytics } = useQuery({
    queryKey: ["/api/reviews/trends", selectedLocationId, periodFilter],
    queryFn: async () => {
      const locationParam = selectedLocationId !== "all" ? `&locationId=${selectedLocationId}` : "";
      const res = await fetch(`/api/reviews/trends?period=${periodFilter}${locationParam}`);
      if (!res.ok) throw new Error("Failed to fetch analytics data");
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
    // FIXED: Ensure a default empty structure if analyticsData is not fully available
    const defaultChartDataset = [{
      label: 'No data',
      data: [],
      backgroundColor: 'rgba(200, 200, 200, 0.2)',
      borderColor: 'rgba(200, 200, 200, 1)',
      borderWidth: 1,
    }];

    if (isLoadingAnalytics || !analyticsData) {
      return {
        platformData: {
          labels: [],
          // FIXED: Use consistent default structure
          datasets: defaultChartDataset.map(ds => ({ ...ds, label: 'Loading platforms...' }))
        },
        ratingData: {
          labels: [],
          // FIXED: Use consistent default structure
          datasets: defaultChartDataset.map(ds => ({ ...ds, label: 'Loading ratings...' }))
        },
        keywordData: {
          labels: [],
          // FIXED: Use consistent default structure
          datasets: defaultChartDataset.map(ds => ({ ...ds, label: 'Loading keywords...' }))
        }
      };
    }
    
    // Platforms data
    // FIXED: Robustly handle potentially missing or malformed analyticsData.platforms
    const platforms = analyticsData.platforms && typeof analyticsData.platforms === 'object' ? analyticsData.platforms : {};
    const platformLabels = Object.keys(platforms);
    const platformValues = Object.values(platforms).filter(v => typeof v === 'number') as number[];
    
    const platformData = {
      labels: platformLabels.length > 0 ? platformLabels : ['No data'],
      datasets: platformValues.length > 0 ? [
        {
          label: 'Reviews by Platform',
          data: platformValues,
          backgroundColor: [
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 99, 132, 0.6)',
            'rgba(255, 206, 86, 0.6)', // Added one more for potential variety
            'rgba(75, 192, 192, 0.6)',
            'rgba(153, 102, 255, 0.6)', // Added one more
          ],
          borderColor: [
            'rgba(54, 162, 235, 1)',
            'rgba(255, 99, 132, 1)',
            'rgba(255, 206, 86, 1)', // Added one more
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)', // Added one more
          ],
          borderWidth: 1,
        },
      ] : defaultChartDataset.map(ds => ({ ...ds, label: 'No platform data' })),
    };

    // Ratings data
    // FIXED: Robustly handle potentially missing or malformed analyticsData.ratings
    const ratings = analyticsData.ratings && typeof analyticsData.ratings === 'object' ? analyticsData.ratings : {};
    const ratingLabels = Object.keys(ratings).map(r => `${r} Stars`);
    const ratingValues = Object.values(ratings).filter(v => typeof v === 'number') as number[];
    
    const ratingData = {
      labels: ratingLabels.length > 0 ? ratingLabels : ['No data'],
      datasets: ratingValues.length > 0 ? [
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
      ] : defaultChartDataset.map(ds => ({ ...ds, label: 'No rating data' })),
    };

    // Keywords data
    // FIXED: Robustly handle potentially missing or malformed analyticsData.keywords
    const keywords = analyticsData.keywords && typeof analyticsData.keywords === 'object' ? analyticsData.keywords : {};
    const keywordLabels = Object.keys(keywords);
    const keywordValues = Object.values(keywords).filter(v => typeof v === 'number') as number[];
    
    const keywordData = {
      labels: keywordLabels.length > 0 ? keywordLabels : ['No data'],
      datasets: keywordValues.length > 0 ? [
        {
          label: 'Mentioned in Reviews',
          data: keywordValues,
          backgroundColor: 'rgba(54, 162, 235, 0.6)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
        },
      ] : defaultChartDataset.map(ds => ({ ...ds, label: 'No keyword data' })),
    };
    
    return { platformData, ratingData, keywordData };
  };
  
  // Get chart data
  const { platformData, ratingData, keywordData } = prepareChartData();

  // FIXED: Ensure TrendGraph always receives valid, possibly empty, arrays for data and labels
  const trendGraphDataProp = analyticsData?.datasets && Array.isArray(analyticsData.datasets) ? analyticsData.datasets : [];
  const trendGraphLabelsProp = analyticsData?.labels && Array.isArray(analyticsData.labels) ? analyticsData.labels : [];

  return (
    <>
      <Helmet>
        <title>Analytics | Reputation Sentinel</title>
        <meta name="description" content="Analyze your online reputation with Reputation Sentinel's powerful analytics tools. Track trends, sentiment, and key metrics across all review platforms." />
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
              {/* FIXED: Pass robustly prepared props to TrendGraph */}
              <TrendGraph data={trendGraphDataProp} labels={trendGraphLabelsProp} />
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