import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  MessageSquarePlus, 
  ThumbsUp, 
  MessageSquare, 
  Lightbulb, 
  AlertTriangle, 
  Tag, 
  Filter,
  Search,
  ArrowUpDown,
  ChevronRight,
  ChevronDown,
  Star,
  CheckCircle,
  Clock,
  BarChart
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

interface FeedbackItem {
  id: number;
  title: string;
  description: string;
  type: "feature_request" | "bug_report" | "improvement" | "question";
  status: "new" | "in_review" | "planned" | "in_progress" | "completed" | "declined";
  priority: "critical" | "high" | "medium" | "low";
  submittedBy: {
    id: number;
    name: string;
    email: string;
    avatar?: string;
  };
  assignedTo?: {
    id: number;
    name: string;
    avatar?: string;
  };
  createdAt: string;
  updatedAt: string;
  votes: number;
  tags: string[];
  comments?: {
    id: number;
    userId: number;
    userName: string;
    userAvatar?: string;
    content: string;
    createdAt: string;
    isStaff: boolean;
  }[];
}

interface FeedbackStats {
  total: number;
  new: number;
  inProgress: number;
  completed: number;
  averageResolutionDays: number;
  implementationRate: number;
  topContributors: {
    userId: number;
    name: string;
    avatar?: string;
    count: number;
  }[];
  byType: {
    featureRequests: number;
    bugReports: number;
    improvements: number;
    questions: number;
  };
}

