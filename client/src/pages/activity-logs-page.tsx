import React, { useState } from "react";
import { Helmet } from "react-helmet";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  Activity,
  AlertCircle,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  CircleSlash,
  Clock,
  Download,
  Eye,
  FileText,
  HelpCircle,
  Info,
  Key,
  Lock,
  MoreHorizontal,
  RefreshCw,
  Search,
  Settings,
  Shield,
  ShieldAlert,
  User,
  UserPlus,
  XCircle,
} from "lucide-react";
import { format, subDays } from "date-fns";
import { cn } from "@/lib/utils";

// Types
interface ActivityLog {
  id: number;
  userId: number;
  username: string;
  actionType: string;
  description: string;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
  status: "success" | "failed" | "warning";
  details?: any;
}

interface SecurityAlert {
  id: number;
  alertType: string;
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  timestamp: string;
  status: "new" | "investigating" | "resolved" | "false_positive";
  affectedResource: string;
  relatedLogs?: number[];
}

const ActivityLogsPage = () => {
  const [activeTab, setActiveTab] = useState("activity");
  const [dateRange, setDateRange] = useState<{
    from: Date;
    to?: Date;
  }>({
    from: subDays(new Date(), 7),
    to: new Date(),
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [actionTypeFilter, setActionTypeFilter] = useState("all");
  const { toast } = useToast();

  // Fetch activity logs
  const {
    data: logsData,
    isLoading: isLoadingLogs,
    error: logsError,
  } = useQuery({
    queryKey: ["/api/activity-logs", dateRange, searchQuery, actionTypeFilter],
    queryFn: async () => {
      // Mock data
      const logs: ActivityLog[] = [
        {
          id: 1,
          userId: 101,
          username: "john.smith",
          actionType: "auth",
          description: "User login successful",
          ipAddress: "192.168.1.1",
          userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          timestamp: "2025-05-11T08:30:00",
          status: "success",
        },
        {
          id: 2,
          userId: 102,
          username: "sarah.admin",
          actionType: "settings",
          description: "Updated notification preferences",
          ipAddress: "192.168.1.2",
          userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
          timestamp: "2025-05-10T15:45:00",
          status: "success",
        },
        {
          id: 3,
          userId: 101,
          username: "john.smith",
          actionType: "review",
          description: "Responded to review #12345",
          ipAddress: "192.168.1.1",
          userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          timestamp: "2025-05-10T11:20:00",
          status: "success",
        },
        {
          id: 4,
          userId: 103,
          username: "unknown.user",
          actionType: "auth",
          description: "Failed login attempt",
          ipAddress: "203.0.113.1",
          userAgent: "Mozilla/5.0 (Linux; Android 11; SM-G998B)",
          timestamp: "2025-05-09T22:15:00",
          status: "failed",
        },
        {
          id: 5,
          userId: 104,
          username: "emma.wilson",
          actionType: "data",
          description: "Exported reviews data (CSV)",
          ipAddress: "192.168.1.4",
          userAgent: "Mozilla/5.0 (iPad; CPU OS 14_7_1 like Mac OS X)",
          timestamp: "2025-05-09T14:30:00",
          status: "success",
        },
        {
          id: 6,
          userId: 105,
          username: "david.chen",
          actionType: "workflow",
          description: "Created new workflow 'Negative Review Alert'",
          ipAddress: "192.168.1.5",
          userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
          timestamp: "2025-05-08T09:45:00",
          status: "success",
        },
        {
          id: 7,
          userId: 106,
          username: "michael.brown",
          actionType: "api",
          description: "API rate limit warning",
          ipAddress: "192.168.1.6",
          userAgent: "PostmanRuntime/7.29.0",
          timestamp: "2025-05-08T16:20:00",
          status: "warning",
        },
        {
          id: 8,
          userId: 101,
          username: "john.smith",
          actionType: "auth",
          description: "Password change",
          ipAddress: "192.168.1.1",
          userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          timestamp: "2025-05-07T13:15:00",
          status: "success",
        },
        {
          id: 9,
          userId: 107,
          username: "team.member",
          actionType: "user",
          description: "Added new team member 'alice.johnson'",
          ipAddress: "192.168.1.7",
          userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/91.0.4472.124",
          timestamp: "2025-05-07T11:30:00",
          status: "success",
        },
        {
          id: 10,
          userId: 104,
          username: "emma.wilson",
          actionType: "settings",
          description: "Updated company profile information",
          ipAddress: "192.168.1.4",
          userAgent: "Mozilla/5.0 (iPad; CPU OS 14_7_1 like Mac OS X)",
          timestamp: "2025-05-06T15:45:00",
          status: "success",
        },
      ];

      // Client-side filtering based on query parameters
      return {
        logs: logs
          .filter((log) => {
            // Filter by date range
            const logDate = new Date(log.timestamp);
            if (
              dateRange.from &&
              logDate < dateRange.from
            ) {
              return false;
            }
            if (
              dateRange.to &&
              logDate > dateRange.to
            ) {
              return false;
            }

            // Filter by action type
            if (actionTypeFilter !== "all" && log.actionType !== actionTypeFilter) {
              return false;
            }

            // Filter by search query
            if (searchQuery) {
              const query = searchQuery.toLowerCase();
              return (
                log.username.toLowerCase().includes(query) ||
                log.description.toLowerCase().includes(query) ||
                log.ipAddress.includes(query)
              );
            }

            return true;
          })
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
        total: logs.length,
      };
    },
  });

  // Fetch security alerts
  const {
    data: alertsData,
    isLoading: isLoadingAlerts,
    error: alertsError,
  } = useQuery({
    queryKey: ["/api/security-alerts"],
    queryFn: async () => {
      // Mock data
      const alerts: SecurityAlert[] = [
        {
          id: 1,
          alertType: "suspicious_login",
          severity: "medium",
          description: "Multiple failed login attempts detected from unusual location",
          timestamp: "2025-05-09T22:20:00",
          status: "investigating",
          affectedResource: "Authentication System",
          relatedLogs: [4],
        },
        {
          id: 2,
          alertType: "api_abuse",
          severity: "low",
          description: "Unusual number of API requests detected",
          timestamp: "2025-05-08T16:25:00",
          status: "resolved",
          affectedResource: "API Gateway",
          relatedLogs: [7],
        },
        {
          id: 3,
          alertType: "permission_escalation",
          severity: "high",
          description: "Attempt to access restricted admin functions",
          timestamp: "2025-05-05T10:15:00",
          status: "resolved",
          affectedResource: "Admin Panel",
        },
        {
          id: 4,
          alertType: "new_device",
          severity: "low",
          description: "Login from new device for user john.smith",
          timestamp: "2025-05-02T09:30:00",
          status: "false_positive",
          affectedResource: "User Account",
        },
        {
          id: 5,
          alertType: "data_export",
          severity: "low",
          description: "Large data export initiated",
          timestamp: "2025-05-09T14:35:00",
          status: "new",
          affectedResource: "Data Export API",
          relatedLogs: [5],
        },
      ];

      return {
        alerts: alerts.sort(
          (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        ),
        stats: {
          new: alerts.filter((a) => a.status === "new").length,
          investigating: alerts.filter((a) => a.status === "investigating").length,
          resolved: alerts.filter((a) => a.status === "resolved").length,
          false_positive: alerts.filter((a) => a.status === "false_positive").length,
          critical: alerts.filter((a) => a.severity === "critical").length,
          high: alerts.filter((a) => a.severity === "high").length,
          medium: alerts.filter((a) => a.severity === "medium").length,
          low: alerts.filter((a) => a.severity === "low").length,
        },
      };
    },
  });

  const handleExportLogs = () => {
    toast({
      title: "Logs Exported",
      description: "Activity logs have been exported successfully.",
    });
  };

  const handleViewLogDetails = (log: ActivityLog) => {
    // In a real implementation, this would show a modal with detailed log information
    console.log("Viewing log details:", log);
  };

  const handleViewAlertDetails = (alert: SecurityAlert) => {
    // In a real implementation, this would show a modal with detailed alert information
    console.log("Viewing alert details:", alert);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return <Badge className="bg-green-500">Success</Badge>;
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
      case "warning":
        return <Badge className="bg-yellow-500">Warning</Badge>;
      case "new":
        return <Badge className="bg-blue-500">New</Badge>;
      case "investigating":
        return <Badge className="bg-amber-500">Investigating</Badge>;
      case "resolved":
        return <Badge className="bg-green-500">Resolved</Badge>;
      case "false_positive":
        return <Badge variant="outline">False Positive</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "critical":
        return <Badge className="bg-red-600">Critical</Badge>;
      case "high":
        return <Badge className="bg-red-500">High</Badge>;
      case "medium":
        return <Badge className="bg-amber-500">Medium</Badge>;
      case "low":
        return <Badge className="bg-blue-500">Low</Badge>;
      default:
        return <Badge variant="outline">{severity}</Badge>;
    }
  };

  const getActionTypeIcon = (actionType: string) => {
    switch (actionType) {
      case "auth":
        return <Key className="h-4 w-4 text-blue-500" />;
      case "settings":
        return <Settings className="h-4 w-4 text-slate-500" />;
      case "review":
        return <FileText className="h-4 w-4 text-green-500" />;
      case "data":
        return <Download className="h-4 w-4 text-purple-500" />;
      case "workflow":
        return <Activity className="h-4 w-4 text-amber-500" />;
      case "api":
        return <RefreshCw className="h-4 w-4 text-rose-500" />;
      case "user":
        return <UserPlus className="h-4 w-4 text-cyan-500" />;
      default:
        return <Info className="h-4 w-4 text-slate-400" />;
    }
  };

  const getAlertTypeIcon = (alertType: string) => {
    switch (alertType) {
      case "suspicious_login":
        return <ShieldAlert className="h-4 w-4 text-red-500" />;
      case "api_abuse":
        return <AlertCircle className="h-4 w-4 text-amber-500" />;
      case "permission_escalation":
        return <Lock className="h-4 w-4 text-red-600" />;
      case "new_device":
        return <User className="h-4 w-4 text-blue-500" />;
      case "data_export":
        return <Download className="h-4 w-4 text-purple-500" />;
      default:
        return <Shield className="h-4 w-4 text-slate-400" />;
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM d, yyyy 'at' h:mm a");
  };

  return (
    <>
      <Helmet>
        <title>Activity Logs | RepuRadar</title>
        <meta
          name="description"
          content="View and manage your account activity logs and security alerts."
        />
      </Helmet>

      <div className="min-h-screen flex flex-col lg:flex-row">
        <Sidebar />

        <main className="flex-1 p-4 lg:p-6 bg-slate-50 min-h-screen">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <header className="mb-6">
              <h1 className="text-2xl font-semibold text-slate-800">Activity Logs</h1>
              <p className="text-slate-500">
                View and manage your account activity and security alerts
              </p>
            </header>

            <Tabs
              defaultValue="activity"
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="mb-6">
                <TabsTrigger value="activity">
                  <Clock className="h-4 w-4 mr-2" />
                  Account Activity
                </TabsTrigger>
                <TabsTrigger value="security">
                  <Shield className="h-4 w-4 mr-2" />
                  Security Alerts
                </TabsTrigger>
              </TabsList>

              {/* Activity Logs Tab */}
              <TabsContent value="activity">
                <Card>
                  <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <CardTitle>Account Activity</CardTitle>
                      <CardDescription>
                        View all account activity and actions
                      </CardDescription>
                    </div>
                    <Button variant="outline" onClick={handleExportLogs}>
                      <Download className="h-4 w-4 mr-2" />
                      Export Logs
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Filters */}
                    <div className="flex flex-col md:flex-row gap-4 md:items-center">
                      <div className="relative flex-1">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
                        <Input
                          placeholder="Search logs..."
                          className="pl-8"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full md:w-auto justify-start text-left font-normal"
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {dateRange?.from ? (
                                dateRange.to ? (
                                  <>
                                    {format(dateRange.from, "LLL dd, y")} -{" "}
                                    {format(dateRange.to, "LLL dd, y")}
                                  </>
                                ) : (
                                  format(dateRange.from, "LLL dd, y")
                                )
                              ) : (
                                <span>Pick a date</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              initialFocus
                              mode="range"
                              defaultMonth={dateRange?.from}
                              selected={dateRange}
                              onSelect={setDateRange as any}
                              numberOfMonths={1}
                            />
                          </PopoverContent>
                        </Popover>

                        <Select
                          value={actionTypeFilter}
                          onValueChange={setActionTypeFilter}
                        >
                          <SelectTrigger className="w-full md:w-[180px]">
                            <SelectValue placeholder="Filter by type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Activity</SelectItem>
                            <SelectItem value="auth">Authentication</SelectItem>
                            <SelectItem value="review">Reviews</SelectItem>
                            <SelectItem value="settings">Settings</SelectItem>
                            <SelectItem value="data">Data Operations</SelectItem>
                            <SelectItem value="workflow">Workflows</SelectItem>
                            <SelectItem value="api">API Usage</SelectItem>
                            <SelectItem value="user">User Management</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Logs Table */}
                    {isLoadingLogs ? (
                      <div className="flex justify-center p-8">
                        <RefreshCw className="h-8 w-8 animate-spin text-slate-400" />
                      </div>
                    ) : logsError ? (
                      <div className="text-center text-red-500 p-4">
                        Failed to load activity logs
                      </div>
                    ) : logsData?.logs.length === 0 ? (
                      <div className="text-center p-8">
                        <Clock className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                        <h3 className="text-xl font-medium text-slate-800 mb-1">
                          No activity found
                        </h3>
                        <p className="text-slate-500">
                          No activity logs match your search criteria
                        </p>
                      </div>
                    ) : (
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-[180px]">Time</TableHead>
                              <TableHead>Activity</TableHead>
                              <TableHead className="hidden md:table-cell">User</TableHead>
                              <TableHead className="hidden md:table-cell">IP Address</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {logsData?.logs.map((log) => (
                              <TableRow key={log.id}>
                                <TableCell className="whitespace-nowrap">
                                  {formatDate(log.timestamp)}
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    {getActionTypeIcon(log.actionType)}
                                    <div>
                                      <div className="font-medium">{log.description}</div>
                                      <div className="text-xs text-slate-500 md:hidden">
                                        User: {log.username}
                                      </div>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell className="hidden md:table-cell">
                                  {log.username}
                                </TableCell>
                                <TableCell className="hidden md:table-cell">
                                  {log.ipAddress}
                                </TableCell>
                                <TableCell>{getStatusBadge(log.status)}</TableCell>
                                <TableCell className="text-right">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleViewLogDetails(log)}
                                  >
                                    <Eye className="h-4 w-4" />
                                    <span className="sr-only">View Details</span>
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" size="sm" disabled>
                      <ChevronLeft className="h-4 w-4 mr-2" />
                      Previous
                    </Button>
                    <div className="text-sm text-slate-500">
                      Showing {logsData?.logs.length} of {logsData?.total} entries
                    </div>
                    <Button variant="outline" size="sm" disabled>
                      Next
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              {/* Security Alerts Tab */}
              <TabsContent value="security">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <Card>
                      <CardHeader>
                        <CardTitle>Security Alerts</CardTitle>
                        <CardDescription>
                          Potential security issues and suspicious activity
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {isLoadingAlerts ? (
                          <div className="flex justify-center p-8">
                            <RefreshCw className="h-8 w-8 animate-spin text-slate-400" />
                          </div>
                        ) : alertsError ? (
                          <div className="text-center text-red-500 p-4">
                            Failed to load security alerts
                          </div>
                        ) : alertsData?.alerts.length === 0 ? (
                          <div className="text-center p-8">
                            <Shield className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                            <h3 className="text-xl font-medium text-slate-800 mb-1">
                              No security alerts
                            </h3>
                            <p className="text-slate-500">
                              Your account has no active security alerts
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {alertsData?.alerts.map((alert) => (
                              <div
                                key={alert.id}
                                className={cn(
                                  "border rounded-lg p-4",
                                  alert.severity === "critical" && "border-red-600 bg-red-50",
                                  alert.severity === "high" && "border-red-300 bg-red-50",
                                  alert.severity === "medium" && "border-amber-300 bg-amber-50",
                                  alert.severity === "low" && "border-blue-300 bg-blue-50"
                                )}
                              >
                                <div className="flex justify-between">
                                  <div className="flex items-center gap-2">
                                    {getAlertTypeIcon(alert.alertType)}
                                    <h3 className="font-medium">
                                      {alert.description}
                                    </h3>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {getSeverityBadge(alert.severity)}
                                    {getStatusBadge(alert.status)}
                                  </div>
                                </div>
                                <div className="mt-2 flex justify-between text-sm text-slate-500">
                                  <div>
                                    <span className="inline-block w-20 sm:w-24">Detected:</span> 
                                    {formatDate(alert.timestamp)}
                                  </div>
                                  <div>
                                    <span>Affected:</span> {alert.affectedResource}
                                  </div>
                                </div>
                                <div className="mt-3 flex justify-end gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleViewAlertDetails(alert)}
                                  >
                                    <Eye className="h-3.5 w-3.5 mr-1" />
                                    View Details
                                  </Button>
                                  {alert.status === "new" || alert.status === "investigating" ? (
                                    <Button 
                                      size="sm"
                                      variant={alert.severity === "critical" || alert.severity === "high" ? "default" : "outline"}
                                    >
                                      <Shield className="h-3.5 w-3.5 mr-1" />
                                      Resolve Issue
                                    </Button>
                                  ) : null}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Alert Summary</CardTitle>
                        <CardDescription>
                          Overview of security alerts by status
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {isLoadingAlerts ? (
                          <div className="flex justify-center p-4">
                            <RefreshCw className="h-6 w-6 animate-spin text-slate-400" />
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <div className="flex justify-between items-center p-2 rounded-md bg-slate-100">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                <span>New</span>
                              </div>
                              <Badge>{alertsData?.stats.new || 0}</Badge>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-md bg-slate-100">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                                <span>Investigating</span>
                              </div>
                              <Badge>{alertsData?.stats.investigating || 0}</Badge>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-md bg-slate-100">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                <span>Resolved</span>
                              </div>
                              <Badge>{alertsData?.stats.resolved || 0}</Badge>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-md bg-slate-100">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-slate-400"></div>
                                <span>False Positive</span>
                              </div>
                              <Badge>{alertsData?.stats.false_positive || 0}</Badge>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>Security Tips</CardTitle>
                        <CardDescription>
                          Recommendations to improve your account security
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex gap-2">
                            <div className="mt-0.5">
                              <CheckCircle2 className="h-5 w-5 text-green-500" />
                            </div>
                            <div>
                              <h3 className="text-sm font-medium">Two-Factor Authentication</h3>
                              <p className="text-xs text-slate-500">
                                Your account is protected with 2FA. Last used on May 11, 2025.
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <div className="mt-0.5">
                              <XCircle className="h-5 w-5 text-red-500" />
                            </div>
                            <div>
                              <h3 className="text-sm font-medium">API Key Rotation</h3>
                              <p className="text-xs text-slate-500">
                                Your API key is over 90 days old. Consider rotating it for security.
                              </p>
                              <Button variant="outline" size="sm" className="mt-1">
                                <Key className="h-3.5 w-3.5 mr-1" />
                                Rotate API Key
                              </Button>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <div className="mt-0.5">
                              <CircleSlash className="h-5 w-5 text-yellow-500" />
                            </div>
                            <div>
                              <h3 className="text-sm font-medium">Login Notifications</h3>
                              <p className="text-xs text-slate-500">
                                Enable email notifications for suspicious login attempts.
                              </p>
                              <Button variant="outline" size="sm" className="mt-1">
                                Enable
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </>
  );
};

export default ActivityLogsPage;