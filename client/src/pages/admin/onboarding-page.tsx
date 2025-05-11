import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { AdminLayout } from "@/components/admin/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Filter,
  CalendarDays,
  CheckCircle,
  Circle,
  Clock,
  Download,
  Edit,
  ExternalLink,
  Grid,
  List,
  MoreHorizontal,
  Plus,
  RefreshCw,
  UserCheck,
  AlertCircle,
  Calendar,
  Briefcase,
  UserPlus,
  Mail,
  Phone
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { apiRequest, queryClient } from "@/lib/queryClient";

// Type definitions
interface OnboardingTask {
  id: number;
  name: string;
  completed: boolean;
  lastUpdated: string | null;
}

interface OnboardingNote {
  id: number;
  date: string;
  author: string;
  content: string;
}

interface ActivityLog {
  id: number;
  date: string;
  type: string;
  description: string;
}

interface OnboardingCustomer {
  id: number;
  customerId: number;
  customerName: string;
  customerCompany: string;
  email: string;
  phone: string;
  plan: string;
  startDate: string;
  assignedTo: string;
  progress: number;
  tasks: OnboardingTask[];
  notes?: OnboardingNote[];
  activity?: ActivityLog[];
}

interface AddNoteFormData {
  content: string;
}

export default function OnboardingPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPlan, setFilterPlan] = useState("all");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [addNoteDialogOpen, setAddNoteDialogOpen] = useState(false);
  const [currentCustomer, setCurrentCustomer] = useState<OnboardingCustomer | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  
  // Fetch onboarding data
  const { data: onboardingData, isLoading, refetch } = useQuery<OnboardingCustomer[]>({
    queryKey: ["/api/admin/onboarding"],
  });

  // Fetch specific customer data when selected
  const { data: customerDetail, isLoading: isLoadingDetail } = useQuery<OnboardingCustomer>({
    queryKey: ["/api/admin/onboarding", selectedCustomerId],
    queryFn: async () => {
      if (!selectedCustomerId) throw new Error("No customer selected");
      const response = await fetch(`/api/admin/onboarding/${selectedCustomerId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch customer onboarding details");
      }
      return await response.json();
    },
    enabled: !!selectedCustomerId,
  });

  // Update task mutation
  const updateTaskMutation = useMutation({
    mutationFn: async ({ customerId, taskId, completed }: { customerId: number, taskId: number, completed: boolean }) => {
      const res = await apiRequest(
        "PATCH", 
        `/api/admin/onboarding/${customerId}/tasks/${taskId}`, 
        { completed }
      );
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Task updated",
        description: "Onboarding task status has been updated",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/onboarding"] });
      if (selectedCustomerId) {
        queryClient.invalidateQueries({ queryKey: ["/api/admin/onboarding", selectedCustomerId] });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle task completion toggle
  const handleTaskToggle = (customerId: number, taskId: number, completed: boolean) => {
    updateTaskMutation.mutate({ customerId, taskId, completed });
  };

  // Filter customers based on search and filters
  const filteredCustomers = onboardingData ? onboardingData
    .filter(customer => {
      // Search filter
      const searchFilter = searchQuery ? 
        customer.customerName.toLowerCase().includes(searchQuery.toLowerCase()) || 
        customer.customerCompany.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchQuery.toLowerCase()) :
        true;
      
      // Plan filter
      const planFilter = filterPlan === "all" || customer.plan === filterPlan;
      
      return searchFilter && planFilter;
    }) : [];

  // Handle customer selection for detailed view
  const handleCustomerSelect = (customerId: number) => {
    setSelectedCustomerId(customerId);
    setActiveTab("overview");
  };

  // Get progress color based on percentage
  const getProgressColor = (progress: number) => {
    if (progress < 30) return "bg-red-500";
    if (progress < 70) return "bg-yellow-500";
    return "bg-green-500";
  };

  // Format date to readable string
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Calculate days since onboarding started
  const getDaysSince = (dateString: string) => {
    const start = new Date(dateString);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const CustomerDetailView = ({ customer }: { customer: OnboardingCustomer }) => {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold">{customer.customerName}</h2>
            <p className="text-muted-foreground">{customer.customerCompany}</p>
          </div>
          <Button variant="outline" onClick={() => setSelectedCustomerId(null)}>
            Back to List
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-sm font-medium">Onboarding Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-2">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm">Progress</span>
                  <span className="text-sm font-medium">{customer.progress}%</span>
                </div>
                <Progress value={customer.progress} className={getProgressColor(customer.progress)} />
                <div className="pt-2 text-xs text-muted-foreground">
                  Started {formatDate(customer.startDate)} ({getDaysSince(customer.startDate)} days ago)
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-sm font-medium">Customer Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm">{customer.email}</span>
                </div>
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm">{customer.phone}</span>
                </div>
                <div className="flex items-center">
                  <Briefcase className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm">{customer.plan} Plan</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-sm font-medium">Assigned To</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Avatar className="h-9 w-9 mr-3">
                  <AvatarFallback>{customer.assignedTo.split(' ').map(name => name[0]).join('')}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{customer.assignedTo}</p>
                  <p className="text-xs text-muted-foreground">Account Manager</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
            <TabsTrigger value="activity">Activity Log</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Onboarding Overview</CardTitle>
                <CardDescription>Summary of onboarding progress</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  <div className="flex flex-col space-y-2">
                    <h3 className="text-lg font-medium mb-2">Onboarding Progress</h3>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm">Overall Completion</span>
                      <span className="text-sm font-medium">{customer.progress}%</span>
                    </div>
                    <Progress value={customer.progress} className={getProgressColor(customer.progress)} />
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                      <div className="bg-background border rounded-lg p-3">
                        <div className="text-muted-foreground text-xs">Account Setup</div>
                        <div className="text-2xl font-bold mt-1 flex items-center">
                          {customer.tasks.filter(t => t.id <= 3).filter(t => t.completed).length}/3
                          <span className="text-green-500 ml-2">
                            <CheckCircle className="h-5 w-5" />
                          </span>
                        </div>
                      </div>
                      
                      <div className="bg-background border rounded-lg p-3">
                        <div className="text-muted-foreground text-xs">Integrations</div>
                        <div className="text-2xl font-bold mt-1 flex items-center">
                          {customer.tasks.filter(t => t.id >= 4 && t.id <= 6).filter(t => t.completed).length}/3
                          {customer.tasks.filter(t => t.id >= 4 && t.id <= 6).every(t => t.completed) ? (
                            <span className="text-green-500 ml-2">
                              <CheckCircle className="h-5 w-5" />
                            </span>
                          ) : (
                            <span className="text-amber-500 ml-2">
                              <Clock className="h-5 w-5" />
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="bg-background border rounded-lg p-3">
                        <div className="text-muted-foreground text-xs">Configuration</div>
                        <div className="text-2xl font-bold mt-1 flex items-center">
                          {customer.tasks.filter(t => t.id >= 7 && t.id <= 9).filter(t => t.completed).length}/3
                          {customer.tasks.filter(t => t.id >= 7 && t.id <= 9).every(t => t.completed) ? (
                            <span className="text-green-500 ml-2">
                              <CheckCircle className="h-5 w-5" />
                            </span>
                          ) : (
                            <span className="text-amber-500 ml-2">
                              <Clock className="h-5 w-5" />
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="bg-background border rounded-lg p-3">
                        <div className="text-muted-foreground text-xs">Finalization</div>
                        <div className="text-2xl font-bold mt-1 flex items-center">
                          {customer.tasks.filter(t => t.id === 10).filter(t => t.completed).length}/1
                          {customer.tasks.filter(t => t.id === 10).every(t => t.completed) ? (
                            <span className="text-green-500 ml-2">
                              <CheckCircle className="h-5 w-5" />
                            </span>
                          ) : (
                            <span className="text-amber-500 ml-2">
                              <Clock className="h-5 w-5" />
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-3">Recent Activity</h3>
                    <div className="space-y-4">
                      {customer.activity && customer.activity.slice(0, 3).map((activity) => (
                        <div key={activity.id} className="flex items-start">
                          <div className={`
                            p-2 rounded-full mr-3 
                            ${activity.type === 'signup' ? 'bg-blue-100 text-blue-700' : ''}
                            ${activity.type === 'payment' ? 'bg-green-100 text-green-700' : ''}
                            ${activity.type === 'update' ? 'bg-yellow-100 text-yellow-700' : ''}
                            ${activity.type === 'support' ? 'bg-purple-100 text-purple-700' : ''}
                          `}>
                            {activity.type === 'signup' && <UserPlus className="h-4 w-4" />}
                            {activity.type === 'payment' && <Briefcase className="h-4 w-4" />}
                            {activity.type === 'update' && <Edit className="h-4 w-4" />}
                            {activity.type === 'support' && <Phone className="h-4 w-4" />}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{activity.description}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(activity.date).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    {customer.activity && customer.activity.length > 3 && (
                      <Button variant="link" className="mt-2 p-0" onClick={() => setActiveTab('activity')}>
                        View all activity
                      </Button>
                    )}
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-3">Recent Notes</h3>
                    <div className="space-y-3">
                      {customer.notes && customer.notes.map((note) => (
                        <Card key={note.id} className="bg-muted/40">
                          <CardContent className="pt-4">
                            <div className="flex justify-between items-start mb-2">
                              <div className="font-medium text-sm">{note.author}</div>
                              <div className="text-xs text-muted-foreground">{formatDate(note.date)}</div>
                            </div>
                            <p className="text-sm">{note.content}</p>
                          </CardContent>
                        </Card>
                      ))}
                      
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => {
                          setCurrentCustomer(customer);
                          setAddNoteDialogOpen(true);
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Note
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="tasks" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Onboarding Tasks</CardTitle>
                <CardDescription>Manage and track onboarding tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Task Checklist</h3>
                    <div className="text-sm text-muted-foreground">
                      {customer.tasks.filter(t => t.completed).length} of {customer.tasks.length} completed
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-semibold mb-2">Account Setup</h4>
                      <div className="space-y-2">
                        {customer.tasks.filter(t => t.id <= 3).map((task) => (
                          <div key={task.id} className="flex items-center justify-between p-2 border rounded-md">
                            <div className="flex items-center">
                              <Checkbox 
                                id={`task-${task.id}`} 
                                checked={task.completed}
                                onCheckedChange={(checked) => {
                                  handleTaskToggle(customer.id, task.id, checked === true);
                                }}
                                className="mr-2"
                              />
                              <label 
                                htmlFor={`task-${task.id}`}
                                className={`text-sm font-medium ${task.completed ? 'line-through text-muted-foreground' : ''}`}
                              >
                                {task.name}
                              </label>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {task.lastUpdated ? `Completed on ${formatDate(task.lastUpdated)}` : ''}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-semibold mb-2">Integrations</h4>
                      <div className="space-y-2">
                        {customer.tasks.filter(t => t.id >= 4 && t.id <= 6).map((task) => (
                          <div key={task.id} className="flex items-center justify-between p-2 border rounded-md">
                            <div className="flex items-center">
                              <Checkbox 
                                id={`task-${task.id}`} 
                                checked={task.completed}
                                onCheckedChange={(checked) => {
                                  handleTaskToggle(customer.id, task.id, checked === true);
                                }}
                                className="mr-2"
                              />
                              <label 
                                htmlFor={`task-${task.id}`}
                                className={`text-sm font-medium ${task.completed ? 'line-through text-muted-foreground' : ''}`}
                              >
                                {task.name}
                              </label>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {task.lastUpdated ? `Completed on ${formatDate(task.lastUpdated)}` : ''}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-semibold mb-2">Configuration</h4>
                      <div className="space-y-2">
                        {customer.tasks.filter(t => t.id >= 7 && t.id <= 9).map((task) => (
                          <div key={task.id} className="flex items-center justify-between p-2 border rounded-md">
                            <div className="flex items-center">
                              <Checkbox 
                                id={`task-${task.id}`} 
                                checked={task.completed}
                                onCheckedChange={(checked) => {
                                  handleTaskToggle(customer.id, task.id, checked === true);
                                }}
                                className="mr-2"
                              />
                              <label 
                                htmlFor={`task-${task.id}`}
                                className={`text-sm font-medium ${task.completed ? 'line-through text-muted-foreground' : ''}`}
                              >
                                {task.name}
                              </label>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {task.lastUpdated ? `Completed on ${formatDate(task.lastUpdated)}` : ''}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-semibold mb-2">Finalization</h4>
                      <div className="space-y-2">
                        {customer.tasks.filter(t => t.id === 10).map((task) => (
                          <div key={task.id} className="flex items-center justify-between p-2 border rounded-md">
                            <div className="flex items-center">
                              <Checkbox 
                                id={`task-${task.id}`} 
                                checked={task.completed}
                                onCheckedChange={(checked) => {
                                  handleTaskToggle(customer.id, task.id, checked === true);
                                }}
                                className="mr-2"
                              />
                              <label 
                                htmlFor={`task-${task.id}`}
                                className={`text-sm font-medium ${task.completed ? 'line-through text-muted-foreground' : ''}`}
                              >
                                {task.name}
                              </label>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {task.lastUpdated ? `Completed on ${formatDate(task.lastUpdated)}` : ''}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="notes" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Customer Notes</CardTitle>
                    <CardDescription>Notes and comments about the onboarding process</CardDescription>
                  </div>
                  <Button 
                    size="sm"
                    onClick={() => {
                      setCurrentCustomer(customer);
                      setAddNoteDialogOpen(true);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Note
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {customer.notes && customer.notes.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="rounded-full bg-muted p-3 mb-3">
                      <Edit className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium mb-1">No notes yet</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Add your first note about this customer's onboarding process
                    </p>
                    <Button 
                      variant="outline"
                      onClick={() => {
                        setCurrentCustomer(customer);
                        setAddNoteDialogOpen(true);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Note
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {customer.notes && customer.notes.map((note) => (
                      <Card key={note.id} className="bg-muted/40">
                        <CardContent className="pt-4">
                          <div className="flex justify-between items-start mb-2">
                            <div className="font-medium">{note.author}</div>
                            <div className="text-sm text-muted-foreground">{formatDate(note.date)}</div>
                          </div>
                          <p>{note.content}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="activity" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Activity Log</CardTitle>
                <CardDescription>Recent activity related to this customer</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <div className="absolute h-full border-l border-border left-[14px]"></div>
                  <ul className="space-y-4">
                    {customer.activity && customer.activity.map((activity) => (
                      <li key={activity.id} className="ml-6">
                        <div className="absolute -left-1 rounded-full p-1 border bg-background">
                          <div className={`
                            p-1 rounded-full
                            ${activity.type === 'signup' ? 'bg-blue-100 text-blue-700' : ''}
                            ${activity.type === 'payment' ? 'bg-green-100 text-green-700' : ''}
                            ${activity.type === 'update' ? 'bg-yellow-100 text-yellow-700' : ''}
                            ${activity.type === 'support' ? 'bg-purple-100 text-purple-700' : ''}
                          `}>
                            {activity.type === 'signup' && <UserPlus className="h-3 w-3" />}
                            {activity.type === 'payment' && <Briefcase className="h-3 w-3" />}
                            {activity.type === 'update' && <Edit className="h-3 w-3" />}
                            {activity.type === 'support' && <Phone className="h-3 w-3" />}
                          </div>
                        </div>
                        <div className="flex flex-col">
                          <div className="text-sm">{activity.description}</div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(activity.date).toLocaleString()}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    );
  };

  return (
    <AdminLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8">
        {selectedCustomerId && customerDetail ? (
          <CustomerDetailView customer={customerDetail} />
        ) : (
          <>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">Customer Onboarding</h2>
                <p className="text-muted-foreground">
                  Manage and track customer onboarding progress
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-1">
                  <RefreshCw className="h-4 w-4" />
                  <span className="hidden sm:inline">Refresh</span>
                </Button>
                <Button size="sm" className="gap-1">
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">New Onboarding</span>
                </Button>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row items-center gap-4 md:justify-between">
              <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                <div className="relative w-full sm:w-[300px]">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search customers..."
                    className="pl-8 w-full"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                <Select
                  value={filterPlan}
                  onValueChange={setFilterPlan}
                >
                  <SelectTrigger className="w-full sm:w-[150px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter by Plan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Plans</SelectItem>
                    <SelectItem value="Free">Free</SelectItem>
                    <SelectItem value="Pro">Pro</SelectItem>
                    <SelectItem value="Business">Business</SelectItem>
                    <SelectItem value="Enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex gap-1">
                <Button 
                  variant={viewMode === "table" ? "default" : "outline"} 
                  size="sm" 
                  className="px-2.5"
                  onClick={() => setViewMode("table")}
                >
                  <List className="h-5 w-5" />
                </Button>
                <Button 
                  variant={viewMode === "grid" ? "default" : "outline"} 
                  size="sm" 
                  className="px-2.5"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid className="h-5 w-5" />
                </Button>
              </div>
            </div>
            
            {isLoading ? (
              viewMode === "table" ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Customer</TableHead>
                        <TableHead>Plan</TableHead>
                        <TableHead>Start Date</TableHead>
                        <TableHead>Assigned To</TableHead>
                        <TableHead>Progress</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {[...Array(5)].map((_, i) => (
                        <TableRow key={i}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Skeleton className="h-10 w-10 rounded-full" />
                              <div className="space-y-1">
                                <Skeleton className="h-4 w-36" />
                                <Skeleton className="h-3 w-24" />
                              </div>
                            </div>
                          </TableCell>
                          <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                          <TableCell className="text-right"><Skeleton className="h-8 w-8 rounded-full ml-auto" /></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {[...Array(8)].map((_, i) => (
                    <Card key={i} className="overflow-hidden">
                      <CardHeader className="p-4">
                        <div className="flex items-center gap-3">
                          <Skeleton className="h-12 w-12 rounded-full" />
                          <div className="space-y-1.5">
                            <Skeleton className="h-4 w-28" />
                            <Skeleton className="h-3 w-20" />
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 pt-0 space-y-3">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-2 w-full" />
                      </CardContent>
                      <CardFooter className="p-4 pt-0">
                        <Skeleton className="h-9 w-full" />
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )
            ) : filteredCustomers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="rounded-full bg-muted p-3 mb-3">
                  <AlertCircle className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-1">No customers found</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Try adjusting your search or filter to find what you're looking for
                </p>
                <Button 
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("");
                    setFilterPlan("all");
                  }}
                >
                  Reset Filters
                </Button>
              </div>
            ) : viewMode === "table" ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>Assigned To</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCustomers.map((customer) => (
                      <TableRow 
                        key={customer.id}
                        className="cursor-pointer"
                        onClick={() => handleCustomerSelect(customer.id)}
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback>
                                {customer.customerName.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{customer.customerName}</div>
                              <div className="text-xs text-muted-foreground">{customer.customerCompany}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`${
                              customer.plan === "Enterprise" 
                                ? "border-purple-200 bg-purple-50 text-purple-700" 
                                : customer.plan === "Business" 
                                ? "border-blue-200 bg-blue-50 text-blue-700" 
                                : customer.plan === "Pro" 
                                ? "border-green-200 bg-green-50 text-green-700" 
                                : "border-gray-200 bg-gray-50 text-gray-700"
                            }`}
                          >
                            {customer.plan}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <CalendarDays className="h-4 w-4 mr-1 text-muted-foreground" />
                            <span>{formatDate(customer.startDate)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <UserCheck className="h-4 w-4 mr-1 text-muted-foreground" />
                            <span>{customer.assignedTo}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <div className="w-full max-w-[120px] mr-2">
                              <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                                <div 
                                  className={`h-full rounded-full ${getProgressColor(customer.progress)}`}
                                  style={{ width: `${customer.progress}%` }}
                                />
                              </div>
                            </div>
                            <span className="text-sm">{customer.progress}%</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={(e) => {
                                e.stopPropagation();
                                handleCustomerSelect(customer.id);
                              }}>
                                <ExternalLink className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                                <Clock className="h-4 w-4 mr-2" />
                                Schedule Call
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {filteredCustomers.map((customer) => (
                  <Card 
                    key={customer.id} 
                    className="overflow-hidden cursor-pointer hover:bg-muted/40 transition-colors"
                    onClick={() => handleCustomerSelect(customer.id)}
                  >
                    <CardHeader className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>
                            {customer.customerName.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-medium">{customer.customerName}</h3>
                          <p className="text-xs text-muted-foreground">{customer.customerCompany}</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 space-y-3">
                      <div className="flex items-center justify-between">
                        <Badge
                          variant="outline"
                          className={`${
                            customer.plan === "Enterprise" 
                              ? "border-purple-200 bg-purple-50 text-purple-700" 
                              : customer.plan === "Business" 
                              ? "border-blue-200 bg-blue-50 text-blue-700" 
                              : customer.plan === "Pro" 
                              ? "border-green-200 bg-green-50 text-green-700" 
                              : "border-gray-200 bg-gray-50 text-gray-700"
                          }`}
                        >
                          {customer.plan}
                        </Badge>
                        <div className="text-xs text-muted-foreground">
                          Started {formatDate(customer.startDate)}
                        </div>
                      </div>
                      
                      <div className="mt-3 space-y-1">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs text-muted-foreground">Progress</span>
                          <span className="text-xs font-medium">{customer.progress}%</span>
                        </div>
                        <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${getProgressColor(customer.progress)}`}
                            style={{ width: `${customer.progress}%` }}
                          />
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="p-4 pt-0">
                      <Button variant="outline" className="w-full h-8 text-xs" size="sm">
                        View Details
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
        
        {/* Add Note Dialog */}
        <Dialog open={addNoteDialogOpen} onOpenChange={setAddNoteDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add Note</DialogTitle>
              <DialogDescription>
                Add a note to track important information about the customer's onboarding.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <Textarea
                placeholder="Enter your note here..."
                className="min-h-[120px]"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddNoteDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                toast({
                  title: "Note added",
                  description: "Your note has been added to the customer record",
                });
                setAddNoteDialogOpen(false);
                // In a real app, this would add the note to the database
                // and refresh the customer data
              }}>
                Add Note
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}