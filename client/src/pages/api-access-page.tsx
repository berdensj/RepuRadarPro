import React, { useState } from "react";
import { Helmet } from "react-helmet";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const ApiAccessPage = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("api-keys");
  const [isKeyDialogOpen, setIsKeyDialogOpen] = useState(false);
  const [isWebhookDialogOpen, setIsWebhookDialogOpen] = useState(false);
  
  // Sample API key for display
  const sampleApiKey = {
    id: "key_01H9ZXYZ123456",
    name: "Dashboard API Key",
    prefix: "repu_123xyz",
    createdAt: "2025-05-10T10:00:00Z",
    lastUsed: "2025-05-14T08:32:15Z",
    expiresAt: null,
    permissions: ["read:reviews", "write:responses"],
    status: "active",
    usageCount: 142,
    rateLimit: 100
  };
  
  // Sample webhook for display
  const sampleWebhook = {
    id: "whk_01H9ZXY123456",
    url: "https://example.com/webhooks/repuradar",
    events: ["review.created", "review.updated"],
    createdAt: "2025-05-05T14:30:00Z",
    lastTriggered: "2025-05-14T09:15:22Z",
    status: "active",
    secretKey: "whsec_123xyz789abc",
    deliveryAttempts: 156,
    successfulDeliveries: 155
  };
  
  // Sample API endpoint for display
  const sampleEndpoint = {
    path: "/api/reviews",
    method: "GET",
    description: "Retrieve reviews for your account or a specific location",
    parameters: [
      {
        name: "locationId",
        type: "number",
        required: false,
        description: "Filter reviews by location ID"
      },
      {
        name: "limit",
        type: "number",
        required: false,
        description: "Maximum number of reviews to return (default: 10, max: 100)"
      }
    ],
    responses: [
      {
        status: 200,
        description: "Success",
        example: "{ reviews: [...] }"
      },
      {
        status: 401,
        description: "Unauthorized",
        example: "{ error: 'Invalid API key' }"
      }
    ],
    authentication: true,
    rateLimit: 100
  };
  
  // Sample API usage data
  const sampleUsage = [
    { date: "2025-05-14", requests: 240, successRate: 0.99, avgResponseTime: 145 },
    { date: "2025-05-13", requests: 186, successRate: 0.98, avgResponseTime: 152 },
    { date: "2025-05-12", requests: 210, successRate: 1.0, avgResponseTime: 138 },
    { date: "2025-05-11", requests: 178, successRate: 0.97, avgResponseTime: 162 },
    { date: "2025-05-10", requests: 196, successRate: 0.99, avgResponseTime: 149 }
  ];
  
  const handleCreateApiKey = () => {
    setIsKeyDialogOpen(false);
    toast({
      title: "API Key Created",
      description: "Your new API key has been created successfully",
    });
  };
  
  const handleCreateWebhook = () => {
    setIsWebhookDialogOpen(false);
    toast({
      title: "Webhook Created",
      description: "Your new webhook has been created successfully",
    });
  };
  
  const handleRevokeApiKey = () => {
    toast({
      title: "API Key Revoked",
      description: "Your API key has been revoked",
    });
  };
  
  const handleDeleteWebhook = () => {
    toast({
      title: "Webhook Deleted",
      description: "Your webhook has been deleted",
    });
  };
  
  return (
    <>
      <Helmet>
        <title>API Access | Reputation Sentinel</title>
        <meta name="description" content="Manage API keys, webhooks, and review API documentation" />
      </Helmet>
      
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">API Access</h1>
          <p className="text-muted-foreground">
            Manage API keys, webhooks, and review API documentation
          </p>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="api-keys">API Keys</TabsTrigger>
            <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
            <TabsTrigger value="documentation">Documentation</TabsTrigger>
            <TabsTrigger value="usage">Usage</TabsTrigger>
          </TabsList>
          
          <TabsContent value="api-keys" className="space-y-4">
            <div className="flex justify-end">
              <Dialog open={isKeyDialogOpen} onOpenChange={setIsKeyDialogOpen}>
                <DialogTrigger asChild>
                  <Button>Create API Key</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create API Key</DialogTitle>
                    <DialogDescription>
                      Generate a new API key with specific permissions
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="key-name">Key Name</Label>
                      <Input id="key-name" placeholder="Dashboard Integration" />
                    </div>
                    <div className="grid gap-2">
                      <Label>Permissions</Label>
                      {/* Simplified permissions list */}
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id="read-reviews" className="h-4 w-4" defaultChecked />
                          <Label htmlFor="read-reviews">Read Reviews</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id="write-responses" className="h-4 w-4" defaultChecked />
                          <Label htmlFor="write-responses">Write Responses</Label>
                        </div>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleCreateApiKey}>Create Key</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>{sampleApiKey.name}</CardTitle>
                <CardDescription>
                  Created on {new Date(sampleApiKey.createdAt).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Prefix</span>
                    <span className="font-mono">{sampleApiKey.prefix}**********</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Last Used</span>
                    <span>{new Date(sampleApiKey.lastUsed).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <span className="capitalize">
                      <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                      {sampleApiKey.status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Permissions</span>
                    <span>{sampleApiKey.permissions.join(", ")}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="destructive" onClick={handleRevokeApiKey}>Revoke Key</Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="webhooks" className="space-y-4">
            <div className="flex justify-end">
              <Dialog open={isWebhookDialogOpen} onOpenChange={setIsWebhookDialogOpen}>
                <DialogTrigger asChild>
                  <Button>Create Webhook</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Webhook</DialogTitle>
                    <DialogDescription>
                      Set up a new webhook endpoint to receive events
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="webhook-url">URL</Label>
                      <Input id="webhook-url" placeholder="https://example.com/webhooks/repuradar" />
                    </div>
                    <div className="grid gap-2">
                      <Label>Events</Label>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id="review-created" className="h-4 w-4" defaultChecked />
                          <Label htmlFor="review-created">review.created</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id="review-updated" className="h-4 w-4" defaultChecked />
                          <Label htmlFor="review-updated">review.updated</Label>
                        </div>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleCreateWebhook}>Create Webhook</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Webhook Endpoint</CardTitle>
                <CardDescription>
                  Created on {new Date(sampleWebhook.createdAt).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">URL</span>
                    <span className="font-mono text-sm truncate max-w-[250px]">{sampleWebhook.url}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Events</span>
                    <span>{sampleWebhook.events.join(", ")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Last Triggered</span>
                    <span>{new Date(sampleWebhook.lastTriggered).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <span className="capitalize">
                      <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                      {sampleWebhook.status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Success Rate</span>
                    <span>{Math.round((sampleWebhook.successfulDeliveries / sampleWebhook.deliveryAttempts) * 100)}%</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="destructive" onClick={handleDeleteWebhook}>Delete Webhook</Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="documentation" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>API Documentation</CardTitle>
                <CardDescription>
                  Learn how to integrate with the Reputation Sentinel API
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-2">Authentication</h3>
                    <p className="text-sm text-muted-foreground">
                      All API requests require an API key, which should be included in the 
                      <code className="text-xs bg-muted px-1 py-0.5 rounded mx-1">Authorization</code> 
                      header:
                    </p>
                    <pre className="bg-muted p-3 rounded-md text-xs mt-2 overflow-x-auto">
                      Authorization: Bearer repu_123xyz456abc
                    </pre>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">Endpoint: {sampleEndpoint.path}</h3>
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 px-2.5 py-0.5 rounded text-xs font-medium">
                        {sampleEndpoint.method}
                      </span>
                      <span className="text-sm text-muted-foreground">{sampleEndpoint.description}</span>
                    </div>
                    
                    <div className="mt-4">
                      <h4 className="text-sm font-medium mb-2">Parameters</h4>
                      <div className="bg-muted rounded-md p-3">
                        <div className="space-y-2">
                          {sampleEndpoint.parameters.map((param, index) => (
                            <div key={index} className="grid grid-cols-3 text-xs">
                              <div className="font-mono">{param.name}</div>
                              <div>{param.type} {param.required && <span className="text-red-500">*</span>}</div>
                              <div className="text-muted-foreground">{param.description}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <h4 className="text-sm font-medium mb-2">Responses</h4>
                      <div className="space-y-2">
                        {sampleEndpoint.responses.map((response, index) => (
                          <div key={index} className="bg-muted rounded-md p-3">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className={`px-2.5 py-0.5 rounded text-xs font-medium ${
                                response.status === 200 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 
                                'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                              }`}>
                                {response.status}
                              </span>
                              <span className="text-xs">{response.description}</span>
                            </div>
                            <pre className="text-xs mt-1">{response.example}</pre>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="usage" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>API Usage</CardTitle>
                <CardDescription>
                  Review your API usage over the past 5 days
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border rounded-md">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-muted/50">
                          <th className="text-left p-2 text-sm font-medium">Date</th>
                          <th className="text-left p-2 text-sm font-medium">Requests</th>
                          <th className="text-left p-2 text-sm font-medium">Success Rate</th>
                          <th className="text-left p-2 text-sm font-medium">Avg. Response Time</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sampleUsage.map((day, index) => (
                          <tr key={index} className="border-t">
                            <td className="p-2 text-sm">{day.date}</td>
                            <td className="p-2 text-sm">{day.requests}</td>
                            <td className="p-2 text-sm">{(day.successRate * 100).toFixed(1)}%</td>
                            <td className="p-2 text-sm">{day.avgResponseTime}ms</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="p-4 bg-muted rounded-md">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium">Current Usage</h3>
                      <span className="text-sm text-muted-foreground">1,010 / 10,000 requests this month</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2.5">
                      <div className="bg-primary h-2.5 rounded-full" style={{ width: '10%' }}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default ApiAccessPage;