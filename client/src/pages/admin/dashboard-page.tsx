import { useQuery } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Calendar,
  CreditCard,
  DollarSign,
  Download,
  ShoppingCart,
  Users,
  ArrowUpRight,
  TrendingUp,
  TrendingDown,
  Activity
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardStats {
  metrics: {
    activeUsers: number;
    activeUsersTrend: number;
    revenue: number;
    revenueTrend: number;
    accounts: number;
    accountsTrend: number;
    locations: number;
    locationsTrend: number;
  };
  usage: {
    reviews: number;
    ai_responses: number;
    review_requests: number;
    api_calls: number;
  };
}

interface UserStats {
  total: number;
  newUsers: {
    count: number;
    trend: number;
  };
  activeUsers: {
    count: number;
    trend: number;
  };
  churnRate: number;
}

interface FinancialData {
  mrr: number;
  mrrChange: number;
  arr: number;
  arrChange: number;
  ltv: number;
  ltv_change: number;
  cac: number;
  cac_change: number;
  conversion_rate: number;
  conversion_change: number;
}

export default function AdminDashboardPage() {
  const { data: dashboardStats, isLoading: isLoadingDashboard } = useQuery<DashboardStats>({
    queryKey: ["/api/admin/dashboard"],
  });

  const { data: userStats, isLoading: isLoadingUserStats } = useQuery<UserStats>({
    queryKey: ["/api/admin/users/stats"],
  });

  const { data: financialData, isLoading: isLoadingFinancial } = useQuery<FinancialData>({
    queryKey: ["/api/admin/financial"],
  });

  return (
    <AdminLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <span className="text-sm">{new Date().toLocaleDateString()}</span>
          </div>
        </div>
        
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users & Accounts</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="performance">System Performance</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Active Users
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {isLoadingDashboard ? (
                    <Skeleton className="h-7 w-24" />
                  ) : (
                    <>
                      <div className="text-2xl font-bold">
                        {dashboardStats?.metrics.activeUsers.toLocaleString()}
                      </div>
                      <div className="flex items-center text-xs text-muted-foreground mt-1">
                        {dashboardStats?.metrics.activeUsersTrend! > 0 ? (
                          <>
                            <ArrowUpRight className="h-3.5 w-3.5 mr-1 text-green-500" />
                            <span className="text-green-500 font-medium">{dashboardStats?.metrics.activeUsersTrend}%</span>
                            <span className="ml-1">from last month</span>
                          </>
                        ) : (
                          <>
                            <TrendingDown className="h-3.5 w-3.5 mr-1 text-red-500" />
                            <span className="text-red-500 font-medium">{Math.abs(dashboardStats?.metrics.activeUsersTrend || 0)}%</span>
                            <span className="ml-1">from last month</span>
                          </>
                        )}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Monthly Revenue
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {isLoadingDashboard ? (
                    <Skeleton className="h-7 w-24" />
                  ) : (
                    <>
                      <div className="text-2xl font-bold">
                        ${dashboardStats?.metrics.revenue.toLocaleString()}
                      </div>
                      <div className="flex items-center text-xs text-muted-foreground mt-1">
                        {dashboardStats?.metrics.revenueTrend! > 0 ? (
                          <>
                            <ArrowUpRight className="h-3.5 w-3.5 mr-1 text-green-500" />
                            <span className="text-green-500 font-medium">{dashboardStats?.metrics.revenueTrend}%</span>
                            <span className="ml-1">from last month</span>
                          </>
                        ) : (
                          <>
                            <TrendingDown className="h-3.5 w-3.5 mr-1 text-red-500" />
                            <span className="text-red-500 font-medium">{Math.abs(dashboardStats?.metrics.revenueTrend || 0)}%</span>
                            <span className="ml-1">from last month</span>
                          </>
                        )}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Business Accounts
                  </CardTitle>
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {isLoadingDashboard ? (
                    <Skeleton className="h-7 w-24" />
                  ) : (
                    <>
                      <div className="text-2xl font-bold">
                        {dashboardStats?.metrics.accounts.toLocaleString()}
                      </div>
                      <div className="flex items-center text-xs text-muted-foreground mt-1">
                        {dashboardStats?.metrics.accountsTrend! > 0 ? (
                          <>
                            <ArrowUpRight className="h-3.5 w-3.5 mr-1 text-green-500" />
                            <span className="text-green-500 font-medium">{dashboardStats?.metrics.accountsTrend}%</span>
                            <span className="ml-1">from last month</span>
                          </>
                        ) : (
                          <>
                            <TrendingDown className="h-3.5 w-3.5 mr-1 text-red-500" />
                            <span className="text-red-500 font-medium">{Math.abs(dashboardStats?.metrics.accountsTrend || 0)}%</span>
                            <span className="ml-1">from last month</span>
                          </>
                        )}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Active Locations
                  </CardTitle>
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {isLoadingDashboard ? (
                    <Skeleton className="h-7 w-24" />
                  ) : (
                    <>
                      <div className="text-2xl font-bold">
                        {dashboardStats?.metrics.locations.toLocaleString()}
                      </div>
                      <div className="flex items-center text-xs text-muted-foreground mt-1">
                        {dashboardStats?.metrics.locationsTrend! > 0 ? (
                          <>
                            <ArrowUpRight className="h-3.5 w-3.5 mr-1 text-green-500" />
                            <span className="text-green-500 font-medium">{dashboardStats?.metrics.locationsTrend}%</span>
                            <span className="ml-1">from last month</span>
                          </>
                        ) : (
                          <>
                            <TrendingDown className="h-3.5 w-3.5 mr-1 text-red-500" />
                            <span className="text-red-500 font-medium">{Math.abs(dashboardStats?.metrics.locationsTrend || 0)}%</span>
                            <span className="ml-1">from last month</span>
                          </>
                        )}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
            
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Platform Usage</CardTitle>
                  <CardDescription>
                    Total activity across key platform features
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingDashboard ? (
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary mr-2"></div>
                            <span>Reviews Tracked</span>
                          </div>
                          <span className="font-medium">{dashboardStats?.usage.reviews.toLocaleString()}</span>
                        </div>
                        <div className="h-2 w-full bg-primary/10 rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ 
                            width: `${Math.min(100, (dashboardStats?.usage.reviews || 0) / 10000 * 100)}%` 
                          }}></div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 mr-2"></div>
                            <span>AI Responses</span>
                          </div>
                          <span className="font-medium">{dashboardStats?.usage.ai_responses.toLocaleString()}</span>
                        </div>
                        <div className="h-2 w-full bg-green-500/10 rounded-full overflow-hidden">
                          <div className="h-full bg-green-500 rounded-full" style={{ 
                            width: `${Math.min(100, (dashboardStats?.usage.ai_responses || 0) / 5000 * 100)}%` 
                          }}></div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2"></div>
                            <span>Review Requests</span>
                          </div>
                          <span className="font-medium">{dashboardStats?.usage.review_requests.toLocaleString()}</span>
                        </div>
                        <div className="h-2 w-full bg-blue-500/10 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full" style={{ 
                            width: `${Math.min(100, (dashboardStats?.usage.review_requests || 0) / 3000 * 100)}%` 
                          }}></div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center">
                            <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mr-2"></div>
                            <span>API Calls</span>
                          </div>
                          <span className="font-medium">{dashboardStats?.usage.api_calls.toLocaleString()}</span>
                        </div>
                        <div className="h-2 w-full bg-purple-500/10 rounded-full overflow-hidden">
                          <div className="h-full bg-purple-500 rounded-full" style={{ 
                            width: `${Math.min(100, (dashboardStats?.usage.api_calls || 0) / 20000 * 100)}%` 
                          }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Financial Metrics</CardTitle>
                  <CardDescription>
                    Key performance indicators
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingFinancial ? (
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">MRR</h4>
                        <div className="flex items-center">
                          <span className="text-xl font-bold mr-2">${financialData?.mrr.toLocaleString()}</span>
                          {financialData?.mrrChange! > 0 ? (
                            <span className="text-xs text-green-500 flex items-center">
                              <ArrowUpRight className="h-3 w-3 mr-0.5" />
                              {financialData?.mrrChange}%
                            </span>
                          ) : (
                            <span className="text-xs text-red-500 flex items-center">
                              <TrendingDown className="h-3 w-3 mr-0.5" />
                              {Math.abs(financialData?.mrrChange || 0)}%
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">ARR</h4>
                        <div className="flex items-center">
                          <span className="text-xl font-bold mr-2">${financialData?.arr.toLocaleString()}</span>
                          {financialData?.arrChange! > 0 ? (
                            <span className="text-xs text-green-500 flex items-center">
                              <ArrowUpRight className="h-3 w-3 mr-0.5" />
                              {financialData?.arrChange}%
                            </span>
                          ) : (
                            <span className="text-xs text-red-500 flex items-center">
                              <TrendingDown className="h-3 w-3 mr-0.5" />
                              {Math.abs(financialData?.arrChange || 0)}%
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">LTV</h4>
                        <div className="flex items-center">
                          <span className="text-xl font-bold mr-2">${financialData?.ltv.toLocaleString()}</span>
                          {financialData?.ltv_change! > 0 ? (
                            <span className="text-xs text-green-500 flex items-center">
                              <ArrowUpRight className="h-3 w-3 mr-0.5" />
                              {financialData?.ltv_change}%
                            </span>
                          ) : (
                            <span className="text-xs text-red-500 flex items-center">
                              <TrendingDown className="h-3 w-3 mr-0.5" />
                              {Math.abs(financialData?.ltv_change || 0)}%
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">CAC</h4>
                        <div className="flex items-center">
                          <span className="text-xl font-bold mr-2">${financialData?.cac.toLocaleString()}</span>
                          {financialData?.cac_change! < 0 ? (
                            <span className="text-xs text-green-500 flex items-center">
                              <ArrowUpRight className="h-3 w-3 mr-0.5" />
                              {Math.abs(financialData?.cac_change || 0)}%
                            </span>
                          ) : (
                            <span className="text-xs text-red-500 flex items-center">
                              <TrendingDown className="h-3 w-3 mr-0.5" />
                              {financialData?.cac_change}%
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="col-span-2">
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">Conversion Rate</h4>
                        <div className="flex items-center">
                          <span className="text-xl font-bold mr-2">{financialData?.conversion_rate}%</span>
                          {financialData?.conversion_change! > 0 ? (
                            <span className="text-xs text-green-500 flex items-center">
                              <ArrowUpRight className="h-3 w-3 mr-0.5" />
                              {financialData?.conversion_change}%
                            </span>
                          ) : (
                            <span className="text-xs text-red-500 flex items-center">
                              <TrendingDown className="h-3 w-3 mr-0.5" />
                              {Math.abs(financialData?.conversion_change || 0)}%
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="users" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Users
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {isLoadingUserStats ? (
                    <Skeleton className="h-7 w-24" />
                  ) : (
                    <div className="text-2xl font-bold">
                      {userStats?.total.toLocaleString()}
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    New Users (30 days)
                  </CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {isLoadingUserStats ? (
                    <Skeleton className="h-7 w-24" />
                  ) : (
                    <>
                      <div className="text-2xl font-bold">
                        {userStats?.newUsers.count.toLocaleString()}
                      </div>
                      <div className="flex items-center text-xs text-muted-foreground mt-1">
                        {userStats?.newUsers.trend! > 0 ? (
                          <>
                            <ArrowUpRight className="h-3.5 w-3.5 mr-1 text-green-500" />
                            <span className="text-green-500 font-medium">{userStats?.newUsers.trend}%</span>
                            <span className="ml-1">from last month</span>
                          </>
                        ) : (
                          <>
                            <TrendingDown className="h-3.5 w-3.5 mr-1 text-red-500" />
                            <span className="text-red-500 font-medium">{Math.abs(userStats?.newUsers.trend || 0)}%</span>
                            <span className="ml-1">from last month</span>
                          </>
                        )}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Churn Rate
                  </CardTitle>
                  <TrendingDown className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {isLoadingUserStats ? (
                    <Skeleton className="h-7 w-24" />
                  ) : (
                    <div className="text-2xl font-bold">
                      {userStats?.churnRate.toFixed(1)}%
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Recently Active Users</CardTitle>
                  <CardDescription>
                    Users who logged in within the last 24 hours
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingUserStats ? (
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  ) : (
                    <div className="text-2xl font-bold">
                      {userStats?.activeUsers.count.toLocaleString()}
                      <span className="text-sm text-muted-foreground ml-2 font-normal">
                        ({((userStats?.activeUsers.count || 0) / (userStats?.total || 1) * 100).toFixed(1)}% of total)
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>User Growth</CardTitle>
                  <CardDescription>
                    Year-to-date user acquisition
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-[200px] flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <BarChart className="h-8 w-8 mx-auto mb-2" />
                    <p>Interactive chart will be displayed here</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="revenue" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Monthly Recurring Revenue
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {isLoadingFinancial ? (
                    <Skeleton className="h-7 w-24" />
                  ) : (
                    <>
                      <div className="text-2xl font-bold">
                        ${financialData?.mrr.toLocaleString()}
                      </div>
                      <div className="flex items-center text-xs text-muted-foreground mt-1">
                        {financialData?.mrrChange! > 0 ? (
                          <>
                            <ArrowUpRight className="h-3.5 w-3.5 mr-1 text-green-500" />
                            <span className="text-green-500 font-medium">{financialData?.mrrChange}%</span>
                            <span className="ml-1">from last month</span>
                          </>
                        ) : (
                          <>
                            <TrendingDown className="h-3.5 w-3.5 mr-1 text-red-500" />
                            <span className="text-red-500 font-medium">{Math.abs(financialData?.mrrChange || 0)}%</span>
                            <span className="ml-1">from last month</span>
                          </>
                        )}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Annual Recurring Revenue
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {isLoadingFinancial ? (
                    <Skeleton className="h-7 w-24" />
                  ) : (
                    <>
                      <div className="text-2xl font-bold">
                        ${financialData?.arr.toLocaleString()}
                      </div>
                      <div className="flex items-center text-xs text-muted-foreground mt-1">
                        {financialData?.arrChange! > 0 ? (
                          <>
                            <ArrowUpRight className="h-3.5 w-3.5 mr-1 text-green-500" />
                            <span className="text-green-500 font-medium">{financialData?.arrChange}%</span>
                            <span className="ml-1">from last year</span>
                          </>
                        ) : (
                          <>
                            <TrendingDown className="h-3.5 w-3.5 mr-1 text-red-500" />
                            <span className="text-red-500 font-medium">{Math.abs(financialData?.arrChange || 0)}%</span>
                            <span className="ml-1">from last year</span>
                          </>
                        )}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Customer LTV
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {isLoadingFinancial ? (
                    <Skeleton className="h-7 w-24" />
                  ) : (
                    <>
                      <div className="text-2xl font-bold">
                        ${financialData?.ltv.toLocaleString()}
                      </div>
                      <div className="flex items-center text-xs text-muted-foreground mt-1">
                        {financialData?.ltv_change! > 0 ? (
                          <>
                            <ArrowUpRight className="h-3.5 w-3.5 mr-1 text-green-500" />
                            <span className="text-green-500 font-medium">{financialData?.ltv_change}%</span>
                            <span className="ml-1">from last year</span>
                          </>
                        ) : (
                          <>
                            <TrendingDown className="h-3.5 w-3.5 mr-1 text-red-500" />
                            <span className="text-red-500 font-medium">{Math.abs(financialData?.ltv_change || 0)}%</span>
                            <span className="ml-1">from last year</span>
                          </>
                        )}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Customer Acquisition Cost
                  </CardTitle>
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {isLoadingFinancial ? (
                    <Skeleton className="h-7 w-24" />
                  ) : (
                    <>
                      <div className="text-2xl font-bold">
                        ${financialData?.cac.toLocaleString()}
                      </div>
                      <div className="flex items-center text-xs text-muted-foreground mt-1">
                        {financialData?.cac_change! < 0 ? (
                          <>
                            <ArrowUpRight className="h-3.5 w-3.5 mr-1 text-green-500" />
                            <span className="text-green-500 font-medium">{Math.abs(financialData?.cac_change || 0)}%</span>
                            <span className="ml-1">decrease</span>
                          </>
                        ) : (
                          <>
                            <TrendingDown className="h-3.5 w-3.5 mr-1 text-red-500" />
                            <span className="text-red-500 font-medium">{financialData?.cac_change}%</span>
                            <span className="ml-1">increase</span>
                          </>
                        )}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Plan</CardTitle>
                <CardDescription>
                  Distribution of revenue across subscription plans
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[300px] flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <BarChart className="h-8 w-8 mx-auto mb-2" />
                  <p>Interactive chart will be displayed here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="performance" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>System Health</CardTitle>
                  <CardDescription>
                    Current status and uptime metrics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">System Status</span>
                      <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700">
                        Operational
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">API Status</span>
                      <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700">
                        Operational
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Database Status</span>
                      <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700">
                        Operational
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Last Incident</span>
                      <span className="text-sm text-muted-foreground">12 days ago</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Uptime (30 days)</span>
                      <span className="text-sm font-medium">99.98%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                  <CardDescription>
                    Server and API response times
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">API Response Time</span>
                        <span className="text-sm font-medium">87ms</span>
                      </div>
                      <div className="h-2 w-full bg-primary/10 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full" 
                          style={{ width: '20%' }}
                        ></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">Database Query Time</span>
                        <span className="text-sm font-medium">145ms</span>
                      </div>
                      <div className="h-2 w-full bg-primary/10 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full" 
                          style={{ width: '35%' }}
                        ></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">Server Load</span>
                        <span className="text-sm font-medium">28%</span>
                      </div>
                      <div className="h-2 w-full bg-primary/10 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full" 
                          style={{ width: '28%' }}
                        ></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">Memory Usage</span>
                        <span className="text-sm font-medium">42%</span>
                      </div>
                      <div className="h-2 w-full bg-primary/10 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full" 
                          style={{ width: '42%' }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}