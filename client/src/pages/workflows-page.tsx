import DashboardLayout from "@/components/dashboard/layout";
import React, { useState } from "react";
import { Helmet } from "react-helmet";
import { useQuery } from "@tanstack/react-query";

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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Copy,
  Edit,
  Eye,
  FileText,
  GitBranch,
  Info,
  MoreHorizontal,
  Pause,
  Play,
  PlusCircle,
  RefreshCw,
  Search,
  Settings,
  Star,
  Trash2,
  XCircle,
  Zap,
} from "lucide-react";
import { format } from "date-fns";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { queryClient } from "@/lib/queryClient";

// Types
interface Workflow {
  id: number;
  name: string;
  description: string;
  trigger: string;
  actions: string[];
  status: "active" | "inactive" | "draft";
  createdAt: string;
  lastRun: string | null;
  runCount: number;
}

interface Template {
  id: number;
  name: string;
  description: string;
  trigger: string;
  complexity: "simple" | "medium" | "advanced";
  category: string;
  actions: string[];
  popularity: number;
}

interface RunHistory {
  id: number;
  workflowId: number;
  workflowName: string;
  status: "success" | "failed" | "in_progress";
  startTime: string;
  endTime: string | null;
  trigger: string;
  actionsTaken: string[];
}

// Form schemas
const workflowFormSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().min(5, "Description must be at least 5 characters"),
  trigger: z.string({
    required_error: "Please select a trigger event",
  }),
  action1: z.string({
    required_error: "Please select at least one action",
  }),
  action2: z.string().optional(),
  action3: z.string().optional(),
  enabled: z.boolean().default(true),
});

