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
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Ban,
  Bookmark,
  Check,
  ChevronDown,
  Download,
  FileText,
  HelpCircle,
  Info,
  Link2,
  MoreHorizontal,
  RefreshCw,
  Settings,
  ShieldAlert,
  Upload,
  X,
} from "lucide-react";
import { format } from "date-fns";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { queryClient } from "@/lib/queryClient";

// Types
interface ImportHistory {
  id: number;
  source: string;
  platform: string;
  fileName: string;
  importDate: string;
  status: "completed" | "failed" | "in_progress";
  records: number;
  errors: number;
}

interface ExportHistory {
  id: number;
  name: string;
  format: string;
  createdDate: string;
  downloadUrl: string;
  records: number;
  status: "available" | "expired" | "generating";
  expiresIn: string;
}

// Form schemas
const importFormSchema = z.object({
  source: z.string({
    required_error: "Please select an import source",
  }),
  platform: z.string({
    required_error: "Please select a platform",
  }),
  fileOrUrl: z.union([
    z.string().url("Please enter a valid URL"),
    z.instanceof(File, { message: "Please select a file" }),
  ]),
  options: z.object({
    skipDuplicates: z.boolean().default(true),
    importResponses: z.boolean().default(true),
    overwriteExisting: z.boolean().default(false),
  }),
});

const exportFormSchema = z.object({
  format: z.string({
    required_error: "Please select an export format",
  }),
  dateRange: z.string({
    required_error: "Please select a date range",
  }),
  platforms: z.array(z.string()).min(1, "Please select at least one platform"),
  includeResponses: z.boolean().default(true),
  includeCustomerInfo: z.boolean().default(true),
  includeNotes: z.boolean().default(false),
});

