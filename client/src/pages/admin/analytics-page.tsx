import { AdminLayout } from "@/components/admin/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import LineChart from "@/components/admin/charts/LineChart";
import BarChart from "@/components/admin/charts/BarChart";
import { 
  Activity, 
  TrendingUp, 
  BarChart3, 
  PieChart, 
  Filter, 
  Download 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";

export default function AdminAnalyticsPage() {
  const [timeRange, setTimeRange] = useState("30days");
  const [platformFilter, setPlatformFilter] = useState("all");
  const [customerFilter, setCustomerFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  
  // Sample data structure for analytics
  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ["/api/admin/analytics", timeRange, platformFilter],
    queryFn: async () => {
      const response = await fetch(`/api/admin/analytics?timeRange=${timeRange}&platform=${platformFilter}`);
      if (!response.ok) {
        throw new Error("Failed to fetch analytics data");
      }
      return response.json();
    }
  });
  
  // Customer locations data
  const { data: customerLocationsData, isLoading: isLoadingLocations } = useQuery({
    queryKey: ["/api/admin/analytics/locations", customerFilter, timeRange],
    queryFn: async () => {
      const response = await fetch(`/api/admin/analytics/locations?customer=${customerFilter}&timeRange=${timeRange}`);
      if (!response.ok) {
        throw new Error("Failed to fetch location analytics data");
      }
      return response.json();
    },
    enabled: customerFilter !== "all" || locationFilter !== "all"
  });
  
  // Get customers list for filter
  const { data: customers, isLoading: isLoadingCustomers } = useQuery({
    queryKey: ["/api/admin/customers/list"],
    queryFn: async () => {
      const response = await fetch("/api/admin/customers/list");
      if (!response.ok) {
        throw new Error("Failed to fetch customers list");
      }
      return response.json();
    }
  });

  return (
    <AdminLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
          <div className="flex flex-wrap items-center gap-2">
            <Select value={platformFilter} onValueChange={setPlatformFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Platforms</SelectItem>
                <SelectItem value="google">Google</SelectItem>
                <SelectItem value="yelp">Yelp</SelectItem>
                <SelectItem value="facebook">Facebook</SelectItem>
                <SelectItem value="apple">Apple Maps</SelectItem>
              </SelectContent>
            </Select>
            <Select value={customerFilter} onValueChange={setCustomerFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Customer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Customers</SelectItem>
                {!isLoadingCustomers && customers?.map((customer: any, index: number) => (
                  <SelectItem key={index} value={customer.id.toString()}>{customer.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Time Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">Last 7 Days</SelectItem>
                <SelectItem value="30days">Last 30 Days</SelectItem>
                <SelectItem value="90days">Last 90 Days</SelectItem>
                <SelectItem value="12months">Last 12 Months</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon">
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="sentiment">Sentiment Analysis</TabsTrigger>
            <TabsTrigger value="engagement">User Engagement</TabsTrigger>
            <TabsTrigger value="competitive">Competitive Analysis</TabsTrigger>
            <TabsTrigger value="locations">Location Performance</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="h-8 w-full" />
                  ) : (
                    <>
                      <div className="text-2xl font-bold">{analyticsData?.overview?.totalReviews?.toLocaleString() || "0"}</div>
                      <p className="text-xs text-muted-foreground">
                        {analyticsData?.overview?.reviewChange >= 0 ? (
                          <span className="text-green-500">+{analyticsData?.overview?.reviewChange}%</span>
                        ) : (
                          <span className="text-red-500">{analyticsData?.overview?.reviewChange}%</span>
                        )} from previous period
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="h-8 w-full" />
                  ) : (
                    <>
                      <div className="text-2xl font-bold">{analyticsData?.overview?.averageRating?.toFixed(1) || "0.0"}</div>
                      <p className="text-xs text-muted-foreground">
                        {analyticsData?.overview?.ratingChange >= 0 ? (
                          <span className="text-green-500">+{analyticsData?.overview?.ratingChange}%</span>
                        ) : (
                          <span className="text-red-500">{analyticsData?.overview?.ratingChange}%</span>
                        )} from previous period
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="h-8 w-full" />
                  ) : (
                    <>
                      <div className="text-2xl font-bold">{analyticsData?.overview?.responseRate || "0"}%</div>
                      <p className="text-xs text-muted-foreground">
                        {analyticsData?.overview?.responseRateChange >= 0 ? (
                          <span className="text-green-500">+{analyticsData?.overview?.responseRateChange}%</span>
                        ) : (
                          <span className="text-red-500">{analyticsData?.overview?.responseRateChange}%</span>
                        )} from previous period
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Sentiment Score</CardTitle>
                  <PieChart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="h-8 w-full" />
                  ) : (
                    <>
                      <div className="text-2xl font-bold">{analyticsData?.overview?.sentimentScore || "0"}/100</div>
                      <p className="text-xs text-muted-foreground">
                        {analyticsData?.overview?.sentimentChange >= 0 ? (
                          <span className="text-green-500">+{analyticsData?.overview?.sentimentChange}%</span>
                        ) : (
                          <span className="text-red-500">{analyticsData?.overview?.sentimentChange}%</span>
                        )} from previous period
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Review Trends</CardTitle>
                  <CardDescription>Review volume over time by platform</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  {isLoading ? (
                    <div className="flex h-full items-center justify-center">
                      <Skeleton className="h-full w-full" />
                    </div>
                  ) : (
                    <LineChart
                      data={analyticsData?.reviewTrends || []}
                      xField="date"
                      yField="count"
                      categories={["Google", "Yelp", "Facebook", "Apple Maps"]}
                      colors={["#4285F4", "#C41200", "#3b5998", "#555555"]}
                    />
                  )}
                </CardContent>
              </Card>
              
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Rating Distribution</CardTitle>
                  <CardDescription>Review count by star rating</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  {isLoading ? (
                    <div className="flex h-full items-center justify-center">
                      <Skeleton className="h-full w-full" />
                    </div>
                  ) : (
                    <BarChart
                      data={analyticsData?.ratingDistribution || []}
                      xKey="rating"
                      yKeys={["count"]}
                      colors={["#8884d8"]}
                    />
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="sentiment" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Sentiment Analysis</CardTitle>
                <CardDescription>
                  AI-powered sentiment analysis of review content over time
                </CardDescription>
              </CardHeader>
              <CardContent className="h-96">
                {isLoading ? (
                  <div className="flex h-full items-center justify-center">
                    <Skeleton className="h-full w-full" />
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="h-80">
                      <LineChart
                        data={analyticsData?.sentimentTrends || []}
                        xField="date"
                        yField="score"
                        categories={["Positive", "Neutral", "Negative"]}
                        colors={["#4CAF50", "#FF9800", "#F44336"]}
                      />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium mb-4">Key Topics & Themes</h3>
                      <div className="space-y-4">
                        {isLoading ? (
                          <>
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                          </>
                        ) : (
                          analyticsData?.keyTopics?.map((topic, i) => (
                            <div key={i} className="flex items-center justify-between">
                              <span className="font-medium">{topic.name}</span>
                              <div className="flex items-center gap-2">
                                <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full ${
                                      topic.sentiment > 75
                                        ? "bg-green-500"
                                        : topic.sentiment > 50
                                        ? "bg-yellow-500"
                                        : "bg-red-500"
                                    }`}
                                    style={{ width: `${topic.sentiment}%` }}
                                  />
                                </div>
                                <span className="text-sm">{topic.sentiment}%</span>
                              </div>
                            </div>
                          )) || []
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="engagement" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>User Engagement</CardTitle>
                <CardDescription>
                  Analysis of user interactions and engagement metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-80 w-full" />
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm font-medium">Response Time Trend</CardTitle>
                      </CardHeader>
                      <CardContent className="h-60">
                        <LineChart
                          data={analyticsData?.responseTimeTrend || []}
                          xField="date"
                          yField="hours"
                          categories={["Average Response Time"]}
                          colors={["#6366F1"]}
                        />
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm font-medium">Customer Interaction Distribution</CardTitle>
                      </CardHeader>
                      <CardContent className="h-60">
                        <BarChart
                          data={analyticsData?.interactionDistribution || []}
                          xField="type"
                          yField="count"
                          color="#9333EA"
                        />
                      </CardContent>
                    </Card>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="competitive" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Competitive Analysis</CardTitle>
                <CardDescription>
                  Review performance compared to competitors
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-80 w-full" />
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm font-medium">Rating Comparison</CardTitle>
                      </CardHeader>
                      <CardContent className="h-60">
                        <BarChart
                          data={analyticsData?.ratingComparison || []}
                          xField="name"
                          yField="rating"
                          color="#2563EB"
                        />
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm font-medium">Review Volume Comparison</CardTitle>
                      </CardHeader>
                      <CardContent className="h-60">
                        <BarChart
                          data={analyticsData?.volumeComparison || []}
                          xField="name"
                          yField="count"
                          color="#10B981"
                        />
                      </CardContent>
                    </Card>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="locations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Location Performance Analytics</CardTitle>
                <CardDescription>
                  Customer location performance metrics for reviews quantity and quality
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="w-full md:w-auto">
                    <Select value={customerFilter} onValueChange={setCustomerFilter}>
                      <SelectTrigger className="w-full md:w-[200px]">
                        <SelectValue placeholder="Select Customer" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Customers</SelectItem>
                        {!isLoadingCustomers && customers?.map((customer: any, index: number) => (
                          <SelectItem key={index} value={customer.id.toString()}>{customer.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {customerFilter !== "all" && customerLocationsData?.locations && (
                    <div className="w-full md:w-auto">
                      <Select value={locationFilter} onValueChange={setLocationFilter}>
                        <SelectTrigger className="w-full md:w-[200px]">
                          <SelectValue placeholder="Select Location" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Locations</SelectItem>
                          {customerLocationsData.locations.map((location: any, index: number) => (
                            <SelectItem key={index} value={location.id.toString()}>
                              {location.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
                
                {isLoadingLocations ? (
                  <div className="space-y-4">
                    <Skeleton className="h-80 w-full" />
                  </div>
                ) : customerFilter === "all" ? (
                  <div className="flex flex-col items-center justify-center p-8 text-center">
                    <div className="mb-4 rounded-full bg-muted p-3">
                      <Filter className="h-6 w-6" />
                    </div>
                    <h3 className="mb-2 text-lg font-semibold">Select a Customer</h3>
                    <p className="mb-4 text-muted-foreground">
                      Choose a customer to see location-specific performance metrics
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Total Locations</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">
                            {customerLocationsData?.totalLocations || 0}
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Total Reviews</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">
                            {customerLocationsData?.totalReviews || 0}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {customerLocationsData?.reviewChange >= 0 ? (
                              <span className="text-green-500">+{customerLocationsData?.reviewChange}%</span>
                            ) : (
                              <span className="text-red-500">{customerLocationsData?.reviewChange}%</span>
                            )} from previous period
                          </p>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Average Rating</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">
                            {customerLocationsData?.averageRating?.toFixed(1) || "0.0"}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {customerLocationsData?.ratingChange >= 0 ? (
                              <span className="text-green-500">+{customerLocationsData?.ratingChange}%</span>
                            ) : (
                              <span className="text-red-500">{customerLocationsData?.ratingChange}%</span>
                            )} from previous period
                          </p>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Response Rate</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">
                            {customerLocationsData?.responseRate || 0}%
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {customerLocationsData?.responseRateChange >= 0 ? (
                              <span className="text-green-500">+{customerLocationsData?.responseRateChange}%</span>
                            ) : (
                              <span className="text-red-500">{customerLocationsData?.responseRateChange}%</span>
                            )} from previous period
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                    
                    {/* Location Performance Table */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Location Performance</CardTitle>
                        <CardDescription>
                          Review quantity and quality metrics by location
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Location Name</TableHead>
                              <TableHead>Reviews</TableHead>
                              <TableHead>Avg. Rating</TableHead>
                              <TableHead>Response Rate</TableHead>
                              <TableHead>Sentiment</TableHead>
                              <TableHead className="text-right">Trending</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {customerLocationsData?.locations.map((location: any, i: number) => (
                              <TableRow key={i}>
                                <TableCell className="font-medium">{location.name}</TableCell>
                                <TableCell>{location.reviewCount}</TableCell>
                                <TableCell>
                                  <div className="flex items-center">
                                    <span className="mr-2">{location.rating.toFixed(1)}</span>
                                    {Array.from({ length: 5 }).map((_, i) => (
                                      <span key={i} className={`inline-block h-4 w-4 ${i < Math.round(location.rating) ? 'text-yellow-400' : 'text-gray-300'}`}>★</span>
                                    ))}
                                  </div>
                                </TableCell>
                                <TableCell>{location.responseRate}%</TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                                      <div
                                        className={`h-full ${
                                          location.sentiment > 75
                                            ? "bg-green-500"
                                            : location.sentiment > 50
                                            ? "bg-yellow-500"
                                            : "bg-red-500"
                                        }`}
                                        style={{ width: `${location.sentiment}%` }}
                                      />
                                    </div>
                                    <span className="text-sm">{location.sentiment}%</span>
                                  </div>
                                </TableCell>
                                <TableCell className="text-right">
                                  {location.trend > 0 ? (
                                    <span className="text-green-500 flex items-center justify-end">
                                      <TrendingUp className="h-4 w-4 mr-1" /> +{location.trend}%
                                    </span>
                                  ) : (
                                    <span className="text-red-500 flex items-center justify-end">
                                      <TrendingUp className="h-4 w-4 mr-1 transform rotate-180" /> {location.trend}%
                                    </span>
                                  )}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                    
                    <div className="grid gap-4 md:grid-cols-2 mt-6">
                      <Card>
                        <CardHeader>
                          <CardTitle>Review Volume by Location</CardTitle>
                        </CardHeader>
                        <CardContent className="h-80">
                          <BarChart
                            data={customerLocationsData?.volumeByLocation || []}
                            xField="name"
                            yField="count"
                            color="#3b82f6"
                          />
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader>
                          <CardTitle>Rating Distribution by Location</CardTitle>
                        </CardHeader>
                        <CardContent className="h-80">
                          <BarChart
                            data={customerLocationsData?.ratingByLocation || []}
                            xField="name"
                            yField="rating"
                            color="#10b981"
                          />
                        </CardContent>
                      </Card>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}