export default function AdminFeedbackPage() {
  const [selectedTab, setSelectedTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  
  const [newFeedbackTitle, setNewFeedbackTitle] = useState("");
  const [newFeedbackDescription, setNewFeedbackDescription] = useState("");
  const [newFeedbackType, setNewFeedbackType] = useState("feature_request");
  const [newFeedbackPriority, setNewFeedbackPriority] = useState("medium");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackItem | null>(null);
  const [newComment, setNewComment] = useState("");
  
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Fetch feedback items
  const { data: feedbackItems, isLoading: isLoadingFeedback } = useQuery<FeedbackItem[]>({
    queryKey: ["/api/admin/feedback"],
  });
  
  // Fetch feedback stats
  const { data: feedbackStats, isLoading: isLoadingStats } = useQuery<FeedbackStats>({
    queryKey: ["/api/admin/feedback/stats"],
  });
  
  // Submit new feedback mutation
  const submitFeedbackMutation = useMutation({
    mutationFn: async (feedback: {
      title: string;
      description: string;
      type: string;
      priority: string;
    }) => {
      // Simulate API call
      console.log("Submitting feedback:", feedback);
      setIsSubmitting(true);
      
      // Simulate delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      return {
        id: Math.floor(Math.random() * 1000),
        ...feedback,
        status: "new",
        submittedBy: {
          id: 1,
          name: "Admin User",
          email: "admin@example.com",
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        votes: 0,
        tags: [],
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/feedback"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/feedback/stats"] });
      
      toast({
        title: "Feedback submitted",
        description: "Your feedback has been submitted successfully.",
      });
      
      setNewFeedbackTitle("");
      setNewFeedbackDescription("");
      setNewFeedbackType("feature_request");
      setNewFeedbackPriority("medium");
      setIsSubmitting(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error submitting feedback",
        description: error.message || "Failed to submit feedback. Please try again.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    },
  });
  
  // Add comment mutation
  const addCommentMutation = useMutation({
    mutationFn: async ({ feedbackId, comment }: { feedbackId: number; comment: string }) => {
      // Simulate API call
      console.log("Adding comment:", { feedbackId, comment });
      
      // Simulate delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      return {
        id: Math.floor(Math.random() * 1000),
        userId: 1,
        userName: "Admin User",
        content: comment,
        createdAt: new Date().toISOString(),
        isStaff: true,
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/feedback"] });
      
      toast({
        title: "Comment added",
        description: "Your comment has been added successfully.",
      });
      
      setNewComment("");
    },
    onError: (error: any) => {
      toast({
        title: "Error adding comment",
        description: error.message || "Failed to add comment. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  // Update feedback status mutation
  const updateFeedbackStatusMutation = useMutation({
    mutationFn: async ({ feedbackId, status }: { feedbackId: number; status: string }) => {
      // Simulate API call
      console.log("Updating feedback status:", { feedbackId, status });
      
      // Simulate delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/feedback"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/feedback/stats"] });
      
      toast({
        title: "Status updated",
        description: "Feedback status has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error updating status",
        description: error.message || "Failed to update status. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  // Handle new feedback submission
  const handleSubmitFeedback = () => {
    if (!newFeedbackTitle || !newFeedbackDescription) {
      toast({
        title: "Validation error",
        description: "Title and description are required.",
        variant: "destructive",
      });
      return;
    }
    
    submitFeedbackMutation.mutate({
      title: newFeedbackTitle,
      description: newFeedbackDescription,
      type: newFeedbackType,
      priority: newFeedbackPriority,
    });
  };
  
  // Handle adding a comment
  const handleAddComment = () => {
    if (!selectedFeedback || !newComment.trim()) return;
    
    addCommentMutation.mutate({
      feedbackId: selectedFeedback.id,
      comment: newComment,
    });
  };
  
  // Handle updating feedback status
  const handleUpdateStatus = (feedbackId: number, newStatus: string) => {
    updateFeedbackStatusMutation.mutate({
      feedbackId,
      status: newStatus,
    });
  };
  
  // Filter and sort feedback items
  const filteredFeedbackItems = feedbackItems
    ? feedbackItems.filter(item => {
        // Tab filter
        const matchesTab = 
          selectedTab === "all" ||
          (selectedTab === "new" && item.status === "new") ||
          (selectedTab === "in_progress" && ["in_review", "planned", "in_progress"].includes(item.status)) ||
          (selectedTab === "completed" && item.status === "completed") ||
          (selectedTab === "declined" && item.status === "declined");
        
        // Type filter
        const matchesType = 
          typeFilter === "all" || 
          item.type === typeFilter;
        
        // Status filter
        const matchesStatus = 
          statusFilter === "all" || 
          item.status === statusFilter;
        
        // Priority filter
        const matchesPriority = 
          priorityFilter === "all" || 
          item.priority === priorityFilter;
        
        // Text search
        const matchesSearch = 
          searchQuery === "" ||
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.submittedBy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
        
        return matchesTab && matchesType && matchesStatus && matchesPriority && matchesSearch;
      })
    : [];
  
  // Sort filtered feedback items
  const sortedFeedbackItems = [...filteredFeedbackItems].sort((a, b) => {
    if (sortBy === "newest") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else if (sortBy === "oldest") {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    } else if (sortBy === "most_votes") {
      return b.votes - a.votes;
    } else if (sortBy === "highest_priority") {
      const priorityValue = {
        critical: 4,
        high: 3,
        medium: 2,
        low: 1,
      };
      return priorityValue[b.priority as keyof typeof priorityValue] - priorityValue[a.priority as keyof typeof priorityValue];
    }
    return 0;
  });
  
  // Render status badge
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "new":
        return (
          <Badge variant="outline" className="border-blue-500 text-blue-500 flex items-center gap-1 w-fit">
            <Clock className="h-3 w-3" />
            New
          </Badge>
        );
      case "in_review":
        return (
          <Badge variant="outline" className="border-purple-500 text-purple-500 flex items-center gap-1 w-fit">
            <Search className="h-3 w-3" />
            In Review
          </Badge>
        );
      case "planned":
        return (
          <Badge variant="outline" className="border-amber-500 text-amber-500 flex items-center gap-1 w-fit">
            <Calendar className="h-3 w-3" />
            Planned
          </Badge>
        );
      case "in_progress":
        return (
          <Badge className="bg-blue-500 text-white flex items-center gap-1 w-fit">
            <Activity className="h-3 w-3" />
            In Progress
          </Badge>
        );
      case "completed":
        return (
          <Badge className="bg-green-500 text-white flex items-center gap-1 w-fit">
            <CheckCircle className="h-3 w-3" />
            Completed
          </Badge>
        );
      case "declined":
        return (
          <Badge variant="destructive" className="flex items-center gap-1 w-fit">
            <X className="h-3 w-3" />
            Declined
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  // Render priority indicator
  const renderPriorityBadge = (priority: string) => {
    switch (priority) {
      case "critical":
        return (
          <Badge className="bg-red-500 text-white flex items-center gap-1 w-fit">
            Critical
          </Badge>
        );
      case "high":
        return (
          <Badge className="bg-amber-500 text-white flex items-center gap-1 w-fit">
            High
          </Badge>
        );
      case "medium":
        return (
          <Badge variant="secondary" className="flex items-center gap-1 w-fit">
            Medium
          </Badge>
        );
      case "low":
        return (
          <Badge variant="outline" className="flex items-center gap-1 w-fit">
            Low
          </Badge>
        );
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };
  
  // Render type icon
  const renderTypeIcon = (type: string) => {
    switch (type) {
      case "feature_request":
        return <Lightbulb className="h-5 w-5 text-amber-500" />;
      case "bug_report":
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case "improvement":
        return <ArrowUpCircle className="h-5 w-5 text-blue-500" />;
      case "question":
        return <HelpCircle className="h-5 w-5 text-purple-500" />;
      default:
        return <MessageSquare className="h-5 w-5 text-gray-500" />;
    }
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  return (
    <AdminLayout pageTitle="Feedback & Suggestions">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Feedback Hub</h2>
            <p className="text-muted-foreground">
              Collect, organize, and manage internal feedback for product improvements
            </p>
          </div>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <MessageSquarePlus className="h-4 w-4" />
                Submit Feedback
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px]">
              <DialogHeader>
                <DialogTitle>Submit New Feedback</DialogTitle>
                <DialogDescription>
                  Share your ideas, report issues, or suggest improvements to help us evolve the platform.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="feedback-title">Title</Label>
                  <Input
                    id="feedback-title"
                    placeholder="Brief summary of your feedback"
                    value={newFeedbackTitle}
                    onChange={(e) => setNewFeedbackTitle(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="feedback-type">Type</Label>
                    <Select
                      value={newFeedbackType}
                      onValueChange={setNewFeedbackType}
                    >
                      <SelectTrigger id="feedback-type">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="feature_request">Feature Request</SelectItem>
                        <SelectItem value="bug_report">Bug Report</SelectItem>
                        <SelectItem value="improvement">Improvement</SelectItem>
                        <SelectItem value="question">Question</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="feedback-priority">Priority</Label>
                    <Select
                      value={newFeedbackPriority}
                      onValueChange={setNewFeedbackPriority}
                    >
                      <SelectTrigger id="feedback-priority">
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="critical">Critical</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="feedback-description">Description</Label>
                  <Textarea
                    id="feedback-description"
                    placeholder="Provide details about your feedback..."
                    rows={5}
                    value={newFeedbackDescription}
                    onChange={(e) => setNewFeedbackDescription(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setNewFeedbackTitle("");
                    setNewFeedbackDescription("");
                    setNewFeedbackType("feature_request");
                    setNewFeedbackPriority("medium");
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSubmitFeedback}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Feedback'
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Feedback</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingStats ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">
                  {feedbackStats?.total || 0}
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Across all categories
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Implementation Rate</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingStats ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold text-green-600">
                  {feedbackStats?.implementationRate || 0}%
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Of all feature requests
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Open Items</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingStats ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="flex gap-1 items-baseline">
                  <div className="text-2xl font-bold">
                    {(feedbackStats?.new || 0) + (feedbackStats?.inProgress || 0)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    ({feedbackStats?.new || 0} new)
                  </div>
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Needing review or implementation
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Avg. Resolution</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingStats ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">
                  {feedbackStats?.averageResolutionDays || 0} days
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                From submission to resolution
              </p>
            </CardContent>
          </Card>
        </div>
        
        {/* Feedback List and Detail View */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Feedback List */}
          <div className="xl:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Feedback List</CardTitle>
                <CardDescription>
                  Browse and manage feedback from team members
                </CardDescription>
              </CardHeader>
              <div className="px-6 pb-3 flex flex-col md:flex-row flex-wrap gap-4">
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search feedback..."
                      className="w-full pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="feature_request">Feature Requests</SelectItem>
                      <SelectItem value="bug_report">Bug Reports</SelectItem>
                      <SelectItem value="improvement">Improvements</SelectItem>
                      <SelectItem value="question">Questions</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[160px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="in_review">In Review</SelectItem>
                      <SelectItem value="planned">Planned</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="declined">Declined</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priorities</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[170px]">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="oldest">Oldest First</SelectItem>
                      <SelectItem value="most_votes">Most Votes</SelectItem>
                      <SelectItem value="highest_priority">Highest Priority</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <CardContent>
                <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
                  <TabsList>
                    <TabsTrigger value="all">
                      All
                    </TabsTrigger>
                    <TabsTrigger value="new">
                      New
                    </TabsTrigger>
                    <TabsTrigger value="in_progress">
                      In Progress
                    </TabsTrigger>
                    <TabsTrigger value="completed">
                      Completed
                    </TabsTrigger>
                    <TabsTrigger value="declined">
                      Declined
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value={selectedTab} className="space-y-4">
                    {isLoadingFeedback ? (
                      Array(5).fill(0).map((_, i) => (
                        <Skeleton key={i} className="h-[150px] w-full" />
                      ))
                    ) : sortedFeedbackItems.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Lightbulb className="mx-auto h-10 w-10 opacity-50 mb-2" />
                        <p>No feedback found matching your filters</p>
                      </div>
                    ) : (
                      sortedFeedbackItems.map((item) => (
                        <Card key={item.id} className="overflow-hidden">
                          <CardHeader className="pb-3">
                            <div className="flex justify-between items-start">
                              <div className="flex items-start gap-3">
                                {renderTypeIcon(item.type)}
                                <div>
                                  <div className="flex items-center">
                                    <CardTitle className="text-lg">
                                      {item.title}
                                    </CardTitle>
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="ml-2 gap-1 h-7"
                                      onClick={() => {
                                        console.log("Vote added");
                                        // Add upvote logic here
                                      }}
                                    >
                                      <ThumbsUp className="h-3.5 w-3.5" />
                                      <span>{item.votes}</span>
                                    </Button>
                                  </div>
                                  <div className="flex flex-wrap gap-2 mt-1">
                                    {renderStatusBadge(item.status)}
                                    {renderPriorityBadge(item.priority)}
                                    {item.tags?.map(tag => (
                                      <Badge 
                                        key={tag} 
                                        variant="outline" 
                                        className="flex items-center gap-1 text-xs"
                                      >
                                        <Tag className="h-3 w-3" />
                                        {tag}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <MoreHorizontal className="h-4 w-4" />
                                      <span className="sr-only">Options</span>
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => setSelectedFeedback(item)}>
                                      View Details
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>Edit</DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => handleUpdateStatus(item.id, "in_review")}
                                      disabled={item.status === "in_review"}
                                    >
                                      Mark as In Review
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => handleUpdateStatus(item.id, "planned")}
                                      disabled={item.status === "planned"}
                                    >
                                      Mark as Planned
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => handleUpdateStatus(item.id, "in_progress")}
                                      disabled={item.status === "in_progress"}
                                    >
                                      Mark as In Progress
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => handleUpdateStatus(item.id, "completed")}
                                      disabled={item.status === "completed"}
                                    >
                                      Mark as Completed
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => handleUpdateStatus(item.id, "declined")}
                                      disabled={item.status === "declined"}
                                    >
                                      Mark as Declined
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                          </CardHeader>
                          
                          <CardContent className="pb-3">
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {item.description}
                            </p>
                          </CardContent>
                          
                          <CardFooter className="border-t pt-3 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                {item.submittedBy.avatar ? (
                                  <AvatarImage src={item.submittedBy.avatar} alt={item.submittedBy.name} />
                                ) : (
                                  <AvatarFallback>{item.submittedBy.name.charAt(0)}</AvatarFallback>
                                )}
                              </Avatar>
                              <span className="text-sm text-muted-foreground">
                                {item.submittedBy.name} • {formatDate(item.createdAt)}
                              </span>
                            </div>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-xs gap-1"
                              onClick={() => setSelectedFeedback(item)}
                            >
                              <MessageSquare className="h-3.5 w-3.5" />
                              {item.comments?.length || 0} {item.comments?.length === 1 ? 'comment' : 'comments'}
                            </Button>
                          </CardFooter>
                        </Card>
                      ))
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
          
          {/* Feedback Detail View */}
          <div className="xl:col-span-1">
            {selectedFeedback ? (
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{selectedFeedback.title}</CardTitle>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setSelectedFeedback(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <CardDescription className="flex flex-wrap gap-2">
                    {renderStatusBadge(selectedFeedback.status)}
                    {renderPriorityBadge(selectedFeedback.priority)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Description</h4>
                    <p className="text-sm whitespace-pre-line">
                      {selectedFeedback.description}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        {selectedFeedback.submittedBy.avatar ? (
                          <AvatarImage src={selectedFeedback.submittedBy.avatar} alt={selectedFeedback.submittedBy.name} />
                        ) : (
                          <AvatarFallback>{selectedFeedback.submittedBy.name.charAt(0)}</AvatarFallback>
                        )}
                      </Avatar>
                      <div>
                        <p className="text-xs font-medium">{selectedFeedback.submittedBy.name}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(selectedFeedback.createdAt)}</p>
                      </div>
                    </div>
                    
                    <Button variant="ghost" size="sm" className="gap-1">
                      <ThumbsUp className="h-3.5 w-3.5" />
                      {selectedFeedback.votes}
                    </Button>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium flex justify-between items-center">
                      <span>Comments {selectedFeedback.comments?.length ? `(${selectedFeedback.comments.length})` : ''}</span>
                    </h4>
                    
                    <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                      {selectedFeedback.comments?.length ? (
                        selectedFeedback.comments.map((comment) => (
                          <div key={comment.id} className="border rounded-md p-3">
                            <div className="flex items-center gap-2 mb-2">
                              <Avatar className="h-6 w-6">
                                {comment.userAvatar ? (
                                  <AvatarImage src={comment.userAvatar} alt={comment.userName} />
                                ) : (
                                  <AvatarFallback>{comment.userName.charAt(0)}</AvatarFallback>
                                )}
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <p className="text-xs font-medium">
                                    {comment.userName}
                                    {comment.isStaff && (
                                      <Badge variant="secondary" className="ml-2 text-xs py-0 h-4">Staff</Badge>
                                    )}
                                  </p>
                                  <p className="text-xs text-muted-foreground">{formatDate(comment.createdAt)}</p>
                                </div>
                              </div>
                            </div>
                            <p className="text-sm">{comment.content}</p>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-4 text-muted-foreground">
                          <MessageSquare className="mx-auto h-6 w-6 opacity-50 mb-2" />
                          <p className="text-sm">No comments yet</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="pt-2">
                      <Textarea
                        placeholder="Add a comment..."
                        className="min-h-[80px]"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                      />
                      <div className="flex justify-end mt-2">
                        <Button 
                          onClick={handleAddComment}
                          disabled={!newComment.trim() || addCommentMutation.isPending}
                          size="sm"
                        >
                          {addCommentMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Posting...
                            </>
                          ) : (
                            'Post Comment'
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter className="border-t flex-col items-start pt-4">
                  <div className="w-full">
                    <h4 className="text-sm font-medium mb-2">Update Status</h4>
                    <div className="grid grid-cols-3 gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        disabled={selectedFeedback.status === "in_review"}
                        onClick={() => handleUpdateStatus(selectedFeedback.id, "in_review")}
                      >
                        In Review
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        disabled={selectedFeedback.status === "planned"}
                        onClick={() => handleUpdateStatus(selectedFeedback.id, "planned")}
                      >
                        Planned
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        disabled={selectedFeedback.status === "in_progress"}
                        onClick={() => handleUpdateStatus(selectedFeedback.id, "in_progress")}
                      >
                        In Progress
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        disabled={selectedFeedback.status === "completed"}
                        onClick={() => handleUpdateStatus(selectedFeedback.id, "completed")}
                        className="text-green-600"
                      >
                        Completed
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        disabled={selectedFeedback.status === "declined"}
                        onClick={() => handleUpdateStatus(selectedFeedback.id, "declined")}
                        className="text-red-600"
                      >
                        Declined
                      </Button>
                    </div>
                  </div>
                </CardFooter>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Feedback Analytics</CardTitle>
                  <CardDescription>
                    Insights from gathered feedback
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isLoadingStats ? (
                    <div className="space-y-4">
                      <Skeleton className="h-24 w-full" />
                      <Skeleton className="h-36 w-full" />
                      <Skeleton className="h-24 w-full" />
                    </div>
                  ) : (
                    <>
                      <div>
                        <h4 className="text-sm font-medium mb-2">Feedback by Type</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <Lightbulb className="h-4 w-4 text-amber-500" />
                              <span className="text-sm">Feature Requests</span>
                            </div>
                            <span className="text-sm font-medium">{feedbackStats?.byType.featureRequests || 0}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <AlertTriangle className="h-4 w-4 text-red-500" />
                              <span className="text-sm">Bug Reports</span>
                            </div>
                            <span className="text-sm font-medium">{feedbackStats?.byType.bugReports || 0}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <ArrowUpCircle className="h-4 w-4 text-blue-500" />
                              <span className="text-sm">Improvements</span>
                            </div>
                            <span className="text-sm font-medium">{feedbackStats?.byType.improvements || 0}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <HelpCircle className="h-4 w-4 text-purple-500" />
                              <span className="text-sm">Questions</span>
                            </div>
                            <span className="text-sm font-medium">{feedbackStats?.byType.questions || 0}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium mb-2">Top Contributors</h4>
                        <div className="space-y-2">
                          {feedbackStats?.topContributors?.map((contributor, index) => (
                            <div key={contributor.userId} className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <Avatar className="h-6 w-6">
                                  {contributor.avatar ? (
                                    <AvatarImage src={contributor.avatar} alt={contributor.name} />
                                  ) : (
                                    <AvatarFallback>{contributor.name.charAt(0)}</AvatarFallback>
                                  )}
                                </Avatar>
                                <span className="text-sm">{contributor.name}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="text-sm font-medium">{contributor.count}</span>
                                {index === 0 && <Star className="h-3.5 w-3.5 text-amber-500" />}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium mb-2">Status Distribution</h4>
                        <div className="relative pt-1">
                          <div className="flex mb-2 items-center justify-between">
                            <div>
                              <span className="text-xs font-medium inline-block py-1 px-2 uppercase rounded-full bg-green-200 text-green-700">
                                Completed
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="text-xs font-medium inline-block text-green-700">
                                {feedbackStats?.completed || 0}
                              </span>
                            </div>
                          </div>
                          <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
                            <div
                              style={{
                                width: `${
                                  feedbackStats?.total
                                    ? (feedbackStats.completed / feedbackStats.total) * 100
                                    : 0
                                }%`,
                              }}
                              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500"
                            ></div>
                          </div>
                          
                          <div className="flex mb-2 items-center justify-between">
                            <div>
                              <span className="text-xs font-medium inline-block py-1 px-2 uppercase rounded-full bg-blue-200 text-blue-700">
                                In Progress
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="text-xs font-medium inline-block text-blue-700">
                                {feedbackStats?.inProgress || 0}
                              </span>
                            </div>
                          </div>
                          <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
                            <div
                              style={{
                                width: `${
                                  feedbackStats?.total
                                    ? (feedbackStats.inProgress / feedbackStats.total) * 100
                                    : 0
                                }%`,
                              }}
                              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
                            ></div>
                          </div>
                          
                          <div className="flex mb-2 items-center justify-between">
                            <div>
                              <span className="text-xs font-medium inline-block py-1 px-2 uppercase rounded-full bg-blue-100 text-blue-800">
                                New
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="text-xs font-medium inline-block text-blue-800">
                                {feedbackStats?.new || 0}
                              </span>
                            </div>
                          </div>
                          <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
                            <div
                              style={{
                                width: `${
                                  feedbackStats?.total
                                    ? (feedbackStats.new / feedbackStats.total) * 100
                                    : 0
                                }%`,
                              }}
                              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-300"
                            ></div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

// These components are just here to prevent errors since they're referenced in the code
function Loader2(props: any) {
  return <div {...props} />;
}

function Calendar(props: any) {
  return <div {...props} />;
}

function Activity(props: any) {
  return <div {...props} />;
}

function X(props: any) {
  return <div {...props} />;
}

function ArrowUpCircle(props: any) {
  return <div {...props} />;
}

function HelpCircle(props: any) {
  return <div {...props} />;
}

function MoreHorizontal(props: any) {
  return <div {...props} />;
}