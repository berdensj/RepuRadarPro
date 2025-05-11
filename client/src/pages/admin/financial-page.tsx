import { useQuery } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Calendar,
  CreditCard,
  DollarSign,
  Users,
  ArrowUpRight,
  TrendingDown,
  Download
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

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
  revenue_by_plan: {
    free: number;
    professional: number;
    business: number;
    enterprise: number;
  };
  new_subscriptions: number;
  upgrades: number;
  cancellations: number;
  renewal_rate: number;
}

interface Transaction {
  id: string;
  userId: number;
  userName: string;
  amount: number;
  type: string;
  plan: string;
  status: string;
  date: string;
}

export default function AdminFinancialPage() {
  const { data: financialData, isLoading } = useQuery<FinancialData>({
    queryKey: ["/api/admin/financial"],
  });
  
  const { data: recentTransactions, isLoading: isLoadingTransactions } = useQuery<Transaction[]>({
    queryKey: ["/api/admin/transactions/recent"],
  });
  
  // Helper function to format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };
  
  return (
    <AdminLayout>
      <div className="space-y-4 p-4 md:p-8">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Financial Dashboard</h2>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Select defaultValue="may">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select month" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="may">May 2025</SelectItem>
                <SelectItem value="april">April 2025</SelectItem>
                <SelectItem value="march">March 2025</SelectItem>
                <SelectItem value="february">February 2025</SelectItem>
                <SelectItem value="january">January 2025</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Monthly Recurring Revenue
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-28" />
              ) : (
                <>
                  <div className="text-2xl font-bold">
                    {formatCurrency(financialData?.mrr || 0)}
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
              {isLoading ? (
                <Skeleton className="h-8 w-28" />
              ) : (
                <>
                  <div className="text-2xl font-bold">
                    {formatCurrency(financialData?.arr || 0)}
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
                Customer Lifetime Value
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-28" />
              ) : (
                <>
                  <div className="text-2xl font-bold">
                    {formatCurrency(financialData?.ltv || 0)}
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
              {isLoading ? (
                <Skeleton className="h-8 w-28" />
              ) : (
                <>
                  <div className="text-2xl font-bold">
                    {formatCurrency(financialData?.cac || 0)}
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
        
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Revenue Overview</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="col-span-2 md:col-span-1">
                <CardHeader>
                  <CardTitle>Revenue by Plan</CardTitle>
                  <CardDescription>
                    Distribution of revenue across subscription tiers
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
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
                            <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mr-2"></div>
                            <span>Enterprise</span>
                          </div>
                          <span className="font-medium">{formatCurrency(financialData?.revenue_by_plan.enterprise || 0)}</span>
                        </div>
                        <div className="h-2 w-full bg-purple-500/10 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-purple-500 rounded-full" 
                            style={{ 
                              width: `${Math.min(100, ((financialData?.revenue_by_plan.enterprise || 0) / 
                                ((financialData?.revenue_by_plan.enterprise || 0) + 
                                (financialData?.revenue_by_plan.business || 0) + 
                                (financialData?.revenue_by_plan.professional || 0) + 
                                (financialData?.revenue_by_plan.free || 0))) * 100)}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2"></div>
                            <span>Business</span>
                          </div>
                          <span className="font-medium">{formatCurrency(financialData?.revenue_by_plan.business || 0)}</span>
                        </div>
                        <div className="h-2 w-full bg-blue-500/10 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-500 rounded-full" 
                            style={{ 
                              width: `${Math.min(100, ((financialData?.revenue_by_plan.business || 0) / 
                                ((financialData?.revenue_by_plan.enterprise || 0) + 
                                (financialData?.revenue_by_plan.business || 0) + 
                                (financialData?.revenue_by_plan.professional || 0) + 
                                (financialData?.revenue_by_plan.free || 0))) * 100)}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 mr-2"></div>
                            <span>Professional</span>
                          </div>
                          <span className="font-medium">{formatCurrency(financialData?.revenue_by_plan.professional || 0)}</span>
                        </div>
                        <div className="h-2 w-full bg-green-500/10 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-green-500 rounded-full" 
                            style={{ 
                              width: `${Math.min(100, ((financialData?.revenue_by_plan.professional || 0) / 
                                ((financialData?.revenue_by_plan.enterprise || 0) + 
                                (financialData?.revenue_by_plan.business || 0) + 
                                (financialData?.revenue_by_plan.professional || 0) + 
                                (financialData?.revenue_by_plan.free || 0))) * 100)}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center">
                            <div className="w-1.5 h-1.5 rounded-full bg-gray-500 mr-2"></div>
                            <span>Free</span>
                          </div>
                          <span className="font-medium">{formatCurrency(financialData?.revenue_by_plan.free || 0)}</span>
                        </div>
                        <div className="h-2 w-full bg-gray-500/10 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gray-500 rounded-full" 
                            style={{ 
                              width: `${Math.min(100, ((financialData?.revenue_by_plan.free || 0) / 
                                ((financialData?.revenue_by_plan.enterprise || 0) + 
                                (financialData?.revenue_by_plan.business || 0) + 
                                (financialData?.revenue_by_plan.professional || 0) + 
                                (financialData?.revenue_by_plan.free || 0))) * 100)}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card className="col-span-2 md:col-span-1">
                <CardHeader>
                  <CardTitle>Key Metrics</CardTitle>
                  <CardDescription>
                    This month's performance indicators
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">New Subscriptions</h4>
                        <div className="flex items-center gap-2">
                          <span className="text-xl font-bold">{financialData?.new_subscriptions}</span>
                          <Badge className="bg-green-500" variant="secondary">+{financialData?.new_subscriptions}%</Badge>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">Upgrades</h4>
                        <div className="flex items-center gap-2">
                          <span className="text-xl font-bold">{financialData?.upgrades}</span>
                          <Badge className="bg-blue-500" variant="secondary">+{financialData?.upgrades}%</Badge>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">Cancellations</h4>
                        <div className="flex items-center gap-2">
                          <span className="text-xl font-bold">{financialData?.cancellations}</span>
                          <Badge className="bg-red-500" variant="secondary">-{financialData?.cancellations}%</Badge>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">Renewal Rate</h4>
                        <div className="flex items-center gap-2">
                          <span className="text-xl font-bold">{financialData?.renewal_rate}%</span>
                          <Badge className="bg-green-500" variant="secondary">+2%</Badge>
                        </div>
                      </div>
                      
                      <div className="col-span-2">
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">Conversion Rate</h4>
                        <div className="flex items-center gap-2">
                          <span className="text-xl font-bold">{financialData?.conversion_rate}%</span>
                          {financialData?.conversion_change! > 0 ? (
                            <Badge className="bg-green-500" variant="secondary">+{financialData?.conversion_change}%</Badge>
                          ) : (
                            <Badge className="bg-red-500" variant="secondary">{financialData?.conversion_change}%</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card className="col-span-2">
                <CardHeader>
                  <CardTitle>Monthly Revenue Trend</CardTitle>
                  <CardDescription>
                    Historical revenue data over the last 12 months
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-[300px] flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <BarChart className="h-8 w-8 mx-auto mb-2" />
                    <p>Revenue trend chart will be displayed here</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="transactions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>
                  Latest financial transactions across the platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Transaction ID</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Plan</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoadingTransactions ? (
                        Array.from({ length: 5 }).map((_, i) => (
                          <TableRow key={i}>
                            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                          </TableRow>
                        ))
                      ) : (recentTransactions?.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell className="font-medium">{transaction.id}</TableCell>
                          <TableCell>{transaction.userName}</TableCell>
                          <TableCell>
                            {transaction.type === 'subscription' ? (
                              <Badge variant="outline" className="border-green-500 text-green-600">Subscription</Badge>
                            ) : transaction.type === 'refund' ? (
                              <Badge variant="outline" className="border-red-500 text-red-600">Refund</Badge>
                            ) : (
                              <Badge variant="outline">One-time</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {transaction.plan === 'enterprise' ? (
                              <Badge className="bg-purple-600">Enterprise</Badge>
                            ) : transaction.plan === 'business' ? (
                              <Badge className="bg-blue-600">Business</Badge>
                            ) : transaction.plan === 'professional' ? (
                              <Badge className="bg-green-600">Professional</Badge>
                            ) : (
                              <Badge variant="outline">Free</Badge>
                            )}
                          </TableCell>
                          <TableCell className={transaction.type === 'refund' ? 'text-red-600' : ''}>
                            {transaction.type === 'refund' ? '-' : ''}{formatCurrency(transaction.amount)}
                          </TableCell>
                          <TableCell>
                            {transaction.status === 'completed' ? (
                              <Badge className="bg-green-600">Completed</Badge>
                            ) : transaction.status === 'pending' ? (
                              <Badge variant="outline" className="border-amber-500 text-amber-600">Pending</Badge>
                            ) : (
                              <Badge variant="destructive">Failed</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            {new Date(transaction.date).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      )))}
                    </TableBody>
                  </Table>
                </div>
                
                <div className="flex items-center justify-center mt-4">
                  <Button variant="outline">View All Transactions</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="subscriptions" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Active Subscriptions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">2,845</div>
                  <p className="text-xs text-muted-foreground">
                    +385 new this month
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Plan Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Free:</p>
                      <p className="font-medium">1,248</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Professional:</p>
                      <p className="font-medium">974</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Business:</p>
                      <p className="font-medium">512</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Enterprise:</p>
                      <p className="font-medium">111</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Renewal Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between items-end">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                      <span className="text-2xl font-bold">93.2%</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      +2.1% from previous period
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Subscription Trends</CardTitle>
                <CardDescription>
                  Monthly subscription growth and churn
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[300px] flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <BarChart className="h-8 w-8 mx-auto mb-2" />
                  <p>Subscription trend chart will be displayed here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}