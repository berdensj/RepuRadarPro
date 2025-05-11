import { useState, useEffect } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { TrendGraph } from "@/components/dashboard/trend-graph";
import { useIsMobile } from "@/hooks/use-mobile";
import { Helmet } from "react-helmet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import { Location } from "@shared/schema";

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
  
  // Use appropriate title based on selected location
  const getLocationName = () => {
    if (selectedLocationId === "all") return "All Locations";
    const location = locations.find(loc => loc.id.toString() === selectedLocationId);
    return location ? location.name : "Selected Location";
  };

  // Sample data for charts
  const platformData = {
    labels: ['Google', 'Yelp', 'Facebook', 'Healthgrades'],
    datasets: [
      {
        label: 'Reviews by Platform',
        data: [65, 32, 18, 12],
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

  const ratingData = {
    labels: ['5 Stars', '4 Stars', '3 Stars', '2 Stars', '1 Star'],
    datasets: [
      {
        label: 'Reviews by Rating',
        data: [48, 35, 22, 14, 8],
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

  const keywordData = {
    labels: ['Staff', 'Service', 'Price', 'Quality', 'Wait Time', 'Results'],
    datasets: [
      {
        label: 'Mentioned in Reviews',
        data: [85, 64, 54, 42, 38, 28],
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };

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
            <TrendGraph />

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