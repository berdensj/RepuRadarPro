import { AdminLayout } from "@/components/admin/layout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Download,
  Calendar,
  Filter,
  Search,
  FileText,
  RefreshCw,
  ClipboardList,
  PieChart,
  TrendingUp,
  User,
  Check,
  Clock,
  Plus,
  Trash2,
  FileSpreadsheet,
  File
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminReportsPage() {
  const [timeRange, setTimeRange] = useState("30days");
  const [reportType, setReportType] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  
  // Sample data structure for reports
  const { data: reportsData, isLoading, refetch } = useQuery({
    queryKey: ["/api/admin/reports", timeRange, reportType, searchTerm],
    queryFn: async () => {
      const response = await fetch(`/api/admin/reports?timeRange=${timeRange}&type=${reportType}&search=${searchTerm}`);
      if (!response.ok) {
        throw new Error("Failed to fetch reports data");
      }
      return response.json();
    }
  });

  // Sample data structure for scheduled reports
  const { data: scheduledReports, isLoading: isLoadingScheduled } = useQuery({
    queryKey: ["/api/admin/reports/scheduled"],
    queryFn: async () => {
      const response = await fetch("/api/admin/reports/scheduled");
      if (!response.ok) {
        throw new Error("Failed to fetch scheduled reports");
      }
      return response.json();
    }
  });

  // Sample data structure for report templates
  const { data: reportTemplates, isLoading: isLoadingTemplates } = useQuery({
    queryKey: ["/api/admin/reports/templates"],
    queryFn: async () => {
      const response = await fetch("/api/admin/reports/templates");
      if (!response.ok) {
        throw new Error("Failed to fetch report templates");
      }
      return response.json();
    }
  });

  const handleRefresh = () => {
    refetch();
  };

  return (
    <AdminLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Reports</h2>
          <div className="flex items-center gap-2">
            <Button variant="default">
              <Plus className="h-4 w-4 mr-2" /> Create Report
            </Button>
          </div>
        </div>

        <Tabs defaultValue="generated" className="space-y-4">
          <TabsList>
            <TabsTrigger value="generated">Generated Reports</TabsTrigger>
            <TabsTrigger value="scheduled">Scheduled Reports</TabsTrigger>
            <TabsTrigger value="templates">Report Templates</TabsTrigger>
          </TabsList>

          <TabsContent value="generated" className="space-y-4">
            <div className="flex flex-col md:flex-row gap-2 md:items-center md:justify-between">
              <div className="flex flex-col md:flex-row gap-2 md:items-center">
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search reports..." 
                    className="pl-8" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger className="w-[180px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Report Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Reports</SelectItem>
                    <SelectItem value="performance">Performance</SelectItem>
                    <SelectItem value="sentiment">Sentiment Analysis</SelectItem>
                    <SelectItem value="competitive">Competitive Analysis</SelectItem>
                    <SelectItem value="financial">Financial</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger className="w-[180px]">
                    <Calendar className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Time Range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7days">Last 7 Days</SelectItem>
                    <SelectItem value="30days">Last 30 Days</SelectItem>
                    <SelectItem value="90days">Last 90 Days</SelectItem>
                    <SelectItem value="12months">Last 12 Months</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button variant="outline" size="icon" onClick={handleRefresh}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Generated Reports</CardTitle>
                <CardDescription>Download, share or delete previously generated reports</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <>
                    <Skeleton className="h-8 w-full mb-2" />
                    <Skeleton className="h-8 w-full mb-2" />
                    <Skeleton className="h-8 w-full mb-2" />
                    <Skeleton className="h-8 w-full mb-2" />
                    <Skeleton className="h-8 w-full" />
                  </>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox />
                        </TableHead>
                        <TableHead>Report Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Size</TableHead>
                        <TableHead>Format</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(reportsData?.reports || []).map((report, i) => (
                        <TableRow key={i}>
                          <TableCell>
                            <Checkbox />
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{report.name}</div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{report.type}</Badge>
                          </TableCell>
                          <TableCell>{report.created}</TableCell>
                          <TableCell>{report.size}</TableCell>
                          <TableCell>
                            {report.format === 'pdf' ? (
                              <Badge className="bg-red-500"><File className="h-3 w-3 mr-1" /> PDF</Badge>
                            ) : (
                              <Badge className="bg-green-600"><FileSpreadsheet className="h-3 w-3 mr-1" /> Excel</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon">
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="text-sm text-muted-foreground">
                  Showing {reportsData?.reports?.length || 0} of {reportsData?.total || 0} reports
                </div>
                <div className="flex gap-1">
                  <Button variant="outline" size="sm" disabled>Previous</Button>
                  <Button variant="outline" size="sm">Next</Button>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="scheduled" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Scheduled Reports</CardTitle>
                <CardDescription>
                  Configure automatic report generation and distribution
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingScheduled ? (
                  <>
                    <Skeleton className="h-8 w-full mb-2" />
                    <Skeleton className="h-8 w-full mb-2" />
                    <Skeleton className="h-8 w-full" />
                  </>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox />
                        </TableHead>
                        <TableHead>Report Name</TableHead>
                        <TableHead>Frequency</TableHead>
                        <TableHead>Recipients</TableHead>
                        <TableHead>Last Generated</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(scheduledReports?.schedules || []).map((schedule, i) => (
                        <TableRow key={i}>
                          <TableCell>
                            <Checkbox />
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{schedule.name}</div>
                            <div className="text-sm text-muted-foreground">{schedule.description}</div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                              <span>{schedule.frequency}</span>
                            </div>
                          </TableCell>
                          <TableCell>{schedule.recipients}</TableCell>
                          <TableCell>{schedule.lastGenerated}</TableCell>
                          <TableCell>
                            {schedule.status === 'active' ? (
                              <Badge className="bg-green-500">Active</Badge>
                            ) : (
                              <Badge variant="outline">Paused</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon">
                              <FileText className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
              <CardFooter>
                <Button>
                  <Plus className="h-4 w-4 mr-2" /> Create Schedule
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="templates" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Report Templates</CardTitle>
                <CardDescription>
                  Manage pre-configured report templates for quick generation
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingTemplates ? (
                  <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    <Skeleton className="h-40 w-full" />
                    <Skeleton className="h-40 w-full" />
                    <Skeleton className="h-40 w-full" />
                  </div>
                ) : (
                  <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {(reportTemplates?.templates || []).map((template, i) => (
                      <Card key={i}>
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-base">{template.name}</CardTitle>
                            {template.isDefault && (
                              <Badge variant="secondary">Default</Badge>
                            )}
                          </div>
                          <CardDescription>{template.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="pb-2">
                          <div className="flex items-center text-sm text-muted-foreground mb-1">
                            {template.type === 'performance' && <TrendingUp className="h-4 w-4 mr-1" />}
                            {template.type === 'sentiment' && <PieChart className="h-4 w-4 mr-1" />}
                            {template.type === 'user' && <User className="h-4 w-4 mr-1" />}
                            {template.type === 'executive' && <ClipboardList className="h-4 w-4 mr-1" />}
                            <span className="capitalize">{template.type} Report</span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            <span>Sections: {template.sections}</span>
                          </div>
                        </CardContent>
                        <CardFooter className="pt-2">
                          <div className="flex gap-2">
                            <Button variant="default" size="sm">
                              <FileText className="h-3 w-3 mr-1" /> Generate
                            </Button>
                            <Button variant="outline" size="sm">Edit</Button>
                          </div>
                        </CardFooter>
                      </Card>
                    ))}
                    
                    {/* Add new template card */}
                    <Card className="border-dashed flex flex-col items-center justify-center p-6">
                      <Plus className="h-8 w-8 mb-2 text-muted-foreground" />
                      <p className="text-muted-foreground mb-4">Create New Template</p>
                      <Button variant="outline">
                        <Plus className="h-4 w-4 mr-2" /> New Template
                      </Button>
                    </Card>
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