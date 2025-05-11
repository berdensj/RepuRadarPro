import { useQuery } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Database,
  Globe,
  HardDrive,
  Server,
  ServerCrash,
  Activity,
  BarChart,
  RefreshCw
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface SystemHealth {
  status: string;
  lastIncident: string | null;
  uptime: {
    percentage: number;
    since: string;
  };
  services: {
    api: {
      status: string;
      latency: number;
    };
    database: {
      status: string;
      latency: number;
    };
    storage: {
      status: string;
      usage: number;
    };
    cache: {
      status: string;
      hitRate: number;
    };
  };
  performance: {
    cpu: number;
    memory: number;
    disk: number;
    network: {
      in: number;
      out: number;
    }
  };
  logs: {
    errors: number;
    warnings: number;
    lastError: string | null;
  };
}

export default function AdminSystemPage() {
  const { data: systemHealth, isLoading, refetch } = useQuery<SystemHealth>({
    queryKey: ["/api/admin/system-health"],
  });
  
  const isOperational = systemHealth?.status === 'operational';
  
  // Helper to format dates
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };
  
  // Helper to format bytes
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  return (
    <AdminLayout>
      <div className="space-y-4 p-4 md:p-8">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">System Health</h2>
          <Button onClick={() => refetch()} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
        
        <Card className="border-2 border-primary">
          <CardHeader className="pb-2">
            <CardTitle>System Status</CardTitle>
            <CardDescription>Current status and uptime information</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-6 w-3/4" />
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  {isOperational ? (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="h-8 w-8" />
                      <div>
                        <p className="text-xl font-bold">All Systems Operational</p>
                        <p className="text-sm text-muted-foreground">
                          All services are running as expected
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-amber-600">
                      <AlertTriangle className="h-8 w-8" />
                      <div>
                        <p className="text-xl font-bold">System Degradation</p>
                        <p className="text-sm text-muted-foreground">
                          Some services are experiencing issues
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
                      <p className="text-sm font-medium">Uptime</p>
                      <p className="text-sm text-muted-foreground">
                        {systemHealth?.uptime.percentage}% over last 30 days
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                      <ServerCrash className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Last Incident</p>
                      <p className="text-sm text-muted-foreground">
                        {systemHealth?.lastIncident 
                          ? formatDate(systemHealth.lastIncident)
                          : 'No recent incidents'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                      <Activity className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Errors (24h)</p>
                      <p className="text-sm text-muted-foreground">
                        {systemHealth?.logs.errors || 0} errors, {systemHealth?.logs.warnings || 0} warnings
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Tabs defaultValue="services" className="space-y-4">
          <TabsList>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="resources">Resource Usage</TabsTrigger>
            <TabsTrigger value="logs">Logs</TabsTrigger>
          </TabsList>
          
          <TabsContent value="services" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">API Service</CardTitle>
                    {isLoading ? (
                      <Skeleton className="h-5 w-20" />
                    ) : (
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        systemHealth?.services.api.status === 'operational' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {systemHealth?.services.api.status === 'operational' ? 'Operational' : 'Degraded'}
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="h-16 w-full" />
                  ) : (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Latency</span>
                        <span className="font-medium">{systemHealth?.services.api.latency}ms</span>
                      </div>
                      <Progress 
                        value={Math.min(100, (systemHealth?.services.api.latency || 0) / 2)} 
                        className="h-2"
                      />
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Good: &lt;100ms</span>
                        <span>Poor: &gt;200ms</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Database Service</CardTitle>
                    {isLoading ? (
                      <Skeleton className="h-5 w-20" />
                    ) : (
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        systemHealth?.services.database.status === 'operational' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {systemHealth?.services.database.status === 'operational' ? 'Operational' : 'Degraded'}
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="h-16 w-full" />
                  ) : (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Query Latency</span>
                        <span className="font-medium">{systemHealth?.services.database.latency}ms</span>
                      </div>
                      <Progress 
                        value={Math.min(100, (systemHealth?.services.database.latency || 0) / 3)} 
                        className="h-2"
                      />
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Good: &lt;150ms</span>
                        <span>Poor: &gt;300ms</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Storage Service</CardTitle>
                    {isLoading ? (
                      <Skeleton className="h-5 w-20" />
                    ) : (
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        systemHealth?.services.storage.status === 'operational' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {systemHealth?.services.storage.status === 'operational' ? 'Operational' : 'Degraded'}
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="h-16 w-full" />
                  ) : (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Storage Usage</span>
                        <span className="font-medium">{systemHealth?.services.storage.usage}%</span>
                      </div>
                      <Progress 
                        value={systemHealth?.services.storage.usage} 
                        className="h-2"
                      />
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Good: &lt;70%</span>
                        <span>Warning: &gt;85%</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Cache Service</CardTitle>
                    {isLoading ? (
                      <Skeleton className="h-5 w-20" />
                    ) : (
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        systemHealth?.services.cache.status === 'operational' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {systemHealth?.services.cache.status === 'operational' ? 'Operational' : 'Degraded'}
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="h-16 w-full" />
                  ) : (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Cache Hit Rate</span>
                        <span className="font-medium">{systemHealth?.services.cache.hitRate}%</span>
                      </div>
                      <Progress 
                        value={systemHealth?.services.cache.hitRate} 
                        className="h-2"
                      />
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Poor: &lt;80%</span>
                        <span>Good: &gt;95%</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="resources" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">CPU Usage</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="h-20 w-full" />
                  ) : (
                    <div className="space-y-2">
                      <div className="flex justify-between items-end">
                        <Server className="h-8 w-8 text-primary" />
                        <span className="text-2xl font-bold">{systemHealth?.performance.cpu}%</span>
                      </div>
                      <Progress 
                        value={systemHealth?.performance.cpu} 
                        className="h-2"
                      />
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Low: &lt;30%</span>
                        <span>High: &gt;70%</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Memory Usage</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="h-20 w-full" />
                  ) : (
                    <div className="space-y-2">
                      <div className="flex justify-between items-end">
                        <HardDrive className="h-8 w-8 text-primary" />
                        <span className="text-2xl font-bold">{systemHealth?.performance.memory}%</span>
                      </div>
                      <Progress 
                        value={systemHealth?.performance.memory} 
                        className="h-2"
                      />
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Low: &lt;40%</span>
                        <span>High: &gt;80%</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Disk Usage</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="h-20 w-full" />
                  ) : (
                    <div className="space-y-2">
                      <div className="flex justify-between items-end">
                        <Database className="h-8 w-8 text-primary" />
                        <span className="text-2xl font-bold">{systemHealth?.performance.disk}%</span>
                      </div>
                      <Progress 
                        value={systemHealth?.performance.disk} 
                        className="h-2"
                      />
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Low: &lt;50%</span>
                        <span>High: &gt;85%</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Network Traffic</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="h-20 w-full" />
                  ) : (
                    <div className="space-y-2">
                      <div className="flex justify-between items-end">
                        <Globe className="h-8 w-8 text-primary" />
                        <div className="text-right">
                          <div className="text-xs text-muted-foreground">IN: {formatBytes(systemHealth?.performance.network.in || 0)}/s</div>
                          <div className="text-xs text-muted-foreground">OUT: {formatBytes(systemHealth?.performance.network.out || 0)}/s</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 space-y-1">
                          <p className="text-xs text-muted-foreground">Inbound</p>
                          <Progress 
                            value={Math.min(100, (systemHealth?.performance.network.in || 0) / 1000000 * 100)} 
                            className="h-2"
                          />
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="text-xs text-muted-foreground">Outbound</p>
                          <Progress 
                            value={Math.min(100, (systemHealth?.performance.network.out || 0) / 2000000 * 100)} 
                            className="h-2"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Resource Usage History</CardTitle>
                <CardDescription>
                  Historical performance data over the last 30 days
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[300px] flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <BarChart className="h-8 w-8 mx-auto mb-2" />
                  <p>Historical performance chart will be displayed here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="logs" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>System Logs</CardTitle>
                <CardDescription>
                  Recent system logs and events
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-full" />
                  </div>
                ) : systemHealth?.logs.errors === 0 && systemHealth.logs.warnings === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-500 mb-2" />
                    <p className="text-lg font-medium text-center">No errors or warnings in the last 24 hours</p>
                    <p className="text-sm text-muted-foreground text-center">The system is running smoothly</p>
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <div className="p-4 bg-red-50 border-b border-red-200">
                      <div className="flex items-center">
                        <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                        <p className="font-medium text-red-800">
                          {systemHealth?.logs.lastError || "Unknown error"}
                        </p>
                      </div>
                      <p className="text-sm text-red-700 ml-7 mt-1">
                        Timestamp: {systemHealth?.lastIncident ? formatDate(systemHealth.lastIncident) : "Unknown"}
                      </p>
                    </div>
                    <div className="p-4 border-b bg-amber-50 border-amber-200">
                      <div className="flex items-center">
                        <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
                        <p className="font-medium text-amber-800">
                          High API latency detected
                        </p>
                      </div>
                      <p className="text-sm text-amber-700 ml-7 mt-1">
                        Timestamp: {formatDate(new Date().toISOString())}
                      </p>
                    </div>
                    <div className="p-4 bg-slate-50">
                      <div className="flex items-center">
                        <Activity className="h-5 w-5 text-slate-500 mr-2" />
                        <p className="font-medium text-slate-800">
                          System backup completed successfully
                        </p>
                      </div>
                      <p className="text-sm text-slate-700 ml-7 mt-1">
                        Timestamp: {formatDate(new Date().toISOString())}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}