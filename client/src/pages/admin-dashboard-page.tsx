import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { AdminLayout } from "@/components/admin/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import LineChart from "@/components/admin/charts/LineChart";
import BarChart from "@/components/admin/charts/BarChart";
import {
  ArrowDownIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  BarChart2,
  Calendar,
  CreditCard,
  DollarSign,
  Download,
  HelpCircle,
  Info,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Users
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function AdminDashboardPage() {
  const [, navigate] = useLocation();
  const [timeRange, setTimeRange] = useState("30days");
  
  // Fetch dashboard data
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["/api/admin/dashboard", timeRange],
    queryFn: async () => {
      const response = await fetch(`/api/admin/dashboard?timeRange=${timeRange}`);
      if (!response.ok) {
        throw new Error("Failed to fetch dashboard data");
      }
      return await response.json();
    }
  });

  // Fetch user stats
  const { data: userStats = {}, isLoading: isLoadingUserStats } = useQuery({
    queryKey: ["/api/admin/users/stats"],
  });

  // Fetch financial data
  const { data: financialData = {}, isLoading: isLoadingFinancial } = useQuery({
    queryKey: ["/api/admin/financial"],
  });

  const handleRefresh = () => {
    refetch();
  };

  const handleTimeRangeChange = (value: string) => {
    setTimeRange(value);
  };

  const formatCurrency = (value: number) => {
    return `$${value.toLocaleString()}`;
  };

  const formatNumber = (value: number) => {
    return value.toLocaleString();
  };

  // Format percentage with + or - sign
  const formatPercentage = (value: number) => {
    const sign = value >= 0 ? "+" : "";
    return `${sign}${value.toFixed(1)}%`;
  };

  // Get trend icon based on value
  const getTrendIcon = (value: number, size = 16) => {
    if (value > 0) {
      return <ArrowUpIcon className="text-green-500" size={size} />;
    } else if (value < 0) {
      return <ArrowDownIcon className="text-red-500" size={size} />;
    }
    return null;
  };

  return (
    <AdminLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
            <p className="text-muted-foreground">
              Overview of your business performance and analytics
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <Select
              value={timeRange}
              onValueChange={handleTimeRangeChange}
            >
              <SelectTrigger className="w-[180px]">
                <Calendar className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Select time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">Last 7 days</SelectItem>
                <SelectItem value="30days">Last 30 days</SelectItem>
                <SelectItem value="90days">Last 90 days</SelectItem>
                <SelectItem value="12months">Last 12 months</SelectItem>
              </SelectContent>
            </Select>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-10 gap-1">
                  <Download className="h-4 w-4" />
                  <span className="hidden sm:inline">Export</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Export Options</DropdownMenuLabel>
                <DropdownMenuItem>
                  Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem>
                  Export as PDF
                </DropdownMenuItem>
                <DropdownMenuItem>
                  Schedule Reports
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button variant="secondary" size="sm" className="h-10" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 mr-1" />
              Refresh
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Overview</TabsTrigger>
            <TabsTrigger value="revenue" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Revenue</TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Users</TabsTrigger>
            <TabsTrigger value="usage" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Usage</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {isLoading ? (
                Array(4).fill(0).map((_, i) => (
                  <Card key={i}>
                    <CardHeader className="pb-2">
                      <Skeleton className="h-4 w-24" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-10 w-32 mb-2" />
                      <Skeleton className="h-4 w-20" />
                    </CardContent>
                  </Card>
                ))
              ) : (
                <>
                  <Card className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <HelpCircle className="h-4 w-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <p>Total number of active users across all subscriptions.</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{formatNumber(data.metrics.activeUsers)}</div>
                      <div className="flex items-center pt-1 text-xs text-muted-foreground">
                        <span className="flex items-center text-xs font-medium">
                          {getTrendIcon(data.metrics.activeUsersTrend)}
                          <span className={data.metrics.activeUsersTrend >= 0 ? "text-green-500" : "text-red-500"}>
                            {formatPercentage(data.metrics.activeUsersTrend)}
                          </span>
                        </span>
                        <span className="ml-1">vs previous period</span>
                      </div>
                      
                      <div 
                        className="absolute bottom-0 left-0 w-full h-1/4 overflow-hidden" 
                        onClick={() => navigate("/admin/customers")}
                      >
                        <div className="absolute inset-0 flex items-end">
                          <div className="relative w-full h-8 cursor-pointer">
                            <LineChart
                              data={data.revenueData}
                              xKey="month"
                              yKeys={["users"]}
                              height={40}
                              showLegend={false}
                              colors={["#1d4ed8"]}
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <HelpCircle className="h-4 w-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <p>Total monthly recurring revenue.</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{formatCurrency(data.metrics.revenue)}</div>
                      <div className="flex items-center pt-1 text-xs text-muted-foreground">
                        <span className="flex items-center text-xs font-medium">
                          {getTrendIcon(data.metrics.revenueTrend)}
                          <span className={data.metrics.revenueTrend >= 0 ? "text-green-500" : "text-red-500"}>
                            {formatPercentage(data.metrics.revenueTrend)}
                          </span>
                        </span>
                        <span className="ml-1">vs previous period</span>
                      </div>
                      
                      <div 
                        className="absolute bottom-0 left-0 w-full h-1/4 overflow-hidden"
                        onClick={() => navigate("/admin/financial")}
                      >
                        <div className="absolute inset-0 flex items-end">
                          <div className="relative w-full h-8 cursor-pointer">
                            <LineChart
                              data={data.revenueData}
                              xKey="month"
                              yKeys={["revenue"]}
                              height={40}
                              showLegend={false}
                              colors={["#10b981"]}
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium">Business Accounts</CardTitle>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <HelpCircle className="h-4 w-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <p>Total number of business and enterprise accounts.</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{formatNumber(data.metrics.accounts)}</div>
                      <div className="flex items-center pt-1 text-xs text-muted-foreground">
                        <span className="flex items-center text-xs font-medium">
                          {getTrendIcon(data.metrics.accountsTrend)}
                          <span className={data.metrics.accountsTrend >= 0 ? "text-green-500" : "text-red-500"}>
                            {formatPercentage(data.metrics.accountsTrend)}
                          </span>
                        </span>
                        <span className="ml-1">vs previous period</span>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium">Total Locations</CardTitle>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <HelpCircle className="h-4 w-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <p>Total number of business locations being monitored.</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{formatNumber(data.metrics.locations)}</div>
                      <div className="flex items-center pt-1 text-xs text-muted-foreground">
                        <span className="flex items-center text-xs font-medium">
                          {getTrendIcon(data.metrics.locationsTrend)}
                          <span className={data.metrics.locationsTrend >= 0 ? "text-green-500" : "text-red-500"}>
                            {formatPercentage(data.metrics.locationsTrend)}
                          </span>
                        </span>
                        <span className="ml-1">vs previous period</span>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
            
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-full lg:col-span-4">
                <CardHeader>
                  <CardTitle>Revenue Overview</CardTitle>
                  <CardDescription>Revenue breakdown by month</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <Skeleton className="h-full w-full" />
                    </div>
                  ) : (
                    <LineChart
                      data={data.revenueData}
                      xKey="month"
                      yKeys={["revenue"]}
                      labels={["Revenue"]}
                      yFormatter={(value) => `$${value.toLocaleString()}`}
                    />
                  )}
                </CardContent>
                <CardFooter className="flex justify-between">
                  <div className="text-xs text-muted-foreground">
                    Updated {new Date().toLocaleDateString()}
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => navigate("/admin/financial")}>
                    View Details <ArrowRightIcon className="ml-1 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
              
              <Card className="col-span-full lg:col-span-3">
                <CardHeader>
                  <CardTitle>Subscription Plans</CardTitle>
                  <CardDescription>Distribution of active customers by plan</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <Skeleton className="h-full w-full" />
                    </div>
                  ) : (
                    <BarChart
                      data={data.planDistribution}
                      xKey="name"
                      yKeys={["value"]}
                      labels={["Customers"]}
                      colors={['#10b981', '#3b82f6', '#f59e0b']}
                      yFormatter={(value) => `${value}%`}
                    />
                  )}
                </CardContent>
                <CardFooter className="flex justify-between">
                  <div className="text-xs text-muted-foreground">
                    Based on {formatNumber(data.metrics.activeUsers)} active users
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => navigate("/admin/customers")}>
                    View Users <ArrowRightIcon className="ml-1 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            </div>
            
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Platform Usage</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-2">
                      {Array(4).fill(0).map((_, i) => (
                        <Skeleton key={i} className="h-12 w-full" />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-2 h-2 rounded-full bg-red-500 mr-2"></div>
                          <span className="text-sm">Total Reviews</span>
                        </div>
                        <span className="font-semibold">{formatNumber(data.usage.reviews)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div>
                          <span className="text-sm">AI Responses</span>
                        </div>
                        <span className="font-semibold">{formatNumber(data.usage.ai_responses)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                          <span className="text-sm">Review Requests</span>
                        </div>
                        <span className="font-semibold">{formatNumber(data.usage.review_requests)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-2 h-2 rounded-full bg-yellow-500 mr-2"></div>
                          <span className="text-sm">API Calls</span>
                        </div>
                        <span className="font-semibold">{formatNumber(data.usage.api_calls)}</span>
                      </div>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button variant="ghost" size="sm" className="w-full" onClick={() => navigate("/admin/system")}>
                    View System Details
                  </Button>
                </CardFooter>
              </Card>
              
              <Card className="col-span-1 md:col-span-1 lg:col-span-3">
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Last 5 platform events</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-2">
                      {Array(5).fill(0).map((_, i) => (
                        <Skeleton key={i} className="h-12 w-full" />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <div className="bg-blue-100 p-2 rounded-full mr-4">
                          <Users className="h-4 w-4 text-blue-700" />
                        </div>
                        <div>
                          <div className="font-medium">New user registered</div>
                          <div className="text-sm text-muted-foreground">2 minutes ago</div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="bg-green-100 p-2 rounded-full mr-4">
                          <CreditCard className="h-4 w-4 text-green-700" />
                        </div>
                        <div>
                          <div className="font-medium">Subscription payment processed</div>
                          <div className="text-sm text-muted-foreground">15 minutes ago</div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="bg-purple-100 p-2 rounded-full mr-4">
                          <BarChart2 className="h-4 w-4 text-purple-700" />
                        </div>
                        <div>
                          <div className="font-medium">New analytics report generated</div>
                          <div className="text-sm text-muted-foreground">1 hour ago</div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="bg-yellow-100 p-2 rounded-full mr-4">
                          <DollarSign className="h-4 w-4 text-yellow-700" />
                        </div>
                        <div>
                          <div className="font-medium">Plan upgrade</div>
                          <div className="text-sm text-muted-foreground">2 hours ago</div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="bg-red-100 p-2 rounded-full mr-4">
                          <Info className="h-4 w-4 text-red-700" />
                        </div>
                        <div>
                          <div className="font-medium">System alert resolved</div>
                          <div className="text-sm text-muted-foreground">3 hours ago</div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button variant="ghost" size="sm" className="w-full">
                    View All Activity
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="revenue" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {isLoadingFinancial ? (
                Array(3).fill(0).map((_, i) => (
                  <Card key={i}>
                    <CardHeader className="pb-2">
                      <Skeleton className="h-4 w-24" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-10 w-32 mb-2" />
                      <Skeleton className="h-4 w-20" />
                    </CardContent>
                  </Card>
                ))
              ) : (
                <>
                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium">Monthly Recurring Revenue</CardTitle>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <HelpCircle className="h-4 w-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Monthly recurring revenue (MRR)</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{formatCurrency(data?.metrics.revenue || 0)}</div>
                      <div className="flex items-center pt-1 text-xs text-muted-foreground">
                        <span className="flex items-center text-xs font-medium">
                          {getTrendIcon(data?.metrics.revenueTrend || 0)}
                          <span className={(data?.metrics.revenueTrend || 0) >= 0 ? "text-green-500" : "text-red-500"}>
                            {formatPercentage(data?.metrics.revenueTrend || 0)}
                          </span>
                        </span>
                        <span className="ml-1">vs previous period</span>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium">Annual Recurring Revenue</CardTitle>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <HelpCircle className="h-4 w-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Annual recurring revenue (ARR)</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{formatCurrency(financialData.arr || 0)}</div>
                      <div className="flex items-center pt-1 text-xs text-muted-foreground">
                        <span className="flex items-center text-xs font-medium">
                          {getTrendIcon(financialData.arrChange || 0)}
                          <span className={(financialData.arrChange || 0) >= 0 ? "text-green-500" : "text-red-500"}>
                            {formatPercentage(financialData.arrChange || 0)}
                          </span>
                        </span>
                        <span className="ml-1">vs previous year</span>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium">Average Revenue Per User</CardTitle>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <HelpCircle className="h-4 w-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Average revenue per user (ARPU)</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{formatCurrency(financialData?.arpu || 0)}</div>
                      <div className="flex items-center pt-1 text-xs text-muted-foreground">
                        <span className="flex items-center text-xs font-medium">
                          {getTrendIcon(financialData?.arpuChange || 0)}
                          <span className={(financialData?.arpuChange || 0) >= 0 ? "text-green-500" : "text-red-500"}>
                            {formatPercentage(financialData?.arpuChange || 0)}
                          </span>
                        </span>
                        <span className="ml-1">vs previous period</span>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
            
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
              <Card className="col-span-full md:col-span-1">
                <CardHeader>
                  <CardTitle>Revenue Trend</CardTitle>
                  <CardDescription>Monthly revenue over time</CardDescription>
                </CardHeader>
                <CardContent className="h-[350px]">
                  {isLoading ? (
                    <Skeleton className="h-full w-full" />
                  ) : (
                    <LineChart
                      data={data.revenueData}
                      xKey="month"
                      yKeys={["revenue"]}
                      labels={["Revenue"]}
                      yFormatter={(value) => `$${value.toLocaleString()}`}
                    />
                  )}
                </CardContent>
              </Card>
              
              <Card className="col-span-full md:col-span-1">
                <CardHeader>
                  <CardTitle>Revenue by Plan</CardTitle>
                  <CardDescription>Monthly revenue breakdown by plan</CardDescription>
                </CardHeader>
                <CardContent className="h-[350px]">
                  {isLoading ? (
                    <Skeleton className="h-full w-full" />
                  ) : (
                    <BarChart
                      data={data.revenueByPlan}
                      xKey="month"
                      yKeys={["pro", "business", "enterprise"]}
                      labels={["Pro", "Business", "Enterprise"]}
                      colors={["#10b981", "#3b82f6", "#8b5cf6"]}
                      stacked={true}
                      yFormatter={(value) => `$${value.toLocaleString()}`}
                    />
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="users" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {isLoadingUserStats ? (
                Array(4).fill(0).map((_, i) => (
                  <Card key={i}>
                    <CardHeader className="pb-2">
                      <Skeleton className="h-4 w-24" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-10 w-32 mb-2" />
                      <Skeleton className="h-4 w-20" />
                    </CardContent>
                  </Card>
                ))
              ) : (
                <>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{formatNumber(userStats?.total || 0)}</div>
                      <div className="text-xs text-muted-foreground">Active accounts</div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">New Users</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{formatNumber(userStats?.newUsers?.count || 0)}</div>
                      <div className="flex items-center pt-1 text-xs text-muted-foreground">
                        <span className="flex items-center text-xs font-medium">
                          {getTrendIcon(userStats?.newUsers?.change || 0)}
                          <span className={(userStats?.newUsers?.change || 0) >= 0 ? "text-green-500" : "text-red-500"}>
                            {formatPercentage(userStats?.newUsers?.change || 0)}
                          </span>
                        </span>
                        <span className="ml-1">vs previous period</span>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Churn Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{formatPercentage(userStats?.churnRate || 0)}</div>
                      <div className="flex items-center pt-1 text-xs text-muted-foreground">
                        <span className="flex items-center text-xs font-medium">
                          {getTrendIcon(-(userStats?.churnRateChange || 0))}
                          <span className={(userStats?.churnRateChange || 0) <= 0 ? "text-green-500" : "text-red-500"}>
                            {formatPercentage(-(userStats?.churnRateChange || 0))}
                          </span>
                        </span>
                        <span className="ml-1">vs previous period</span>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{formatPercentage(userStats?.conversionRate || 0)}</div>
                      <div className="flex items-center pt-1 text-xs text-muted-foreground">
                        <span className="flex items-center text-xs font-medium">
                          {getTrendIcon(userStats?.conversionRateChange || 0)}
                          <span className={(userStats?.conversionRateChange || 0) >= 0 ? "text-green-500" : "text-red-500"}>
                            {formatPercentage(userStats?.conversionRateChange || 0)}
                          </span>
                        </span>
                        <span className="ml-1">vs previous period</span>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
            
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
              <Card className="col-span-full md:col-span-1">
                <CardHeader>
                  <CardTitle>User Growth</CardTitle>
                  <CardDescription>Monthly active users over time</CardDescription>
                </CardHeader>
                <CardContent className="h-[350px]">
                  {isLoading ? (
                    <Skeleton className="h-full w-full" />
                  ) : (
                    <LineChart
                      data={data.revenueData}
                      xKey="month"
                      yKeys={["users"]}
                      labels={["Active Users"]}
                      colors={["#3b82f6"]}
                      yFormatter={(value) => formatNumber(value)}
                    />
                  )}
                </CardContent>
              </Card>
              
              <Card className="col-span-full md:col-span-1">
                <CardHeader>
                  <CardTitle>Plan Distribution</CardTitle>
                  <CardDescription>Users by subscription plan</CardDescription>
                </CardHeader>
                <CardContent className="h-[350px]">
                  {isLoading ? (
                    <Skeleton className="h-full w-full" />
                  ) : (
                    <BarChart
                      data={data.planDistribution}
                      xKey="name"
                      yKeys={["value"]}
                      labels={["Percentage"]}
                      colors={["#10b981"]}
                      yFormatter={(value) => `${value}%`}
                    />
                  )}
                </CardContent>
              </Card>
            </div>
            
            <div className="grid gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div>
                    <CardTitle>User Management Quick Actions</CardTitle>
                    <CardDescription>Common tasks for user management</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    <Button variant="outline" className="justify-start" onClick={() => navigate("/admin/customers")}>
                      <Users className="mr-2 h-4 w-4" />
                      View All Users
                    </Button>
                    <Button variant="outline" className="justify-start">
                      <Plus className="mr-2 h-4 w-4" />
                      Add New User
                    </Button>
                    <Button variant="outline" className="justify-start">
                      <CreditCard className="mr-2 h-4 w-4" />
                      Manage Subscriptions
                    </Button>
                    <Button variant="outline" className="justify-start">
                      <MoreHorizontal className="mr-2 h-4 w-4" />
                      More Actions
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="usage" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {isLoading ? (
                Array(4).fill(0).map((_, i) => (
                  <Card key={i}>
                    <CardHeader className="pb-2">
                      <Skeleton className="h-4 w-24" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-10 w-32 mb-2" />
                      <Skeleton className="h-4 w-20" />
                    </CardContent>
                  </Card>
                ))
              ) : (
                <>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Reviews Processed</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{formatNumber(data.usage.reviews)}</div>
                      <div className="text-xs text-muted-foreground">Total reviews in the system</div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">AI Responses</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{formatNumber(data.usage.ai_responses)}</div>
                      <div className="text-xs text-muted-foreground">AI-generated review responses</div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Review Requests</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{formatNumber(data.usage.review_requests)}</div>
                      <div className="text-xs text-muted-foreground">Sent to customers</div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">API Calls</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{formatNumber(data.usage.api_calls)}</div>
                      <div className="text-xs text-muted-foreground">External API requests</div>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
            
            <div className="grid gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>System Usage Analytics</CardTitle>
                  <CardDescription>Monitor usage statistics to plan capacity</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-8">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm font-medium">Reviews Storage</div>
                        <div className="text-sm text-muted-foreground">65% used</div>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: "65%" }}></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm font-medium">AI API Usage</div>
                        <div className="text-sm text-muted-foreground">42% used</div>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: "42%" }}></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm font-medium">Email Quota</div>
                        <div className="text-sm text-muted-foreground">28% used</div>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 rounded-full" style={{ width: "28%" }}></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm font-medium">External API Quotas</div>
                        <div className="text-sm text-muted-foreground">85% used</div>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-red-500 rounded-full" style={{ width: "85%" }}></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" size="sm" className="w-full" onClick={() => navigate("/admin/system")}>
                    View Detailed System Stats
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}