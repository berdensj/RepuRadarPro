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
import { Textarea } from "@/components/ui/textarea";
import { Code } from "@/components/ui/code";
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
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  AlertCircle,
  AlertTriangle,
  Check,
  Clock,
  Code as CodeIcon,
  Copy,
  Database,
  Edit,
  EyeIcon,
  EyeOff,
  FileJson,
  Key,
  LineChart,
  Lock,
  MoreHorizontal,
  PlusCircle,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
  UploadCloud,
  Webhook,
} from "lucide-react";
import { format, formatDistance, subDays } from "date-fns";
import { queryClient } from "@/lib/queryClient";

// Types
interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  createdAt: string;
  lastUsed: string | null;
  expiresAt: string | null;
  permissions: string[];
  status: "active" | "revoked" | "expired";
  usageCount: number;
  rateLimit: number;
}

interface ApiUsage {
  date: string;
  requests: number;
  successRate: number;
  avgResponseTime: number;
}

interface ApiEndpoint {
  path: string;
  method: string;
  description: string;
  parameters: {
    name: string;
    type: string;
    required: boolean;
    description: string;
  }[];
  responses: {
    status: number;
    description: string;
    example: any;
  }[];
  authentication: boolean;
  rateLimit: number;
}

interface Webhook {
  id: string;
  url: string;
  events: string[];
  createdAt: string;
  lastTriggered: string | null;
  status: "active" | "inactive" | "failed";
  secretKey: string;
  deliveryAttempts: number;
  successfulDeliveries: number;
}

// Form schemas
const apiKeyFormSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  permissions: z.array(z.string()).min(1, "Select at least one permission"),
  expiresIn: z.string(),
  rateLimit: z.number().min(1, "Rate limit must be at least 1"),
});

const webhookFormSchema = z.object({
  url: z.string().url("Please enter a valid URL"),
  events: z.array(z.string()).min(1, "Select at least one event"),
  description: z.string().optional(),
});

