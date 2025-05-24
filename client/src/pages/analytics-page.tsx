import React from 'react';
import { useState, useEffect } from "react";
// import { Sidebar } from "../components/dashboard/sidebar"; // FIXED: Removed old sidebar import
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
      // TODO: Replace with apiRequest from queryClient if applicable
      const locationParam = selectedLocationId !== "all" ? `&locationId=${selectedLocationId}` : "";
      const res = await fetch(`/api/reviews/trends?period=${periodFilter}${locationParam}`);
      if (!res.ok) throw new Error("Failed to fetch analytics data");
      return res.json();
    }
  });
  
  const getLocationName = () => {
    if (selectedLocationId === "all") return "All Locations";
    const location = locations.find(loc => loc.id.toString() === selectedLocationId);
    return location ? location.name : "Selected Location";
  };

  const prepareChartData = () => {
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
          datasets: defaultChartDataset.map(ds => ({ ...ds, label: 'Loading platforms...' }))
        },
        ratingData: {
          labels: [],
          datasets: defaultChartDataset.map(ds => ({ ...ds, label: 'Loading ratings...' }))
        },
        keywordData: {
          labels: [],
          datasets: defaultChartDataset.map(ds => ({ ...ds, label: 'Loading keywords...' }))
        }
      };
    }
    
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
            'rgba(255, 206, 86, 0.6)', 
            'rgba(75, 192, 192, 0.6)',
            'rgba(153, 102, 255, 0.6)',
          ],
          borderColor: [
            'rgba(54, 162, 235, 1)',
            'rgba(255, 99, 132, 1)',
            'rgba(255, 206, 86, 1)', 
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
          ],
          borderWidth: 1,
        },
      ] : defaultChartDataset.map(ds => ({ ...ds, label: 'No platform data' })),
    };

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
  
  const { platformData, ratingData, keywordData } = prepareChartData();

  const trendGraphDataProp = analyticsData?.datasets && Array.isArray(analyticsData.datasets) ? analyticsData.datasets : [];
  const trendGraphLabelsProp = analyticsData?.labels && Array.isArray(analyticsData.labels) ? analyticsData.labels : [];

  return (
    <>
      <Helmet>
        <title>Analytics | Reputation Sentinel</title>
        <meta name="description" content="Analyze your online reputation with Reputation Sentinel's powerful analytics tools. Track trends, sentiment, and key metrics across all review platforms." />
      </Helmet>
      
      {/* FIXED: Removed outer layout divs, page content starts here */}
      {/* Header section for page title and filters */}
      <header className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800 dark:text-slate-100">Analytics</h1>
          <p className="text-slate-500 dark:text-slate-400">Key metrics for {getLocationName()}</p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center space-x-2">
          {!isLoadingLocations && (
            <Select value={selectedLocationId} onValueChange={setSelectedLocationId}>
              <SelectTrigger className="w-auto min-w-[180px]" aria-label="Select Location">
                <SelectValue placeholder="Select Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {locations.map((loc) => (
                  <SelectItem key={loc.id} value={loc.id.toString()}>
                    {loc.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Select value={periodFilter} onValueChange={setPeriodFilter}>
            <SelectTrigger className="w-auto min-w-[120px]" aria-label="Select Period">
              <SelectValue placeholder="Select Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30">Last 30 Days</SelectItem>
              <SelectItem value="90">Last 90 Days</SelectItem>
              <SelectItem value="180">Last 180 Days</SelectItem>
              <SelectItem value="365">Last Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </header>

      {isLoadingAnalytics ? (
        <div className="flex justify-center items-center h-64">
          <BarChart2 className="h-12 w-12 animate-pulse text-primary" /> 
        </div>
      ) : (
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="platforms">By Platform</TabsTrigger>
            <TabsTrigger value="ratings">By Rating</TabsTrigger>
            <TabsTrigger value="keywords">Keywords</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Review Volume Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <TrendGraph data={trendGraphDataProp} labels={trendGraphLabelsProp} />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Overall Sentiment</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-center h-[300px]">
                  {/* TODO: Implement sentiment display (e.g., a gauge or score) */}
                  <p className="text-slate-500 dark:text-slate-400">Sentiment data unavailable</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="platforms">
            <Card>
              <CardHeader>
                <CardTitle>Reviews by Platform</CardTitle>
              </CardHeader>
              <CardContent className="h-[350px] flex items-center justify-center">
                <Pie data={platformData} options={{ responsive: true, maintainAspectRatio: false }} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ratings">
            <Card>
              <CardHeader>
                <CardTitle>Reviews by Rating</CardTitle>
              </CardHeader>
              <CardContent className="h-[350px] flex items-center justify-center">
                <Bar data={ratingData} options={{ responsive: true, maintainAspectRatio: false }} />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="keywords">
            <Card>
              <CardHeader>
                <CardTitle>Top Mentioned Keywords</CardTitle>
              </CardHeader>
              <CardContent className="h-[350px] flex items-center justify-center">
                <Bar data={keywordData} options={{ responsive: true, maintainAspectRatio: false, indexAxis: 'y' }} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </>
  );
}