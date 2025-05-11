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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  AreaChart,
  BarChart,
  ChevronDown,
  Copy,
  Database,
  Edit,
  GripHorizontal,
  Layers,
  LineChart,
  Minus,
  MoreHorizontal,
  PieChart,
  Plus,
  PlusCircle,
  RefreshCw,
  Save,
  Search,
  Share2,
  Trash2,
  XCircle
} from "lucide-react";
import { queryClient } from "@/lib/queryClient";

// Types
interface Dashboard {
  id: number;
  name: string;
  description: string;
  isDefault: boolean;
  layout: DashboardLayout;
  createdAt: string;
  updatedAt: string;
}

interface DashboardLayout {
  widgets: Widget[];
  columns: number;
}

interface Widget {
  id: string;
  type: string;
  title: string;
  size: 'small' | 'medium' | 'large';
  position: {
    x: number;
    y: number;
  };
  settings: any;
  data?: any;
}

interface WidgetTemplate {
  id: string;
  type: string;
  title: string;
  description: string;
  category: string;
  icon: React.ReactNode;
  defaultSize: 'small' | 'medium' | 'large';
  availableSizes: string[];
  settings: any;
}

// Form schemas
const dashboardFormSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().min(5, "Description must be at least 5 characters"),
  isDefault: z.boolean().default(false),
});

const widgetFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  type: z.string(),
  size: z.enum(["small", "medium", "large"]),
  dataSource: z.string().optional(),
  refreshInterval: z.string().optional(),
  settings: z.record(z.any()).optional(),
});

