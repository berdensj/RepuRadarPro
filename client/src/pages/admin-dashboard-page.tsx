import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Users, 
  DollarSign, 
  LineChart, 
  Activity, 
  UserPlus, 
  ShieldAlert, 
  User, 
  Server, 
  Bell, 
  Filter, 
  Star, 
  MessageSquare, 
  Download, 
  Calendar, 
  Layers, 
  Link, 
  Loader2 
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart as RechartsLineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';

const AdminDashboardPage = () => {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState('30days');
  const [chartView, setChartView] = useState('revenue');

  // Fetching admin dashboard data
  const { data: dashboardData, isLoading: dashboardLoading } = useQuery({
    queryKey: ['/api/admin/dashboard', timeRange],
    queryFn: async () => {
      const res = await apiRequest('GET', `/api/admin/dashboard?timeRange=${timeRange}`);
      return res.json();
    },
  });

  // Fetching user statistics
  const { data: userStats, isLoading: userStatsLoading } = useQuery({
    queryKey: ['/api/admin/users/stats', timeRange],
    queryFn: async () => {
      const res = await apiRequest('GET', `/api/admin/users/stats?timeRange=${timeRange}`);
      return res.json();
    },
  });

  // Fetching financial data
  const { data: financialData, isLoading: financialLoading } = useQuery({
    queryKey: ['/api/admin/financial', timeRange],
    queryFn: async () => {
      const res = await apiRequest('GET', `/api/admin/financial?timeRange=${timeRange}`);
      return res.json();
    },
  });

  // Fetching system health data
  const { data: systemHealth, isLoading: systemHealthLoading } = useQuery({
    queryKey: ['/api/admin/system-health'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/admin/system-health');
      return res.json();
    },
  });

  // Fetching recent users
  const { data: recentUsers, isLoading: recentUsersLoading } = useQuery({
    queryKey: ['/api/admin/users/recent'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/admin/users/recent');
      return res.json();
    },
  });

  // Fetching recent transactions
  const { data: recentTransactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ['/api/admin/transactions/recent'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/admin/transactions/recent');
      return res.json();
    },
  });

  // Sample data for visualizations - in a real app, this would come from the API
  // Business metrics data
  const businessMetrics = [
    {
      id: 'active_users',
      name: 'Active Users',
      value: 2845,
      change: 12.6,
      changeType: 'increase',
      icon: Users
    },
    {
      id: 'mrr',
      name: 'Monthly Revenue',
      value: "$24,512",
      change: 8.2,
      changeType: 'increase',
      icon: DollarSign
    },
    {
      id: 'retention',
      name: 'Retention Rate',
      value: "94.3%",
      change: 1.8,
      changeType: 'increase',
      icon: Activity
    },
    {
      id: 'signups',
      name: 'New Signups',
      value: 385,
      change: 5.3,
      changeType: 'decrease',
      icon: UserPlus
    }
  ];

  // User plan distribution data
  const planDistributionData = [
    { name: 'Free', value: 65 },
    { name: 'Pro', value: 27 },
    { name: 'Business', value: 8 },
  ];

  // Revenue chart data
  const revenueData = [
    { month: 'Jan', revenue: 15400, users: 1820 },
    { month: 'Feb', revenue: 17200, users: 2010 },
    { month: 'Mar', revenue: 19100, users: 2180 },
    { month: 'Apr', revenue: 21500, users: 2340 },
    { month: 'May', revenue: 22800, users: 2520 },
    { month: 'Jun', revenue: 24100, users: 2710 },
    { month: 'Jul', revenue: 25400, users: 2845 },
  ];

  // User growth chart data
  const userGrowthData = [
    { month: 'Jan', newUsers: 280, churn: 42 },
    { month: 'Feb', newUsers: 310, churn: 48 },
    { month: 'Mar', newUsers: 340, churn: 52 },
    { month: 'Apr', newUsers: 370, churn: 58 },
    { month: 'May', newUsers: 390, churn: 62 },
    { month: 'Jun', newUsers: 410, churn: 65 },
    { month: 'Jul', newUsers: 385, churn: 72 },
  ];

  // Feature usage data
  const featureUsageData = [
    { name: 'Review Monitoring', usage: 92 },
    { name: 'AI Responses', usage: 78 },
    { name: 'Review Requests', usage: 63 },
    { name: 'Competitor Analysis', usage: 45 },
    { name: 'Integrations', usage: 85 },
  ];

  // User acquisition source data
  const acquisitionSourceData = [
    { name: 'Organic Search', value: 40 },
    { name: 'Direct', value: 25 },
    { name: 'Referral', value: 15 },
    { name: 'Social Media', value: 12 },
    { name: 'Paid Ads', value: 8 },
  ];

  // Support ticket data
  const supportTicketData = [
    { status: 'Open', count: 18 },
    { status: 'In Progress', count: 12 },
    { status: 'Resolved', count: 87 },
  ];

  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
  const PLAN_COLORS = ['#8884d8', '#14b8a6', '#ff9800'];

  // Custom tooltip for bar chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-md shadow-sm p-2 text-xs">
          <p className="font-medium">{label}</p>
          <p className="text-primary">{`Revenue: $${payload[0].value.toLocaleString()}`}</p>
          <p className="text-secondary">{`Users: ${payload[1].value}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Overview of system performance, users, and revenue</p>
        </div>
        <div className="flex items-center gap-4">
          <Select
            value={timeRange}
            onValueChange={setTimeRange}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 Days</SelectItem>
              <SelectItem value="30days">Last 30 Days</SelectItem>
              <SelectItem value="90days">Last 90 Days</SelectItem>
              <SelectItem value="6months">Last 6 Months</SelectItem>
              <SelectItem value="1year">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export Data
          </Button>
        </div>
      </div>

      {/* Dashboard Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {businessMetrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
                    metric.changeType === 'increase' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {metric.changeType === 'increase' ? (
                      <ArrowUpRight className="h-3 w-3" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3" />
                    )}
                    {metric.change}%
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-sm font-medium text-muted-foreground">
                    {metric.name}
                  </p>
                  <h3 className="text-2xl font-bold">{metric.value}</h3>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Dashboard Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="usage">Platform Usage</TabsTrigger>
          <TabsTrigger value="support">Support</TabsTrigger>
          <TabsTrigger value="system">System Health</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="md:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base font-medium">Business Metrics</CardTitle>
                <Select
                  value={chartView}
                  onValueChange={setChartView}
                >
                  <SelectTrigger className="w-[150px] h-8 text-xs">
                    <SelectValue placeholder="Select chart" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="revenue">Revenue</SelectItem>
                    <SelectItem value="users">User Growth</SelectItem>
                  </SelectContent>
                </Select>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    {chartView === 'revenue' ? (
                      <BarChart 
                        data={revenueData}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                        <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Bar yAxisId="left" dataKey="revenue" fill="#8884d8" name="Revenue ($)" />
                        <Bar yAxisId="right" dataKey="users" fill="#82ca9d" name="Active Users" />
                      </BarChart>
                    ) : (
                      <AreaChart
                        data={userGrowthData}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Area type="monotone" dataKey="newUsers" stroke="#8884d8" fill="#8884d8" name="New Users" />
                        <Area type="monotone" dataKey="churn" stroke="#ff8042" fill="#ff8042" name="Churn" />
                      </AreaChart>
                    )}
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base font-medium">Plan Distribution</CardTitle>
                <CardDescription>User breakdown by subscription plan</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={planDistributionData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {planDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={PLAN_COLORS[index % PLAN_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 space-y-2">
                  {planDistributionData.map((plan, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div 
                          className="w-3 h-3 rounded-full mr-2" 
                          style={{ backgroundColor: PLAN_COLORS[index % PLAN_COLORS.length] }}
                        />
                        <span className="text-sm">{plan.name}</span>
                      </div>
                      <span className="text-sm font-medium">{plan.value}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-medium">Recent Signups</CardTitle>
                <CardDescription>Latest users to join the platform</CardDescription>
              </CardHeader>
              <CardContent>
                {recentUsersLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User</TableHead>
                          <TableHead>Plan</TableHead>
                          <TableHead>Joined</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {/* This would be populated with real data from API */}
                        <TableRow>
                          <TableCell className="font-medium">
                            <div className="flex items-center">
                              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center mr-2">
                                <User className="h-4 w-4" />
                              </div>
                              <div>
                                <div className="font-medium">Sarah Johnson</div>
                                <div className="text-xs text-muted-foreground">sarah@example.com</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-purple-100 text-purple-800">Pro</Badge>
                          </TableCell>
                          <TableCell>Today</TableCell>
                          <TableCell>
                            <Badge className="bg-green-100 text-green-800">Active</Badge>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">
                            <div className="flex items-center">
                              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center mr-2">
                                <User className="h-4 w-4" />
                              </div>
                              <div>
                                <div className="font-medium">Michael Clark</div>
                                <div className="text-xs text-muted-foreground">mike@example.com</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">Free</Badge>
                          </TableCell>
                          <TableCell>Yesterday</TableCell>
                          <TableCell>
                            <Badge className="bg-green-100 text-green-800">Active</Badge>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">
                            <div className="flex items-center">
                              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center mr-2">
                                <User className="h-4 w-4" />
                              </div>
                              <div>
                                <div className="font-medium">Dental Care Inc.</div>
                                <div className="text-xs text-muted-foreground">admin@dentalcare.com</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-indigo-100 text-indigo-800">Business</Badge>
                          </TableCell>
                          <TableCell>2 days ago</TableCell>
                          <TableCell>
                            <Badge className="bg-green-100 text-green-800">Active</Badge>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                )}
                <Button variant="link" className="mt-4 px-0">
                  View all users
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base font-medium">Recent Transactions</CardTitle>
                <CardDescription>Latest payments processed</CardDescription>
              </CardHeader>
              <CardContent>
                {transactionsLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Customer</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {/* This would be populated with real data from API */}
                        <TableRow>
                          <TableCell className="font-medium">Sarah Johnson</TableCell>
                          <TableCell>$49.00</TableCell>
                          <TableCell>Today</TableCell>
                          <TableCell>
                            <Badge className="bg-green-100 text-green-800">Completed</Badge>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Dental Care Inc.</TableCell>
                          <TableCell>$149.00</TableCell>
                          <TableCell>Yesterday</TableCell>
                          <TableCell>
                            <Badge className="bg-green-100 text-green-800">Completed</Badge>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Robert Smith</TableCell>
                          <TableCell>$49.00</TableCell>
                          <TableCell>3 days ago</TableCell>
                          <TableCell>
                            <Badge className="bg-green-100 text-green-800">Completed</Badge>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                )}
                <Button variant="link" className="mt-4 px-0">
                  View all transactions
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Customers Tab */}
        <TabsContent value="customers" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="text-base font-medium">User Acquisition</CardTitle>
                <CardDescription>New signups vs churn over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={userGrowthData}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Area 
                        type="monotone" 
                        dataKey="newUsers" 
                        stackId="1"
                        stroke="#8884d8" 
                        fill="#8884d8" 
                        name="New Users" 
                      />
                      <Area 
                        type="monotone" 
                        dataKey="churn" 
                        stackId="2"
                        stroke="#ff8042" 
                        fill="#ff8042" 
                        name="Churn" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base font-medium">Acquisition Sources</CardTitle>
                <CardDescription>Where users are coming from</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={acquisitionSourceData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {acquisitionSourceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-medium">Customer Database</CardTitle>
                <CardDescription>Manage all registered users</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Input placeholder="Search users..." className="w-[200px]" />
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-1" /> Filter
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Locations</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {/* This would show real user data */}
                    <TableRow>
                      <TableCell className="font-medium">Sarah Johnson</TableCell>
                      <TableCell>sarah@example.com</TableCell>
                      <TableCell>
                        <Badge className="bg-purple-100 text-purple-800">Pro</Badge>
                      </TableCell>
                      <TableCell>Jan 12, 2023</TableCell>
                      <TableCell>
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      </TableCell>
                      <TableCell>3</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm">Edit</Button>
                          <Button variant="ghost" size="sm">View</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Michael Clark</TableCell>
                      <TableCell>mike@example.com</TableCell>
                      <TableCell>
                        <Badge variant="outline">Free</Badge>
                      </TableCell>
                      <TableCell>Mar 5, 2023</TableCell>
                      <TableCell>
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      </TableCell>
                      <TableCell>1</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm">Edit</Button>
                          <Button variant="ghost" size="sm">View</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Dental Care Inc.</TableCell>
                      <TableCell>admin@dentalcare.com</TableCell>
                      <TableCell>
                        <Badge className="bg-indigo-100 text-indigo-800">Business</Badge>
                      </TableCell>
                      <TableCell>Feb 18, 2023</TableCell>
                      <TableCell>
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      </TableCell>
                      <TableCell>5</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm">Edit</Button>
                          <Button variant="ghost" size="sm">View</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Dr. Robert Smith</TableCell>
                      <TableCell>drsmith@example.com</TableCell>
                      <TableCell>
                        <Badge className="bg-purple-100 text-purple-800">Pro</Badge>
                      </TableCell>
                      <TableCell>Dec 8, 2022</TableCell>
                      <TableCell>
                        <Badge variant="outline">Inactive</Badge>
                      </TableCell>
                      <TableCell>2</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm">Edit</Button>
                          <Button variant="ghost" size="sm">View</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Revenue Tab */}
        <TabsContent value="revenue" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">MRR</CardTitle>
                <CardDescription>Monthly Recurring Revenue</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$24,512</div>
                <div className="text-xs flex items-center text-green-600 mt-1">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  8.2% from last month
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <div>Goal: $30,000</div>
                  <div>82% achieved</div>
                </div>
                <Progress value={82} className="h-1 mt-1" />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">ARR</CardTitle>
                <CardDescription>Annual Recurring Revenue</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$294,144</div>
                <div className="text-xs flex items-center text-green-600 mt-1">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  12.4% from last year
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <div>Goal: $350,000</div>
                  <div>84% achieved</div>
                </div>
                <Progress value={84} className="h-1 mt-1" />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">ARPU</CardTitle>
                <CardDescription>Average Revenue Per User</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$8.62</div>
                <div className="text-xs flex items-center text-green-600 mt-1">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  3.1% from last month
                </div>
                <Separator className="my-2" />
                <div className="grid grid-cols-2 gap-2 text-xs mt-2">
                  <div className="flex flex-col items-center p-2 border rounded-md">
                    <span className="text-muted-foreground">Free</span>
                    <span className="font-medium">$0</span>
                  </div>
                  <div className="flex flex-col items-center p-2 border rounded-md">
                    <span className="text-muted-foreground">Pro</span>
                    <span className="font-medium">$49</span>
                  </div>
                  <div className="flex flex-col items-center p-2 border rounded-md">
                    <span className="text-muted-foreground">Business</span>
                    <span className="font-medium">$149</span>
                  </div>
                  <div className="flex flex-col items-center p-2 border rounded-md">
                    <span className="text-muted-foreground">Enterprise</span>
                    <span className="font-medium">$499</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">LTV</CardTitle>
                <CardDescription>Customer Lifetime Value</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$412</div>
                <div className="text-xs flex items-center text-green-600 mt-1">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  5.7% from last quarter
                </div>
                <Separator className="my-2" />
                <div className="grid grid-cols-2 gap-2 text-xs mt-2">
                  <div className="flex flex-col items-center p-2 border rounded-md">
                    <span className="text-muted-foreground">Free → Pro</span>
                    <span className="font-medium">18.2%</span>
                  </div>
                  <div className="flex flex-col items-center p-2 border rounded-md">
                    <span className="text-muted-foreground">Avg. Retention</span>
                    <span className="font-medium">9.4 mo</span>
                  </div>
                  <div className="flex flex-col items-center p-2 border rounded-md">
                    <span className="text-muted-foreground">CAC</span>
                    <span className="font-medium">$52</span>
                  </div>
                  <div className="flex flex-col items-center p-2 border rounded-md">
                    <span className="text-muted-foreground">LTV:CAC</span>
                    <span className="font-medium">7.9:1</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base font-medium">Revenue Breakdown</CardTitle>
              <CardDescription>Monthly revenue by plan</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      { month: 'Jan', free: 0, pro: 9200, business: 6200 },
                      { month: 'Feb', free: 0, pro: 10100, business: 7100 },
                      { month: 'Mar', free: 0, pro: 11300, business: 7800 },
                      { month: 'Apr', free: 0, pro: 12600, business: 8900 },
                      { month: 'May', free: 0, pro: 13400, business: 9400 },
                      { month: 'Jun', free: 0, pro: 14100, business: 10000 },
                      { month: 'Jul', free: 0, pro: 14700, business: 10700 },
                    ]}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="pro" stackId="a" name="Pro Plan" fill="#14b8a6" />
                    <Bar dataKey="business" stackId="a" name="Business Plan" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-medium">Subscription Events</CardTitle>
                <CardDescription>Recent upgrades, downgrades, and cancellations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Event</TableHead>
                        <TableHead>From</TableHead>
                        <TableHead>To</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">Sarah Johnson</TableCell>
                        <TableCell>
                          <Badge className="bg-green-100 text-green-800">Upgrade</Badge>
                        </TableCell>
                        <TableCell>Free</TableCell>
                        <TableCell>Pro</TableCell>
                        <TableCell>Today</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Robert Smith</TableCell>
                        <TableCell>
                          <Badge className="bg-red-100 text-red-800">Downgrade</Badge>
                        </TableCell>
                        <TableCell>Business</TableCell>
                        <TableCell>Pro</TableCell>
                        <TableCell>Yesterday</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">James Wilson</TableCell>
                        <TableCell>
                          <Badge className="bg-red-100 text-red-800">Cancelled</Badge>
                        </TableCell>
                        <TableCell>Pro</TableCell>
                        <TableCell>-</TableCell>
                        <TableCell>2 days ago</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Dental Care Inc.</TableCell>
                        <TableCell>
                          <Badge className="bg-green-100 text-green-800">Upgrade</Badge>
                        </TableCell>
                        <TableCell>Pro</TableCell>
                        <TableCell>Business</TableCell>
                        <TableCell>3 days ago</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base font-medium">Revenue Forecast</CardTitle>
                <CardDescription>Projected 12-month revenue</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsLineChart
                      data={[
                        { month: 'Aug', revenue: 26800, projected: true },
                        { month: 'Sep', revenue: 28200, projected: true },
                        { month: 'Oct', revenue: 29600, projected: true },
                        { month: 'Nov', revenue: 31000, projected: true },
                        { month: 'Dec', revenue: 33500, projected: true },
                        { month: 'Jan', revenue: 35000, projected: true },
                      ]}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="revenue" 
                        name="Projected Revenue ($)"
                        stroke="#14b8a6" 
                        strokeDasharray="5 5" 
                        strokeWidth={2}
                        dot={{ r: 4 }}
                      />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Platform Usage Tab */}
        <TabsContent value="usage" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="text-base font-medium">Feature Usage</CardTitle>
                <CardDescription>Most popular features by user engagement</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={featureUsageData}
                      layout="vertical"
                      margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" domain={[0, 100]} />
                      <YAxis type="category" dataKey="name" />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="usage" name="Usage %" fill="#14b8a6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base font-medium">Platform Activity</CardTitle>
                <CardDescription>Daily active usage</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-muted-foreground">
                        Daily Active Users
                      </div>
                      <div className="text-xl font-bold">2,143</div>
                    </div>
                    <div className="flex items-center text-green-600 text-sm">
                      <ArrowUpRight className="h-4 w-4 mr-1" />
                      7.2%
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-muted-foreground">
                        Avg. Session Duration
                      </div>
                      <div className="text-xl font-bold">18m 42s</div>
                    </div>
                    <div className="flex items-center text-green-600 text-sm">
                      <ArrowUpRight className="h-4 w-4 mr-1" />
                      2.8%
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-muted-foreground">
                        Reviews Monitored
                      </div>
                      <div className="text-xl font-bold">142,857</div>
                    </div>
                    <div className="flex items-center text-green-600 text-sm">
                      <ArrowUpRight className="h-4 w-4 mr-1" />
                      12.3%
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-muted-foreground">
                        AI Responses Generated
                      </div>
                      <div className="text-xl font-bold">24,382</div>
                    </div>
                    <div className="flex items-center text-green-600 text-sm">
                      <ArrowUpRight className="h-4 w-4 mr-1" />
                      18.5%
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-medium">Review Activity</CardTitle>
                <CardDescription>Reviews processed by platform</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { platform: 'Google', reviews: 48500 },
                        { platform: 'Yelp', reviews: 34200 },
                        { platform: 'Facebook', reviews: 18700 },
                        { platform: 'Apple Maps', reviews: 12300 },
                        { platform: 'Other', reviews: 8200 },
                      ]}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="platform" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="reviews" name="Reviews" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base font-medium">API Usage</CardTitle>
                <CardDescription>Requests by endpoint type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Review Fetch', value: 45 },
                          { name: 'AI Response', value: 25 },
                          { name: 'Analytics', value: 15 },
                          { name: 'User Management', value: 10 },
                          { name: 'Misc', value: 5 },
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {COLORS.map((color, index) => (
                          <Cell key={`cell-${index}`} fill={color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base font-medium">User Engagement Timeline</CardTitle>
              <CardDescription>Key user activities over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative border-l-2 border-muted ml-3 pl-8 pb-2 space-y-8">
                <div className="absolute w-4 h-4 rounded-full bg-primary -left-[9px] top-0" />
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium">Today</span>
                    <Badge className="bg-green-100 text-green-800">128 New Users</Badge>
                    <Badge className="bg-blue-100 text-blue-800">2,481 Active Sessions</Badge>
                    <Badge className="bg-purple-100 text-purple-800">1,248 Reviews Imported</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Peak activity time was 2pm-4pm EST with 542 concurrent users.
                  </p>
                </div>
                
                <div className="absolute w-4 h-4 rounded-full bg-muted -left-[9px] top-[100px]" />
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium">Yesterday</span>
                    <Badge className="bg-green-100 text-green-800">112 New Users</Badge>
                    <Badge className="bg-blue-100 text-blue-800">2,345 Active Sessions</Badge>
                    <Badge className="bg-purple-100 text-purple-800">1,193 Reviews Imported</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Feature update to AI response generator resulted in 28% increased usage.
                  </p>
                </div>
                
                <div className="absolute w-4 h-4 rounded-full bg-muted -left-[9px] top-[200px]" />
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium">July 8, 2023</span>
                    <Badge className="bg-green-100 text-green-800">98 New Users</Badge>
                    <Badge className="bg-blue-100 text-blue-800">2,267 Active Sessions</Badge>
                    <Badge className="bg-purple-100 text-purple-800">1,054 Reviews Imported</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Apple Maps integration launched. 287 users connected their Apple accounts.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Support Tab */}
        <TabsContent value="support" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">Support Tickets</CardTitle>
                <CardDescription>Overview of current support load</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={supportTicketData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        <Cell key="cell-0" fill="#ef4444" />
                        <Cell key="cell-1" fill="#f97316" />
                        <Cell key="cell-2" fill="#22c55e" />
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-2 grid grid-cols-3 gap-2 text-center">
                  <div className="space-y-1">
                    <div className="text-xs font-medium text-muted-foreground">Open</div>
                    <div className="text-xl font-bold text-red-600">18</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs font-medium text-muted-foreground">In Progress</div>
                    <div className="text-xl font-bold text-orange-600">12</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs font-medium text-muted-foreground">Resolved</div>
                    <div className="text-xl font-bold text-green-600">87</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">Response Time</CardTitle>
                <CardDescription>Average ticket resolution metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <div className="text-sm font-medium">First Response</div>
                      <div className="text-sm font-medium">1h 12m</div>
                    </div>
                    <Progress value={75} className="h-2" />
                    <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                      <div>Target: 2h</div>
                      <div className="text-green-600">Ahead by 48m</div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <div className="text-sm font-medium">Resolution Time</div>
                      <div className="text-sm font-medium">8h 34m</div>
                    </div>
                    <Progress value={85} className="h-2" />
                    <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                      <div>Target: 12h</div>
                      <div className="text-green-600">Ahead by 3h 26m</div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <div className="text-sm font-medium">Customer Satisfaction</div>
                      <div className="text-sm font-medium">4.8/5</div>
                    </div>
                    <Progress value={96} className="h-2" />
                    <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                      <div>Target: 4.5/5</div>
                      <div className="text-green-600">Above target</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">Common Issues</CardTitle>
                <CardDescription>Most reported problems this month</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <div className="text-sm font-medium flex items-center">
                        <Link className="h-4 w-4 mr-1" />
                        Integration Issues
                      </div>
                      <div className="text-sm font-medium">32%</div>
                    </div>
                    <Progress value={32} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <div className="text-sm font-medium flex items-center">
                        <Star className="h-4 w-4 mr-1" />
                        Review Fetch Errors
                      </div>
                      <div className="text-sm font-medium">28%</div>
                    </div>
                    <Progress value={28} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <div className="text-sm font-medium flex items-center">
                        <User className="h-4 w-4 mr-1" />
                        Account Settings
                      </div>
                      <div className="text-sm font-medium">18%</div>
                    </div>
                    <Progress value={18} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <div className="text-sm font-medium flex items-center">
                        <MessageSquare className="h-4 w-4 mr-1" />
                        AI Response Quality
                      </div>
                      <div className="text-sm font-medium">12%</div>
                    </div>
                    <Progress value={12} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <div className="text-sm font-medium flex items-center">
                        <Bell className="h-4 w-4 mr-1" />
                        Notification Issues
                      </div>
                      <div className="text-sm font-medium">10%</div>
                    </div>
                    <Progress value={10} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-medium">Recent Support Tickets</CardTitle>
                <CardDescription>Active and recently resolved tickets</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Select defaultValue="all">
                  <SelectTrigger className="w-[130px] h-8 text-xs">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Tickets</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-1" /> Filter
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ticket ID</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Last Update</TableHead>
                      <TableHead>Assigned To</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">#1842</TableCell>
                      <TableCell>Cannot fetch Google reviews</TableCell>
                      <TableCell>sarah@example.com</TableCell>
                      <TableCell>
                        <Badge className="bg-red-100 text-red-800">Open</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-red-800 border-red-800">High</Badge>
                      </TableCell>
                      <TableCell>Today, 10:24 AM</TableCell>
                      <TableCell>Today, 10:32 AM</TableCell>
                      <TableCell>Alex Thompson</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">#1841</TableCell>
                      <TableCell>AI responses not generating</TableCell>
                      <TableCell>drsmith@example.com</TableCell>
                      <TableCell>
                        <Badge className="bg-orange-100 text-orange-800">In Progress</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-orange-800 border-orange-800">Medium</Badge>
                      </TableCell>
                      <TableCell>Today, 9:15 AM</TableCell>
                      <TableCell>Today, 11:02 AM</TableCell>
                      <TableCell>Maria Garcia</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">#1840</TableCell>
                      <TableCell>Need to add more locations</TableCell>
                      <TableCell>admin@dentalcare.com</TableCell>
                      <TableCell>
                        <Badge className="bg-orange-100 text-orange-800">In Progress</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-blue-800 border-blue-800">Low</Badge>
                      </TableCell>
                      <TableCell>Yesterday, 4:32 PM</TableCell>
                      <TableCell>Today, 9:45 AM</TableCell>
                      <TableCell>James Wilson</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">#1839</TableCell>
                      <TableCell>Billing question about plan limits</TableCell>
                      <TableCell>mike@example.com</TableCell>
                      <TableCell>
                        <Badge className="bg-green-100 text-green-800">Resolved</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-blue-800 border-blue-800">Low</Badge>
                      </TableCell>
                      <TableCell>Yesterday, 2:18 PM</TableCell>
                      <TableCell>Yesterday, 3:47 PM</TableCell>
                      <TableCell>Alex Thompson</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Health Tab */}
        <TabsContent value="system" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">Server Status</CardTitle>
                <CardDescription>Current system health</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-4">
                  <div className="inline-flex items-center justify-center rounded-full p-4 bg-green-100">
                    <CheckCircle2 className="h-12 w-12 text-green-600" />
                  </div>
                  <h3 className="mt-2 text-xl font-semibold text-green-600">All Systems Online</h3>
                  <p className="text-sm text-muted-foreground mt-1">Last incident: 13 days ago</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">API Performance</CardTitle>
                <CardDescription>Average response times</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <div className="text-sm font-medium">GET Requests</div>
                      <div className="text-sm font-medium">78ms</div>
                    </div>
                    <Progress value={78} className="h-2" />
                    <div className="mt-1 text-xs text-muted-foreground">
                      Target: &lt;100ms
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <div className="text-sm font-medium">POST Requests</div>
                      <div className="text-sm font-medium">124ms</div>
                    </div>
                    <Progress value={82} className="h-2" />
                    <div className="mt-1 text-xs text-muted-foreground">
                      Target: &lt;150ms
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <div className="text-sm font-medium">AI Generation</div>
                      <div className="text-sm font-medium">890ms</div>
                    </div>
                    <Progress value={89} className="h-2" />
                    <div className="mt-1 text-xs text-muted-foreground">
                      Target: &lt;1s
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">Error Rate</CardTitle>
                <CardDescription>System errors over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[150px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsLineChart
                      data={[
                        { day: 'Mon', errors: 0.8 },
                        { day: 'Tue', errors: 0.6 },
                        { day: 'Wed', errors: 0.9 },
                        { day: 'Thu', errors: 0.4 },
                        { day: 'Fri', errors: 0.3 },
                        { day: 'Sat', errors: 0.2 },
                        { day: 'Sun', errors: 0.5 },
                      ]}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="errors" 
                        stroke="#ef4444" 
                        name="Error Rate (%)"
                      />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-2 text-center">
                  <div className="text-3xl font-bold text-green-600">0.5%</div>
                  <div className="text-xs text-muted-foreground">
                    7-day average error rate
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">Server Resources</CardTitle>
                <CardDescription>Current usage metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <div className="text-sm font-medium">CPU Usage</div>
                      <div className="text-sm font-medium">42%</div>
                    </div>
                    <Progress value={42} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <div className="text-sm font-medium">Memory Usage</div>
                      <div className="text-sm font-medium">68%</div>
                    </div>
                    <Progress value={68} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <div className="text-sm font-medium">Disk Usage</div>
                      <div className="text-sm font-medium">54%</div>
                    </div>
                    <Progress value={54} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <div className="text-sm font-medium">Network</div>
                      <div className="text-sm font-medium">35%</div>
                    </div>
                    <Progress value={35} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-medium">Database Metrics</CardTitle>
                <CardDescription>Database performance and size</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Database Size</h3>
                      <div className="text-2xl font-bold">12.8 GB</div>
                      <p className="text-xs text-muted-foreground">Growing at ~400MB/month</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Query Performance</h3>
                      <div className="text-2xl font-bold">42ms</div>
                      <p className="text-xs text-muted-foreground">Average query time</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Connection Pool</h3>
                      <div className="text-2xl font-bold">32/50</div>
                      <p className="text-xs text-muted-foreground">Active connections</p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="text-sm font-medium mb-2">Table Sizes</h3>
                    <div className="space-y-2">
                      <div>
                        <div className="flex justify-between mb-1">
                          <div className="text-xs">reviews</div>
                          <div className="text-xs">8.2 GB</div>
                        </div>
                        <Progress value={82} className="h-1" />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <div className="text-xs">users</div>
                          <div className="text-xs">1.4 GB</div>
                        </div>
                        <Progress value={14} className="h-1" />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <div className="text-xs">locations</div>
                          <div className="text-xs">0.8 GB</div>
                        </div>
                        <Progress value={8} className="h-1" />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <div className="text-xs">metrics</div>
                          <div className="text-xs">1.8 GB</div>
                        </div>
                        <Progress value={18} className="h-1" />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <div className="text-xs">other</div>
                          <div className="text-xs">0.6 GB</div>
                        </div>
                        <Progress value={6} className="h-1" />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base font-medium">External Integrations</CardTitle>
                <CardDescription>Status of third-party service connections</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Service</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Latency</TableHead>
                        <TableHead>Last Check</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">Google Places API</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <div className="mr-2 h-2.5 w-2.5 rounded-full bg-green-500"></div>
                            Operational
                          </div>
                        </TableCell>
                        <TableCell>214ms</TableCell>
                        <TableCell>2 min ago</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Yelp API</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <div className="mr-2 h-2.5 w-2.5 rounded-full bg-green-500"></div>
                            Operational
                          </div>
                        </TableCell>
                        <TableCell>287ms</TableCell>
                        <TableCell>4 min ago</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Facebook Graph API</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <div className="mr-2 h-2.5 w-2.5 rounded-full bg-green-500"></div>
                            Operational
                          </div>
                        </TableCell>
                        <TableCell>312ms</TableCell>
                        <TableCell>3 min ago</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">OpenAI API</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <div className="mr-2 h-2.5 w-2.5 rounded-full bg-green-500"></div>
                            Operational
                          </div>
                        </TableCell>
                        <TableCell>587ms</TableCell>
                        <TableCell>1 min ago</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Apple Maps API</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <div className="mr-2 h-2.5 w-2.5 rounded-full bg-yellow-500"></div>
                            Degraded
                          </div>
                        </TableCell>
                        <TableCell>645ms</TableCell>
                        <TableCell>5 min ago</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base font-medium">System Events</CardTitle>
              <CardDescription>Recent system activities and deployments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative border-l-2 border-muted ml-3 pl-8 pb-2 space-y-8">
                <div className="absolute w-4 h-4 rounded-full bg-primary -left-[9px] top-0" />
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Today, 9:24 AM</span>
                    <Badge className="bg-green-100 text-green-800">Deployment</Badge>
                  </div>
                  <p className="text-sm">
                    Deployed v2.8.3: Added Apple Maps integration and fixed review fetching issues.
                  </p>
                </div>
                
                <div className="absolute w-4 h-4 rounded-full bg-muted -left-[9px] top-[100px]" />
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Yesterday, 3:15 PM</span>
                    <Badge className="bg-yellow-100 text-yellow-800">Incident</Badge>
                  </div>
                  <p className="text-sm">
                    Temporary API latency increase due to database maintenance. Resolved within 28 minutes.
                  </p>
                </div>
                
                <div className="absolute w-4 h-4 rounded-full bg-muted -left-[9px] top-[200px]" />
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">July 10, 2023</span>
                    <Badge className="bg-blue-100 text-blue-800">Scaling</Badge>
                  </div>
                  <p className="text-sm">
                    Added additional database read replicas to handle increased traffic.
                  </p>
                </div>
                
                <div className="absolute w-4 h-4 rounded-full bg-muted -left-[9px] top-[300px]" />
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">July 8, 2023</span>
                    <Badge className="bg-green-100 text-green-800">Deployment</Badge>
                  </div>
                  <p className="text-sm">
                    Deployed v2.8.2: Enhanced AI response generation and competitor analysis features.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboardPage;