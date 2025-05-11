import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { 
  PlusCircle, 
  Send,
  Loader2, 
  MessageCircle, 
  Mail, 
  Phone, 
  Clock, 
  Check, 
  X, 
  Edit, 
  Copy,
  Trash2,
  Link,
  Calendar,
  Coins,
  ShieldCheck,
  Plug,
  RotateCw,
  Settings,
  Building,
  GanttChart
} from 'lucide-react';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger 
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Define review request schema
const requestFormSchema = z.object({
  recipientName: z.string().min(1, 'Recipient name is required'),
  recipientEmail: z.string().email('Valid email is required'),
  recipientPhone: z.string().optional(),
  locationId: z.string().optional(),
  template: z.string().min(1, 'Template is required'),
  messageType: z.enum(['email', 'sms', 'both']),
  notes: z.string().optional(),
});

// Define template schema
const templateFormSchema = z.object({
  name: z.string().min(1, 'Template name is required'),
  type: z.enum(['email', 'sms']),
  subject: z.string().min(1, 'Subject is required').optional(),
  content: z.string().min(10, 'Content must be at least 10 characters'),
  isDefault: z.boolean().default(false),
});

// Define CRM integration schema
const crmIntegrationSchema = z.object({
  name: z.string().min(1, 'Integration name is required'),
  crmType: z.enum(['housecallpro', 'servicetitan', 'salesforce', 'zoho', 'jobber', 'podium', 'mindbody', 'booker', 'square', 'schedulicity', 'vagaro', 'other']),
  apiKey: z.string().min(1, 'API key is required'),
  triggerEvent: z.enum(['appointment_completed', 'invoice_paid', 'service_completed', 'customer_created', 'treatment_finished', 'checkout_complete', 'membership_renewed', 'other']),
  templateId: z.string().min(1, 'Template is required'),
  delayHours: z.number().min(0).max(72).default(2),
  active: z.boolean().default(true),
  customEndpoint: z.string().optional(),
  otherSettings: z.record(z.string()).optional(),
});

type ReviewRequest = {
  id: number;
  userId: number;
  recipientName: string;
  recipientEmail: string;
  recipientPhone: string | null;
  locationId: number | null;
  template: string;
  messageType: 'email' | 'sms' | 'both';
  status: 'pending' | 'sent' | 'delivered' | 'opened' | 'clicked' | 'completed' | 'failed';
  notes: string | null;
  createdAt: string;
  sentAt: string | null;
};

type ReviewTemplate = {
  id: number;
  userId: number;
  name: string;
  type: 'email' | 'sms';
  subject: string | null;
  content: string;
  isDefault: boolean;
  createdAt: string;
};

type CRMIntegration = {
  id: number;
  userId: number;
  name: string;
  crmType: 'housecallpro' | 'servicetitan' | 'salesforce' | 'zoho' | 'jobber' | 'podium' | 'other';
  apiKey: string;
  triggerEvent: 'appointment_completed' | 'invoice_paid' | 'service_completed' | 'customer_created' | 'other';
  templateId: number;
  delayHours: number;
  active: boolean;
  customEndpoint?: string;
  otherSettings?: Record<string, string>;
  createdAt: string;
  lastSync?: string;
  requestsSent: number;
};

const ReviewRequestsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [addRequestOpen, setAddRequestOpen] = useState(false);
  const [addTemplateOpen, setAddTemplateOpen] = useState(false);
  const [addIntegrationOpen, setAddIntegrationOpen] = useState(false);
  const [deletingRequest, setDeletingRequest] = useState<number | null>(null);
  const [deletingTemplate, setDeletingTemplate] = useState<number | null>(null);
  const [deletingIntegration, setDeletingIntegration] = useState<number | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<ReviewTemplate | null>(null);
  const [editingIntegration, setEditingIntegration] = useState<CRMIntegration | null>(null);
  const [selectedTab, setSelectedTab] = useState('requests');
  const [templateType, setTemplateType] = useState<'email' | 'sms'>('email');
  const [selectedIntegration, setSelectedIntegration] = useState<string | null>(null);
  const [showTestIntegrationDialog, setShowTestIntegrationDialog] = useState(false);

  // Fetch review requests
  const { data: reviewRequests, isLoading: requestsLoading } = useQuery({
    queryKey: ['/api/review-requests'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/review-requests');
      return res.json();
    },
  });

  // Fetch review templates
  const { data: reviewTemplates, isLoading: templatesLoading } = useQuery({
    queryKey: ['/api/review-templates'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/review-templates');
      return res.json();
    },
  });

  // Fetch locations for dropdown
  const { data: locations, isLoading: locationsLoading } = useQuery({
    queryKey: ['/api/locations'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/locations');
      return res.json();
    },
  });
  
  // Fetch CRM integrations
  const { data: crmIntegrations, isLoading: integrationsLoading } = useQuery({
    queryKey: ['/api/crm-integrations'],
    queryFn: async () => {
      try {
        const res = await apiRequest('GET', '/api/crm-integrations');
        return res.json();
      } catch (error) {
        // If the endpoint doesn't exist yet, return empty array
        console.error("Failed to fetch CRM integrations:", error);
        return [];
      }
    },
  });

  // Form setup
  const requestForm = useForm<z.infer<typeof requestFormSchema>>({
    resolver: zodResolver(requestFormSchema),
    defaultValues: {
      recipientName: '',
      recipientEmail: '',
      recipientPhone: '',
      locationId: '',
      template: '',
      messageType: 'email',
      notes: '',
    },
  });

  const templateForm = useForm<z.infer<typeof templateFormSchema>>({
    resolver: zodResolver(templateFormSchema),
    defaultValues: {
      name: '',
      type: 'email',
      subject: '',
      content: '',
      isDefault: false,
    },
  });
  
  const integrationForm = useForm<z.infer<typeof crmIntegrationSchema>>({
    resolver: zodResolver(crmIntegrationSchema),
    defaultValues: {
      name: '',
      crmType: 'housecallpro',
      apiKey: '',
      triggerEvent: 'service_completed',
      templateId: '',
      delayHours: 2,
      active: true,
      customEndpoint: '',
      otherSettings: {},
    },
  });

  // Add Request Mutation
  const addRequestMutation = useMutation({
    mutationFn: async (values: z.infer<typeof requestFormSchema>) => {
      const res = await apiRequest('POST', '/api/review-requests', values);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Review Request Added',
        description: 'The review request has been created successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/review-requests'] });
      requestForm.reset();
      setAddRequestOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to create review request: ${error.message}`,
        variant: 'destructive',
      });
    }
  });

  // Add Template Mutation
  const addTemplateMutation = useMutation({
    mutationFn: async (values: z.infer<typeof templateFormSchema>) => {
      const res = await apiRequest('POST', '/api/review-templates', values);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Template Added',
        description: 'The review template has been created successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/review-templates'] });
      templateForm.reset();
      setAddTemplateOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to create template: ${error.message}`,
        variant: 'destructive',
      });
    }
  });

  // Update Template Mutation
  const updateTemplateMutation = useMutation({
    mutationFn: async ({ id, values }: { id: number, values: z.infer<typeof templateFormSchema> }) => {
      const res = await apiRequest('PATCH', `/api/review-templates/${id}`, values);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Template Updated',
        description: 'The review template has been updated successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/review-templates'] });
      templateForm.reset();
      setEditingTemplate(null);
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to update template: ${error.message}`,
        variant: 'destructive',
      });
    }
  });

  // Delete Request Mutation
  const deleteRequestMutation = useMutation({
    mutationFn: async (requestId: number) => {
      await apiRequest('DELETE', `/api/review-requests/${requestId}`);
    },
    onSuccess: () => {
      toast({
        title: 'Request Deleted',
        description: 'The review request has been deleted successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/review-requests'] });
      setDeletingRequest(null);
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to delete request: ${error.message}`,
        variant: 'destructive',
      });
    }
  });

  // Delete Template Mutation
  const deleteTemplateMutation = useMutation({
    mutationFn: async (templateId: number) => {
      await apiRequest('DELETE', `/api/review-templates/${templateId}`);
    },
    onSuccess: () => {
      toast({
        title: 'Template Deleted',
        description: 'The review template has been deleted successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/review-templates'] });
      setDeletingTemplate(null);
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to delete template: ${error.message}`,
        variant: 'destructive',
      });
    }
  });

  // Send Request Mutation
  const sendRequestMutation = useMutation({
    mutationFn: async (requestId: number) => {
      const res = await apiRequest('POST', `/api/review-requests/${requestId}/send`);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Request Sent',
        description: 'The review request has been sent successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/review-requests'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to send request: ${error.message}`,
        variant: 'destructive',
      });
    }
  });

  const onRequestSubmit = (values: z.infer<typeof requestFormSchema>) => {
    addRequestMutation.mutate(values);
  };

  const onTemplateSubmit = (values: z.infer<typeof templateFormSchema>) => {
    if (editingTemplate) {
      updateTemplateMutation.mutate({ id: editingTemplate.id, values });
    } else {
      addTemplateMutation.mutate(values);
    }
  };

  const handleEditTemplate = (template: ReviewTemplate) => {
    setEditingTemplate(template);
    templateForm.reset({
      name: template.name,
      type: template.type,
      subject: template.subject || '',
      content: template.content,
      isDefault: template.isDefault,
    });
    setAddTemplateOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline">Pending</Badge>;
      case 'sent':
        return <Badge variant="secondary">Sent</Badge>;
      case 'delivered':
        return <Badge variant="secondary">Delivered</Badge>;
      case 'opened':
        return <Badge variant="secondary">Opened</Badge>;
      case 'clicked':
        return <Badge className="bg-blue-100 text-blue-800">Clicked</Badge>;
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Add CRM Integration Mutation
  const addIntegrationMutation = useMutation({
    mutationFn: async (values: z.infer<typeof crmIntegrationSchema>) => {
      const res = await apiRequest('POST', '/api/crm-integrations', values);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Integration Added',
        description: 'The CRM integration has been set up successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/crm-integrations'] });
      integrationForm.reset();
      setAddIntegrationOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to create integration: ${error.message}`,
        variant: 'destructive',
      });
    }
  });

  // Update CRM Integration Mutation
  const updateIntegrationMutation = useMutation({
    mutationFn: async ({ id, values }: { id: number, values: z.infer<typeof crmIntegrationSchema> }) => {
      const res = await apiRequest('PATCH', `/api/crm-integrations/${id}`, values);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Integration Updated',
        description: 'The CRM integration has been updated successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/crm-integrations'] });
      integrationForm.reset();
      setEditingIntegration(null);
      setAddIntegrationOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to update integration: ${error.message}`,
        variant: 'destructive',
      });
    }
  });

  // Delete CRM Integration Mutation
  const deleteIntegrationMutation = useMutation({
    mutationFn: async (integrationId: number) => {
      await apiRequest('DELETE', `/api/crm-integrations/${integrationId}`);
    },
    onSuccess: () => {
      toast({
        title: 'Integration Deleted',
        description: 'The CRM integration has been removed successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/crm-integrations'] });
      setDeletingIntegration(null);
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to delete integration: ${error.message}`,
        variant: 'destructive',
      });
    }
  });

  // Test Integration Mutation
  const testIntegrationMutation = useMutation({
    mutationFn: async (integrationId: number) => {
      const res = await apiRequest('POST', `/api/crm-integrations/${integrationId}/test`);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Test Successful',
        description: 'Successfully connected to the CRM platform.',
      });
      setShowTestIntegrationDialog(false);
    },
    onError: (error: Error) => {
      toast({
        title: 'Connection Failed',
        description: `Could not connect to the CRM: ${error.message}`,
        variant: 'destructive',
      });
    }
  });

  const onIntegrationSubmit = (values: z.infer<typeof crmIntegrationSchema>) => {
    if (editingIntegration) {
      updateIntegrationMutation.mutate({ id: editingIntegration.id, values });
    } else {
      addIntegrationMutation.mutate(values);
    }
  };

  const handleEditIntegration = (integration: CRMIntegration) => {
    setEditingIntegration(integration);
    integrationForm.reset({
      name: integration.name,
      crmType: integration.crmType,
      apiKey: integration.apiKey,
      triggerEvent: integration.triggerEvent,
      templateId: integration.templateId.toString(),
      delayHours: integration.delayHours,
      active: integration.active,
      customEndpoint: integration.customEndpoint || '',
      otherSettings: integration.otherSettings || {},
    });
    setAddIntegrationOpen(true);
  };

  const handleTemplateTypeChange = (type: 'email' | 'sms') => {
    setTemplateType(type);
    templateForm.setValue('type', type);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied to clipboard',
      description: 'The content has been copied to your clipboard.',
    });
  };

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Review Requests</h1>
        <div className="flex space-x-2">
          <Dialog open={addTemplateOpen} onOpenChange={setAddTemplateOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Edit className="mr-2 h-4 w-4" /> Manage Templates
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[650px]">
              <DialogHeader>
                <DialogTitle>{editingTemplate ? 'Edit Template' : 'Create New Template'}</DialogTitle>
                <DialogDescription>
                  {editingTemplate 
                    ? 'Update your existing review request template.'
                    : 'Create a template for requesting reviews from your customers.'}
                </DialogDescription>
              </DialogHeader>
              <Form {...templateForm}>
                <form onSubmit={templateForm.handleSubmit(onTemplateSubmit)} className="space-y-4">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        type="button"
                        variant={templateType === 'email' ? 'default' : 'outline'}
                        className="flex-1"
                        onClick={() => handleTemplateTypeChange('email')}
                      >
                        <Mail className="mr-2 h-4 w-4" /> Email Template
                      </Button>
                      <Button
                        type="button"
                        variant={templateType === 'sms' ? 'default' : 'outline'}
                        className="flex-1"
                        onClick={() => handleTemplateTypeChange('sms')}
                      >
                        <MessageCircle className="mr-2 h-4 w-4" /> SMS Template
                      </Button>
                    </div>
                  </div>
                  
                  <FormField
                    control={templateForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Template Name*</FormLabel>
                        <FormControl>
                          <Input placeholder="E.g., Standard Review Request" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={templateForm.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem className="hidden">
                        <FormControl>
                          <Input type="hidden" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {templateType === 'email' && (
                    <FormField
                      control={templateForm.control}
                      name="subject"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Subject*</FormLabel>
                          <FormControl>
                            <Input placeholder="We'd love your feedback!" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  
                  <FormField
                    control={templateForm.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Message Content*</FormLabel>
                        <FormControl>
                          <Textarea 
                            rows={8}
                            placeholder={templateType === 'email' 
                              ? "Dear {{name}},\n\nThank you for choosing our services. We'd love to hear about your experience.\n\nPlease take a moment to leave us a review by clicking this link: {{reviewLink}}\n\nThank you,\n{{businessName}}"
                              : "Hi {{name}}, thanks for choosing {{businessName}}! We'd appreciate your feedback. Please leave a review here: {{reviewLink}}"
                            } 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Use variables like {{name}}, {{businessName}}, and {{reviewLink}} that will be replaced with actual values.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={templateForm.control}
                    name="isDefault"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={field.onChange}
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Set as Default Template</FormLabel>
                          <FormDescription>
                            This template will be selected by default when creating new review requests.
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <DialogFooter>
                    {editingTemplate && (
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => {
                          setEditingTemplate(null);
                          templateForm.reset({
                            name: '',
                            type: 'email',
                            subject: '',
                            content: '',
                            isDefault: false,
                          });
                        }}
                        className="mr-auto"
                      >
                        Cancel Edit
                      </Button>
                    )}
                    <Button 
                      type="submit" 
                      disabled={addTemplateMutation.isPending || updateTemplateMutation.isPending}
                    >
                      {(addTemplateMutation.isPending || updateTemplateMutation.isPending) && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      {editingTemplate ? 'Update Template' : 'Save Template'}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
          
          <Dialog open={addRequestOpen} onOpenChange={setAddRequestOpen}>
            <DialogTrigger asChild>
              <Button><PlusCircle className="mr-2 h-4 w-4" /> New Request</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px]">
              <DialogHeader>
                <DialogTitle>New Review Request</DialogTitle>
                <DialogDescription>
                  Send a request to your customer to leave a review.
                </DialogDescription>
              </DialogHeader>
              <Form {...requestForm}>
                <form onSubmit={requestForm.handleSubmit(onRequestSubmit)} className="space-y-4">
                  <FormField
                    control={requestForm.control}
                    name="recipientName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Recipient Name*</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={requestForm.control}
                    name="recipientEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Recipient Email*</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="john.doe@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={requestForm.control}
                    name="recipientPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Recipient Phone (optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="+1 (555) 123-4567" {...field} />
                        </FormControl>
                        <FormDescription>
                          Required if you want to send SMS messages.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={requestForm.control}
                    name="locationId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location (optional)</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a location" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {locations && locations.map((location: any) => (
                              <SelectItem key={location.id} value={location.id.toString()}>
                                {location.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Associate this request with a specific location.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={requestForm.control}
                    name="template"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Template*</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a template" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {reviewTemplates && reviewTemplates.map((template: ReviewTemplate) => (
                              <SelectItem key={template.id} value={template.id.toString()}>
                                {template.name} ({template.type})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={requestForm.control}
                    name="messageType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Message Type*</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="email">Email Only</SelectItem>
                            <SelectItem value="sms">SMS Only</SelectItem>
                            <SelectItem value="both">Email & SMS</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Choose how you want to send the request.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={requestForm.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes (optional)</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Additional notes about this request..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <DialogFooter>
                    <Button type="submit" disabled={addRequestMutation.isPending}>
                      {addRequestMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Create Request
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="requests" onValueChange={setSelectedTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="requests">Review Requests</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="integrations">CRM Integrations</TabsTrigger>
        </TabsList>
        
        {/* Review Requests Tab */}
        <TabsContent value="requests" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Review Requests</CardTitle>
              <CardDescription>
                Manage and track your review requests to customers.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {requestsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : reviewRequests && reviewRequests.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Recipient</TableHead>
                        <TableHead>Contact Info</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reviewRequests.map((request: ReviewRequest) => (
                        <TableRow key={request.id}>
                          <TableCell className="font-medium">{request.recipientName}</TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="text-sm flex items-center">
                                <Mail className="mr-1 h-3 w-3" /> {request.recipientEmail}
                              </span>
                              {request.recipientPhone && (
                                <span className="text-sm flex items-center mt-1">
                                  <Phone className="mr-1 h-3 w-3" /> {request.recipientPhone}
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {request.messageType === 'both' 
                                ? 'Email & SMS' 
                                : request.messageType === 'email' ? 'Email' : 'SMS'}
                            </Badge>
                          </TableCell>
                          <TableCell>{getStatusBadge(request.status)}</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Clock className="mr-1 h-3 w-3 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">
                                {new Date(request.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <span className="sr-only">Open menu</span>
                                  <svg 
                                    className="h-4 w-4" 
                                    xmlns="http://www.w3.org/2000/svg" 
                                    viewBox="0 0 24 24" 
                                    fill="none" 
                                    stroke="currentColor" 
                                    strokeWidth="2" 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round"
                                  >
                                    <circle cx="12" cy="12" r="1" />
                                    <circle cx="19" cy="12" r="1" />
                                    <circle cx="5" cy="12" r="1" />
                                  </svg>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                
                                {request.status === 'pending' && (
                                  <DropdownMenuItem
                                    onClick={() => sendRequestMutation.mutate(request.id)}
                                  >
                                    <Send className="mr-2 h-4 w-4" />
                                    <span>Send Now</span>
                                  </DropdownMenuItem>
                                )}
                                
                                <DropdownMenuItem
                                  onClick={() => {
                                    // Copy link functionality
                                    copyToClipboard(`https://repuradar.com/review/${request.id}`);
                                  }}
                                >
                                  <Copy className="mr-2 h-4 w-4" />
                                  <span>Copy Link</span>
                                </DropdownMenuItem>
                                
                                <DropdownMenuSeparator />
                                
                                <DropdownMenuItem
                                  onClick={() => setDeletingRequest(request.id)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  <span>Delete</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                            
                            <AlertDialog 
                              open={deletingRequest === request.id} 
                              onOpenChange={(open) => !open && setDeletingRequest(null)}
                            >
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will permanently delete this review request to {request.recipientName}.
                                    This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => deleteRequestMutation.mutate(request.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    {deleteRequestMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <MessageCircle className="mx-auto h-12 w-12 text-muted-foreground/50" />
                  <h3 className="mt-4 text-lg font-medium">No Review Requests</h3>
                  <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
                    You haven't created any review requests yet. Get started by creating your first request.
                  </p>
                  <Button onClick={() => setAddRequestOpen(true)} className="mt-4">
                    <PlusCircle className="mr-2 h-4 w-4" /> Create First Request
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Review Request Statistics</CardTitle>
              <CardDescription>
                Overview of your review request performance.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-background border rounded-lg p-4">
                  <div className="text-sm font-medium text-muted-foreground">Total Requests</div>
                  <div className="mt-1 text-3xl font-bold">
                    {reviewRequests ? reviewRequests.length : 0}
                  </div>
                </div>
                
                <div className="bg-background border rounded-lg p-4">
                  <div className="text-sm font-medium text-muted-foreground">Delivered</div>
                  <div className="mt-1 text-3xl font-bold">
                    {reviewRequests 
                      ? reviewRequests.filter((r: ReviewRequest) => 
                          ['delivered', 'opened', 'clicked', 'completed'].includes(r.status)
                        ).length
                      : 0
                    }
                  </div>
                </div>
                
                <div className="bg-background border rounded-lg p-4">
                  <div className="text-sm font-medium text-muted-foreground">Opened</div>
                  <div className="mt-1 text-3xl font-bold">
                    {reviewRequests 
                      ? reviewRequests.filter((r: ReviewRequest) => 
                          ['opened', 'clicked', 'completed'].includes(r.status)
                        ).length
                      : 0
                    }
                  </div>
                </div>
                
                <div className="bg-background border rounded-lg p-4">
                  <div className="text-sm font-medium text-muted-foreground">Completed</div>
                  <div className="mt-1 text-3xl font-bold">
                    {reviewRequests 
                      ? reviewRequests.filter((r: ReviewRequest) => r.status === 'completed').length
                      : 0
                    }
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="text-sm font-medium mb-2">Conversion Rate</h3>
                <div className="w-full bg-muted rounded-full h-2.5">
                  <div 
                    className="bg-primary h-2.5 rounded-full" 
                    style={{ 
                      width: reviewRequests && reviewRequests.length > 0 
                        ? `${(reviewRequests.filter((r: ReviewRequest) => 
                            r.status === 'completed').length / reviewRequests.length) * 100}%` 
                        : '0%' 
                    }}
                  ></div>
                </div>
                <div className="flex justify-between mt-1 text-sm text-muted-foreground">
                  <span>0%</span>
                  <span>
                    {reviewRequests && reviewRequests.length > 0 
                      ? `${Math.round((reviewRequests.filter((r: ReviewRequest) => 
                          r.status === 'completed').length / reviewRequests.length) * 100)}%` 
                      : '0%'
                    }
                  </span>
                  <span>100%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Review Request Templates</CardTitle>
              <CardDescription>
                Manage your templates for requesting reviews.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {templatesLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : reviewTemplates && reviewTemplates.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Template Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Default</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reviewTemplates.map((template: ReviewTemplate) => (
                        <TableRow key={template.id}>
                          <TableCell className="font-medium">{template.name}</TableCell>
                          <TableCell>
                            <Badge variant={template.type === 'email' ? 'default' : 'secondary'}>
                              {template.type === 'email' ? 'Email' : 'SMS'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {template.isDefault ? (
                              <Check className="h-5 w-5 text-green-600" />
                            ) : (
                              <X className="h-5 w-5 text-muted-foreground/40" />
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleEditTemplate(template)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => copyToClipboard(template.content)}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                              
                              <AlertDialog 
                                open={deletingTemplate === template.id} 
                                onOpenChange={(open) => !open && setDeletingTemplate(null)}
                              >
                                <AlertDialogTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => setDeletingTemplate(template.id)}
                                    disabled={template.isDefault}
                                    className={template.isDefault ? 'opacity-30 cursor-not-allowed' : ''}
                                  >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This will permanently delete the template "{template.name}".
                                      This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => deleteTemplateMutation.mutate(template.id)}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      {deleteTemplateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <MessageCircle className="mx-auto h-12 w-12 text-muted-foreground/50" />
                  <h3 className="mt-4 text-lg font-medium">No Templates</h3>
                  <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
                    You haven't created any review request templates yet. Get started by creating your first template.
                  </p>
                  <Button onClick={() => setAddTemplateOpen(true)} className="mt-4">
                    <PlusCircle className="mr-2 h-4 w-4" /> Create First Template
                  </Button>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline" 
                onClick={() => {
                  setEditingTemplate(null);
                  templateForm.reset({
                    name: '',
                    type: 'email',
                    subject: '',
                    content: '',
                    isDefault: false,
                  });
                  setAddTemplateOpen(true);
                }}
              >
                <PlusCircle className="mr-2 h-4 w-4" /> Add New Template
              </Button>
            </CardFooter>
          </Card>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Email Template Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 list-disc pl-5">
                  <li className="text-sm">Keep email subject lines clear and concise</li>
                  <li className="text-sm">Personalize your emails with {{name}} variable</li>
                  <li className="text-sm">Express gratitude for their business</li>
                  <li className="text-sm">Keep the request simple and direct</li>
                  <li className="text-sm">Make the review link prominent</li>
                  <li className="text-sm">Explain how reviews help your business</li>
                  <li className="text-sm">Sign off with your business name</li>
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>SMS Template Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 list-disc pl-5">
                  <li className="text-sm">Keep messages under 160 characters when possible</li>
                  <li className="text-sm">Identify your business clearly</li>
                  <li className="text-sm">Use a personal, conversational tone</li>
                  <li className="text-sm">Include only one call-to-action</li>
                  <li className="text-sm">Make sure your link is short and trackable</li>
                  <li className="text-sm">Avoid using all caps or excessive punctuation</li>
                  <li className="text-sm">Include an opt-out option for compliance</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* CRM Integrations Tab */}
        <TabsContent value="integrations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>CRM Integrations</CardTitle>
              <CardDescription>
                Automatically send review requests based on events in your CRM platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              {integrationsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : crmIntegrations && crmIntegrations.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Integration Name</TableHead>
                        <TableHead>Platform</TableHead>
                        <TableHead>Trigger</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Last Sync</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {crmIntegrations.map((integration: CRMIntegration) => (
                        <TableRow key={integration.id}>
                          <TableCell className="font-medium">{integration.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {integration.crmType.replace(/([A-Z])/g, ' $1').toLowerCase()}
                            </Badge>
                          </TableCell>
                          <TableCell className="capitalize">
                            {integration.triggerEvent.replace(/_/g, ' ')}
                          </TableCell>
                          <TableCell>
                            {integration.active ? (
                              <Badge className="bg-green-100 text-green-800">Active</Badge>
                            ) : (
                              <Badge variant="outline">Disabled</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {integration.lastSync ? (
                              <div className="flex items-center">
                                <Clock className="mr-1 h-3 w-3 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">
                                  {new Date(integration.lastSync).toLocaleDateString()}
                                </span>
                              </div>
                            ) : (
                              <span className="text-sm text-muted-foreground">Never</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleEditIntegration(integration)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => {
                                  setSelectedIntegration(integration.id.toString());
                                  setShowTestIntegrationDialog(true);
                                }}
                              >
                                <RotateCw className="h-4 w-4" />
                              </Button>
                              
                              <AlertDialog 
                                open={deletingIntegration === integration.id} 
                                onOpenChange={(open) => {
                                  if (!open) setDeletingIntegration(null);
                                }}
                              >
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="sm" onClick={() => setDeletingIntegration(integration.id)}>
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Integration</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete this CRM integration? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction 
                                      className="bg-red-600 text-white hover:bg-red-700" 
                                      onClick={() => deleteIntegrationMutation.mutate(integration.id)}
                                    >
                                      {deleteIntegrationMutation.isPending ? 
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" /> : 
                                        null
                                      }
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8 space-y-3">
                  <div className="mx-auto bg-muted rounded-full w-12 h-12 flex items-center justify-center">
                    <Plug className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium">No CRM integrations yet</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Automate your review requests by connecting your CRM platform.
                    Set triggers based on customer interactions to send review requests.
                  </p>
                  <Button 
                    onClick={() => {
                      integrationForm.reset();
                      setEditingIntegration(null);
                      setAddIntegrationOpen(true);
                    }}
                    className="mt-2"
                  >
                    <PlusCircle className="mr-2 h-4 w-4" /> 
                    Connect CRM Platform
                  </Button>
                </div>
              )}
            </CardContent>
            {crmIntegrations && crmIntegrations.length > 0 && (
              <CardFooter className="justify-end">
                <Button 
                  onClick={() => {
                    integrationForm.reset();
                    setEditingIntegration(null);
                    setAddIntegrationOpen(true);
                  }}
                >
                  <PlusCircle className="mr-2 h-4 w-4" /> Add New Integration
                </Button>
              </CardFooter>
            )}
          </Card>
          
          {/* CRM Integration Dialog */}
          <Dialog open={addIntegrationOpen} onOpenChange={setAddIntegrationOpen}>
            <DialogContent className="sm:max-w-[650px]">
              <DialogHeader>
                <DialogTitle>
                  {editingIntegration ? 'Edit CRM Integration' : 'Connect CRM Platform'}
                </DialogTitle>
                <DialogDescription>
                  {editingIntegration 
                    ? 'Update your CRM integration settings.'
                    : 'Connect your CRM platform to automatically send review requests based on customer interactions.'}
                </DialogDescription>
              </DialogHeader>
              
              <Form {...integrationForm}>
                <form onSubmit={integrationForm.handleSubmit(onIntegrationSubmit)} className="space-y-4">
                  <FormField
                    control={integrationForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Integration Name*</FormLabel>
                        <FormControl>
                          <Input placeholder="E.g., HouseCallPro Customer Reviews" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={integrationForm.control}
                      name="crmType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CRM Platform*</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {/* Field Service & Contractor Platforms */}
                              <SelectItem value="housecallpro">HouseCall Pro</SelectItem>
                              <SelectItem value="servicetitan">ServiceTitan</SelectItem>
                              <SelectItem value="jobber">Jobber</SelectItem>
                              
                              {/* Salon & Spa Platforms */}
                              <SelectItem value="mindbody">Mindbody</SelectItem>
                              <SelectItem value="booker">Booker by MINDBODY</SelectItem>
                              <SelectItem value="vagaro">Vagaro</SelectItem>
                              <SelectItem value="schedulicity">Schedulicity</SelectItem>
                              
                              {/* Payment & POS Platforms */}
                              <SelectItem value="square">Square</SelectItem>
                              
                              {/* General CRMs */}
                              <SelectItem value="salesforce">Salesforce</SelectItem>
                              <SelectItem value="zoho">Zoho CRM</SelectItem>
                              <SelectItem value="podium">Podium</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={integrationForm.control}
                      name="apiKey"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>API Key/Token*</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormDescription>
                            Find this in your CRM platform's developer settings
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={integrationForm.control}
                      name="triggerEvent"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Trigger Event*</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {/* General Triggers */}
                              <SelectItem value="appointment_completed">Appointment Completed</SelectItem>
                              <SelectItem value="invoice_paid">Invoice Paid</SelectItem>
                              <SelectItem value="service_completed">Service Completed</SelectItem>
                              <SelectItem value="customer_created">Customer Created</SelectItem>
                              
                              {/* Spa & Salon Specific Triggers */}
                              <SelectItem value="treatment_finished">Treatment Finished</SelectItem>
                              <SelectItem value="checkout_complete">Checkout Complete</SelectItem>
                              <SelectItem value="membership_renewed">Membership Renewed</SelectItem>
                              
                              <SelectItem value="other">Custom Event</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={integrationForm.control}
                      name="templateId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Review Template*</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a template" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {reviewTemplates && reviewTemplates.map((template: ReviewTemplate) => (
                                <SelectItem key={template.id} value={template.id.toString()}>
                                  {template.name} ({template.type})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={integrationForm.control}
                      name="delayHours"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Delay (Hours)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number"
                              min={0}
                              max={72}
                              {...field} 
                              onChange={e => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormDescription>
                            Hours to wait after the trigger event before sending the request
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={integrationForm.control}
                      name="active"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4 border rounded-md">
                          <FormControl>
                            <input
                              type="checkbox"
                              className="h-4 w-4 mt-1"
                              checked={field.value}
                              onChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Enable Integration</FormLabel>
                            <FormDescription>
                              When enabled, review requests will be sent automatically
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  {integrationForm.watch('crmType') === 'other' && (
                    <FormField
                      control={integrationForm.control}
                      name="customEndpoint"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Custom API Endpoint</FormLabel>
                          <FormControl>
                            <Input placeholder="https://api.example.com/webhook" {...field} />
                          </FormControl>
                          <FormDescription>
                            For custom CRM integrations, specify the API endpoint
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  
                  <DialogFooter className="mt-6">
                    <Button type="submit" disabled={addIntegrationMutation.isPending || updateIntegrationMutation.isPending}>
                      {(addIntegrationMutation.isPending || updateIntegrationMutation.isPending) && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      {editingIntegration ? 'Update Integration' : 'Connect Platform'}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
          
          {/* Test Integration Dialog */}
          <Dialog open={showTestIntegrationDialog} onOpenChange={setShowTestIntegrationDialog}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Test CRM Connection</DialogTitle>
                <DialogDescription>
                  Verify your CRM integration is working correctly.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Ready to test your integration</h4>
                  <p className="text-sm text-muted-foreground">
                    This will send a test request to your CRM platform to verify the connection.
                    No review requests will be sent to customers.
                  </p>
                </div>
                
                <div className="border rounded-lg p-4 bg-muted/50">
                  <div className="flex items-center space-x-4">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <Plug className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {crmIntegrations?.find((i: CRMIntegration) => 
                          i.id.toString() === selectedIntegration
                        )?.name || 'CRM Integration'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {crmIntegrations?.find((i: CRMIntegration) => 
                          i.id.toString() === selectedIntegration
                        )?.crmType.replace(/([A-Z])/g, ' $1').split(' ').map(word => 
                          word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                        ).join(' ') || 'Unknown platform'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowTestIntegrationDialog(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={() => {
                    const integrationId = parseInt(selectedIntegration || '0');
                    if (integrationId > 0) {
                      testIntegrationMutation.mutate(integrationId);
                    }
                  }}
                  disabled={testIntegrationMutation.isPending}
                >
                  {testIntegrationMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Test Connection
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Home Service CRMs */}
            <Card>
              <CardHeader className="pb-2">
                <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center mb-2">
                  <Building className="h-4 w-4 text-blue-700" />
                </div>
                <CardTitle className="text-base">Home Services</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">
                  Connect platforms for contractors and home service businesses:
                </p>
                <ul className="text-sm text-muted-foreground list-disc pl-4 space-y-1">
                  <li>HouseCall Pro</li>
                  <li>ServiceTitan</li>
                  <li>Jobber</li>
                </ul>
              </CardContent>
            </Card>
            
            {/* Medspa/Salon CRMs */}
            <Card>
              <CardHeader className="pb-2">
                <div className="h-8 w-8 rounded-lg bg-purple-100 flex items-center justify-center mb-2">
                  <Calendar className="h-4 w-4 text-purple-700" />
                </div>
                <CardTitle className="text-base">Spa & Salon</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">
                  Integrate with popular medspa and salon management systems:
                </p>
                <ul className="text-sm text-muted-foreground list-disc pl-4 space-y-1">
                  <li>Mindbody</li>
                  <li>Booker by MINDBODY</li>
                  <li>Vagaro</li>
                  <li>Schedulicity</li>
                  <li>Square</li>
                </ul>
              </CardContent>
            </Card>
            
            {/* Other CRMs */}
            <Card>
              <CardHeader className="pb-2">
                <div className="h-8 w-8 rounded-lg bg-green-100 flex items-center justify-center mb-2">
                  <GanttChart className="h-4 w-4 text-green-700" />
                </div>
                <CardTitle className="text-base">General CRMs</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">
                  Connect with general-purpose CRM platforms:
                </p>
                <ul className="text-sm text-muted-foreground list-disc pl-4 space-y-1">
                  <li>Salesforce</li>
                  <li>Zoho CRM</li>
                  <li>Podium</li>
                  <li>Custom integrations via API</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReviewRequestsPage;