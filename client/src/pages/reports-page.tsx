import DashboardLayout from "@/components/dashboard/layout";
import React, { useState } from "react";
import { Helmet } from "react-helmet";
import { useQuery, useMutation } from "@tanstack/react-query";

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
      const response = await fetch("/api/reports/schedules");
      if (!response.ok) {
        throw new Error("Failed to fetch report schedules");
      }
      return await response.json();
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
      const response = await fetch("/api/reports/templates");
      if (!response.ok) {
        throw new Error("Failed to fetch report templates");
      }
      return await response.json();
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

  const onSubmit = async (values: z.infer<typeof createReportSchema>) => {
    try {
      const response = await fetch("/api/reports/schedule", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to create report schedule");
      }
      
      const data = await response.json();
      
      toast({
        title: "Report Scheduled",
        description: "Your new report has been scheduled successfully.",
      });
      
      setIsCreatingReport(false);
      form.reset();
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/reports/schedules"] });
    } catch (error: any) {
      console.error("Error creating report schedule:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create report schedule",
        variant: "destructive",
      });
    }
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

      <DashboardLayout>
        <div className="flex-1 p-4 lg:p-6 bg-slate-50 min-h-screen">
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
                                    {templatesData?.templates.map((template: ReportTemplate) => (
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
                                Enter the email addresses that should receive this report.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <DialogFooter>
                          <Button type="submit">Create Report</Button>
                        </DialogFooter>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>
            </header>

            <Tabs defaultValue="schedules" onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="schedules">Scheduled Reports</TabsTrigger>
                <TabsTrigger value="templates">Report Templates</TabsTrigger>
              </TabsList>
              
              <TabsContent value="schedules">
                <Card>
                  <CardHeader>
                    <CardTitle>Your Report Schedules</CardTitle>
                    <CardDescription>
                      View and manage your scheduled reports.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoadingSchedules ? (
                      <div className="flex items-center justify-center py-8">
                        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : schedulesError ? (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <p className="text-slate-500 mb-2">Failed to load schedules</p>
                        <Button 
                          variant="outline" 
                          onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/reports/schedules"] })}
                        >
                          Try Again
                        </Button>
                      </div>
                    ) : schedulesData?.schedules?.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-8">
                        <FileText className="h-12 w-12 text-slate-300 mb-4" />
                        <p className="text-slate-500 mb-4">No reports scheduled yet</p>
                        <Button onClick={() => setIsCreatingReport(true)}>
                          Create Your First Report
                        </Button>
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[240px]">Name</TableHead>
                            <TableHead>Frequency</TableHead>
                            <TableHead>Recipients</TableHead>
                            <TableHead>Last Generated</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {schedulesData?.schedules.map((schedule: ReportSchedule) => (
                            <TableRow key={schedule.id}>
                              <TableCell className="font-medium">
                                <div className="font-medium">{schedule.name}</div>
                                <div className="text-sm text-slate-500">
                                  {schedule.description}
                                </div>
                              </TableCell>
                              <TableCell>{schedule.frequency}</TableCell>
                              <TableCell>{schedule.recipients}</TableCell>
                              <TableCell>{schedule.lastGenerated}</TableCell>
                              <TableCell>
                                {getStatusBadge(schedule.status)}
                              </TableCell>
                              <TableCell className="text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                      <span className="sr-only">Open menu</span>
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                    <DropdownMenuItem
                                      onClick={() => handleGenerateNow(schedule.id, schedule.name)}
                                    >
                                      <RefreshCw className="mr-2 h-4 w-4" />
                                      Generate Now
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      <Settings className="mr-2 h-4 w-4" />
                                      Edit Schedule
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
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
                                          <span className="mr-2">⏸</span>
                                          Pause Schedule
                                        </>
                                      ) : (
                                        <>
                                          <span className="mr-2">▶️</span>
                                          Activate Schedule
                                        </>
                                      )}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      <Share2 className="mr-2 h-4 w-4" />
                                      Share Report
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                  <CardFooter className="flex items-center justify-between">
                    <Button variant="outline" size="sm">
                      Previous
                    </Button>
                    <div className="text-sm text-slate-500">
                      Page 1 of 1
                    </div>
                    <Button variant="outline" size="sm">
                      Next
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              <TabsContent value="templates">
                <Card>
                  <CardHeader>
                    <CardTitle>Report Templates</CardTitle>
                    <CardDescription>
                      Pre-configured report templates for your business needs.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoadingTemplates ? (
                      <div className="flex items-center justify-center py-8">
                        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : templatesError ? (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <p className="text-slate-500 mb-2">Failed to load templates</p>
                        <Button 
                          variant="outline" 
                          onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/reports/templates"] })}
                        >
                          Try Again
                        </Button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {templatesData?.templates.map((template: ReportTemplate) => (
                          <Card key={template.id} className="overflow-hidden">
                            <CardHeader className="pb-3">
                              <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                  <CardTitle>{template.name}</CardTitle>
                                  <CardDescription className="line-clamp-2">
                                    {template.description}
                                  </CardDescription>
                                </div>
                                {template.isDefault && (
                                  <Badge variant="outline" className="ml-2">Default</Badge>
                                )}
                              </div>
                            </CardHeader>
                            <CardContent className="pt-0">
                              <div className="flex items-center space-x-4 text-sm mb-4">
                                <div className="flex items-center">
                                  {getTemplateTypeBadge(template.type)}
                                </div>
                                <div className="flex items-center">
                                  <FileBarChart2 className="mr-1 h-4 w-4 text-slate-400" />
                                  <span>{template.sections} sections</span>
                                </div>
                              </div>
                              <Button 
                                className="w-full" 
                                variant="outline"
                                onClick={() => {
                                  setIsCreatingReport(true);
                                  form.setValue("templateId", template.id.toString());
                                }}
                              >
                                Use Template
                              </Button>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
};

export default ReportsPage;