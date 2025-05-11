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
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Check,
  ChevronDown,
  Copy,
  Edit,
  FileCheck,
  FilePlus,
  FileText,
  FolderOpen,
  MessageSquare,
  MoreHorizontal,
  Pencil,
  PlusCircle,
  RefreshCw,
  Search,
  Star,
  Trash2,
} from "lucide-react";
import { format } from "date-fns";
import { queryClient } from "@/lib/queryClient";

// Types
interface ReviewTemplate {
  id: number;
  name: string;
  content: string;
  category: string;
  templateType: string;
  isDefault: boolean;
  variables: string[];
  rating: number;
  createdAt: string;
  updatedAt: string;
  usageCount: number;
}

// Form schema
const templateFormSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  content: z.string().min(10, "Content must be at least 10 characters"),
  category: z.string({
    required_error: "Please select a category",
  }),
  templateType: z.string({
    required_error: "Please select a template type",
  }),
  rating: z.number({
    required_error: "Please select a rating",
  }),
  isDefault: z.boolean().default(false),
});

const TemplatesPage = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ReviewTemplate | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<ReviewTemplate | null>(null);
  const { toast } = useToast();

  // Fetch templates
  const {
    data: templatesData,
    isLoading: isLoadingTemplates,
    error: templatesError,
  } = useQuery({
    queryKey: ["/api/review-templates", searchQuery, activeTab],
    queryFn: async () => {
      // Mock data
      const templates: ReviewTemplate[] = [
        {
          id: 1,
          name: "Thank You for Positive Review",
          content:
            "Dear {{customer_name}},\n\nThank you for your wonderful 5-star review! We're thrilled to hear that you had such a positive experience with {{business_name}}. Your satisfaction is our top priority, and feedback like yours motivates our team to continue providing excellent service.\n\nWe truly appreciate you taking the time to share your experience with others and look forward to serving you again soon.\n\nBest regards,\n{{user_name}}\n{{business_name}}",
          category: "Gratitude",
          templateType: "positive",
          isDefault: true,
          variables: ["customer_name", "business_name", "user_name"],
          rating: 5,
          createdAt: "2025-04-10T10:00:00",
          updatedAt: "2025-05-05T15:30:00",
          usageCount: 127,
        },
        {
          id: 2,
          name: "Response to Negative Review",
          content:
            "Dear {{customer_name}},\n\nThank you for taking the time to share your feedback. We sincerely apologize that your experience at {{business_name}} didn't meet your expectations. We take all feedback seriously and use it to improve our services.\n\n{{specific_apology}}\n\nWe would appreciate the opportunity to address your concerns directly. Please contact me at {{contact_info}} so we can make this right for you.\n\nSincerely,\n{{user_name}}\n{{business_name}}",
          category: "Service Recovery",
          templateType: "negative",
          isDefault: true,
          variables: [
            "customer_name",
            "business_name",
            "specific_apology",
            "contact_info",
            "user_name",
          ],
          rating: 1,
          createdAt: "2025-04-11T11:15:00",
          updatedAt: "2025-05-06T09:20:00",
          usageCount: 85,
        },
        {
          id: 3,
          name: "Neutral Review Response",
          content:
            "Hello {{customer_name}},\n\nThank you for sharing your experience with {{business_name}}. We appreciate your balanced feedback and insights on where we're doing well and where we can improve.\n\n{{acknowledgment}}\n\nWe're continuously working to enhance our offerings and would love to hear more about how we can make your next experience with us exceptional. Feel free to reach out directly at {{contact_info}}.\n\nThank you,\n{{user_name}}\n{{business_name}}",
          category: "Acknowledgment",
          templateType: "neutral",
          isDefault: true,
          variables: [
            "customer_name",
            "business_name",
            "acknowledgment",
            "contact_info",
            "user_name",
          ],
          rating: 3,
          createdAt: "2025-04-12T14:30:00",
          updatedAt: "2025-04-12T14:30:00",
          usageCount: 64,
        },
        {
          id: 4,
          name: "Holiday Special Thanks",
          content:
            "Dear {{customer_name}},\n\nThank you for your wonderful review of {{business_name}}! During this holiday season, we're especially grateful for amazing customers like you.\n\nYour kind words mean so much to our team, and we're delighted that you had a positive experience with us. We look forward to serving you again in the new year!\n\nWarmest wishes for a joyful holiday season,\n{{user_name}}\n{{business_name}}",
          category: "Seasonal",
          templateType: "positive",
          isDefault: false,
          variables: ["customer_name", "business_name", "user_name"],
          rating: 5,
          createdAt: "2025-04-20T09:45:00",
          updatedAt: "2025-04-20T09:45:00",
          usageCount: 23,
        },
        {
          id: 5,
          name: "Professional Services Thank You",
          content:
            "Dear {{customer_name}},\n\nThank you for your thoughtful review of our professional services at {{business_name}}. We understand that choosing the right {{service_type}} is an important decision, and we're honored that you've placed your trust in us.\n\nWe're committed to maintaining the high standards you've recognized in your review and look forward to continuing our professional relationship.\n\nBest regards,\n{{user_name}}\n{{business_name}}",
          category: "Professional",
          templateType: "positive",
          isDefault: false,
          variables: [
            "customer_name",
            "business_name",
            "service_type",
            "user_name",
          ],
          rating: 4,
          createdAt: "2025-04-25T16:20:00",
          updatedAt: "2025-05-10T11:30:00",
          usageCount: 42,
        },
        {
          id: 6,
          name: "Appreciation for Detailed Feedback",
          content:
            "Dear {{customer_name}},\n\nThank you for taking the time to provide such detailed feedback about your experience with {{business_name}}. We genuinely appreciate the thoroughness of your review, which offers valuable insights for both our team and potential customers.\n\n{{specific_acknowledgment}}\n\nYour feedback helps us refine our approach, and we're grateful for customers like you who contribute to our growth and improvement.\n\nWith appreciation,\n{{user_name}}\n{{business_name}}",
          category: "Gratitude",
          templateType: "positive",
          isDefault: false,
          variables: [
            "customer_name",
            "business_name",
            "specific_acknowledgment",
            "user_name",
          ],
          rating: 5,
          createdAt: "2025-05-02T13:10:00",
          updatedAt: "2025-05-02T13:10:00",
          usageCount: 18,
        },
        {
          id: 7,
          name: "First-Time Customer Response",
          content:
            "Dear {{customer_name}},\n\nThank you for choosing {{business_name}} for your first visit and for taking the time to share your experience! We're thrilled to welcome you as a new customer and are pleased that you enjoyed your time with us.\n\n{{personalized_note}}\n\nWe look forward to seeing you again and continuing to provide the quality service you've come to expect from us.\n\nWarm regards,\n{{user_name}}\n{{business_name}}",
          category: "Acquisition",
          templateType: "positive",
          isDefault: false,
          variables: [
            "customer_name",
            "business_name",
            "personalized_note",
            "user_name",
          ],
          rating: 4,
          createdAt: "2025-05-05T10:25:00",
          updatedAt: "2025-05-05T10:25:00",
          usageCount: 31,
        },
      ];

      // Filter by tab
      let filtered = templates;
      
      if (activeTab === "positive") {
        filtered = templates.filter(
          (template) => template.templateType === "positive"
        );
      } else if (activeTab === "negative") {
        filtered = templates.filter(
          (template) => template.templateType === "negative"
        );
      } else if (activeTab === "neutral") {
        filtered = templates.filter(
          (template) => template.templateType === "neutral"
        );
      }
      
      // Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(
          (template) =>
            template.name.toLowerCase().includes(query) ||
            template.category.toLowerCase().includes(query) ||
            template.content.toLowerCase().includes(query)
        );
      }

      return {
        templates: filtered,
        total: templates.length,
      };
    },
  });

  // Form for templates
  const form = useForm<z.infer<typeof templateFormSchema>>({
    resolver: zodResolver(templateFormSchema),
    defaultValues: {
      name: "",
      content: "",
      isDefault: false,
    },
  });

  // Initialize form with existing template data for editing
  const initEditForm = (template: ReviewTemplate) => {
    form.reset({
      name: template.name,
      content: template.content,
      category: template.category,
      templateType: template.templateType,
      rating: template.rating,
      isDefault: template.isDefault,
    });
    
    setSelectedTemplate(template);
    setIsEditing(true);
  };

  const onSubmit = (values: z.infer<typeof templateFormSchema>) => {
    console.log("Creating/Updating template:", values);
    
    if (isEditing) {
      toast({
        title: "Template Updated",
        description: `${values.name} has been updated successfully.`,
      });
    } else {
      toast({
        title: "Template Created",
        description: `${values.name} has been created successfully.`,
      });
    }
    
    // Close the dialog and reset form
    setIsCreating(false);
    setIsEditing(false);
    setSelectedTemplate(null);
    form.reset();
    
    // Refresh templates
    queryClient.invalidateQueries({ queryKey: ["/api/review-templates"] });
  };

  const handleDeleteTemplate = (template: ReviewTemplate) => {
    toast({
      title: "Template Deleted",
      description: `${template.name} has been deleted successfully.`,
    });
    
    // Refresh templates
    queryClient.invalidateQueries({ queryKey: ["/api/review-templates"] });
  };

  const handleDuplicateTemplate = (template: ReviewTemplate) => {
    // Pre-fill the form with the template data for duplicating
    form.reset({
      name: `Copy of ${template.name}`,
      content: template.content,
      category: template.category,
      templateType: template.templateType,
      rating: template.rating,
      isDefault: false, // Don't copy the default status
    });
    
    setIsCreating(true);
  };

  const handleCopyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
    
    toast({
      title: "Copied to Clipboard",
      description: "Template content has been copied to clipboard.",
    });
  };

  const handlePreviewTemplate = (template: ReviewTemplate) => {
    setPreviewTemplate(template);
  };

  const getTemplateTypeColor = (type: string) => {
    switch (type) {
      case "positive":
        return "bg-green-500";
      case "negative":
        return "bg-red-500";
      case "neutral":
        return "bg-blue-500";
      default:
        return "bg-slate-500";
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM d, yyyy");
  };

  const getRatingStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars.push(
          <Star
            key={i}
            className="h-4 w-4 fill-yellow-400 text-yellow-400"
          />
        );
      } else {
        stars.push(
          <Star
            key={i}
            className="h-4 w-4 text-slate-300"
          />
        );
      }
    }
    return <div className="flex">{stars}</div>;
  };

  const renderVariableBadges = (variables: string[]) => {
    return (
      <div className="flex flex-wrap gap-1 mt-1">
        {variables.map((variable) => (
          <Badge key={variable} variant="outline" className="text-xs">
            {`{{${variable}}}`}
          </Badge>
        ))}
      </div>
    );
  };

  return (
    <>
      <Helmet>
        <title>Review Templates | RepuRadar</title>
        <meta
          name="description"
          content="Create and manage templates for responding to customer reviews."
        />
      </Helmet>

      <div className="min-h-screen flex flex-col lg:flex-row">
        <Sidebar />

        <main className="flex-1 p-4 lg:p-6 bg-slate-50 min-h-screen">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <header className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-semibold text-slate-800">Review Templates</h1>
                <p className="text-slate-500">
                  Create and manage templates for responding to customer reviews
                </p>
              </div>
              <Button onClick={() => setIsCreating(true)}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Create Template
              </Button>
            </header>

            {/* Search and Filters */}
            <div className="mb-6 flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search templates..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex">
                <Tabs
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="w-full sm:w-auto"
                >
                  <TabsList>
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="positive">Positive</TabsTrigger>
                    <TabsTrigger value="neutral">Neutral</TabsTrigger>
                    <TabsTrigger value="negative">Negative</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>

            {/* Templates Grid/List */}
            {isLoadingTemplates ? (
              <div className="flex justify-center p-12">
                <RefreshCw className="h-8 w-8 animate-spin text-slate-400" />
              </div>
            ) : templatesError ? (
              <div className="text-center text-red-500 p-8">
                Failed to load review templates
              </div>
            ) : templatesData?.templates.length === 0 ? (
              <Card className="flex flex-col items-center justify-center p-12 text-center">
                <FileText className="h-12 w-12 text-slate-300 mb-3" />
                <h2 className="text-xl font-medium text-slate-800 mb-2">
                  No Templates Found
                </h2>
                <p className="text-slate-500 mb-6 max-w-md">
                  {searchQuery
                    ? "No templates match your search criteria. Try adjusting your search or filters."
                    : "You haven't created any templates yet. Create your first template to get started."}
                </p>
                <Button onClick={() => setIsCreating(true)}>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Create Template
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {templatesData?.templates.map((template) => (
                  <Card key={template.id} className="overflow-hidden">
                    <CardHeader className="p-4 pb-2">
                      <div className="flex justify-between items-start mb-1">
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        <Badge className={getTemplateTypeColor(template.templateType)}>
                          {template.templateType.charAt(0).toUpperCase() + template.templateType.slice(1)}
                        </Badge>
                      </div>
                      <CardDescription className="flex justify-between">
                        <span>{template.category}</span>
                        {template.isDefault && <Badge variant="outline">Default</Badge>}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="text-sm text-slate-500 mb-3 line-clamp-3">
                        {template.content.split("\n")[0]}...
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="text-xs text-slate-400">
                          {formatDate(template.updatedAt)}
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-slate-400 mr-1">
                            For:
                          </span>
                          {getRatingStars(template.rating)}
                        </div>
                      </div>
                      {renderVariableBadges(template.variables)}
                    </CardContent>
                    <CardFooter className="p-4 pt-2 flex justify-between border-t">
                      <div className="text-xs text-slate-500">
                        Used {template.usageCount} times
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePreviewTemplate(template)}
                        >
                          <FileCheck className="h-4 w-4 mr-1" />
                          Preview
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">More options</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Template Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => initEditForm(template)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDuplicateTemplate(template)}>
                              <Copy className="h-4 w-4 mr-2" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleCopyToClipboard(template.content)}
                            >
                              <MessageSquare className="h-4 w-4 mr-2" />
                              Copy Text
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDeleteTemplate(template)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Create/Edit Template Dialog */}
      <Dialog
        open={isCreating || isEditing}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreating(false);
            setIsEditing(false);
            setSelectedTemplate(null);
            form.reset();
          }
        }}
      >
        <DialogContent className="sm:max-w-[650px]">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Edit Template" : "Create New Template"}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Update your existing review template"
                : "Create a new template for responding to customer reviews"}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Template Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Thank You for 5-Star Review" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Gratitude">Gratitude</SelectItem>
                          <SelectItem value="Service Recovery">Service Recovery</SelectItem>
                          <SelectItem value="Acknowledgment">Acknowledgment</SelectItem>
                          <SelectItem value="Seasonal">Seasonal</SelectItem>
                          <SelectItem value="Professional">Professional</SelectItem>
                          <SelectItem value="Acquisition">Acquisition</SelectItem>
                          <SelectItem value="Custom">Custom</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="templateType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Template Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="positive">Positive</SelectItem>
                          <SelectItem value="neutral">Neutral</SelectItem>
                          <SelectItem value="negative">Negative</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="rating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Applicable Rating</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      defaultValue={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select applicable rating" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1">1 Star</SelectItem>
                        <SelectItem value="2">2 Stars</SelectItem>
                        <SelectItem value="3">3 Stars</SelectItem>
                        <SelectItem value="4">4 Stars</SelectItem>
                        <SelectItem value="5">5 Stars</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      The star rating this template is designed for
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Template Content</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={`Dear {{customer_name}},\n\nThank you for your review...\n\nBest regards,\n{{user_name}}\n{{business_name}}`}
                        className="min-h-[200px] font-mono text-sm"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Use variables like {{'{{'}}customer_name{{'}}'}}, {{'{{'}}business_name{{'}}'}}, etc.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
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
                      <FormLabel>Set as Default Template</FormLabel>
                      <FormDescription>
                        This will be the default template for this rating and type
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
                    setIsCreating(false);
                    setIsEditing(false);
                    setSelectedTemplate(null);
                    form.reset();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {isEditing ? "Update Template" : "Create Template"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Template Preview Dialog */}
      <Dialog
        open={!!previewTemplate}
        onOpenChange={(open) => {
          if (!open) setPreviewTemplate(null);
        }}
      >
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Template Preview</DialogTitle>
            <DialogDescription>
              Preview how your template will look
            </DialogDescription>
          </DialogHeader>

          {previewTemplate && (
            <div className="space-y-4 pt-2">
              <div className="flex justify-between">
                <div>
                  <span className="text-sm font-medium">Template:</span>{" "}
                  <span className="text-sm">{previewTemplate.name}</span>
                </div>
                <Badge className={getTemplateTypeColor(previewTemplate.templateType)}>
                  {previewTemplate.templateType.charAt(0).toUpperCase() + previewTemplate.templateType.slice(1)}
                </Badge>
              </div>

              <div>
                <span className="text-sm font-medium">Applicable Rating:</span>{" "}
                {getRatingStars(previewTemplate.rating)}
              </div>

              <div>
                <span className="text-sm font-medium">Variables:</span>
                {renderVariableBadges(previewTemplate.variables)}
              </div>

              <div className="border rounded-md p-4 bg-slate-50">
                <span className="text-sm font-medium block mb-2">Preview:</span>
                <ScrollArea className="h-[250px] w-full">
                  <div className="whitespace-pre-wrap text-sm">
                    {previewTemplate.content}
                  </div>
                </ScrollArea>
              </div>

              <div className="text-xs text-slate-500">
                <span className="font-medium">Note:</span> Variables will be
                replaced with actual values when using this template.
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPreviewTemplate(null)}
            >
              Close
            </Button>
            {previewTemplate && (
              <Button
                onClick={() => {
                  handleCopyToClipboard(previewTemplate.content);
                  setPreviewTemplate(null);
                }}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy to Clipboard
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TemplatesPage;