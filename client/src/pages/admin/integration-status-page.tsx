import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertTriangle,
  Clock,
  RefreshCw,
  CheckCircle,
  XCircle,
  Info,
  ExternalLink,
  Download,
  ArrowUpDown,
  Calendar,
  RotateCw,
  EyeOff
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface IntegrationStatus {
  id: string;
  name: string;
  status: "operational" | "degraded" | "down";
  lastSync: string;
  syncCount: number;
  errorCount: number;
  responseTime: number;
  availability: number;
  throttled: boolean;
  nextSyncScheduled: string;
}

interface ErrorLog {
  id: string;
  timestamp: string;
  integration: string;
  errorType: string;
  errorMessage: string;
  statusCode?: number;
  count: number;
  resolved: boolean;
}

export default function AdminIntegrationStatusPage() {
  const [dateFilter, setDateFilter] = useState("24h");

  // Fetch integration statuses
  const { data: integrations, isLoading: isLoadingIntegrations, refetch: refetchIntegrations } = useQuery<IntegrationStatus[]>({
    queryKey: ["/api/admin/integrations/status"],
  });

  // Fetch error logs
  const { data: errorLogs, isLoading: isLoadingErrorLogs } = useQuery<ErrorLog[]>({
    queryKey: ["/api/admin/integrations/errors", dateFilter],
  });

  // Calculate overall system health
  const overallHealth = integrations
    ? integrations.every(i => i.status === "operational")
      ? "operational"
      : integrations.some(i => i.status === "down")
        ? "critical"
        : "degraded"
    : null;

  // Group errors by integration
  const errorsByIntegration = errorLogs
    ? errorLogs.reduce((acc, error) => {
        if (!acc[error.integration]) {
          acc[error.integration] = [];
        }
        acc[error.integration].push(error);
        return acc;
      }, {} as Record<string, ErrorLog[]>)
    : {};

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Calculate time since last sync
  const getTimeSince = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHr = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHr / 24);

    if (diffDay > 0) {
      return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
    } else if (diffHr > 0) {
      return `${diffHr} hour${diffHr > 1 ? 's' : ''} ago`;
    } else if (diffMin > 0) {
      return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "operational":
        return "bg-green-500";
      case "degraded":
        return "bg-amber-500";
      case "down":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  // Handle manual sync trigger
  const triggerSync = (integrationId: string) => {
    console.log(`Triggering sync for integration: ${integrationId}`);
    // In a real implementation, this would call an API endpoint
    alert(`Sync triggered for ${integrationId}`);
  };

  return (
    <AdminLayout pageTitle="Integration Status">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">System Health Monitoring</h2>
            <p className="text-muted-foreground">
              Monitor the health and status of review platform integrations
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-muted-foreground text-sm hidden md:inline-block">
              Last updated:
            </span>
            <span className="text-sm font-medium hidden md:inline-block">
              {new Date().toLocaleString()}
            </span>
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2"
              onClick={() => refetchIntegrations()}
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>
        
        {/* Overall Status Card */}
        <Card className="border-2 border-primary">
          <CardHeader className="pb-2">
            <CardTitle>System Integration Status</CardTitle>
            <CardDescription>Current status of all review platform integrations</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingIntegrations ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-6 w-3/4" />
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  {overallHealth === "operational" ? (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="h-8 w-8" />
                      <div>
                        <p className="text-xl font-bold">All Integrations Operational</p>
                        <p className="text-sm text-muted-foreground">
                          All review platforms are connected and syncing properly
                        </p>
                      </div>
                    </div>
                  ) : overallHealth === "critical" ? (
                    <div className="flex items-center gap-2 text-red-600">
                      <XCircle className="h-8 w-8" />
                      <div>
                        <p className="text-xl font-bold">Critical Integration Issues</p>
                        <p className="text-sm text-muted-foreground">
                          One or more integrations are down and not functioning
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-amber-600">
                      <AlertTriangle className="h-8 w-8" />
                      <div>
                        <p className="text-xl font-bold">Degraded Integration Performance</p>
                        <p className="text-sm text-muted-foreground">
                          Some integrations are experiencing issues or delays
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                      <Clock className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Last Full Sync</p>
                      <p className="text-sm text-muted-foreground">
                        {integrations && integrations.length > 0
                          ? getTimeSince(
                              integrations
                                .map(i => new Date(i.lastSync).getTime())
                                .sort((a, b) => b - a)[0]
                                .toString()
                            )
                          : "Never"}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                      <RotateCw className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Sync Success Rate</p>
                      <p className="text-sm text-muted-foreground">
                        {integrations
                          ? Math.round(
                              (integrations.filter(i => i.status === "operational").length /
                                Math.max(integrations.length, 1)) *
                                100
                            )
                          : 0}% across all platforms
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                      <AlertTriangle className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Active Issues</p>
                      <p className="text-sm text-muted-foreground">
                        {errorLogs
                          ? errorLogs.filter(e => !e.resolved).length
                          : 0} unresolved errors
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Integration Status Cards */}
          <div className="xl:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Integration Platform Status</CardTitle>
                <CardDescription>
                  Status and performance of each review platform integration
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-5">
                  {isLoadingIntegrations
                    ? Array(3).fill(0).map((_, i) => (
                        <div key={i} className="space-y-2">
                          <Skeleton className="h-6 w-1/4" />
                          <Skeleton className="h-12 w-full" />
                        </div>
                      ))
                    : integrations?.map(integration => (
                        <div key={integration.id} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-3 h-3 rounded-full ${getStatusColor(
                                  integration.status
                                )}`}
                              />
                              <h3 className="text-base font-medium">{integration.name}</h3>
                            </div>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="gap-1">
                                  <Info className="h-4 w-4" />
                                  <span className="hidden md:inline">Details</span>
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>{integration.name} Integration Details</DialogTitle>
                                  <DialogDescription>
                                    Detailed performance metrics and status
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                      <p className="text-sm font-medium">Status</p>
                                      <Badge 
                                        className={integration.status === "operational"
                                          ? "bg-green-500"
                                          : integration.status === "degraded"
                                            ? "bg-amber-500"
                                            : "bg-red-500"
                                        }
                                      >
                                        {integration.status.charAt(0).toUpperCase() + integration.status.slice(1)}
                                      </Badge>
                                    </div>
                                    <div className="space-y-1">
                                      <p className="text-sm font-medium">Last Sync</p>
                                      <p className="text-sm">{formatDate(integration.lastSync)}</p>
                                    </div>
                                    <div className="space-y-1">
                                      <p className="text-sm font-medium">Reviews Synced</p>
                                      <p className="text-sm">{integration.syncCount.toLocaleString()}</p>
                                    </div>
                                    <div className="space-y-1">
                                      <p className="text-sm font-medium">Error Count</p>
                                      <p className="text-sm">{integration.errorCount}</p>
                                    </div>
                                    <div className="space-y-1">
                                      <p className="text-sm font-medium">Average Response Time</p>
                                      <p className="text-sm">{integration.responseTime}ms</p>
                                    </div>
                                    <div className="space-y-1">
                                      <p className="text-sm font-medium">API Rate Limiting</p>
                                      <Badge variant={integration.throttled ? "destructive" : "outline"}>
                                        {integration.throttled ? "Throttled" : "Normal"}
                                      </Badge>
                                    </div>
                                    <div className="space-y-1">
                                      <p className="text-sm font-medium">Next Scheduled Sync</p>
                                      <p className="text-sm">{formatDate(integration.nextSyncScheduled)}</p>
                                    </div>
                                    <div className="space-y-1">
                                      <p className="text-sm font-medium">Availability</p>
                                      <p className="text-sm">{integration.availability}%</p>
                                    </div>
                                  </div>
                                  
                                  <div className="pt-4">
                                    <Button className="w-full gap-2" onClick={() => triggerSync(integration.id)}>
                                      <RefreshCw className="h-4 w-4" />
                                      Trigger Manual Sync
                                    </Button>
                                  </div>
                                  
                                  <div className="pt-2 text-center">
                                    <a
                                      href="#"
                                      className="text-sm text-primary inline-flex items-center gap-1"
                                    >
                                      View in platform dashboard
                                      <ExternalLink className="h-3 w-3" />
                                    </a>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
                          
                          <div className="bg-muted/50 rounded-md p-4">
                            <div className="flex flex-col md:flex-row justify-between mb-2">
                              <div className="flex gap-4 mb-2 md:mb-0">
                                <div>
                                  <p className="text-xs text-muted-foreground">Status</p>
                                  <p className="text-sm font-medium capitalize">{integration.status}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground">Last Sync</p>
                                  <p className="text-sm font-medium">{getTimeSince(integration.lastSync)}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground">Response Time</p>
                                  <p className="text-sm font-medium">{integration.responseTime}ms</p>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => triggerSync(integration.id)}
                                  className="h-8 text-xs gap-1"
                                >
                                  <RefreshCw className="h-3 w-3" />
                                  Sync Now
                                </Button>
                                {integration.status !== "operational" && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 text-xs gap-1"
                                  >
                                    <EyeOff className="h-3 w-3" />
                                    Mute Alerts
                                  </Button>
                                )}
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex justify-between text-xs">
                                <span>Error Rate</span>
                                <span className="font-medium">
                                  {integration.syncCount > 0
                                    ? ((integration.errorCount / integration.syncCount) * 100).toFixed(1)
                                    : 0}%
                                </span>
                              </div>
                              <Progress
                                value={
                                  integration.syncCount > 0
                                    ? Math.min(100, (integration.errorCount / integration.syncCount) * 100 * 5)
                                    : 0
                                }
                                className="h-1.5"
                                indicatorClassName={
                                  integration.errorCount / Math.max(integration.syncCount, 1) > 0.05
                                    ? "bg-red-500"
                                    : integration.errorCount / Math.max(integration.syncCount, 1) > 0.01
                                    ? "bg-amber-500"
                                    : "bg-green-500"
                                }
                              />
                              <div className="flex justify-between text-xs text-muted-foreground">
                                <span>Good: &lt;1%</span>
                                <span>Critical: &gt;5%</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Error Logs Panel */}
          <div className="xl:col-span-1">
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Error Logs</CardTitle>
                    <CardDescription>
                      Recent integration errors and issues
                    </CardDescription>
                  </div>
                  <Select
                    value={dateFilter}
                    onValueChange={setDateFilter}
                  >
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Time Range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="24h">Last 24 Hours</SelectItem>
                      <SelectItem value="7d">Last 7 Days</SelectItem>
                      <SelectItem value="30d">Last 30 Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="all" className="space-y-4">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="active">Active</TabsTrigger>
                    <TabsTrigger value="resolved">Resolved</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="all" className="space-y-4">
                    {isLoadingErrorLogs ? (
                      Array(5).fill(0).map((_, i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                      ))
                    ) : errorLogs?.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <CheckCircle className="mx-auto h-10 w-10 text-green-500 mb-2 opacity-50" />
                        <p>No errors found in the selected time period</p>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                        {errorLogs?.map(error => (
                          <div
                            key={error.id}
                            className={`p-3 rounded-md border ${
                              error.resolved
                                ? "border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50"
                                : "border-red-200 bg-red-50 dark:border-red-900/30 dark:bg-red-900/10"
                            }`}
                          >
                            <div className="flex justify-between items-start mb-1">
                              <h4 className="text-sm font-medium flex items-center gap-1">
                                {error.resolved ? (
                                  <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                                ) : (
                                  <XCircle className="h-3.5 w-3.5 text-red-500" />
                                )}
                                {error.errorType}
                              </h4>
                              <Badge
                                variant="outline"
                                className={`text-xs ${
                                  error.resolved
                                    ? "border-green-500 text-green-700 dark:text-green-400"
                                    : "border-red-500 text-red-700 dark:text-red-400"
                                }`}
                              >
                                {error.integration}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mb-1 truncate">
                              {error.errorMessage}
                            </p>
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-muted-foreground">
                                {formatDate(error.timestamp)}
                              </span>
                              <Badge variant="secondary" className="text-xs">
                                {error.count > 1 ? `${error.count}× occurrences` : "1 occurrence"}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex justify-center pt-2">
                      <Button variant="outline" className="gap-2 w-full">
                        <Download className="h-4 w-4" />
                        Export Error Logs
                      </Button>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="active">
                    <div className="text-center py-8 text-muted-foreground">
                      <AlertTriangle className="mx-auto h-10 w-10 text-amber-500 mb-2 opacity-50" />
                      <p>Active errors tab content</p>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="resolved">
                    <div className="text-center py-8 text-muted-foreground">
                      <CheckCircle className="mx-auto h-10 w-10 text-green-500 mb-2 opacity-50" />
                      <p>Resolved errors tab content</p>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}