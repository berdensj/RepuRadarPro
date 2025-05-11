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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  CalendarIcon,
  FileBarChart2,
  FileText,
  LayoutDashboard,
  MailIcon,
  MoreHorizontal,
  PlusCircle,
  RefreshCw,
  Settings,
  Share2,
  UserIcon,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { queryClient } from "@/lib/queryClient";

// Define types
interface ReportSchedule {
  id: number;
  name: string;
  description: string;
  frequency: string;
  recipients: string;
  lastGenerated: string;
  status: "active" | "paused" | "draft";
}

interface ReportTemplate {
  id: number;
  name: string;
  description: string;
  type: string;
  sections: string;
  isDefault: boolean;
}

// Form schema for creating a new report schedule
const createReportSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().min(5, "Description must be at least 5 characters"),
  frequency: z.string({
    required_error: "Please select a frequency",
  }),
  recipients: z.string().min(1, "Please add at least one recipient"),
  templateId: z.string({
    required_error: "Please select a template",
  }),
});

const ReportsPage = () => {
  const [activeTab, setActiveTab] = useState("schedules");
  const [isCreatingReport, setIsCreatingReport] = useState(false);
  const { toast } = useToast();

  // Fetch report schedules
  const {
    data: schedulesData,
    isLoading: isLoadingSchedules,
    error: schedulesError,
  } = useQuery({
    queryKey: ["/api/reports/schedules"],
    queryFn: async () => {
      // Mock data until backend is implemented
      return {
        schedules: [
          {
            id: 1,
            name: "Monthly Performance Report",
            description: "Comprehensive review of platform performance",
            frequency: "Monthly (1st)",
            recipients: "3 recipients",
            lastGenerated: "May 1, 2025",
            status: "active",
          },
          {
            id: 2,
            name: "Weekly Reviews Digest",
            description: "Summary of new reviews and response metrics",
            frequency: "Weekly (Monday)",
            recipients: "5 recipients",
            lastGenerated: "May 6, 2025",
            status: "active",
          },
          {
            id: 3,
            name: "Quarterly Business Intelligence",
            description: "In-depth analysis of business trends and metrics",
            frequency: "Quarterly",
            recipients: "7 recipients",
            lastGenerated: "April 1, 2025",
            status: "active",
          },
          {
            id: 4,
            name: "Competitor Benchmark Report",
            description: "Comparison with key competitors",
            frequency: "Monthly (15th)",
            recipients: "4 recipients",
            lastGenerated: "April 15, 2025",
            status: "paused",
          },
          {
            id: 5,
            name: "Location Performance Summary",
            description: "Performance metrics for each business location",
            frequency: "Monthly (5th)",
            recipients: "2 recipients",
            lastGenerated: "May 5, 2025",
            status: "active",
          },
        ],
        total: 5,
      };
    },
  });

  // Fetch report templates
  const {
    data: templatesData,
    isLoading: isLoadingTemplates,
    error: templatesError,
  } = useQuery({
    queryKey: ["/api/reports/templates"],
    queryFn: async () => {
      // Mock data until backend is implemented
      return {
        templates: [
          {
            id: 1,
            name: "Executive Dashboard",
            description: "High-level metrics for executive review",
            type: "executive",
            sections: "5",
            isDefault: true,
          },
          {
            id: 2,
            name: "Performance Analytics",
            description: "Detailed performance metrics and trends",
            type: "performance",
            sections: "8",
            isDefault: false,
          },
          {
            id: 3,
            name: "Sentiment Analysis",
            description: "Customer sentiment trends and insights",
            type: "sentiment",
            sections: "6",
            isDefault: false,
          },
          {
            id: 4,
            name: "User Engagement Report",
            description: "User interaction and engagement metrics",
            type: "user",
            sections: "7",
            isDefault: false,
          },
          {
            id: 5,
            name: "Financial Summary",
            description: "Revenue and financial performance",
            type: "executive",
            sections: "4",
            isDefault: false,
          },
          {
            id: 6,
            name: "Custom Template",
            description: "User-defined custom template",
            type: "custom",
            sections: "Variable",
            isDefault: false,
          },
        ],
        total: 6,
      };
    },
  });

  // Form for creating a new report
  const form = useForm<z.infer<typeof createReportSchema>>({
    resolver: zodResolver(createReportSchema),
    defaultValues: {
      name: "",
      description: "",
      recipients: "",
    },
  });

  const onSubmit = (values: z.infer<typeof createReportSchema>) => {
    // Simulate creating a new report
    console.log("Creating new report:", values);
    
    toast({
      title: "Report Scheduled",
      description: "Your new report has been scheduled successfully.",
    });
    
    setIsCreatingReport(false);
    form.reset();
    
    // Invalidate queries to refresh data
    queryClient.invalidateQueries({ queryKey: ["/api/reports/schedules"] });
  };

  const handleGenerateNow = (reportId: number, reportName: string) => {
    // Simulate generating a report immediately
    toast({
      title: "Generating Report",
      description: `${reportName} is being generated. You'll be notified when it's ready.`,
    });
  };

  const handlePauseToggle = (
    reportId: number,
    reportName: string,
    currentStatus: string
  ) => {
    const newStatus = currentStatus === "active" ? "paused" : "active";
    const action = currentStatus === "active" ? "paused" : "activated";
    
    toast({
      title: `Report ${action}`,
      description: `${reportName} has been ${action}.`,
    });
    
    // Invalidate queries to refresh data
    queryClient.invalidateQueries({ queryKey: ["/api/reports/schedules"] });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">Active</Badge>;
      case "paused":
        return <Badge variant="outline">Paused</Badge>;
      case "draft":
        return <Badge variant="secondary">Draft</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTemplateTypeBadge = (type: string) => {
    switch (type) {
      case "executive":
        return <Badge className="bg-purple-500">Executive</Badge>;
      case "performance":
        return <Badge className="bg-blue-500">Performance</Badge>;
      case "sentiment":
        return <Badge className="bg-amber-500">Sentiment</Badge>;
      case "user":
        return <Badge className="bg-cyan-500">User</Badge>;
      case "custom":
        return <Badge className="bg-slate-500">Custom</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  return (
    <>
      <Helmet>
        <title>Reports | RepuRadar</title>
        <meta
          name="description"
          content="Schedule and manage automated reports for your business insights."
        />
      </Helmet>

      <div className="min-h-screen flex flex-col lg:flex-row">
        <Sidebar />

        <main className="flex-1 p-4 lg:p-6 bg-slate-50 min-h-screen">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <header className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-semibold text-slate-800">Reports</h1>
                <p className="text-slate-500">
                  Schedule and manage automated reports for your business
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Dialog open={isCreatingReport} onOpenChange={setIsCreatingReport}>
                  <DialogTrigger asChild>
                    <Button>
                      <PlusCircle className="h-4 w-4 mr-2" />
                      New Report
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[565px]">
                    <DialogHeader>
                      <DialogTitle>Create a New Report</DialogTitle>
                      <DialogDescription>
                        Set up a new automated report to track your business metrics.
                      </DialogDescription>
                    </DialogHeader>
                    
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Report Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Monthly Performance Report" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Brief description of what this report will track"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="frequency"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Frequency</FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select frequency" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="daily">Daily</SelectItem>
                                    <SelectItem value="weekly_monday">Weekly (Monday)</SelectItem>
                                    <SelectItem value="weekly_friday">Weekly (Friday)</SelectItem>
                                    <SelectItem value="monthly_1st">Monthly (1st)</SelectItem>
                                    <SelectItem value="monthly_15th">Monthly (15th)</SelectItem>
                                    <SelectItem value="quarterly">Quarterly</SelectItem>
                                    <SelectItem value="annually">Annually</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="templateId"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Report Template</FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select template" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {templatesData?.templates.map((template) => (
                                      <SelectItem
                                        key={template.id}
                                        value={template.id.toString()}
                                      >
                                        {template.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <FormField
                          control={form.control}
                          name="recipients"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Recipients</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Email addresses (comma-separated)"
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription>
                                Enter email addresses separated by commas
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <DialogFooter>
                          <Button variant="outline" type="button" onClick={() => setIsCreatingReport(false)}>
                            Cancel
                          </Button>
                          <Button type="submit">Schedule Report</Button>
                        </DialogFooter>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>
            </header>

            <Tabs
              defaultValue="schedules"
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="mb-6">
                <TabsTrigger value="schedules">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  Scheduled Reports
                </TabsTrigger>
                <TabsTrigger value="templates">
                  <FileText className="h-4 w-4 mr-2" />
                  Report Templates
                </TabsTrigger>
                <TabsTrigger value="history">
                  <FileBarChart2 className="h-4 w-4 mr-2" />
                  Report History
                </TabsTrigger>
              </TabsList>

              {/* Scheduled Reports Tab */}
              <TabsContent value="schedules">
                <Card>
                  <CardHeader>
                    <CardTitle>Scheduled Reports</CardTitle>
                    <CardDescription>
                      View and manage your automated report schedules
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoadingSchedules ? (
                      <div className="flex justify-center p-8">
                        <RefreshCw className="h-8 w-8 animate-spin text-slate-400" />
                      </div>
                    ) : schedulesError ? (
                      <div className="text-center text-red-500 p-4">
                        Failed to load report schedules
                      </div>
                    ) : (
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Report Name</TableHead>
                              <TableHead className="hidden md:table-cell">Frequency</TableHead>
                              <TableHead className="hidden md:table-cell">Recipients</TableHead>
                              <TableHead className="hidden md:table-cell">Last Generated</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {schedulesData?.schedules.map((schedule) => (
                              <TableRow key={schedule.id}>
                                <TableCell>
                                  <div className="font-medium">{schedule.name}</div>
                                  <div className="text-sm text-slate-500 md:hidden">
                                    {schedule.frequency}
                                  </div>
                                </TableCell>
                                <TableCell className="hidden md:table-cell">
                                  {schedule.frequency}
                                </TableCell>
                                <TableCell className="hidden md:table-cell">
                                  {schedule.recipients}
                                </TableCell>
                                <TableCell className="hidden md:table-cell">
                                  {schedule.lastGenerated}
                                </TableCell>
                                <TableCell>
                                  {getStatusBadge(schedule.status)}
                                </TableCell>
                                <TableCell className="text-right">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon">
                                        <MoreHorizontal className="h-4 w-4" />
                                        <span className="sr-only">Open menu</span>
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem
                                        onClick={() =>
                                          handleGenerateNow(schedule.id, schedule.name)
                                        }
                                      >
                                        <FileBarChart2 className="h-4 w-4 mr-2" />
                                        Generate Now
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={() =>
                                          handlePauseToggle(
                                            schedule.id,
                                            schedule.name,
                                            schedule.status
                                          )
                                        }
                                      >
                                        {schedule.status === "active" ? (
                                          <>
                                            <span className="h-4 w-4 mr-2">⏸️</span>
                                            Pause Report
                                          </>
                                        ) : (
                                          <>
                                            <span className="h-4 w-4 mr-2">▶️</span>
                                            Activate Report
                                          </>
                                        )}
                                      </DropdownMenuItem>
                                      <DropdownMenuItem>
                                        <Share2 className="h-4 w-4 mr-2" />
                                        Share Report
                                      </DropdownMenuItem>
                                      <DropdownMenuItem>
                                        <Settings className="h-4 w-4 mr-2" />
                                        Edit Schedule
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Templates Tab */}
              <TabsContent value="templates">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Report Templates</span>
                      <Button size="sm">
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Create Template
                      </Button>
                    </CardTitle>
                    <CardDescription>
                      Pre-defined report templates and custom templates
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoadingTemplates ? (
                      <div className="flex justify-center p-8">
                        <RefreshCw className="h-8 w-8 animate-spin text-slate-400" />
                      </div>
                    ) : templatesError ? (
                      <div className="text-center text-red-500 p-4">
                        Failed to load report templates
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {templatesData?.templates.map((template) => (
                          <Card key={template.id} className="overflow-hidden">
                            <CardHeader className="pb-2">
                              <CardTitle className="text-lg flex justify-between items-start">
                                <span>{template.name}</span>
                                {template.isDefault && (
                                  <Badge className="bg-slate-600">Default</Badge>
                                )}
                              </CardTitle>
                              <CardDescription>
                                {getTemplateTypeBadge(template.type)}
                              </CardDescription>
                            </CardHeader>
                            <CardContent className="pb-2">
                              <p className="text-sm text-slate-600">
                                {template.description}
                              </p>
                              <p className="text-xs text-slate-500 mt-2">
                                {template.sections} sections
                              </p>
                            </CardContent>
                            <CardFooter className="pt-2 flex justify-between">
                              <Button variant="ghost" size="sm">Preview</Button>
                              <Button variant="outline" size="sm">Use Template</Button>
                            </CardFooter>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* History Tab */}
              <TabsContent value="history">
                <Card>
                  <CardHeader>
                    <CardTitle>Report History</CardTitle>
                    <CardDescription>
                      View and download previously generated reports
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Report Name</TableHead>
                            <TableHead className="hidden md:table-cell">Generated On</TableHead>
                            <TableHead className="hidden md:table-cell">Generated By</TableHead>
                            <TableHead className="hidden md:table-cell">Size</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {[1, 2, 3, 4, 5].map((i) => (
                            <TableRow key={i}>
                              <TableCell>
                                <div className="font-medium">
                                  {i % 3 === 0
                                    ? "Weekly Reviews Digest"
                                    : i % 2 === 0
                                    ? "Monthly Performance Report"
                                    : "Quarterly Business Intelligence"}
                                </div>
                                <div className="text-sm text-slate-500 md:hidden">
                                  May {i + 5}, 2025
                                </div>
                              </TableCell>
                              <TableCell className="hidden md:table-cell">
                                May {i + 5}, 2025
                              </TableCell>
                              <TableCell className="hidden md:table-cell">
                                <div className="flex items-center gap-2">
                                  <UserIcon className="h-4 w-4 text-slate-400" />
                                  {i % 2 === 0 ? "John Smith" : "Automated"}
                                </div>
                              </TableCell>
                              <TableCell className="hidden md:table-cell">
                                {Math.floor(Math.random() * 800) + 200} KB
                              </TableCell>
                              <TableCell className="text-right">
                                <Button variant="outline" size="sm">
                                  Download
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" size="sm">
                      Previous
                    </Button>
                    <div className="text-sm text-slate-500">
                      Page 1 of 4
                    </div>
                    <Button variant="outline" size="sm">
                      Next
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </>
  );
};

export default ReportsPage;