const DashboardBuilderPage = () => {
  const [activeDashboard, setActiveDashboard] = useState<number | null>(null);
  const [isCreatingDashboard, setIsCreatingDashboard] = useState(false);
  const [isEditingDashboard, setIsEditingDashboard] = useState(false);
  const [isAddingWidget, setIsAddingWidget] = useState(false);
  const [selectedWidgetTemplate, setSelectedWidgetTemplate] = useState<WidgetTemplate | null>(null);
  const [editMode, setEditMode] = useState(false);
  const { toast } = useToast();

  // Fetch dashboards
  const {
    data: dashboardsData,
    isLoading: isLoadingDashboards,
    error: dashboardsError,
  } = useQuery({
    queryKey: ["/api/dashboards"],
    queryFn: async () => {
      // Mock data
      const dashboards: Dashboard[] = [
        {
          id: 1,
          name: "Default Dashboard",
          description: "Overview of key performance metrics",
          isDefault: true,
          layout: {
            widgets: [
              {
                id: "widget1",
                type: "reviews_by_rating",
                title: "Reviews by Rating",
                size: "medium",
                position: { x: 0, y: 0 },
                settings: {
                  chartType: "pie",
                  period: "last_30_days",
                },
              },
              {
                id: "widget2",
                type: "reviews_by_platform",
                title: "Reviews by Platform",
                size: "medium",
                position: { x: 1, y: 0 },
                settings: {
                  chartType: "bar",
                  period: "last_30_days",
                },
              },
              {
                id: "widget3",
                type: "sentiment_trend",
                title: "Sentiment Trend",
                size: "large",
                position: { x: 0, y: 1 },
                settings: {
                  chartType: "line",
                  period: "last_90_days",
                  interval: "week",
                },
              },
              {
                id: "widget4",
                type: "recent_reviews",
                title: "Recent Reviews",
                size: "small",
                position: { x: 0, y: 2 },
                settings: {
                  limit: 5,
                  showRating: true,
                },
              },
              {
                id: "widget5",
                type: "stats_summary",
                title: "Key Metrics",
                size: "small",
                position: { x: 1, y: 2 },
                settings: {
                  metrics: ["avg_rating", "total_reviews", "response_rate"],
                  comparison: "previous_period",
                },
              },
            ],
            columns: 2,
          },
          createdAt: "2025-04-10T10:00:00",
          updatedAt: "2025-05-05T15:30:00",
        },
        {
          id: 2,
          name: "Executive Summary",
          description: "High-level metrics for management review",
          isDefault: false,
          layout: {
            widgets: [
              {
                id: "widget1",
                type: "stats_summary",
                title: "Monthly Performance",
                size: "large",
                position: { x: 0, y: 0 },
                settings: {
                  metrics: [
                    "avg_rating",
                    "total_reviews",
                    "response_rate",
                    "negative_reviews",
                  ],
                  comparison: "previous_period",
                },
              },
              {
                id: "widget2",
                type: "rating_comparison",
                title: "Rating vs Competitors",
                size: "medium",
                position: { x: 0, y: 1 },
                settings: {
                  chartType: "bar",
                  competitors: ["competitor1", "competitor2", "competitor3"],
                },
              },
              {
                id: "widget3",
                type: "sentiment_analysis",
                title: "Key Topics",
                size: "medium",
                position: { x: 1, y: 1 },
                settings: {
                  period: "last_90_days",
                  maxTopics: 5,
                },
              },
            ],
            columns: 2,
          },
          createdAt: "2025-04-15T11:20:00",
          updatedAt: "2025-05-08T09:45:00",
        },
        {
          id: 3,
          name: "Location Performance",
          description: "Detailed metrics by location",
          isDefault: false,
          layout: {
            widgets: [
              {
                id: "widget1",
                type: "location_map",
                title: "Locations Overview",
                size: "large",
                position: { x: 0, y: 0 },
                settings: {
                  mapType: "heat",
                  metric: "avg_rating",
                },
              },
              {
                id: "widget2",
                type: "location_comparison",
                title: "Location Comparison",
                size: "large",
                position: { x: 0, y: 1 },
                settings: {
                  chartType: "bar",
                  sortBy: "avg_rating",
                  limit: 10,
                },
              },
            ],
            columns: 1,
          },
          createdAt: "2025-04-20T14:30:00",
          updatedAt: "2025-05-07T16:15:00",
        },
      ];

      return {
        dashboards,
        total: dashboards.length,
      };
    },
  });

  // Widget templates
  const widgetTemplates: WidgetTemplate[] = [
    {
      id: "reviews_by_rating",
      type: "reviews_by_rating",
      title: "Reviews by Rating",
      description: "Distribution of reviews by star rating",
      category: "Reviews",
      icon: <PieChart className="h-5 w-5" />,
      defaultSize: "medium",
      availableSizes: ["small", "medium", "large"],
      settings: {
        chartType: "pie",
        period: "last_30_days",
      },
    },
    {
      id: "reviews_by_platform",
      type: "reviews_by_platform",
      title: "Reviews by Platform",
      description: "Distribution of reviews across platforms",
      category: "Reviews",
      icon: <BarChart className="h-5 w-5" />,
      defaultSize: "medium",
      availableSizes: ["small", "medium", "large"],
      settings: {
        chartType: "bar",
        period: "last_30_days",
      },
    },
    {
      id: "sentiment_trend",
      type: "sentiment_trend",
      title: "Sentiment Trend",
      description: "Sentiment score trend over time",
      category: "Analytics",
      icon: <LineChart className="h-5 w-5" />,
      defaultSize: "large",
      availableSizes: ["medium", "large"],
      settings: {
        chartType: "line",
        period: "last_90_days",
        interval: "week",
      },
    },
    {
      id: "recent_reviews",
      type: "recent_reviews",
      title: "Recent Reviews",
      description: "List of most recent reviews",
      category: "Reviews",
      icon: <Database className="h-5 w-5" />,
      defaultSize: "small",
      availableSizes: ["small", "medium"],
      settings: {
        limit: 5,
        showRating: true,
      },
    },
    {
      id: "stats_summary",
      type: "stats_summary",
      title: "Key Metrics",
      description: "Summary of key performance metrics",
      category: "Analytics",
      icon: <Layers className="h-5 w-5" />,
      defaultSize: "small",
      availableSizes: ["small", "medium", "large"],
      settings: {
        metrics: ["avg_rating", "total_reviews", "response_rate"],
        comparison: "previous_period",
      },
    },
    {
      id: "rating_comparison",
      type: "rating_comparison",
      title: "Rating Comparison",
      description: "Compare ratings with competitors",
      category: "Competitors",
      icon: <BarChart className="h-5 w-5" />,
      defaultSize: "medium",
      availableSizes: ["medium", "large"],
      settings: {
        chartType: "bar",
        competitors: [],
      },
    },
    {
      id: "sentiment_analysis",
      type: "sentiment_analysis",
      title: "Sentiment Analysis",
      description: "Analysis of review sentiment and topics",
      category: "Analytics",
      icon: <PieChart className="h-5 w-5" />,
      defaultSize: "medium",
      availableSizes: ["medium", "large"],
      settings: {
        period: "last_90_days",
        maxTopics: 5,
      },
    },
    {
      id: "location_map",
      type: "location_map",
      title: "Locations Map",
      description: "Geographical map of locations",
      category: "Locations",
      icon: <GripHorizontal className="h-5 w-5" />,
      defaultSize: "large",
      availableSizes: ["large"],
      settings: {
        mapType: "heat",
        metric: "avg_rating",
      },
    },
    {
      id: "location_comparison",
      type: "location_comparison",
      title: "Location Comparison",
      description: "Compare metrics across locations",
      category: "Locations",
      icon: <BarChart className="h-5 w-5" />,
      defaultSize: "large",
      availableSizes: ["medium", "large"],
      settings: {
        chartType: "bar",
        sortBy: "avg_rating",
        limit: 10,
      },
    },
  ];

  // Dashboard form
  const dashboardForm = useForm<z.infer<typeof dashboardFormSchema>>({
    resolver: zodResolver(dashboardFormSchema),
    defaultValues: {
      name: "",
      description: "",
      isDefault: false,
    },
  });

  // Widget form
  const widgetForm = useForm<z.infer<typeof widgetFormSchema>>({
    resolver: zodResolver(widgetFormSchema),
    defaultValues: {
      title: "",
      type: "",
      size: "medium",
      dataSource: "all",
      refreshInterval: "never",
    },
  });

  // Get currently active dashboard
  const getActiveDashboardData = () => {
    if (!activeDashboard || !dashboardsData) return null;
    return dashboardsData.dashboards.find((d) => d.id === activeDashboard);
  };

  const currentDashboard = getActiveDashboardData();

  // Initialize dashboard form with existing data
  const initDashboardEditForm = (dashboard: Dashboard) => {
    dashboardForm.reset({
      name: dashboard.name,
      description: dashboard.description,
      isDefault: dashboard.isDefault,
    });
    setIsEditingDashboard(true);
  };

  // Initialize widget form with template data
  const initWidgetForm = (template: WidgetTemplate) => {
    widgetForm.reset({
      title: template.title,
      type: template.type,
      size: template.defaultSize,
      dataSource: "all",
      refreshInterval: "never",
      settings: template.settings,
    });
    setSelectedWidgetTemplate(template);
    setIsAddingWidget(true);
  };

  const onSubmitDashboard = (values: z.infer<typeof dashboardFormSchema>) => {
    console.log("Creating/Updating dashboard:", values);
    
    if (isEditingDashboard) {
      toast({
        title: "Dashboard Updated",
        description: `${values.name} has been updated successfully.`,
      });
    } else {
      toast({
        title: "Dashboard Created",
        description: `${values.name} has been created successfully.`,
      });
      
      // Set the new dashboard as active (would be handled by API response in real implementation)
      setActiveDashboard(Math.floor(Math.random() * 1000));
    }
    
    // Close the dialog and reset form
    setIsCreatingDashboard(false);
    setIsEditingDashboard(false);
    dashboardForm.reset();
    
    // Refresh dashboards
    queryClient.invalidateQueries({ queryKey: ["/api/dashboards"] });
  };

  const onSubmitWidget = (values: z.infer<typeof widgetFormSchema>) => {
    console.log("Adding widget:", values);
    
    toast({
      title: "Widget Added",
      description: `${values.title} has been added to your dashboard.`,
    });
    
    // Close the dialog and reset form
    setIsAddingWidget(false);
    setSelectedWidgetTemplate(null);
    widgetForm.reset();
    
    // Refresh dashboards
    queryClient.invalidateQueries({ queryKey: ["/api/dashboards"] });
  };

  const handleDeleteDashboard = (dashboardId: number) => {
    toast({
      title: "Dashboard Deleted",
      description: "Dashboard has been deleted successfully.",
    });
    
    // If deleted dashboard was active, set active to null
    if (activeDashboard === dashboardId) {
      setActiveDashboard(null);
    }
    
    // Refresh dashboards
    queryClient.invalidateQueries({ queryKey: ["/api/dashboards"] });
  };

  const handleDuplicateDashboard = (dashboard: Dashboard) => {
    toast({
      title: "Dashboard Duplicated",
      description: `${dashboard.name} has been duplicated successfully.`,
    });
    
    // Refresh dashboards
    queryClient.invalidateQueries({ queryKey: ["/api/dashboards"] });
  };

  const handleDeleteWidget = (widgetId: string) => {
    toast({
      title: "Widget Removed",
      description: "Widget has been removed from your dashboard.",
    });
    
    // Refresh dashboards
    queryClient.invalidateQueries({ queryKey: ["/api/dashboards"] });
  };

  // Custom widget renderer function
  const renderWidget = (widget: Widget) => {
    switch (widget.type) {
      case "reviews_by_rating":
        return (
          <div className="h-full flex items-center justify-center bg-slate-100 rounded-md">
            <PieChart className="h-12 w-12 text-slate-300" />
            <span className="sr-only">Reviews by Rating chart</span>
          </div>
        );
      case "reviews_by_platform":
        return (
          <div className="h-full flex items-center justify-center bg-slate-100 rounded-md">
            <BarChart className="h-12 w-12 text-slate-300" />
            <span className="sr-only">Reviews by Platform chart</span>
          </div>
        );
      case "sentiment_trend":
        return (
          <div className="h-full flex items-center justify-center bg-slate-100 rounded-md">
            <LineChart className="h-12 w-12 text-slate-300" />
            <span className="sr-only">Sentiment Trend chart</span>
          </div>
        );
      case "recent_reviews":
        return (
          <div className="h-full flex items-center justify-center bg-slate-100 rounded-md">
            <Database className="h-12 w-12 text-slate-300" />
            <span className="sr-only">Recent Reviews list</span>
          </div>
        );
      case "stats_summary":
        return (
          <div className="h-full flex items-center justify-center bg-slate-100 rounded-md">
            <Layers className="h-12 w-12 text-slate-300" />
            <span className="sr-only">Key Metrics summary</span>
          </div>
        );
      case "rating_comparison":
        return (
          <div className="h-full flex items-center justify-center bg-slate-100 rounded-md">
            <BarChart className="h-12 w-12 text-slate-300" />
            <span className="sr-only">Rating Comparison chart</span>
          </div>
        );
      case "sentiment_analysis":
        return (
          <div className="h-full flex items-center justify-center bg-slate-100 rounded-md">
            <PieChart className="h-12 w-12 text-slate-300" />
            <span className="sr-only">Sentiment Analysis chart</span>
          </div>
        );
      case "location_map":
        return (
          <div className="h-full flex items-center justify-center bg-slate-100 rounded-md">
            <GripHorizontal className="h-12 w-12 text-slate-300" />
            <span className="sr-only">Locations Map</span>
          </div>
        );
      case "location_comparison":
        return (
          <div className="h-full flex items-center justify-center bg-slate-100 rounded-md">
            <BarChart className="h-12 w-12 text-slate-300" />
            <span className="sr-only">Location Comparison chart</span>
          </div>
        );
      default:
        return (
          <div className="h-full flex items-center justify-center bg-slate-100 rounded-md">
            <div className="text-slate-400">Unknown widget type</div>
          </div>
        );
    }
  };

  return (
    <>
      <Helmet>
        <title>Dashboard Builder | RepuRadar</title>
        <meta
          name="description"
          content="Create and customize your own dashboards with the metrics that matter most to you."
        />
      </Helmet>

      <div className="min-h-screen flex flex-col lg:flex-row">
        <Sidebar />

        <main className="flex-1 p-4 lg:p-6 bg-slate-50 min-h-screen">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <header className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-semibold text-slate-800">Dashboard Builder</h1>
                <p className="text-slate-500">
                  Create and customize dashboards with your most important metrics
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Select
                  value={activeDashboard?.toString() || ""}
                  onValueChange={(value) => setActiveDashboard(parseInt(value))}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select Dashboard" />
                  </SelectTrigger>
                  <SelectContent>
                    {dashboardsData?.dashboards.map((dashboard) => (
                      <SelectItem key={dashboard.id} value={dashboard.id.toString()}>
                        {dashboard.name}
                        {dashboard.isDefault && " (Default)"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={() => setIsCreatingDashboard(true)}>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  New Dashboard
                </Button>
              </div>
            </header>

            {/* Dashboard Content */}
            {isLoadingDashboards ? (
              <div className="flex justify-center p-12">
                <RefreshCw className="h-8 w-8 animate-spin text-slate-400" />
              </div>
            ) : dashboardsError ? (
              <div className="text-center text-red-500 p-8">
                Failed to load dashboards
              </div>
            ) : !currentDashboard ? (
              <Card className="flex flex-col items-center justify-center p-12 text-center">
                <Layers className="h-12 w-12 text-slate-300 mb-3" />
                <h2 className="text-xl font-medium text-slate-800 mb-2">
                  No Dashboard Selected
                </h2>
                <p className="text-slate-500 mb-6 max-w-md">
                  Select an existing dashboard from the dropdown above or create a new one to get started.
                </p>
                <div className="flex gap-3">
                  <Select
                    value={activeDashboard?.toString() || ""}
                    onValueChange={(value) => setActiveDashboard(parseInt(value))}
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Select Dashboard" />
                    </SelectTrigger>
                    <SelectContent>
                      {dashboardsData?.dashboards.map((dashboard) => (
                        <SelectItem key={dashboard.id} value={dashboard.id.toString()}>
                          {dashboard.name}
                          {dashboard.isDefault && " (Default)"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button onClick={() => setIsCreatingDashboard(true)}>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    New Dashboard
                  </Button>
                </div>
              </Card>
            ) : (
              <>
                <div className="mb-4 flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-medium text-slate-800">
                      {currentDashboard.name}
                      {currentDashboard.isDefault && (
                        <Badge className="ml-2 bg-blue-500">Default</Badge>
                      )}
                    </h2>
                    <p className="text-slate-500">{currentDashboard.description}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={editMode ? "default" : "outline"}
                      onClick={() => setEditMode(!editMode)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      {editMode ? "Save Layout" : "Edit Layout"}
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Dashboard Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => initDashboardEditForm(currentDashboard)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Settings
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicateDashboard(currentDashboard)}>
                          <Copy className="h-4 w-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Share2 className="h-4 w-4 mr-2" />
                          Share
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDeleteDashboard(currentDashboard.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Dashboard Layout */}
                <div className="bg-white rounded-md border p-4 min-h-[600px]">
                  {editMode && (
                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md flex justify-between items-center">
                      <div className="flex items-center">
                        <Edit className="h-5 w-5 text-blue-500 mr-2" />
                        <span className="text-blue-700 font-medium">Edit Mode</span>
                        <span className="text-blue-600 ml-2 hidden sm:inline">
                          Rearrange widgets and add new ones to customize your dashboard
                        </span>
                      </div>
                      <Button onClick={() => setIsAddingWidget(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Widget
                      </Button>
                    </div>
                  )}

                  <ResizablePanelGroup
                    direction="vertical"
                    className="min-h-[600px] rounded-lg border"
                  >
                    {/* Row groups based on widget positions */}
                    {[0, 1, 2].map((rowIdx) => {
                      const rowWidgets = currentDashboard.layout.widgets.filter(
                        (w) => w.position.y === rowIdx
                      );
                      
                      if (rowWidgets.length === 0) return null;
                      
                      return (
                        <ResizablePanel key={`row-${rowIdx}`} defaultSize={100}>
                          <div className="p-3">
                            <ResizablePanelGroup direction="horizontal">
                              {rowWidgets.map((widget, idx) => (
                                <React.Fragment key={widget.id}>
                                  <ResizablePanel
                                    defaultSize={
                                      widget.size === "small"
                                        ? 33
                                        : widget.size === "medium"
                                        ? 50
                                        : 100
                                    }
                                  >
                                    <Card className="h-full">
                                      <CardHeader className="px-4 py-3 flex flex-row items-center justify-between space-y-0">
                                        <CardTitle className="text-base font-medium">
                                          {widget.title}
                                        </CardTitle>
                                        {editMode && (
                                          <div className="flex items-center gap-1">
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              className="h-7 w-7"
                                              onClick={() => handleDeleteWidget(widget.id)}
                                            >
                                              <Minus className="h-4 w-4" />
                                              <span className="sr-only">Remove</span>
                                            </Button>
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              className="h-7 w-7"
                                            >
                                              <GripHorizontal className="h-4 w-4" />
                                              <span className="sr-only">Move</span>
                                            </Button>
                                          </div>
                                        )}
                                        {!editMode && (
                                          <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                              <Button variant="ghost" size="icon" className="h-7 w-7">
                                                <MoreHorizontal className="h-4 w-4" />
                                                <span className="sr-only">Actions</span>
                                              </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                              <DropdownMenuItem>
                                                <RefreshCw className="h-4 w-4 mr-2" />
                                                Refresh
                                              </DropdownMenuItem>
                                              <DropdownMenuItem>
                                                <Edit className="h-4 w-4 mr-2" />
                                                Edit Widget
                                              </DropdownMenuItem>
                                              <DropdownMenuItem>
                                                <Download className="h-4 w-4 mr-2" />
                                                Export Data
                                              </DropdownMenuItem>
                                            </DropdownMenuContent>
                                          </DropdownMenu>
                                        )}
                                      </CardHeader>
                                      <CardContent className="px-4 py-0">
                                        <div
                                          className={`${
                                            widget.size === "small"
                                              ? "h-40"
                                              : widget.size === "medium"
                                              ? "h-60"
                                              : "h-80"
                                          }`}
                                        >
                                          {renderWidget(widget)}
                                        </div>
                                      </CardContent>
                                    </Card>
                                  </ResizablePanel>
                                  {idx < rowWidgets.length - 1 && <ResizableHandle withHandle />}
                                </React.Fragment>
                              ))}
                            </ResizablePanelGroup>
                          </div>
                          {rowIdx < 2 && <ResizableHandle withHandle />}
                        </ResizablePanel>
                      );
                    })}
                  </ResizablePanelGroup>
                </div>
              </>
            )}
          </div>
        </main>
      </div>

      {/* Create/Edit Dashboard Dialog */}
      <Dialog
        open={isCreatingDashboard || isEditingDashboard}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreatingDashboard(false);
            setIsEditingDashboard(false);
            dashboardForm.reset();
          }
        }}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {isEditingDashboard ? "Edit Dashboard" : "Create New Dashboard"}
            </DialogTitle>
            <DialogDescription>
              {isEditingDashboard
                ? "Update your dashboard settings"
                : "Create a new custom dashboard to track your most important metrics"}
            </DialogDescription>
          </DialogHeader>

          <Form {...dashboardForm}>
            <form
              onSubmit={dashboardForm.handleSubmit(onSubmitDashboard)}
              className="space-y-4 pt-4"
            >
              <FormField
                control={dashboardForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dashboard Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Performance Overview" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={dashboardForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Key metrics for daily performance tracking"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={dashboardForm.control}
                name="isDefault"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Set as Default Dashboard</FormLabel>
                      <FormDescription>
                        This dashboard will be shown by default when you access the application
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsCreatingDashboard(false);
                    setIsEditingDashboard(false);
                    dashboardForm.reset();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {isEditingDashboard ? "Update Dashboard" : "Create Dashboard"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Add Widget Dialog */}
      <Dialog
        open={isAddingWidget}
        onOpenChange={(open) => {
          if (!open) {
            setIsAddingWidget(false);
            setSelectedWidgetTemplate(null);
            widgetForm.reset();
          }
        }}
      >
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Add Widget</DialogTitle>
            <DialogDescription>
              Add a new widget to your dashboard
            </DialogDescription>
          </DialogHeader>

          {selectedWidgetTemplate ? (
            <Form {...widgetForm}>
              <form
                onSubmit={widgetForm.handleSubmit(onSubmitWidget)}
                className="space-y-4 pt-4"
              >
                <FormField
                  control={widgetForm.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Widget Title</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={widgetForm.control}
                  name="size"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Widget Size</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select size" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {selectedWidgetTemplate.availableSizes.includes("small") && (
                            <SelectItem value="small">Small</SelectItem>
                          )}
                          {selectedWidgetTemplate.availableSizes.includes("medium") && (
                            <SelectItem value="medium">Medium</SelectItem>
                          )}
                          {selectedWidgetTemplate.availableSizes.includes("large") && (
                            <SelectItem value="large">Large</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={widgetForm.control}
                  name="dataSource"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data Source</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select data source" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="all">All Locations</SelectItem>
                          <SelectItem value="location_group">Location Group</SelectItem>
                          <SelectItem value="specific_location">Specific Location</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={widgetForm.control}
                  name="refreshInterval"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Refresh Interval</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select refresh interval" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="never">Never (Manual refresh only)</SelectItem>
                          <SelectItem value="1h">Every hour</SelectItem>
                          <SelectItem value="6h">Every 6 hours</SelectItem>
                          <SelectItem value="12h">Every 12 hours</SelectItem>
                          <SelectItem value="24h">Daily</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsAddingWidget(false);
                      setSelectedWidgetTemplate(null);
                      widgetForm.reset();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Add Widget</Button>
                </DialogFooter>
              </form>
            </Form>
          ) : (
            <>
              <div className="mb-4">
                <Input
                  placeholder="Search widgets..."
                  className="w-full"
                  startIcon={<Search className="h-4 w-4" />}
                />
              </div>

              <Tabs defaultValue="all">
                <TabsList className="mb-4">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="Reviews">Reviews</TabsTrigger>
                  <TabsTrigger value="Analytics">Analytics</TabsTrigger>
                  <TabsTrigger value="Competitors">Competitors</TabsTrigger>
                  <TabsTrigger value="Locations">Locations</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="mt-0">
                  <ScrollArea className="h-[350px] pr-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {widgetTemplates.map((template) => (
                        <Card
                          key={template.id}
                          className="cursor-pointer hover:bg-slate-50 transition-colors"
                          onClick={() => initWidgetForm(template)}
                        >
                          <CardHeader className="p-4 pb-2">
                            <div className="flex justify-between items-start">
                              <div className="flex items-center gap-2">
                                <div className="bg-slate-100 p-1.5 rounded">
                                  {template.icon}
                                </div>
                                <CardTitle className="text-base">{template.title}</CardTitle>
                              </div>
                              <Badge variant="outline">{template.category}</Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="p-4 pt-2">
                            <p className="text-sm text-slate-500">{template.description}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>

                {["Reviews", "Analytics", "Competitors", "Locations"].map((category) => (
                  <TabsContent key={category} value={category} className="mt-0">
                    <ScrollArea className="h-[350px] pr-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {widgetTemplates
                          .filter((t) => t.category === category)
                          .map((template) => (
                            <Card
                              key={template.id}
                              className="cursor-pointer hover:bg-slate-50 transition-colors"
                              onClick={() => initWidgetForm(template)}
                            >
                              <CardHeader className="p-4 pb-2">
                                <div className="flex justify-between items-start">
                                  <div className="flex items-center gap-2">
                                    <div className="bg-slate-100 p-1.5 rounded">
                                      {template.icon}
                                    </div>
                                    <CardTitle className="text-base">{template.title}</CardTitle>
                                  </div>
                                  <Badge variant="outline">{template.category}</Badge>
                                </div>
                              </CardHeader>
                              <CardContent className="p-4 pt-2">
                                <p className="text-sm text-slate-500">{template.description}</p>
                              </CardContent>
                            </Card>
                          ))}
                      </div>
                    </ScrollArea>
                  </TabsContent>
                ))}
              </Tabs>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAddingWidget(false);
                    setSelectedWidgetTemplate(null);
                    widgetForm.reset();
                  }}
                >
                  Cancel
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DashboardBuilderPage;