const WorkflowsPage = () => {
  const [activeTab, setActiveTab] = useState("workflows");
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const { toast } = useToast();

  // Fetch workflows
  const {
    data: workflowsData,
    isLoading: isLoadingWorkflows,
    error: workflowsError,
  } = useQuery({
    queryKey: ["/api/workflows"],
    queryFn: async () => {
      // Mock data
      return {
        workflows: [
          {
            id: 1,
            name: "Negative Review Alert",
            description: "Send alert when a negative review is received",
            trigger: "New review with rating < 3",
            actions: ["Send email notification", "Create high priority alert", "Assign to manager"],
            status: "active",
            createdAt: "2025-05-01T10:30:00",
            lastRun: "2025-05-10T14:25:00",
            runCount: 12,
          },
          {
            id: 2,
            name: "Review Response Generator",
            description: "Generate AI response for new reviews",
            trigger: "New review received",
            actions: ["Generate AI response", "Save as draft", "Notify team member"],
            status: "active",
            createdAt: "2025-05-02T11:15:00",
            lastRun: "2025-05-10T16:40:00",
            runCount: 35,
          },
          {
            id: 3,
            name: "Weekly Analytics Report",
            description: "Generate and email weekly analytics report",
            trigger: "Schedule: Every Monday at 8:00 AM",
            actions: ["Generate analytics report", "Export as PDF", "Email to team"],
            status: "active",
            createdAt: "2025-04-15T09:20:00",
            lastRun: "2025-05-06T08:00:00",
            runCount: 4,
          },
          {
            id: 4,
            name: "Customer Follow-up",
            description: "Send follow-up email 7 days after response",
            trigger: "7 days after review response",
            actions: ["Generate follow-up email", "Send to customer"],
            status: "inactive",
            createdAt: "2025-05-03T14:10:00",
            lastRun: null,
            runCount: 0,
          },
          {
            id: 5,
            name: "New Location Alert",
            description: "Notify team when new location is added",
            trigger: "New location created",
            actions: ["Create internal notification", "Add to onboarding queue"],
            status: "draft",
            createdAt: "2025-05-09T16:30:00",
            lastRun: null,
            runCount: 0,
          },
        ] as Workflow[],
        total: 5,
      };
    },
  });

  // Fetch templates
  const {
    data: templatesData,
    isLoading: isLoadingTemplates,
    error: templatesError,
  } = useQuery({
    queryKey: ["/api/workflows/templates"],
    queryFn: async () => {
      // Mock data
      return {
        templates: [
          {
            id: 1,
            name: "Negative Review Response",
            description: "Automatically handle negative reviews with timely responses",
            trigger: "New review with rating < 3",
            complexity: "medium",
            category: "Review Management",
            actions: [
              "Generate AI response draft",
              "Create high priority alert",
              "Assign to team member",
            ],
            popularity: 487,
          },
          {
            id: 2,
            name: "Positive Review Thank You",
            description: "Thank customers for positive reviews",
            trigger: "New review with rating >= 4",
            complexity: "simple",
            category: "Review Management",
            actions: ["Generate thank you response", "Auto-publish response"],
            popularity: 356,
          },
          {
            id: 3,
            name: "Weekly Performance Report",
            description: "Generate and distribute weekly performance metrics",
            trigger: "Schedule: Weekly",
            complexity: "medium",
            category: "Reporting",
            actions: ["Generate report", "Export as PDF", "Email to recipients"],
            popularity: 289,
          },
          {
            id: 4,
            name: "Customer Review Request",
            description: "Ask customers for reviews after positive interaction",
            trigger: "Customer interaction marked 'positive'",
            complexity: "simple",
            category: "Review Generation",
            actions: ["Generate review request email", "Send email to customer"],
            popularity: 412,
          },
          {
            id: 5,
            name: "Competitor Monitoring Alert",
            description: "Alert when competitors receive high-volume reviews",
            trigger: "Competitor receives 5+ reviews in 24 hours",
            complexity: "advanced",
            category: "Competitor Analysis",
            actions: [
              "Generate competitor activity report",
              "Create alert",
              "Send notification to team",
            ],
            popularity: 178,
          },
          {
            id: 6,
            name: "Review Import Automation",
            description: "Regularly import reviews from multiple platforms",
            trigger: "Schedule: Daily",
            complexity: "advanced",
            category: "Data Management",
            actions: ["Import reviews from all platforms", "Run deduplication", "Generate summary"],
            popularity: 203,
          },
        ] as Template[],
        total: 6,
      };
    },
  });

  // Fetch run history
  const {
    data: historyData,
    isLoading: isLoadingHistory,
    error: historyError,
  } = useQuery({
    queryKey: ["/api/workflows/history"],
    queryFn: async () => {
      // Mock data
      return {
        history: [
          {
            id: 1,
            workflowId: 1,
            workflowName: "Negative Review Alert",
            status: "success",
            startTime: "2025-05-10T14:25:00",
            endTime: "2025-05-10T14:25:30",
            trigger: "New negative review from Google",
            actionsTaken: ["Email sent to manager", "Alert #A-123 created"],
          },
          {
            id: 2,
            workflowId: 2,
            workflowName: "Review Response Generator",
            status: "success",
            startTime: "2025-05-10T16:40:00",
            endTime: "2025-05-10T16:40:45",
            trigger: "New review from Yelp",
            actionsTaken: ["Response draft created", "Notification sent to team"],
          },
          {
            id: 3,
            workflowId: 3,
            workflowName: "Weekly Analytics Report",
            status: "success",
            startTime: "2025-05-06T08:00:00",
            endTime: "2025-05-06T08:02:15",
            trigger: "Scheduled trigger",
            actionsTaken: ["Report generated", "PDF exported", "Email sent to 5 recipients"],
          },
          {
            id: 4,
            workflowId: 1,
            workflowName: "Negative Review Alert",
            status: "failed",
            startTime: "2025-05-05T11:30:00",
            endTime: "2025-05-05T11:30:10",
            trigger: "New negative review from Facebook",
            actionsTaken: ["Email sending failed: Invalid recipient address"],
          },
          {
            id: 5,
            workflowId: 2,
            workflowName: "Review Response Generator",
            status: "in_progress",
            startTime: "2025-05-11T09:15:00",
            endTime: null,
            trigger: "New review from Google",
            actionsTaken: ["Generating AI response"],
          },
        ] as RunHistory[],
        total: 5,
      };
    },
  });

  // Form for workflows
  const form = useForm<z.infer<typeof workflowFormSchema>>({
    resolver: zodResolver(workflowFormSchema),
    defaultValues: {
      name: "",
      description: "",
      enabled: true,
    },
  });

  // Initialize form with template data
  const initializeFormWithTemplate = (template: Template) => {
    form.reset({
      name: template.name,
      description: template.description,
      trigger: template.trigger,
      action1: template.actions[0] || "",
      action2: template.actions[1] || "",
      action3: template.actions[2] || "",
      enabled: true,
    });
    
    setSelectedTemplate(template);
    setIsCreating(true);
  };

  // Initialize form with workflow data for editing
  const initializeFormForEditing = (workflow: Workflow) => {
    form.reset({
      name: workflow.name,
      description: workflow.description,
      trigger: workflow.trigger,
      action1: workflow.actions[0] || "",
      action2: workflow.actions[1] || "",
      action3: workflow.actions[2] || "",
      enabled: workflow.status === "active",
    });
    
    setSelectedWorkflow(workflow);
    setIsEditing(true);
  };

  const onSubmit = (values: z.infer<typeof workflowFormSchema>) => {
    console.log("Saving workflow:", values);
    
    if (isEditing && selectedWorkflow) {
      toast({
        title: "Workflow Updated",
        description: `${values.name} has been updated successfully.`,
      });
    } else {
      toast({
        title: "Workflow Created",
        description: `${values.name} has been created successfully.`,
      });
    }
    
    // Close the dialog and reset form
    setIsCreating(false);
    setIsEditing(false);
    setSelectedWorkflow(null);
    setSelectedTemplate(null);
    form.reset();
    
    // Refresh workflows
    queryClient.invalidateQueries({ queryKey: ["/api/workflows"] });
  };

  const handleToggleStatus = (workflow: Workflow) => {
    const newStatus = workflow.status === "active" ? "inactive" : "active";
    const action = newStatus === "active" ? "activated" : "deactivated";
    
    toast({
      title: `Workflow ${action}`,
      description: `${workflow.name} has been ${action}.`,
    });
    
    // Refresh workflows
    queryClient.invalidateQueries({ queryKey: ["/api/workflows"] });
  };

  const handleDeleteWorkflow = (workflow: Workflow) => {
    toast({
      title: "Workflow Deleted",
      description: `${workflow.name} has been deleted.`,
    });
    
    // Refresh workflows
    queryClient.invalidateQueries({ queryKey: ["/api/workflows"] });
  };

  const handleRunNow = (workflow: Workflow) => {
    toast({
      title: "Workflow Triggered",
      description: `${workflow.name} has been manually triggered.`,
    });
    
    // Refresh history
    queryClient.invalidateQueries({ queryKey: ["/api/workflows/history"] });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">Active</Badge>;
      case "inactive":
        return <Badge variant="outline">Inactive</Badge>;
      case "draft":
        return <Badge variant="secondary">Draft</Badge>;
      case "success":
        return <Badge className="bg-green-500">Success</Badge>;
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
      case "in_progress":
        return <Badge className="bg-blue-500">In Progress</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getComplexityBadge = (complexity: string) => {
    switch (complexity) {
      case "simple":
        return <Badge className="bg-green-500">Simple</Badge>;
      case "medium":
        return <Badge className="bg-blue-500">Medium</Badge>;
      case "advanced":
        return <Badge className="bg-purple-500">Advanced</Badge>;
      default:
        return <Badge variant="outline">{complexity}</Badge>;
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Never";
    return format(new Date(dateString), "MMM d, yyyy 'at' h:mm a");
  };

  return (
    <>
      <Helmet>
        <title>Workflow Automation | RepuRadar</title>
        <meta
          name="description"
          content="Create and manage automated workflows for your review management."
        />
      </Helmet>

      <div className="min-h-screen flex flex-col lg:flex-row">
        <Sidebar />

        <main className="flex-1 p-4 lg:p-6 bg-slate-50 min-h-screen">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <header className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-semibold text-slate-800">Workflow Automation</h1>
                <p className="text-slate-500">
                  Create automated workflows to streamline your review management
                </p>
              </div>
              <Button onClick={() => { setIsCreating(true); setSelectedTemplate(null); }}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Create Workflow
              </Button>
            </header>

            <Tabs
              defaultValue="workflows"
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="mb-6">
                <TabsTrigger value="workflows">
                  <GitBranch className="h-4 w-4 mr-2" />
                  My Workflows
                </TabsTrigger>
                <TabsTrigger value="templates">
                  <Copy className="h-4 w-4 mr-2" />
                  Templates
                </TabsTrigger>
                <TabsTrigger value="history">
                  <Clock className="h-4 w-4 mr-2" />
                  Run History
                </TabsTrigger>
              </TabsList>

              {/* Workflows Tab */}
              <TabsContent value="workflows">
                <Card>
                  <CardHeader>
                    <CardTitle>My Workflows</CardTitle>
                    <CardDescription>
                      View and manage your automated workflows
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoadingWorkflows ? (
                      <div className="flex justify-center p-8">
                        <RefreshCw className="h-8 w-8 animate-spin text-slate-400" />
                      </div>
                    ) : workflowsError ? (
                      <div className="text-center text-red-500 p-4">
                        Failed to load workflows
                      </div>
                    ) : workflowsData?.workflows.length === 0 ? (
                      <div className="text-center p-8">
                        <GitBranch className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                        <h3 className="text-xl font-medium text-slate-800 mb-1">
                          No workflows yet
                        </h3>
                        <p className="text-slate-500">
                          Get started by creating your first automated workflow
                        </p>
                        <Button
                          onClick={() => setIsCreating(true)}
                          className="mt-4"
                        >
                          Create Workflow
                        </Button>
                      </div>
                    ) : (
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-[250px]">Name</TableHead>
                              <TableHead className="hidden md:table-cell">Trigger</TableHead>
                              <TableHead className="hidden md:table-cell">Last Run</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {workflowsData?.workflows.map((workflow) => (
                              <TableRow key={workflow.id}>
                                <TableCell>
                                  <div className="font-medium">{workflow.name}</div>
                                  <div className="text-sm text-slate-500 truncate max-w-[220px]">
                                    {workflow.description}
                                  </div>
                                </TableCell>
                                <TableCell className="hidden md:table-cell">
                                  {workflow.trigger}
                                </TableCell>
                                <TableCell className="hidden md:table-cell">
                                  {formatDate(workflow.lastRun)}
                                  {workflow.lastRun && (
                                    <div className="text-xs text-slate-500">
                                      {workflow.runCount} runs total
                                    </div>
                                  )}
                                </TableCell>
                                <TableCell>{getStatusBadge(workflow.status)}</TableCell>
                                <TableCell className="text-right">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon">
                                        <MoreHorizontal className="h-4 w-4" />
                                        <span className="sr-only">Actions</span>
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem onClick={() => handleRunNow(workflow)}>
                                        <Zap className="h-4 w-4 mr-2" />
                                        Run Now
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={() => initializeFormForEditing(workflow)}
                                      >
                                        <Edit className="h-4 w-4 mr-2" />
                                        Edit
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => handleToggleStatus(workflow)}>
                                        {workflow.status === "active" ? (
                                          <>
                                            <Pause className="h-4 w-4 mr-2" />
                                            Deactivate
                                          </>
                                        ) : (
                                          <>
                                            <Play className="h-4 w-4 mr-2" />
                                            Activate
                                          </>
                                        )}
                                      </DropdownMenuItem>
                                      <DropdownMenuItem>
                                        <Copy className="h-4 w-4 mr-2" />
                                        Duplicate
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem
                                        className="text-red-600"
                                        onClick={() => handleDeleteWorkflow(workflow)}
                                      >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete
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
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <CardTitle>Workflow Templates</CardTitle>
                        <CardDescription>
                          Pre-built templates to jumpstart your automation
                        </CardDescription>
                      </div>
                      <div className="relative w-full sm:w-auto">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
                        <Input
                          placeholder="Search templates..."
                          className="pl-8 w-full sm:w-[200px]"
                        />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {isLoadingTemplates ? (
                      <div className="flex justify-center p-8">
                        <RefreshCw className="h-8 w-8 animate-spin text-slate-400" />
                      </div>
                    ) : templatesError ? (
                      <div className="text-center text-red-500 p-4">
                        Failed to load templates
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {templatesData?.templates.map((template) => (
                          <Card key={template.id} className="overflow-hidden">
                            <CardHeader className="pb-2">
                              <div className="flex justify-between">
                                <CardTitle className="text-lg">{template.name}</CardTitle>
                                {getComplexityBadge(template.complexity)}
                              </div>
                              <CardDescription>
                                {template.category}
                              </CardDescription>
                            </CardHeader>
                            <CardContent className="pb-2">
                              <p className="text-sm text-slate-600 mb-3">
                                {template.description}
                              </p>
                              <div className="space-y-2 text-sm">
                                <div className="flex items-start gap-2">
                                  <Zap className="h-4 w-4 text-slate-400 mt-0.5" />
                                  <div>
                                    <span className="font-medium">Trigger:</span>{" "}
                                    {template.trigger}
                                  </div>
                                </div>
                                <div className="flex items-start gap-2">
                                  <ArrowRight className="h-4 w-4 text-slate-400 mt-0.5" />
                                  <div>
                                    <span className="font-medium">Actions:</span>
                                    <ul className="pl-1 pt-1 space-y-1">
                                      {template.actions.map((action, idx) => (
                                        <li key={idx} className="flex items-center">
                                          <span className="w-4 h-4 inline-flex items-center justify-center rounded-full text-xs bg-slate-100 mr-1">
                                            {idx + 1}
                                          </span>{" "}
                                          {action}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                            <CardFooter className="pt-2 flex justify-between">
                              <div className="flex items-center text-sm text-slate-500">
                                <Star className="h-3.5 w-3.5 text-yellow-400 mr-1" />
                                {template.popularity} users
                              </div>
                              <Button
                                onClick={() => initializeFormWithTemplate(template)}
                              >
                                Use Template
                              </Button>
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
                    <CardTitle>Workflow Run History</CardTitle>
                    <CardDescription>
                      View the execution history of your automated workflows
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoadingHistory ? (
                      <div className="flex justify-center p-8">
                        <RefreshCw className="h-8 w-8 animate-spin text-slate-400" />
                      </div>
                    ) : historyError ? (
                      <div className="text-center text-red-500 p-4">
                        Failed to load run history
                      </div>
                    ) : historyData?.history.length === 0 ? (
                      <div className="text-center p-8">
                        <Clock className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                        <h3 className="text-xl font-medium text-slate-800 mb-1">
                          No execution history
                        </h3>
                        <p className="text-slate-500">
                          Your workflow execution history will appear here once they run
                        </p>
                      </div>
                    ) : (
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Workflow</TableHead>
                              <TableHead className="hidden md:table-cell">Trigger</TableHead>
                              <TableHead className="hidden md:table-cell">Start Time</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {historyData?.history.map((run) => (
                              <TableRow key={run.id}>
                                <TableCell>
                                  <div className="font-medium">{run.workflowName}</div>
                                  <div className="text-xs text-slate-500 md:hidden">
                                    {formatDate(run.startTime)}
                                  </div>
                                </TableCell>
                                <TableCell className="hidden md:table-cell">
                                  {run.trigger}
                                </TableCell>
                                <TableCell className="hidden md:table-cell">
                                  {formatDate(run.startTime)}
                                  {run.endTime && run.startTime && (
                                    <div className="text-xs text-slate-500">
                                      Duration:{" "}
                                      {Math.round(
                                        (new Date(run.endTime).getTime() -
                                          new Date(run.startTime).getTime()) /
                                          1000
                                      )}{" "}
                                      seconds
                                    </div>
                                  )}
                                </TableCell>
                                <TableCell>{getStatusBadge(run.status)}</TableCell>
                                <TableCell className="text-right">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon">
                                        <MoreHorizontal className="h-4 w-4" />
                                        <span className="sr-only">Actions</span>
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem>
                                        <Eye className="h-4 w-4 mr-2" />
                                        View Details
                                      </DropdownMenuItem>
                                      {run.status === "failed" && (
                                        <DropdownMenuItem>
                                          <RefreshCw className="h-4 w-4 mr-2" />
                                          Retry Execution
                                        </DropdownMenuItem>
                                      )}
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
            </Tabs>
          </div>
        </main>
      </div>

      {/* Create/Edit Workflow Dialog */}
      <Dialog
        open={isCreating || isEditing}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreating(false);
            setIsEditing(false);
            setSelectedWorkflow(null);
            setSelectedTemplate(null);
            form.reset();
          }
        }}
      >
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Edit Workflow" : "Create New Workflow"}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Modify your existing workflow automation"
                : selectedTemplate
                ? `Creating workflow from "${selectedTemplate.name}" template`
                : "Define triggers and actions for your automated workflow"}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Workflow Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Negative Review Alert" {...field} />
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
                        placeholder="e.g., Send alerts when negative reviews are received"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="trigger"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Trigger Event</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a trigger event" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="New review received">
                          New review received
                        </SelectItem>
                        <SelectItem value="New review with rating < 3">
                          New review with rating &lt; 3
                        </SelectItem>
                        <SelectItem value="New review with rating >= 4">
                          New review with rating &gt;= 4
                        </SelectItem>
                        <SelectItem value="Review response published">
                          Review response published
                        </SelectItem>
                        <SelectItem value="7 days after review response">
                          7 days after review response
                        </SelectItem>
                        <SelectItem value="New location created">
                          New location created
                        </SelectItem>
                        <SelectItem value="Schedule: Daily">
                          Schedule: Daily
                        </SelectItem>
                        <SelectItem value="Schedule: Weekly">
                          Schedule: Weekly
                        </SelectItem>
                        <SelectItem value="Schedule: Monthly">
                          Schedule: Monthly
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div>
                <h3 className="text-sm font-medium mb-2">Actions</h3>
                <div className="space-y-3">
                  <FormField
                    control={form.control}
                    name="action1"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-sm font-medium text-slate-600">
                            1
                          </span>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select an action" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Send email notification">
                                Send email notification
                              </SelectItem>
                              <SelectItem value="Create high priority alert">
                                Create high priority alert
                              </SelectItem>
                              <SelectItem value="Assign to team member">
                                Assign to team member
                              </SelectItem>
                              <SelectItem value="Generate AI response">
                                Generate AI response
                              </SelectItem>
                              <SelectItem value="Save as draft">
                                Save as draft
                              </SelectItem>
                              <SelectItem value="Auto-publish response">
                                Auto-publish response
                              </SelectItem>
                              <SelectItem value="Generate analytics report">
                                Generate analytics report
                              </SelectItem>
                              <SelectItem value="Export as PDF">
                                Export as PDF
                              </SelectItem>
                              <SelectItem value="Email to team">
                                Email to team
                              </SelectItem>
                              <SelectItem value="Create internal notification">
                                Create internal notification
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="action2"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-sm font-medium text-slate-600">
                            2
                          </span>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select an action (optional)" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="">
                                - No action -
                              </SelectItem>
                              <SelectItem value="Send email notification">
                                Send email notification
                              </SelectItem>
                              <SelectItem value="Create high priority alert">
                                Create high priority alert
                              </SelectItem>
                              <SelectItem value="Assign to team member">
                                Assign to team member
                              </SelectItem>
                              <SelectItem value="Generate AI response">
                                Generate AI response
                              </SelectItem>
                              <SelectItem value="Save as draft">
                                Save as draft
                              </SelectItem>
                              <SelectItem value="Auto-publish response">
                                Auto-publish response
                              </SelectItem>
                              <SelectItem value="Generate analytics report">
                                Generate analytics report
                              </SelectItem>
                              <SelectItem value="Export as PDF">
                                Export as PDF
                              </SelectItem>
                              <SelectItem value="Email to team">
                                Email to team
                              </SelectItem>
                              <SelectItem value="Create internal notification">
                                Create internal notification
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="action3"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-sm font-medium text-slate-600">
                            3
                          </span>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select an action (optional)" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="">
                                - No action -
                              </SelectItem>
                              <SelectItem value="Send email notification">
                                Send email notification
                              </SelectItem>
                              <SelectItem value="Create high priority alert">
                                Create high priority alert
                              </SelectItem>
                              <SelectItem value="Assign to team member">
                                Assign to team member
                              </SelectItem>
                              <SelectItem value="Generate AI response">
                                Generate AI response
                              </SelectItem>
                              <SelectItem value="Save as draft">
                                Save as draft
                              </SelectItem>
                              <SelectItem value="Auto-publish response">
                                Auto-publish response
                              </SelectItem>
                              <SelectItem value="Generate analytics report">
                                Generate analytics report
                              </SelectItem>
                              <SelectItem value="Export as PDF">
                                Export as PDF
                              </SelectItem>
                              <SelectItem value="Email to team">
                                Email to team
                              </SelectItem>
                              <SelectItem value="Create internal notification">
                                Create internal notification
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <FormField
                control={form.control}
                name="enabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Workflow Status
                      </FormLabel>
                      <FormDescription>
                        Enable or disable this workflow
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsCreating(false);
                    setIsEditing(false);
                    setSelectedWorkflow(null);
                    setSelectedTemplate(null);
                    form.reset();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {isEditing ? "Update Workflow" : "Create Workflow"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default WorkflowsPage;