const ApiAccessPage = () => {
  const [activeTab, setActiveTab] = useState("keys");
  const [showSecret, setShowSecret] = useState(false);
  const [newApiKey, setNewApiKey] = useState<{
    key: string;
    prefix: string;
  } | null>(null);
  const [isCreatingKey, setIsCreatingKey] = useState(false);
  const [isCreatingWebhook, setIsCreatingWebhook] = useState(false);
  const [selectedApiKey, setSelectedApiKey] = useState<ApiKey | null>(null);
  const [selectedEndpoint, setSelectedEndpoint] = useState<ApiEndpoint | null>(
    null
  );
  const { toast } = useToast();

  // Fetch API Keys
  const {
    data: apiKeysData,
    isLoading: isLoadingKeys,
    error: keysError,
  } = useQuery({
    queryKey: ["/api/api-keys"],
    queryFn: async () => {
      // Mock data
      const apiKeys: ApiKey[] = [
        {
          id: "key_1a2b3c4d5e6f",
          name: "Production API Key",
          prefix: "pk_live_",
          createdAt: "2025-04-20T14:30:00",
          lastUsed: "2025-05-10T09:15:00",
          expiresAt: "2026-04-20T14:30:00",
          permissions: ["read:reviews", "write:reviews", "read:metrics"],
          status: "active",
          usageCount: 1287,
          rateLimit: 100,
        },
        {
          id: "key_7g8h9i0j1k2l",
          name: "Development Key",
          prefix: "pk_dev_",
          createdAt: "2025-04-25T10:15:00",
          lastUsed: "2025-05-09T16:45:00",
          expiresAt: null,
          permissions: ["read:reviews", "read:metrics"],
          status: "active",
          usageCount: 532,
          rateLimit: 50,
        },
        {
          id: "key_3m4n5o6p7q8r",
          name: "Test Key",
          prefix: "pk_test_",
          createdAt: "2025-05-01T11:30:00",
          lastUsed: "2025-05-08T14:20:00",
          expiresAt: "2025-05-08T11:30:00",
          permissions: ["read:reviews"],
          status: "expired",
          usageCount: 175,
          rateLimit: 20,
        },
        {
          id: "key_9s0t1u2v3w4x",
          name: "Analytics Integration",
          prefix: "pk_live_",
          createdAt: "2025-04-15T09:45:00",
          lastUsed: "2025-05-07T13:10:00",
          expiresAt: null,
          permissions: ["read:metrics", "read:reviews"],
          status: "active",
          usageCount: 976,
          rateLimit: 75,
        },
        {
          id: "key_5y6z7a8b9c0d",
          name: "Legacy Integration",
          prefix: "pk_live_",
          createdAt: "2025-03-10T08:20:00",
          lastUsed: "2025-04-15T11:25:00",
          expiresAt: null,
          permissions: [
            "read:reviews",
            "write:reviews",
            "read:metrics",
            "write:metrics",
          ],
          status: "revoked",
          usageCount: 2145,
          rateLimit: 100,
        },
      ];

      return {
        apiKeys,
        total: apiKeys.length,
      };
    },
  });

  // Fetch API Usage
  const {
    data: apiUsageData,
    isLoading: isLoadingUsage,
    error: usageError,
  } = useQuery({
    queryKey: ["/api/api-usage"],
    queryFn: async () => {
      // Mock data
      const apiUsage: ApiUsage[] = [
        {
          date: subDays(new Date(), 6).toISOString(),
          requests: 245,
          successRate: 98.8,
          avgResponseTime: 87,
        },
        {
          date: subDays(new Date(), 5).toISOString(),
          requests: 312,
          successRate: 99.2,
          avgResponseTime: 92,
        },
        {
          date: subDays(new Date(), 4).toISOString(),
          requests: 287,
          successRate: 97.5,
          avgResponseTime: 103,
        },
        {
          date: subDays(new Date(), 3).toISOString(),
          requests: 342,
          successRate: 99.7,
          avgResponseTime: 89,
        },
        {
          date: subDays(new Date(), 2).toISOString(),
          requests: 298,
          successRate: 98.2,
          avgResponseTime: 95,
        },
        {
          date: subDays(new Date(), 1).toISOString(),
          requests: 356,
          successRate: 99.4,
          avgResponseTime: 84,
        },
        {
          date: new Date().toISOString(),
          requests: 187,
          successRate: 100,
          avgResponseTime: 81,
        },
      ];

      return {
        usage: apiUsage,
        total: apiUsage.reduce((sum, day) => sum + day.requests, 0),
        aggregates: {
          avgSuccessRate:
            apiUsage.reduce((sum, day) => sum + day.successRate, 0) / apiUsage.length,
          avgResponseTime:
            apiUsage.reduce((sum, day) => sum + day.avgResponseTime, 0) / apiUsage.length,
          maxRequests: Math.max(...apiUsage.map((day) => day.requests)),
        },
      };
    },
  });

  // Fetch API Documentation
  const {
    data: apiDocsData,
    isLoading: isLoadingDocs,
    error: docsError,
  } = useQuery({
    queryKey: ["/api/api-docs"],
    queryFn: async () => {
      // Mock data
      const apiEndpoints: ApiEndpoint[] = [
        {
          path: "/api/v1/reviews",
          method: "GET",
          description: "Retrieve a list of reviews",
          parameters: [
            {
              name: "page",
              type: "integer",
              required: false,
              description: "Page number for pagination",
            },
            {
              name: "limit",
              type: "integer",
              required: false,
              description: "Number of items per page",
            },
            {
              name: "sort",
              type: "string",
              required: false,
              description: "Sort field (e.g., 'date', 'rating')",
            },
            {
              name: "platform",
              type: "string",
              required: false,
              description: "Filter by platform (e.g., 'google', 'yelp')",
            },
            {
              name: "rating",
              type: "integer",
              required: false,
              description: "Filter by rating (1-5)",
            },
          ],
          responses: [
            {
              status: 200,
              description: "Successful response",
              example: {
                data: [
                  {
                    id: "rev_12345",
                    rating: 4,
                    content: "Great service!",
                    platform: "google",
                    author: "John D.",
                    date: "2025-05-01T10:00:00Z",
                  },
                ],
                meta: {
                  total: 120,
                  page: 1,
                  limit: 10,
                },
              },
            },
            {
              status: 401,
              description: "Unauthorized",
              example: {
                error: "Unauthorized",
                message: "Invalid API key",
              },
            },
          ],
          authentication: true,
          rateLimit: 100,
        },
        {
          path: "/api/v1/reviews/:id",
          method: "GET",
          description: "Retrieve a specific review by ID",
          parameters: [
            {
              name: "id",
              type: "string",
              required: true,
              description: "The review ID",
            },
          ],
          responses: [
            {
              status: 200,
              description: "Successful response",
              example: {
                id: "rev_12345",
                rating: 4,
                content: "Great service!",
                platform: "google",
                author: "John D.",
                date: "2025-05-01T10:00:00Z",
                response: {
                  content: "Thank you for your feedback!",
                  date: "2025-05-02T09:30:00Z",
                },
              },
            },
            {
              status: 404,
              description: "Not found",
              example: {
                error: "Not Found",
                message: "Review not found",
              },
            },
          ],
          authentication: true,
          rateLimit: 100,
        },
        {
          path: "/api/v1/reviews/:id/respond",
          method: "POST",
          description: "Respond to a review",
          parameters: [
            {
              name: "id",
              type: "string",
              required: true,
              description: "The review ID",
            },
            {
              name: "content",
              type: "string",
              required: true,
              description: "The response content",
            },
          ],
          responses: [
            {
              status: 200,
              description: "Successful response",
              example: {
                id: "rev_12345",
                response: {
                  content: "Thank you for your feedback!",
                  date: "2025-05-02T09:30:00Z",
                },
              },
            },
            {
              status: 403,
              description: "Forbidden",
              example: {
                error: "Forbidden",
                message: "Insufficient permissions",
              },
            },
          ],
          authentication: true,
          rateLimit: 50,
        },
        {
          path: "/api/v1/metrics/summary",
          method: "GET",
          description: "Get review metrics summary",
          parameters: [
            {
              name: "period",
              type: "string",
              required: false,
              description: "Time period (e.g., '7d', '30d', '90d')",
            },
            {
              name: "platform",
              type: "string",
              required: false,
              description: "Filter by platform",
            },
          ],
          responses: [
            {
              status: 200,
              description: "Successful response",
              example: {
                averageRating: 4.2,
                totalReviews: 156,
                ratingsDistribution: {
                  "1": 5,
                  "2": 8,
                  "3": 22,
                  "4": 45,
                  "5": 76,
                },
                responseRate: 87.5,
              },
            },
          ],
          authentication: true,
          rateLimit: 100,
        },
        {
          path: "/api/v1/metrics/trends",
          method: "GET",
          description: "Get review metrics trends over time",
          parameters: [
            {
              name: "period",
              type: "string",
              required: false,
              description: "Time period (e.g., '7d', '30d', '90d')",
            },
            {
              name: "interval",
              type: "string",
              required: false,
              description: "Time interval (e.g., 'day', 'week', 'month')",
            },
          ],
          responses: [
            {
              status: 200,
              description: "Successful response",
              example: {
                data: [
                  {
                    date: "2025-05-01",
                    averageRating: 4.3,
                    reviewCount: 12,
                  },
                  {
                    date: "2025-05-02",
                    averageRating: 4.5,
                    reviewCount: 8,
                  },
                ],
              },
            },
          ],
          authentication: true,
          rateLimit: 50,
        },
      ];

      return {
        endpoints: apiEndpoints,
        total: apiEndpoints.length,
        baseUrl: "https://api.repuradar.com",
        version: "v1",
        authentication: {
          type: "Bearer Token",
          headerName: "X-API-Key",
        },
      };
    },
  });

  // Fetch Webhooks
  const {
    data: webhooksData,
    isLoading: isLoadingWebhooks,
    error: webhooksError,
  } = useQuery({
    queryKey: ["/api/webhooks"],
    queryFn: async () => {
      // Mock data
      const webhooks: Webhook[] = [
        {
          id: "wh_1a2b3c4d5e6f",
          url: "https://example.com/webhooks/reviews",
          events: ["review.created", "review.updated"],
          createdAt: "2025-04-15T10:30:00",
          lastTriggered: "2025-05-10T14:20:00",
          status: "active",
          secretKey: "whsec_7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z",
          deliveryAttempts: 143,
          successfulDeliveries: 140,
        },
        {
          id: "wh_7g8h9i0j1k2l",
          url: "https://myapp.example.org/api/repuradar",
          events: [
            "review.created",
            "review.updated",
            "response.created",
            "response.updated",
          ],
          createdAt: "2025-04-20T14:45:00",
          lastTriggered: "2025-05-09T11:30:00",
          status: "active",
          secretKey: "whsec_3m4n5o6p7q8r9s0t1u2v3w4x5y6z7a8b9c0d1e2f3g",
          deliveryAttempts: 87,
          successfulDeliveries: 87,
        },
        {
          id: "wh_3m4n5o6p7q8r",
          url: "https://integrations.testcompany.com/repuradar-hook",
          events: ["metrics.updated"],
          createdAt: "2025-05-01T09:15:00",
          lastTriggered: "2025-05-08T23:15:00",
          status: "failed",
          secretKey: "whsec_9s0t1u2v3w4x5y6z7a8b9c0d1e2f3g4h5i6j7k8l9m",
          deliveryAttempts: 42,
          successfulDeliveries: 38,
        },
        {
          id: "wh_9s0t1u2v3w4x",
          url: "https://dashboard.example.net/hooks/repuradar",
          events: ["review.created", "review.deleted"],
          createdAt: "2025-04-25T16:30:00",
          lastTriggered: null,
          status: "inactive",
          secretKey: "whsec_5y6z7a8b9c0d1e2f3g4h5i6j7k8l9m0n1o2p3q4r5s",
          deliveryAttempts: 0,
          successfulDeliveries: 0,
        },
      ];

      return {
        webhooks,
        total: webhooks.length,
        availableEvents: [
          {
            name: "review.created",
            description: "Triggered when a new review is created",
          },
          {
            name: "review.updated",
            description: "Triggered when an existing review is updated",
          },
          {
            name: "review.deleted",
            description: "Triggered when a review is deleted",
          },
          {
            name: "response.created",
            description: "Triggered when a response to a review is created",
          },
          {
            name: "response.updated",
            description: "Triggered when a response is updated",
          },
          {
            name: "metrics.updated",
            description: "Triggered when metrics are updated (daily)",
          },
        ],
      };
    },
  });

  // API Key form
  const apiKeyForm = useForm<z.infer<typeof apiKeyFormSchema>>({
    resolver: zodResolver(apiKeyFormSchema),
    defaultValues: {
      name: "",
      permissions: [],
      expiresIn: "never",
      rateLimit: 60,
    },
  });

  // Webhook form
  const webhookForm = useForm<z.infer<typeof webhookFormSchema>>({
    resolver: zodResolver(webhookFormSchema),
    defaultValues: {
      url: "",
      events: [],
      description: "",
    },
  });

  const onSubmitApiKey = (values: z.infer<typeof apiKeyFormSchema>) => {
    console.log("Creating API key:", values);
    
    // Simulate API key creation
    const newKeyValue = "pk_live_" + generateRandomString(40);
    const keyPrefix = newKeyValue.substring(0, 11);
    
    setNewApiKey({
      key: newKeyValue,
      prefix: keyPrefix,
    });
    
    toast({
      title: "API Key Created",
      description: "Your new API key has been created successfully.",
    });
    
    // Reset form
    apiKeyForm.reset();
    
    // Close the dialog (modal will stay open to show the key)
    setIsCreatingKey(false);
    
    // Refresh API keys
    queryClient.invalidateQueries({ queryKey: ["/api/api-keys"] });
  };

  const onSubmitWebhook = (values: z.infer<typeof webhookFormSchema>) => {
    console.log("Creating webhook:", values);
    
    toast({
      title: "Webhook Created",
      description: "Your new webhook has been created successfully.",
    });
    
    // Reset form and close dialog
    webhookForm.reset();
    setIsCreatingWebhook(false);
    
    // Refresh webhooks
    queryClient.invalidateQueries({ queryKey: ["/api/webhooks"] });
  };

  const handleRevokeApiKey = (apiKey: ApiKey) => {
    toast({
      title: "API Key Revoked",
      description: `The API key "${apiKey.name}" has been revoked successfully.`,
    });
    
    // Refresh API keys
    queryClient.invalidateQueries({ queryKey: ["/api/api-keys"] });
  };

  const handleDeleteWebhook = (webhook: Webhook) => {
    toast({
      title: "Webhook Deleted",
      description: `The webhook has been deleted successfully.`,
    });
    
    // Refresh webhooks
    queryClient.invalidateQueries({ queryKey: ["/api/webhooks"] });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    
    toast({
      title: "Copied to Clipboard",
      description: "The text has been copied to your clipboard.",
    });
  };

  const toggleWebhookStatus = (webhook: Webhook) => {
    const newStatus = webhook.status === "active" ? "inactive" : "active";
    const action = newStatus === "active" ? "activated" : "deactivated";
    
    toast({
      title: `Webhook ${action}`,
      description: `The webhook has been ${action} successfully.`,
    });
    
    // Refresh webhooks
    queryClient.invalidateQueries({ queryKey: ["/api/webhooks"] });
  };

  // Helper function to generate random string for API key
  const generateRandomString = (length: number) => {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Never";
    return format(new Date(dateString), "MMM d, yyyy 'at' h:mm a");
  };

  const formatRelativeDate = (dateString: string | null) => {
    if (!dateString) return "Never";
    return formatDistance(new Date(dateString), new Date(), { addSuffix: true });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">Active</Badge>;
      case "inactive":
        return <Badge variant="outline">Inactive</Badge>;
      case "revoked":
        return <Badge variant="destructive">Revoked</Badge>;
      case "expired":
        return <Badge className="bg-amber-500">Expired</Badge>;
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <>
      <Helmet>
        <title>API Access | RepuRadar</title>
        <meta
          name="description"
          content="Manage API keys, webhooks, and access to the RepuRadar API."
        />
      </Helmet>

      <div className="min-h-screen flex flex-col lg:flex-row">
        <Sidebar />

        <main className="flex-1 p-4 lg:p-6 bg-slate-50 min-h-screen">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <header className="mb-6">
              <h1 className="text-2xl font-semibold text-slate-800">API Access</h1>
              <p className="text-slate-500">
                Manage API keys, webhooks, and access to the RepuRadar API
              </p>
            </header>

            <Tabs
              defaultValue="keys"
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="mb-6">
                <TabsTrigger value="keys">
                  <Key className="h-4 w-4 mr-2" />
                  API Keys
                </TabsTrigger>
                <TabsTrigger value="webhooks">
                  <Webhook className="h-4 w-4 mr-2" />
                  Webhooks
                </TabsTrigger>
                <TabsTrigger value="usage">
                  <LineChart className="h-4 w-4 mr-2" />
                  Usage
                </TabsTrigger>
                <TabsTrigger value="docs">
                  <FileJson className="h-4 w-4 mr-2" />
                  Documentation
                </TabsTrigger>
              </TabsList>

              {/* API Keys Tab */}
              <TabsContent value="keys">
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-xl font-semibold text-slate-800">API Keys</h2>
                      <p className="text-slate-500">
                        Manage API keys for accessing the RepuRadar API
                      </p>
                    </div>
                    <Button onClick={() => setIsCreatingKey(true)}>
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Create API Key
                    </Button>
                  </div>

                  {isLoadingKeys ? (
                    <div className="flex justify-center p-8">
                      <RefreshCw className="h-8 w-8 animate-spin text-slate-400" />
                    </div>
                  ) : keysError ? (
                    <div className="text-center text-red-500 p-4">
                      Failed to load API keys
                    </div>
                  ) : apiKeysData?.apiKeys.length === 0 ? (
                    <Card className="flex flex-col items-center justify-center p-12 text-center">
                      <Key className="h-12 w-12 text-slate-300 mb-3" />
                      <h2 className="text-xl font-medium text-slate-800 mb-2">
                        No API Keys
                      </h2>
                      <p className="text-slate-500 mb-6 max-w-md">
                        You haven't created any API keys yet. Create your first key to
                        integrate with the RepuRadar API.
                      </p>
                      <Button onClick={() => setIsCreatingKey(true)}>
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Create API Key
                      </Button>
                    </Card>
                  ) : (
                    <Card>
                      <CardContent className="p-0">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-[250px]">Name</TableHead>
                              <TableHead>Key</TableHead>
                              <TableHead className="hidden md:table-cell">Created</TableHead>
                              <TableHead className="hidden md:table-cell">Last Used</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {apiKeysData?.apiKeys.map((apiKey) => (
                              <TableRow key={apiKey.id}>
                                <TableCell>
                                  <div className="font-medium">{apiKey.name}</div>
                                  <div className="text-sm text-slate-500 truncate max-w-[220px]">
                                    {apiKey.permissions.join(", ")}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="font-mono text-sm">
                                    {apiKey.prefix}•••••••••••••••
                                  </div>
                                  <div className="text-xs text-slate-500">
                                    {apiKey.usageCount} requests
                                  </div>
                                </TableCell>
                                <TableCell className="hidden md:table-cell">
                                  {formatDate(apiKey.createdAt)}
                                </TableCell>
                                <TableCell className="hidden md:table-cell">
                                  {apiKey.lastUsed
                                    ? formatRelativeDate(apiKey.lastUsed)
                                    : "Never"}
                                </TableCell>
                                <TableCell>{getStatusBadge(apiKey.status)}</TableCell>
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
                                      <DropdownMenuItem 
                                        onClick={() => setSelectedApiKey(apiKey)}
                                      >
                                        <EyeIcon className="h-4 w-4 mr-2" />
                                        View Details
                                      </DropdownMenuItem>
                                      {apiKey.status === "active" && (
                                        <DropdownMenuItem
                                          onClick={() => handleRevokeApiKey(apiKey)}
                                          className="text-red-600"
                                        >
                                          <Lock className="h-4 w-4 mr-2" />
                                          Revoke Key
                                        </DropdownMenuItem>
                                      )}
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  )}

                  <Card>
                    <CardHeader>
                      <CardTitle>Using API Keys</CardTitle>
                      <CardDescription>
                        Learn how to authenticate requests with your API keys
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <p className="text-slate-600">
                          To authenticate API requests, include your API key in the
                          request headers:
                        </p>
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <div className="text-sm font-medium">Example Request</div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => 
                                copyToClipboard(`curl -X GET \\
  "https://api.repuradar.com/api/v1/reviews" \\
  -H "X-API-Key: YOUR_API_KEY"`)
                              }
                            >
                              <Copy className="h-3.5 w-3.5 mr-1" />
                              Copy
                            </Button>
                          </div>
                          <div className="bg-slate-950 text-slate-50 p-3 rounded-md overflow-x-auto text-sm font-mono">
                            <pre>{`curl -X GET \\
  "https://api.repuradar.com/api/v1/reviews" \\
  -H "X-API-Key: YOUR_API_KEY"`}</pre>
                          </div>
                        </div>
                        <Alert>
                          <AlertTriangle className="h-4 w-4" />
                          <AlertTitle>Security Warning</AlertTitle>
                          <AlertDescription>
                            Keep your API keys secure. Do not share them in publicly
                            accessible areas like GitHub, client-side code, or
                            expose them in your frontend applications.
                          </AlertDescription>
                        </Alert>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Webhooks Tab */}
              <TabsContent value="webhooks">
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-xl font-semibold text-slate-800">Webhooks</h2>
                      <p className="text-slate-500">
                        Set up webhooks to receive real-time event notifications
                      </p>
                    </div>
                    <Button onClick={() => setIsCreatingWebhook(true)}>
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Create Webhook
                    </Button>
                  </div>

                  {isLoadingWebhooks ? (
                    <div className="flex justify-center p-8">
                      <RefreshCw className="h-8 w-8 animate-spin text-slate-400" />
                    </div>
                  ) : webhooksError ? (
                    <div className="text-center text-red-500 p-4">
                      Failed to load webhooks
                    </div>
                  ) : webhooksData?.webhooks.length === 0 ? (
                    <Card className="flex flex-col items-center justify-center p-12 text-center">
                      <Webhook className="h-12 w-12 text-slate-300 mb-3" />
                      <h2 className="text-xl font-medium text-slate-800 mb-2">
                        No Webhooks
                      </h2>
                      <p className="text-slate-500 mb-6 max-w-md">
                        You haven't created any webhooks yet. Webhooks allow you to
                        receive real-time notifications when events occur.
                      </p>
                      <Button onClick={() => setIsCreatingWebhook(true)}>
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Create Webhook
                      </Button>
                    </Card>
                  ) : (
                    <div className="grid grid-cols-1 gap-4">
                      {webhooksData?.webhooks.map((webhook) => (
                        <Card key={webhook.id}>
                          <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                              <div className="text-sm text-slate-500 font-mono">
                                {webhook.id}
                              </div>
                              {getStatusBadge(webhook.status)}
                            </div>
                          </CardHeader>
                          <CardContent className="py-2">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-3">
                              <div className="font-medium truncate">{webhook.url}</div>
                              <div className="flex flex-wrap gap-1">
                                {webhook.events.map((event) => (
                                  <Badge key={event} variant="outline">
                                    {event}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-slate-500">
                              <div>
                                <span className="inline-block w-20">Created:</span>
                                {formatDate(webhook.createdAt)}
                              </div>
                              <div>
                                <span className="inline-block w-20">Last Run:</span>
                                {webhook.lastTriggered
                                  ? formatRelativeDate(webhook.lastTriggered)
                                  : "Never"}
                              </div>
                              <div>
                                <span className="inline-block w-20">Success:</span>
                                {webhook.deliveryAttempts > 0
                                  ? `${Math.round(
                                      (webhook.successfulDeliveries /
                                        webhook.deliveryAttempts) *
                                        100
                                    )}% (${webhook.successfulDeliveries}/${
                                      webhook.deliveryAttempts
                                    })`
                                  : "N/A"}
                              </div>
                            </div>
                          </CardContent>
                          <CardFooter className="flex justify-between pt-0">
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={webhook.status === "active"}
                                onCheckedChange={() => toggleWebhookStatus(webhook)}
                                disabled={webhook.status === "failed"}
                              />
                              <span className="text-sm">
                                {webhook.status === "active" ? "Active" : "Inactive"}
                              </span>
                            </div>
                            <div>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="h-4 w-4 mr-1" />
                                    Actions
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Webhook Actions</DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => copyToClipboard(webhook.url)}>
                                    <Copy className="h-4 w-4 mr-2" />
                                    Copy URL
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => copyToClipboard(webhook.secretKey)}>
                                    <Key className="h-4 w-4 mr-2" />
                                    Copy Secret Key
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <RefreshCw className="h-4 w-4 mr-2" />
                                    Send Test Webhook
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => handleDeleteWebhook(webhook)}
                                    className="text-red-600"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete Webhook
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  )}

                  <Card>
                    <CardHeader>
                      <CardTitle>Securing Webhooks</CardTitle>
                      <CardDescription>
                        Learn how to verify webhook signatures
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <p className="text-slate-600">
                          For security, you should verify each webhook request using the
                          webhook signature. We include a <code>X-Webhook-Signature</code>{" "}
                          header with each request.
                        </p>
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <div className="text-sm font-medium">Signature Verification (Node.js)</div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => 
                                copyToClipboard(`const crypto = require('crypto');

// Your webhook secret key
const webhookSecret = 'whsec_your_webhook_secret_key';

function verifySignature(payload, signature) {
  const hmac = crypto.createHmac('sha256', webhookSecret);
  const digest = hmac.update(payload).digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(digest),
    Buffer.from(signature)
  );
}`)
                              }
                            >
                              <Copy className="h-3.5 w-3.5 mr-1" />
                              Copy
                            </Button>
                          </div>
                          <div className="bg-slate-950 text-slate-50 p-3 rounded-md overflow-x-auto text-sm font-mono">
                            <pre>{`const crypto = require('crypto');

// Your webhook secret key
const webhookSecret = 'whsec_your_webhook_secret_key';

function verifySignature(payload, signature) {
  const hmac = crypto.createHmac('sha256', webhookSecret);
  const digest = hmac.update(payload).digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(digest),
    Buffer.from(signature)
  );
}`}</pre>
                          </div>
                        </div>
                        <Alert>
                          <ShieldCheck className="h-4 w-4" />
                          <AlertTitle>Security Best Practice</AlertTitle>
                          <AlertDescription>
                            Always verify webhook signatures to ensure the request
                            comes from RepuRadar and hasn't been tampered with.
                          </AlertDescription>
                        </Alert>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Usage Tab */}
              <TabsContent value="usage">
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>API Usage Overview</CardTitle>
                      <CardDescription>
                        API usage statistics for the past 7 days
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {isLoadingUsage ? (
                        <div className="flex justify-center p-8">
                          <RefreshCw className="h-8 w-8 animate-spin text-slate-400" />
                        </div>
                      ) : usageError ? (
                        <div className="text-center text-red-500 p-4">
                          Failed to load API usage statistics
                        </div>
                      ) : (
                        <>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                            <Card>
                              <CardContent className="pt-6">
                                <div className="text-2xl font-bold">
                                  {apiUsageData?.total.toLocaleString()}
                                </div>
                                <p className="text-sm text-slate-500 mt-1">
                                  Total Requests (7 days)
                                </p>
                              </CardContent>
                            </Card>
                            <Card>
                              <CardContent className="pt-6">
                                <div className="text-2xl font-bold">
                                  {apiUsageData?.aggregates.avgSuccessRate.toFixed(1)}%
                                </div>
                                <p className="text-sm text-slate-500 mt-1">
                                  Average Success Rate
                                </p>
                              </CardContent>
                            </Card>
                            <Card>
                              <CardContent className="pt-6">
                                <div className="text-2xl font-bold">
                                  {apiUsageData?.aggregates.avgResponseTime.toFixed(0)}ms
                                </div>
                                <p className="text-sm text-slate-500 mt-1">
                                  Average Response Time
                                </p>
                              </CardContent>
                            </Card>
                          </div>

                          <div className="border rounded-md">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Date</TableHead>
                                  <TableHead className="text-right">Requests</TableHead>
                                  <TableHead className="text-right">Success Rate</TableHead>
                                  <TableHead className="text-right">Avg. Response Time</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {apiUsageData?.usage.map((day) => (
                                  <TableRow key={day.date}>
                                    <TableCell>
                                      {format(new Date(day.date), "MMM d, yyyy")}
                                    </TableCell>
                                    <TableCell className="text-right">
                                      {day.requests.toLocaleString()}
                                    </TableCell>
                                    <TableCell className="text-right">
                                      {day.successRate.toFixed(1)}%
                                    </TableCell>
                                    <TableCell className="text-right">
                                      {day.avgResponseTime}ms
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Rate Limits</CardTitle>
                      <CardDescription>
                        Understanding rate limits for your API keys
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <p>
                          Rate limits are applied on a per-API key basis. The default
                          rate limit is 60 requests per minute, but this can be
                          customized when creating API keys.
                        </p>
                        <div className="border rounded-md p-4 bg-slate-50">
                          <h3 className="font-medium mb-2">
                            Rate Limit Headers
                          </h3>
                          <p className="text-sm text-slate-600 mb-3">
                            API responses include the following headers to help you
                            track your rate limit usage:
                          </p>
                          <div className="space-y-2">
                            <div>
                              <code className="text-xs bg-slate-100 p-1 rounded">
                                X-RateLimit-Limit
                              </code>
                              <span className="text-sm ml-2">
                                Maximum number of requests allowed per minute
                              </span>
                            </div>
                            <div>
                              <code className="text-xs bg-slate-100 p-1 rounded">
                                X-RateLimit-Remaining
                              </code>
                              <span className="text-sm ml-2">
                                Number of requests remaining in the current window
                              </span>
                            </div>
                            <div>
                              <code className="text-xs bg-slate-100 p-1 rounded">
                                X-RateLimit-Reset
                              </code>
                              <span className="text-sm ml-2">
                                Time in UTC epoch seconds when the rate limit will reset
                              </span>
                            </div>
                          </div>
                        </div>
                        <Alert variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertTitle>Rate Limit Exceeded</AlertTitle>
                          <AlertDescription>
                            When you exceed your rate limit, requests will return a 429
                            Too Many Requests response. Implement exponential backoff
                            in your applications to handle rate limiting gracefully.
                          </AlertDescription>
                        </Alert>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Documentation Tab */}
              <TabsContent value="docs">
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>API Documentation</CardTitle>
                      <CardDescription>
                        Explore the available endpoints and how to use them
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {isLoadingDocs ? (
                        <div className="flex justify-center p-8">
                          <RefreshCw className="h-8 w-8 animate-spin text-slate-400" />
                        </div>
                      ) : docsError ? (
                        <div className="text-center text-red-500 p-4">
                          Failed to load API documentation
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="mb-6">
                            <h3 className="text-lg font-medium mb-2">
                              API Overview
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="border rounded-md p-4 bg-slate-50">
                                <div className="text-sm text-slate-500 mb-1">
                                  Base URL
                                </div>
                                <div className="font-mono text-sm">
                                  {apiDocsData?.baseUrl}
                                </div>
                              </div>
                              <div className="border rounded-md p-4 bg-slate-50">
                                <div className="text-sm text-slate-500 mb-1">
                                  API Version
                                </div>
                                <div>
                                  <Badge>{apiDocsData?.version}</Badge>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="mb-4">
                            <h3 className="text-lg font-medium mb-2">
                              Authentication
                            </h3>
                            <div className="border rounded-md p-4 bg-slate-50">
                              <p className="mb-2">
                                All API requests must include an API key in the header:
                              </p>
                              <div className="font-mono text-sm overflow-x-auto bg-slate-100 p-2 rounded">
                                {apiDocsData?.authentication.headerName}: YOUR_API_KEY
                              </div>
                            </div>
                          </div>

                          <div>
                            <h3 className="text-lg font-medium mb-2">
                              Available Endpoints
                            </h3>
                            <Accordion type="single" collapsible>
                              {apiDocsData?.endpoints.map((endpoint, index) => (
                                <AccordionItem
                                  key={index}
                                  value={`endpoint-${index}`}
                                >
                                  <AccordionTrigger className="hover:bg-slate-50 px-4">
                                    <div className="flex items-center gap-2">
                                      <Badge
                                        className={
                                          endpoint.method === "GET"
                                            ? "bg-blue-500"
                                            : endpoint.method === "POST"
                                            ? "bg-green-500"
                                            : endpoint.method === "PUT"
                                            ? "bg-amber-500"
                                            : endpoint.method === "DELETE"
                                            ? "bg-red-500"
                                            : ""
                                        }
                                      >
                                        {endpoint.method}
                                      </Badge>
                                      <span className="font-mono text-sm">
                                        {endpoint.path}
                                      </span>
                                    </div>
                                  </AccordionTrigger>
                                  <AccordionContent className="px-4 pt-2">
                                    <div className="space-y-4">
                                      <p className="text-slate-600">
                                        {endpoint.description}
                                      </p>

                                      {endpoint.parameters.length > 0 && (
                                        <div>
                                          <h4 className="text-sm font-medium mb-2">
                                            Parameters
                                          </h4>
                                          <div className="border rounded-md">
                                            <Table>
                                              <TableHeader>
                                                <TableRow>
                                                  <TableHead>Name</TableHead>
                                                  <TableHead>Type</TableHead>
                                                  <TableHead>Required</TableHead>
                                                  <TableHead>Description</TableHead>
                                                </TableRow>
                                              </TableHeader>
                                              <TableBody>
                                                {endpoint.parameters.map((param, idx) => (
                                                  <TableRow key={idx}>
                                                    <TableCell className="font-mono text-xs">
                                                      {param.name}
                                                    </TableCell>
                                                    <TableCell className="text-xs">
                                                      {param.type}
                                                    </TableCell>
                                                    <TableCell>
                                                      {param.required ? (
                                                        <Check className="h-4 w-4 text-green-500" />
                                                      ) : (
                                                        <div className="text-xs text-slate-500">
                                                          Optional
                                                        </div>
                                                      )}
                                                    </TableCell>
                                                    <TableCell className="text-xs">
                                                      {param.description}
                                                    </TableCell>
                                                  </TableRow>
                                                ))}
                                              </TableBody>
                                            </Table>
                                          </div>
                                        </div>
                                      )}

                                      <div>
                                        <h4 className="text-sm font-medium mb-2">
                                          Responses
                                        </h4>
                                        <Tabs defaultValue={endpoint.responses[0].status.toString()}>
                                          <TabsList>
                                            {endpoint.responses.map((response) => (
                                              <TabsTrigger
                                                key={response.status}
                                                value={response.status.toString()}
                                              >
                                                {response.status}
                                              </TabsTrigger>
                                            ))}
                                          </TabsList>
                                          {endpoint.responses.map((response) => (
                                            <TabsContent
                                              key={response.status}
                                              value={response.status.toString()}
                                            >
                                              <div className="space-y-2">
                                                <div className="text-sm text-slate-600">
                                                  {response.description}
                                                </div>
                                                <div className="bg-slate-950 text-slate-50 p-3 rounded-md overflow-x-auto">
                                                  <pre className="font-mono text-xs">{JSON.stringify(response.example, null, 2)}</pre>
                                                </div>
                                              </div>
                                            </TabsContent>
                                          ))}
                                        </Tabs>
                                      </div>

                                      <div className="flex items-center gap-2 text-xs text-slate-500">
                                        <div>
                                          {endpoint.authentication ? (
                                            <div className="flex items-center text-slate-600">
                                              <Lock className="h-3.5 w-3.5 mr-1" />
                                              Authentication required
                                            </div>
                                          ) : (
                                            <div className="flex items-center text-slate-600">
                                              <ShieldCheck className="h-3.5 w-3.5 mr-1" />
                                              No authentication required
                                            </div>
                                          )}
                                        </div>
                                        <div className="border-l pl-2 ml-2">
                                          Rate limit: {endpoint.rateLimit} requests/minute
                                        </div>
                                      </div>

                                      <div className="flex justify-end">
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => copyToClipboard("curl command would go here")}
                                        >
                                          <Copy className="h-3.5 w-3.5 mr-1" />
                                          Copy as cURL
                                        </Button>
                                      </div>
                                    </div>
                                  </AccordionContent>
                                </AccordionItem>
                              ))}
                            </Accordion>
                          </div>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter>
                      <p className="text-sm text-slate-500">
                        For comprehensive documentation, including code examples in
                        various languages, check our{" "}
                        <a
                          href="https://docs.repuradar.com/api"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          full API reference
                        </a>
                        .
                      </p>
                    </CardFooter>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>

      {/* Create API Key Dialog */}
      <Dialog
        open={isCreatingKey}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreatingKey(false);
            apiKeyForm.reset();
          }
        }}
      >
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Create API Key</DialogTitle>
            <DialogDescription>
              Create a new API key to access the RepuRadar API
            </DialogDescription>
          </DialogHeader>

          <Form {...apiKeyForm}>
            <form
              onSubmit={apiKeyForm.handleSubmit(onSubmitApiKey)}
              className="space-y-4 pt-4"
            >
              <FormField
                control={apiKeyForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Key Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Production API Key" {...field} />
                    </FormControl>
                    <FormDescription>
                      A descriptive name to help you identify this API key
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={apiKeyForm.control}
                name="permissions"
                render={() => (
                  <FormItem>
                    <div className="mb-2">
                      <FormLabel>Permissions</FormLabel>
                      <FormDescription>
                        Select the operations this API key can perform
                      </FormDescription>
                    </div>
                    <div className="space-y-2">
                      {[
                        {
                          id: "read:reviews",
                          label: "Read Reviews",
                          description: "View reviews and their details",
                        },
                        {
                          id: "write:reviews",
                          label: "Write Reviews",
                          description: "Respond to reviews and manage them",
                        },
                        {
                          id: "read:metrics",
                          label: "Read Metrics",
                          description: "Access performance metrics and analytics",
                        },
                        {
                          id: "write:metrics",
                          label: "Write Metrics",
                          description: "Update or create custom metrics",
                        },
                      ].map((permission) => (
                        <FormField
                          key={permission.id}
                          control={apiKeyForm.control}
                          name="permissions"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={permission.id}
                                className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(permission.id)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([
                                            ...(field.value || []),
                                            permission.id,
                                          ])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== permission.id
                                            )
                                          );
                                    }}
                                  />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel className="cursor-pointer">
                                    {permission.label}
                                  </FormLabel>
                                  <FormDescription>
                                    {permission.description}
                                  </FormDescription>
                                </div>
                              </FormItem>
                            );
                          }}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={apiKeyForm.control}
                  name="expiresIn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expiration</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select expiration" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="never">Never</SelectItem>
                          <SelectItem value="7d">7 days</SelectItem>
                          <SelectItem value="30d">30 days</SelectItem>
                          <SelectItem value="90d">90 days</SelectItem>
                          <SelectItem value="1y">1 year</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        When the key should expire
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={apiKeyForm.control}
                  name="rateLimit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rate Limit</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        defaultValue={field.value.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select rate limit" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="20">20 requests/minute</SelectItem>
                          <SelectItem value="60">60 requests/minute</SelectItem>
                          <SelectItem value="100">100 requests/minute</SelectItem>
                          <SelectItem value="200">200 requests/minute</SelectItem>
                          <SelectItem value="500">500 requests/minute</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Maximum requests per minute
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsCreatingKey(false);
                    apiKeyForm.reset();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">Create API Key</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* New API Key Dialog */}
      <Dialog
        open={!!newApiKey}
        onOpenChange={(open) => {
          if (!open) setNewApiKey(null);
        }}
      >
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>API Key Created</DialogTitle>
            <DialogDescription>
              Your new API key has been created successfully. Please copy it now as
              you won't be able to see it again.
            </DialogDescription>
          </DialogHeader>

          {newApiKey && (
            <div className="space-y-4 pt-2">
              <div className="border rounded-md p-4 bg-slate-50">
                <div className="flex justify-between items-center mb-2">
                  <div className="text-sm text-slate-500">API Key</div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(newApiKey.key)}
                  >
                    <Copy className="h-3.5 w-3.5 mr-1" />
                    Copy
                  </Button>
                </div>
                <div className="relative">
                  <div
                    className={`font-mono text-sm ${
                      showSecret ? "" : "filter blur-sm select-none"
                    }`}
                  >
                    {newApiKey.key}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-1/2 right-2 transform -translate-y-1/2"
                    onClick={() => setShowSecret(!showSecret)}
                  >
                    {showSecret ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <EyeIcon className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <Alert variant="warning">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Important Security Notice</AlertTitle>
                <AlertDescription>
                  This API key will only be shown once and cannot be retrieved later.
                  Store it securely and don't share it in publicly accessible code.
                </AlertDescription>
              </Alert>
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setNewApiKey(null)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Webhook Dialog */}
      <Dialog
        open={isCreatingWebhook}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreatingWebhook(false);
            webhookForm.reset();
          }
        }}
      >
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Create Webhook</DialogTitle>
            <DialogDescription>
              Set up a webhook to receive real-time event notifications
            </DialogDescription>
          </DialogHeader>

          <Form {...webhookForm}>
            <form
              onSubmit={webhookForm.handleSubmit(onSubmitWebhook)}
              className="space-y-4 pt-4"
            >
              <FormField
                control={webhookForm.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Webhook URL</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://example.com/webhooks/repuradar"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      The URL where we'll send event notifications
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={webhookForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Production webhook for review alerts" {...field} />
                    </FormControl>
                    <FormDescription>
                      A description to help you identify this webhook
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={webhookForm.control}
                name="events"
                render={() => (
                  <FormItem>
                    <div className="mb-2">
                      <FormLabel>Events</FormLabel>
                      <FormDescription>
                        Select the events that will trigger this webhook
                      </FormDescription>
                    </div>
                    <div className="border rounded-md p-4 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {webhooksData?.availableEvents.map((event) => (
                          <FormField
                            key={event.name}
                            control={webhookForm.control}
                            name="events"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={event.name}
                                  className="flex flex-row items-start space-x-2 space-y-0"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(event.name)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([
                                              ...(field.value || []),
                                              event.name,
                                            ])
                                          : field.onChange(
                                              field.value?.filter(
                                                (value) => value !== event.name
                                              )
                                            );
                                      }}
                                    />
                                  </FormControl>
                                  <div className="space-y-1 leading-none">
                                    <FormLabel className="cursor-pointer text-sm">
                                      {event.name}
                                    </FormLabel>
                                    <FormDescription className="text-xs">
                                      {event.description}
                                    </FormDescription>
                                  </div>
                                </FormItem>
                              );
                            }}
                          />
                        ))}
                      </div>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsCreatingWebhook(false);
                    webhookForm.reset();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">Create Webhook</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* API Key Details Dialog */}
      <Dialog
        open={!!selectedApiKey}
        onOpenChange={(open) => {
          if (!open) setSelectedApiKey(null);
        }}
      >
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>API Key Details</DialogTitle>
            <DialogDescription>
              {selectedApiKey?.name}
            </DialogDescription>
          </DialogHeader>

          {selectedApiKey && (
            <div className="space-y-4 pt-2">
              <div className="flex gap-2">
                <div className="flex-1">
                  <div className="text-sm text-slate-500 mb-1">Key ID</div>
                  <div className="font-mono text-sm">{selectedApiKey.id}</div>
                </div>
                <div className="flex-1">
                  <div className="text-sm text-slate-500 mb-1">Status</div>
                  <div>{getStatusBadge(selectedApiKey.status)}</div>
                </div>
              </div>

              <div className="flex gap-2">
                <div className="flex-1">
                  <div className="text-sm text-slate-500 mb-1">Created</div>
                  <div className="text-sm">
                    {formatDate(selectedApiKey.createdAt)}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="text-sm text-slate-500 mb-1">Expires</div>
                  <div className="text-sm">
                    {selectedApiKey.expiresAt
                      ? formatDate(selectedApiKey.expiresAt)
                      : "Never"}
                  </div>
                </div>
              </div>

              <div>
                <div className="text-sm text-slate-500 mb-1">Last Used</div>
                <div className="text-sm">
                  {selectedApiKey.lastUsed
                    ? formatDate(selectedApiKey.lastUsed)
                    : "Never"}
                </div>
              </div>

              <div>
                <div className="text-sm text-slate-500 mb-1">Permissions</div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedApiKey.permissions.map((permission) => (
                    <Badge key={permission} variant="outline">
                      {permission}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-sm text-slate-500 mb-1">Usage Statistics</div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="border rounded-md p-3 bg-slate-50">
                    <div className="text-sm font-medium">
                      {selectedApiKey.usageCount.toLocaleString()}
                    </div>
                    <div className="text-xs text-slate-500">Total Requests</div>
                  </div>
                  <div className="border rounded-md p-3 bg-slate-50">
                    <div className="text-sm font-medium">
                      {selectedApiKey.rateLimit}/min
                    </div>
                    <div className="text-xs text-slate-500">Rate Limit</div>
                  </div>
                </div>
              </div>

              {selectedApiKey.status === "active" && (
                <div className="flex justify-end gap-2">
                  <Button
                    variant="destructive"
                    onClick={() => {
                      handleRevokeApiKey(selectedApiKey);
                      setSelectedApiKey(null);
                    }}
                  >
                    <Lock className="h-4 w-4 mr-2" />
                    Revoke Key
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ApiAccessPage;