const ImportExportPage = () => {
  const [activeTab, setActiveTab] = useState("import");
  const [currentImport, setCurrentImport] = useState<ImportHistory | null>(null);
  const [importProgress, setImportProgress] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  // Fetch import history
  const {
    data: importHistoryData,
    isLoading: isLoadingImport,
    error: importError,
  } = useQuery({
    queryKey: ["/api/import-export/import-history"],
    queryFn: async () => {
      // Mock data
      return {
        history: [
          {
            id: 1,
            source: "CSV",
            platform: "Google",
            fileName: "google_reviews_may2025.csv",
            importDate: "2025-05-10T14:30:00",
            status: "completed",
            records: 124,
            errors: 0,
          },
          {
            id: 2,
            source: "API",
            platform: "Yelp",
            fileName: "yelp_api_import",
            importDate: "2025-05-09T10:15:00",
            status: "completed",
            records: 57,
            errors: 2,
          },
          {
            id: 3,
            source: "JSON",
            platform: "Facebook",
            fileName: "facebook_reviews_q2.json",
            importDate: "2025-05-08T16:45:00",
            status: "failed",
            records: 0,
            errors: 15,
          },
          {
            id: 4,
            source: "API",
            platform: "Google",
            fileName: "google_api_import",
            importDate: "2025-05-07T09:20:00",
            status: "completed",
            records: 89,
            errors: 0,
          },
          {
            id: 5,
            source: "CSV",
            platform: "TripAdvisor",
            fileName: "tripadvisor_may2025.csv",
            importDate: "2025-05-01T11:10:00",
            status: "completed",
            records: 42,
            errors: 3,
          },
        ] as ImportHistory[],
        total: 5,
      };
    },
  });

  // Fetch export history
  const {
    data: exportHistoryData,
    isLoading: isLoadingExport,
    error: exportError,
  } = useQuery({
    queryKey: ["/api/import-export/export-history"],
    queryFn: async () => {
      // Mock data
      return {
        history: [
          {
            id: 1,
            name: "All Reviews - May 2025",
            format: "CSV",
            createdDate: "2025-05-10T14:30:00",
            downloadUrl: "#download-1",
            records: 312,
            status: "available",
            expiresIn: "6 days",
          },
          {
            id: 2,
            name: "Google Reviews - Q2 2025",
            format: "Excel",
            createdDate: "2025-05-08T10:15:00",
            downloadUrl: "#download-2",
            records: 157,
            status: "available",
            expiresIn: "4 days",
          },
          {
            id: 3,
            name: "Customer Feedback Analysis",
            format: "PDF",
            createdDate: "2025-05-05T16:45:00",
            downloadUrl: "#download-3",
            records: 275,
            status: "available",
            expiresIn: "1 day",
          },
          {
            id: 4,
            name: "Negative Reviews - Q1 2025",
            format: "JSON",
            createdDate: "2025-04-15T09:20:00",
            downloadUrl: "",
            records: 48,
            status: "expired",
            expiresIn: "Expired",
          },
          {
            id: 5,
            name: "Review Analytics Report",
            format: "PDF",
            createdDate: "2025-05-11T11:10:00",
            downloadUrl: "",
            records: 189,
            status: "generating",
            expiresIn: "Pending",
          },
        ] as ExportHistory[],
        total: 5,
      };
    },
  });

  // Import form
  const importForm = useForm<z.infer<typeof importFormSchema>>({
    resolver: zodResolver(importFormSchema),
    defaultValues: {
      options: {
        skipDuplicates: true,
        importResponses: true,
        overwriteExisting: false,
      },
    },
  });

  // Export form
  const exportForm = useForm<z.infer<typeof exportFormSchema>>({
    resolver: zodResolver(exportFormSchema),
    defaultValues: {
      includeResponses: true,
      includeCustomerInfo: true,
      includeNotes: false,
      platforms: [],
    },
  });

  const onSubmitImport = (values: z.infer<typeof importFormSchema>) => {
    // Simulate starting an import
    console.log("Starting import:", values);
    
    toast({
      title: "Import Started",
      description: "Your import has been initiated and will process in the background.",
    });
    
    // Simulate an import in progress
    const newImport: ImportHistory = {
      id: Math.floor(Math.random() * 1000),
      source: values.source,
      platform: values.platform,
      fileName: typeof values.fileOrUrl === 'string' 
        ? 'api_import' 
        : values.fileOrUrl.name,
      importDate: new Date().toISOString(),
      status: "in_progress",
      records: 0,
      errors: 0,
    };
    
    setCurrentImport(newImport);
    setImportProgress(0);
    
    // Simulate import progress
    const interval = setInterval(() => {
      setImportProgress((prev) => {
        const newProgress = prev + Math.floor(Math.random() * 10);
        if (newProgress >= 100) {
          clearInterval(interval);
          
          // Update the import to completed status
          setCurrentImport((current) => 
            current ? {
              ...current,
              status: "completed",
              records: Math.floor(Math.random() * 100) + 50,
              errors: Math.floor(Math.random() * 3),
            } : null
          );
          
          // Refresh import history
          queryClient.invalidateQueries({ queryKey: ["/api/import-export/import-history"] });
          
          toast({
            title: "Import Completed",
            description: "Your import has finished processing.",
          });
          
          return 100;
        }
        return newProgress;
      });
    }, 800);
    
    importForm.reset();
  };

  const onSubmitExport = (values: z.infer<typeof exportFormSchema>) => {
    // Simulate starting an export
    console.log("Starting export:", values);
    
    setIsExporting(true);
    
    toast({
      title: "Export Started",
      description: "Your export is being generated and will be available shortly.",
    });
    
    // Simulate export generation delay
    setTimeout(() => {
      setIsExporting(false);
      
      toast({
        title: "Export Ready",
        description: `Your ${values.format} export is ready to download.`,
      });
      
      // Refresh export history
      queryClient.invalidateQueries({ queryKey: ["/api/import-export/export-history"] });
    }, 3000);
    
    exportForm.reset();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500">Completed</Badge>;
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
      case "in_progress":
        return <Badge className="bg-blue-500">In Progress</Badge>;
      case "available":
        return <Badge className="bg-green-500">Available</Badge>;
      case "expired":
        return <Badge variant="outline">Expired</Badge>;
      case "generating":
        return <Badge className="bg-blue-500">Generating</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM d, yyyy 'at' h:mm a");
  };

  return (
    <>
      <Helmet>
        <title>Import & Export | RepuRadar</title>
        <meta
          name="description"
          content="Import and export review data across multiple platforms."
        />
      </Helmet>

      <div className="min-h-screen flex flex-col lg:flex-row">
        <Sidebar />

        <main className="flex-1 p-4 lg:p-6 bg-slate-50 min-h-screen">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <header className="mb-6">
              <h1 className="text-2xl font-semibold text-slate-800">Import & Export</h1>
              <p className="text-slate-500">
                Import and export review data across multiple platforms
              </p>
            </header>

            <Tabs
              defaultValue="import"
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="mb-6">
                <TabsTrigger value="import">
                  <ArrowUpFromLine className="h-4 w-4 mr-2" />
                  Import Reviews
                </TabsTrigger>
                <TabsTrigger value="export">
                  <ArrowDownToLine className="h-4 w-4 mr-2" />
                  Export Reviews
                </TabsTrigger>
                <TabsTrigger value="history">
                  <FileText className="h-4 w-4 mr-2" />
                  Import/Export History
                </TabsTrigger>
              </TabsList>

              {/* Import Tab */}
              <TabsContent value="import">
                {currentImport && currentImport.status === "in_progress" ? (
                  <Card>
                    <CardHeader>
                      <CardTitle>Import in Progress</CardTitle>
                      <CardDescription>
                        Your data is being imported, please wait...
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">
                            Importing from {currentImport.source} ({currentImport.platform})
                          </span>
                          <span className="text-sm font-medium">{importProgress}%</span>
                        </div>
                        <Progress value={importProgress} className="h-2" />
                      </div>
                      <div className="pt-4">
                        <h3 className="text-sm font-medium mb-2">Import Details:</h3>
                        <ul className="text-sm space-y-1 text-slate-500">
                          <li>
                            <span className="inline-block w-28">Source:</span>
                            {currentImport.source}
                          </li>
                          <li>
                            <span className="inline-block w-28">Platform:</span>
                            {currentImport.platform}
                          </li>
                          <li>
                            <span className="inline-block w-28">File:</span>
                            {currentImport.fileName}
                          </li>
                          <li>
                            <span className="inline-block w-28">Started:</span>
                            {formatDate(currentImport.importDate)}
                          </li>
                        </ul>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" onClick={() => setCurrentImport(null)}>
                        Cancel Import
                      </Button>
                    </CardFooter>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Import Reviews</CardTitle>
                        <CardDescription>
                          Import reviews from various sources and platforms
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Form {...importForm}>
                          <form
                            onSubmit={importForm.handleSubmit(onSubmitImport)}
                            className="space-y-4"
                          >
                            <FormField
                              control={importForm.control}
                              name="source"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Import Source</FormLabel>
                                  <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select import source" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="CSV">CSV File</SelectItem>
                                      <SelectItem value="JSON">JSON File</SelectItem>
                                      <SelectItem value="Excel">Excel File</SelectItem>
                                      <SelectItem value="API">API Integration</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={importForm.control}
                              name="platform"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Platform</FormLabel>
                                  <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select platform" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="Google">Google</SelectItem>
                                      <SelectItem value="Yelp">Yelp</SelectItem>
                                      <SelectItem value="Facebook">Facebook</SelectItem>
                                      <SelectItem value="TripAdvisor">TripAdvisor</SelectItem>
                                      <SelectItem value="Custom">Custom</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={importForm.control}
                              name="fileOrUrl"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>
                                    {importForm.watch("source") === "API"
                                      ? "API URL"
                                      : "Upload File"}
                                  </FormLabel>
                                  <FormControl>
                                    {importForm.watch("source") === "API" ? (
                                      <Input
                                        placeholder="https://api.example.com/reviews"
                                        {...field}
                                        value={typeof field.value === "string" ? field.value : ""}
                                        onChange={(e) => field.onChange(e.target.value)}
                                      />
                                    ) : (
                                      <Input
                                        type="file"
                                        accept={
                                          importForm.watch("source") === "CSV"
                                            ? ".csv"
                                            : importForm.watch("source") === "JSON"
                                            ? ".json"
                                            : ".xlsx,.xls"
                                        }
                                        onChange={(e) =>
                                          field.onChange(
                                            e.target.files && e.target.files.length > 0
                                              ? e.target.files[0]
                                              : null
                                          )
                                        }
                                      />
                                    )}
                                  </FormControl>
                                  <FormDescription>
                                    {importForm.watch("source") === "API"
                                      ? "Enter the API endpoint URL"
                                      : `Upload a ${importForm.watch("source")} file containing your review data`}
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <div className="space-y-3">
                              <FormLabel>Import Options</FormLabel>
                              
                              <FormField
                                control={importForm.control}
                                name="options.skipDuplicates"
                                render={({ field }) => (
                                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3">
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                      />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                      <FormLabel>Skip Duplicates</FormLabel>
                                      <FormDescription>
                                        Skip importing reviews that already exist in the system
                                      </FormDescription>
                                    </div>
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={importForm.control}
                                name="options.importResponses"
                                render={({ field }) => (
                                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3">
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                      />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                      <FormLabel>Import Responses</FormLabel>
                                      <FormDescription>
                                        Include review responses in the import
                                      </FormDescription>
                                    </div>
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={importForm.control}
                                name="options.overwriteExisting"
                                render={({ field }) => (
                                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3">
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                      />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                      <FormLabel>Overwrite Existing</FormLabel>
                                      <FormDescription>
                                        Update existing reviews with new data if duplicates are found
                                      </FormDescription>
                                    </div>
                                  </FormItem>
                                )}
                              />
                            </div>

                            <Button type="submit" className="w-full mt-4">
                              Start Import
                            </Button>
                          </form>
                        </Form>
                      </CardContent>
                    </Card>

                    <div className="space-y-6">
                      <Card>
                        <CardHeader>
                          <CardTitle>Recent Imports</CardTitle>
                          <CardDescription>
                            Your most recent data imports
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          {isLoadingImport ? (
                            <div className="flex justify-center p-8">
                              <RefreshCw className="h-8 w-8 animate-spin text-slate-400" />
                            </div>
                          ) : importError ? (
                            <div className="text-center text-red-500 p-4">
                              Failed to load import history
                            </div>
                          ) : importHistoryData?.history.length === 0 ? (
                            <div className="text-center p-8">
                              <FileText className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                              <h3 className="text-xl font-medium text-slate-800 mb-1">
                                No import history
                              </h3>
                              <p className="text-slate-500">
                                You haven't imported any data yet.
                              </p>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {importHistoryData?.history.slice(0, 3).map((item) => (
                                <div
                                  key={item.id}
                                  className="border rounded-md p-3 flex justify-between items-center"
                                >
                                  <div>
                                    <div className="font-medium">{item.fileName}</div>
                                    <div className="text-sm text-slate-500">
                                      {item.platform} • {formatDate(item.importDate)}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {getStatusBadge(item.status)}
                                    <div className="text-sm">
                                      {item.records} records
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </CardContent>
                        <CardFooter>
                          <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => setActiveTab("history")}
                          >
                            View Full History
                          </Button>
                        </CardFooter>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle>Import Tips</CardTitle>
                          <CardDescription>
                            Best practices for importing review data
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-3">
                            <li className="flex gap-2">
                              <Check className="h-5 w-5 text-green-500 shrink-0" />
                              <div className="text-sm">
                                <span className="font-medium">Check file format</span>
                                <p className="text-slate-500">
                                  Ensure your CSV or JSON files have the correct
                                  column headers and format.
                                </p>
                              </div>
                            </li>
                            <li className="flex gap-2">
                              <Check className="h-5 w-5 text-green-500 shrink-0" />
                              <div className="text-sm">
                                <span className="font-medium">Data cleansing</span>
                                <p className="text-slate-500">
                                  Clean your data before importing to avoid errors
                                  and inconsistencies.
                                </p>
                              </div>
                            </li>
                            <li className="flex gap-2">
                              <Check className="h-5 w-5 text-green-500 shrink-0" />
                              <div className="text-sm">
                                <span className="font-medium">Backup before import</span>
                                <p className="text-slate-500">
                                  Always backup your existing data before performing
                                  a large import.
                                </p>
                              </div>
                            </li>
                          </ul>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* Export Tab */}
              <TabsContent value="export">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Export Reviews</CardTitle>
                      <CardDescription>
                        Export your review data in various formats
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Form {...exportForm}>
                        <form
                          onSubmit={exportForm.handleSubmit(onSubmitExport)}
                          className="space-y-4"
                        >
                          <FormField
                            control={exportForm.control}
                            name="format"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Export Format</FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select export format" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="CSV">CSV File</SelectItem>
                                    <SelectItem value="Excel">Excel File</SelectItem>
                                    <SelectItem value="JSON">JSON File</SelectItem>
                                    <SelectItem value="PDF">PDF Report</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={exportForm.control}
                            name="dateRange"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Date Range</FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select date range" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="last_7_days">Last 7 days</SelectItem>
                                    <SelectItem value="last_30_days">Last 30 days</SelectItem>
                                    <SelectItem value="last_3_months">Last 3 months</SelectItem>
                                    <SelectItem value="last_6_months">Last 6 months</SelectItem>
                                    <SelectItem value="last_year">Last year</SelectItem>
                                    <SelectItem value="all_time">All time</SelectItem>
                                    <SelectItem value="custom">Custom range</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={exportForm.control}
                            name="platforms"
                            render={() => (
                              <FormItem>
                                <div className="mb-2">
                                  <FormLabel>Platforms</FormLabel>
                                  <FormDescription>
                                    Select which platforms to include in the export
                                  </FormDescription>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                  {["Google", "Yelp", "Facebook", "TripAdvisor"].map(
                                    (platform) => (
                                      <FormField
                                        key={platform}
                                        control={exportForm.control}
                                        name="platforms"
                                        render={({ field }) => {
                                          return (
                                            <FormItem
                                              key={platform}
                                              className="flex flex-row items-center space-x-2 space-y-0"
                                            >
                                              <FormControl>
                                                <Checkbox
                                                  checked={field.value?.includes(platform)}
                                                  onCheckedChange={(checked) => {
                                                    return checked
                                                      ? field.onChange([
                                                          ...(field.value || []),
                                                          platform,
                                                        ])
                                                      : field.onChange(
                                                          field.value?.filter(
                                                            (value) => value !== platform
                                                          )
                                                        )
                                                  }}
                                                />
                                              </FormControl>
                                              <FormLabel className="text-sm font-normal cursor-pointer">
                                                {platform}
                                              </FormLabel>
                                            </FormItem>
                                          )
                                        }}
                                      />
                                    )
                                  )}
                                </div>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="space-y-4 pt-2">
                            <FormLabel>Export Options</FormLabel>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <FormField
                                control={exportForm.control}
                                name="includeResponses"
                                render={({ field }) => (
                                  <FormItem className="flex flex-row items-start space-x-2 space-y-0">
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                      />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                      <FormLabel>Include Responses</FormLabel>
                                    </div>
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={exportForm.control}
                                name="includeCustomerInfo"
                                render={({ field }) => (
                                  <FormItem className="flex flex-row items-start space-x-2 space-y-0">
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                      />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                      <FormLabel>Include Customer Info</FormLabel>
                                    </div>
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={exportForm.control}
                                name="includeNotes"
                                render={({ field }) => (
                                  <FormItem className="flex flex-row items-start space-x-2 space-y-0">
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                      />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                      <FormLabel>Include Internal Notes</FormLabel>
                                    </div>
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>

                          <Button
                            type="submit"
                            className="w-full mt-4"
                            disabled={isExporting}
                          >
                            {isExporting ? (
                              <>
                                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                Generating Export...
                              </>
                            ) : (
                              "Generate Export"
                            )}
                          </Button>
                        </form>
                      </Form>
                    </CardContent>
                  </Card>

                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Recent Exports</CardTitle>
                        <CardDescription>
                          Your most recent data exports
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {isLoadingExport ? (
                          <div className="flex justify-center p-8">
                            <RefreshCw className="h-8 w-8 animate-spin text-slate-400" />
                          </div>
                        ) : exportError ? (
                          <div className="text-center text-red-500 p-4">
                            Failed to load export history
                          </div>
                        ) : exportHistoryData?.history.length === 0 ? (
                          <div className="text-center p-8">
                            <FileText className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                            <h3 className="text-xl font-medium text-slate-800 mb-1">
                              No export history
                            </h3>
                            <p className="text-slate-500">
                              You haven't exported any data yet.
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {exportHistoryData?.history.slice(0, 3).map((item) => (
                              <div
                                key={item.id}
                                className="border rounded-md p-3 flex justify-between items-center"
                              >
                                <div>
                                  <div className="font-medium">{item.name}</div>
                                  <div className="text-sm text-slate-500">
                                    {item.format} • {formatDate(item.createdDate)}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  {getStatusBadge(item.status)}
                                  {item.status === "available" && (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8"
                                      asChild
                                    >
                                      <a href={item.downloadUrl} download>
                                        <Download className="h-4 w-4" />
                                      </a>
                                    </Button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                      <CardFooter>
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => setActiveTab("history")}
                        >
                          View Full History
                        </Button>
                      </CardFooter>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Export Features</CardTitle>
                        <CardDescription>
                          What you can do with exported data
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-3">
                          <li className="flex gap-2">
                            <Check className="h-5 w-5 text-green-500 shrink-0" />
                            <div className="text-sm">
                              <span className="font-medium">Data Analysis</span>
                              <p className="text-slate-500">
                                Perform your own analysis on review data using
                                Excel or other tools.
                              </p>
                            </div>
                          </li>
                          <li className="flex gap-2">
                            <Check className="h-5 w-5 text-green-500 shrink-0" />
                            <div className="text-sm">
                              <span className="font-medium">Reporting</span>
                              <p className="text-slate-500">
                                Create custom reports for stakeholders or team meetings.
                              </p>
                            </div>
                          </li>
                          <li className="flex gap-2">
                            <Check className="h-5 w-5 text-green-500 shrink-0" />
                            <div className="text-sm">
                              <span className="font-medium">Integration</span>
                              <p className="text-slate-500">
                                Integrate review data with other business systems.
                              </p>
                            </div>
                          </li>
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              {/* History Tab */}
              <TabsContent value="history">
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Import History</CardTitle>
                      <CardDescription>
                        History of all your data imports
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {isLoadingImport ? (
                        <div className="flex justify-center p-8">
                          <RefreshCw className="h-8 w-8 animate-spin text-slate-400" />
                        </div>
                      ) : importError ? (
                        <div className="text-center text-red-500 p-4">
                          Failed to load import history
                        </div>
                      ) : importHistoryData?.history.length === 0 ? (
                        <div className="text-center p-8">
                          <FileText className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                          <h3 className="text-xl font-medium text-slate-800 mb-1">
                            No import history
                          </h3>
                          <p className="text-slate-500">
                            You haven't imported any data yet.
                          </p>
                        </div>
                      ) : (
                        <div className="rounded-md border">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>File Name</TableHead>
                                <TableHead>Platform</TableHead>
                                <TableHead className="hidden md:table-cell">Date</TableHead>
                                <TableHead className="hidden md:table-cell">Records</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {importHistoryData?.history.map((item) => (
                                <TableRow key={item.id}>
                                  <TableCell>
                                    <div className="font-medium">{item.fileName}</div>
                                    <div className="text-xs text-slate-500 md:hidden">
                                      {formatDate(item.importDate)}
                                    </div>
                                  </TableCell>
                                  <TableCell>{item.platform}</TableCell>
                                  <TableCell className="hidden md:table-cell">
                                    {formatDate(item.importDate)}
                                  </TableCell>
                                  <TableCell className="hidden md:table-cell">
                                    {item.records}
                                    {item.errors > 0 && (
                                      <span className="text-red-500 ml-1">
                                        ({item.errors} errors)
                                      </span>
                                    )}
                                  </TableCell>
                                  <TableCell>{getStatusBadge(item.status)}</TableCell>
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
                                          <FileText className="h-4 w-4 mr-2" />
                                          View Details
                                        </DropdownMenuItem>
                                        <DropdownMenuItem>
                                          <RefreshCw className="h-4 w-4 mr-2" />
                                          Retry Import
                                        </DropdownMenuItem>
                                        <DropdownMenuItem>
                                          <Ban className="h-4 w-4 mr-2" />
                                          Delete Record
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

                  <Card>
                    <CardHeader>
                      <CardTitle>Export History</CardTitle>
                      <CardDescription>
                        History of all your data exports
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {isLoadingExport ? (
                        <div className="flex justify-center p-8">
                          <RefreshCw className="h-8 w-8 animate-spin text-slate-400" />
                        </div>
                      ) : exportError ? (
                        <div className="text-center text-red-500 p-4">
                          Failed to load export history
                        </div>
                      ) : exportHistoryData?.history.length === 0 ? (
                        <div className="text-center p-8">
                          <FileText className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                          <h3 className="text-xl font-medium text-slate-800 mb-1">
                            No export history
                          </h3>
                          <p className="text-slate-500">
                            You haven't exported any data yet.
                          </p>
                        </div>
                      ) : (
                        <div className="rounded-md border">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Format</TableHead>
                                <TableHead className="hidden md:table-cell">Date</TableHead>
                                <TableHead className="hidden md:table-cell">Records</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {exportHistoryData?.history.map((item) => (
                                <TableRow key={item.id}>
                                  <TableCell>
                                    <div className="font-medium">{item.name}</div>
                                    <div className="text-xs text-slate-500 md:hidden">
                                      {formatDate(item.createdDate)}
                                    </div>
                                  </TableCell>
                                  <TableCell>{item.format}</TableCell>
                                  <TableCell className="hidden md:table-cell">
                                    {formatDate(item.createdDate)}
                                  </TableCell>
                                  <TableCell className="hidden md:table-cell">
                                    {item.records}
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-2">
                                      {getStatusBadge(item.status)}
                                      {item.status === "available" ? (
                                        <span className="text-xs text-slate-500">
                                          {item.expiresIn}
                                        </span>
                                      ) : null}
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <div className="flex justify-end gap-1">
                                      {item.status === "available" && (
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-8 w-8"
                                          asChild
                                        >
                                          <a href={item.downloadUrl} download>
                                            <Download className="h-4 w-4" />
                                          </a>
                                        </Button>
                                      )}
                                      <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                          <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <MoreHorizontal className="h-4 w-4" />
                                            <span className="sr-only">Actions</span>
                                          </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                          <DropdownMenuSeparator />
                                          {item.status === "available" && (
                                            <DropdownMenuItem asChild>
                                              <a href={item.downloadUrl} download>
                                                <Download className="h-4 w-4 mr-2" />
                                                Download
                                              </a>
                                            </DropdownMenuItem>
                                          )}
                                          <DropdownMenuItem>
                                            <Link2 className="h-4 w-4 mr-2" />
                                            Share Link
                                          </DropdownMenuItem>
                                          <DropdownMenuItem>
                                            <RefreshCw className="h-4 w-4 mr-2" />
                                            Regenerate
                                          </DropdownMenuItem>
                                          <DropdownMenuItem>
                                            <Bookmark className="h-4 w-4 mr-2" />
                                            Save Settings
                                          </DropdownMenuItem>
                                          <DropdownMenuSeparator />
                                          <DropdownMenuItem className="text-red-600">
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Delete
                                          </DropdownMenuItem>
                                        </DropdownMenuContent>
                                      </DropdownMenu>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </>
  );
};

export default ImportExportPage;