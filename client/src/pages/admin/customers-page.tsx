import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { 
  Pencil, 
  Search, 
  CreditCard, 
  Package, 
  Mail, 
  Phone, 
  Calendar, 
  Check, 
  X, 
  UserCog, 
  Building, 
  ArrowUpDown,
  Download
} from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger, 
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useForm } from "react-hook-form";
import { apiRequest, queryClient } from "@/lib/queryClient";

// Type definitions
interface Customer {
  id: number;
  username: string;
  email: string;
  fullName: string;
  phone?: string;
  address?: string;
  company?: string;
  role: string;
  isActive: boolean;
  plan: string;
  billingCycle: string;
  nextBillingDate: string;
  paymentMethod: string;
  createdAt: string;
  profilePicture?: string | null;
  locationCount: number;
  totalSpend: number;
}

// Customer update form type
interface CustomerUpdateFormData {
  fullName: string;
  email: string;
  phone: string;
  company: string;
  address: string;
  plan: string;
  billingCycle: string;
  isActive: boolean;
}

export default function AdminCustomersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [planFilter, setPlanFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  // Fetch customers data
  const { data: customers, isLoading } = useQuery<Customer[]>({
    queryKey: ["/api/admin/customers"],
  });

  // Toggle sort order
  const toggleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  // Customer update mutation
  const updateCustomerMutation = useMutation({
    mutationFn: async (data: {id: number, updates: Partial<CustomerUpdateFormData>}) => {
      const res = await apiRequest("PATCH", `/api/admin/customers/${data.id}`, data.updates);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Customer updated",
        description: "Customer information has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/customers"] });
      setEditDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Filter customers based on search and filters
  const filteredCustomers = customers ? customers
    .filter(customer => {
      // Filter by search query
      const matchesSearch = 
        customer.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (customer.company && customer.company.toLowerCase().includes(searchQuery.toLowerCase()));
      
      // Filter by plan
      const matchesPlan = planFilter === "all" || customer.plan === planFilter;
      
      // Filter by status
      const matchesStatus = 
        statusFilter === "all" || 
        (statusFilter === "active" && customer.isActive) ||
        (statusFilter === "inactive" && !customer.isActive);
        
      // Filter by tab
      const matchesTab = 
        activeTab === "all" || 
        (activeTab === "pro" && customer.plan === "Pro") ||
        (activeTab === "business" && customer.plan === "Business") ||
        (activeTab === "enterprise" && customer.plan === "Enterprise") ||
        (activeTab === "free" && customer.plan === "Free");
      
      return matchesSearch && matchesPlan && matchesStatus && matchesTab;
    })
    .sort((a, b) => {
      // Sort by selected column
      if (sortBy === "createdAt") {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
      } else if (sortBy === "fullName") {
        return sortOrder === "asc" 
          ? a.fullName.localeCompare(b.fullName)
          : b.fullName.localeCompare(a.fullName);
      } else if (sortBy === "totalSpend") {
        return sortOrder === "asc" 
          ? a.totalSpend - b.totalSpend
          : b.totalSpend - a.totalSpend;
      } else if (sortBy === "locationCount") {
        return sortOrder === "asc" 
          ? a.locationCount - b.locationCount
          : b.locationCount - a.locationCount;
      }
      return 0;
    }) : [];

  // Customer edit form
  const CustomerEditForm = ({ customer }: { customer: Customer }) => {
    const { register, handleSubmit, formState: { errors } } = useForm<CustomerUpdateFormData>({
      defaultValues: {
        fullName: customer.fullName,
        email: customer.email,
        phone: customer.phone || "",
        company: customer.company || "",
        address: customer.address || "",
        plan: customer.plan,
        billingCycle: customer.billingCycle,
        isActive: customer.isActive
      }
    });

    const onSubmit = (data: CustomerUpdateFormData) => {
      updateCustomerMutation.mutate({
        id: customer.id,
        updates: data
      });
    };

    return (
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input 
              id="fullName"
              {...register("fullName", { required: "Full name is required" })}
            />
            {errors.fullName && <p className="text-xs text-red-500">{errors.fullName.message}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email"
              type="email"
              {...register("email", { 
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address"
                }
              })}
            />
            {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input 
              id="phone"
              {...register("phone")}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="company">Company</Label>
            <Input 
              id="company"
              {...register("company")}
            />
          </div>
          
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="address">Address</Label>
            <Input 
              id="address"
              {...register("address")}
            />
          </div>
        </div>
        
        <Separator />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="plan">Subscription Plan</Label>
            <Select 
              defaultValue={customer.plan}
              onValueChange={(value) => register("plan").onChange({ target: { value } })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a plan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Free">Free</SelectItem>
                <SelectItem value="Pro">Pro</SelectItem>
                <SelectItem value="Business">Business</SelectItem>
                <SelectItem value="Enterprise">Enterprise</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="billingCycle">Billing Cycle</Label>
            <Select 
              defaultValue={customer.billingCycle}
              onValueChange={(value) => register("billingCycle").onChange({ target: { value } })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select billing cycle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="annually">Annually</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch 
              id="isActive" 
              defaultChecked={customer.isActive}
              onCheckedChange={(checked) => register("isActive").onChange({ target: { value: checked } })}
            />
            <Label htmlFor="isActive">Account Active</Label>
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => setEditDialogOpen(false)}
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            disabled={updateCustomerMutation.isPending}
          >
            {updateCustomerMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </form>
    );
  };

  // Get the count of customers for each plan type
  const planCounts = {
    all: customers?.length || 0,
    free: customers?.filter(c => c.plan === "Free").length || 0,
    pro: customers?.filter(c => c.plan === "Pro").length || 0,
    business: customers?.filter(c => c.plan === "Business").length || 0,
    enterprise: customers?.filter(c => c.plan === "Enterprise").length || 0
  };

  return (
    <AdminLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Customer Management</h2>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" className="h-8 gap-1">
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Export</span>
            </Button>
            <Button size="sm" className="h-8 gap-1">
              <UserCog className="h-4 w-4" />
              <span className="hidden sm:inline">Add Customer</span>
            </Button>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all" className="text-xs sm:text-sm">
              All <Badge variant="outline" className="ml-1">{planCounts.all}</Badge>
            </TabsTrigger>
            <TabsTrigger value="pro" className="text-xs sm:text-sm">
              Pro <Badge variant="outline" className="ml-1">{planCounts.pro}</Badge>
            </TabsTrigger>
            <TabsTrigger value="business" className="text-xs sm:text-sm">
              Business <Badge variant="outline" className="ml-1">{planCounts.business}</Badge>
            </TabsTrigger>
            <TabsTrigger value="enterprise" className="text-xs sm:text-sm">
              Enterprise <Badge variant="outline" className="ml-1">{planCounts.enterprise}</Badge>
            </TabsTrigger>
            <TabsTrigger value="free" className="text-xs sm:text-sm">
              Free <Badge variant="outline" className="ml-1">{planCounts.free}</Badge>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab} className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Customer Management</CardTitle>
                <CardDescription>View and manage your customer accounts and subscriptions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="relative w-full md:w-96">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search customers..."
                      className="pl-8 w-full"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  
                  <div className="flex flex-1 items-center space-x-2">
                    <Select
                      value={planFilter}
                      onValueChange={setPlanFilter}
                    >
                      <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Plan" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Plans</SelectItem>
                        <SelectItem value="Free">Free</SelectItem>
                        <SelectItem value="Pro">Pro</SelectItem>
                        <SelectItem value="Business">Business</SelectItem>
                        <SelectItem value="Enterprise">Enterprise</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Select
                      value={statusFilter}
                      onValueChange={setStatusFilter}
                    >
                      <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Customer</TableHead>
                        <TableHead 
                          className="cursor-pointer"
                          onClick={() => toggleSort("fullName")}
                        >
                          <div className="flex items-center">
                            Name
                            <ArrowUpDown className="ml-1 h-3 w-3" />
                          </div>
                        </TableHead>
                        <TableHead className="hidden md:table-cell">Contact</TableHead>
                        <TableHead className="hidden lg:table-cell">Plan</TableHead>
                        <TableHead 
                          className="hidden lg:table-cell cursor-pointer"
                          onClick={() => toggleSort("totalSpend")}
                        >
                          <div className="flex items-center">
                            Total Spend
                            <ArrowUpDown className="ml-1 h-3 w-3" />
                          </div>
                        </TableHead>
                        <TableHead 
                          className="hidden xl:table-cell cursor-pointer"
                          onClick={() => toggleSort("locationCount")}
                        >
                          <div className="flex items-center">
                            Locations
                            <ArrowUpDown className="ml-1 h-3 w-3" />
                          </div>
                        </TableHead>
                        <TableHead className="hidden xl:table-cell">Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        Array.from({ length: 5 }).map((_, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Skeleton className="h-10 w-10 rounded-full" />
                                <Skeleton className="h-4 w-24" />
                              </div>
                            </TableCell>
                            <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                            <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-36" /></TableCell>
                            <TableCell className="hidden lg:table-cell"><Skeleton className="h-4 w-20" /></TableCell>
                            <TableCell className="hidden lg:table-cell"><Skeleton className="h-4 w-20" /></TableCell>
                            <TableCell className="hidden xl:table-cell"><Skeleton className="h-4 w-16" /></TableCell>
                            <TableCell className="hidden xl:table-cell"><Skeleton className="h-4 w-16" /></TableCell>
                            <TableCell className="text-right"><Skeleton className="h-8 w-8 rounded-full ml-auto" /></TableCell>
                          </TableRow>
                        ))
                      ) : filteredCustomers.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="h-24 text-center">
                            No customers found. Try adjusting your filters.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredCustomers.map((customer) => (
                          <TableRow key={customer.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar>
                                  {customer.profilePicture ? (
                                    <AvatarImage src={customer.profilePicture} alt={customer.fullName} />
                                  ) : (
                                    <AvatarFallback>
                                      {customer.fullName.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                  )}
                                </Avatar>
                                <div>
                                  <div className="font-medium">{customer.username}</div>
                                  <div className="text-xs text-muted-foreground">ID: {customer.id}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{customer.fullName}</TableCell>
                            <TableCell className="hidden md:table-cell">
                              <div className="flex flex-col">
                                <span className="text-sm">{customer.email}</span>
                                {customer.phone && (
                                  <span className="text-xs text-muted-foreground">{customer.phone}</span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="hidden lg:table-cell">
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
                            <TableCell className="hidden lg:table-cell">
                              ${customer.totalSpend.toLocaleString()}
                            </TableCell>
                            <TableCell className="hidden xl:table-cell">
                              {customer.locationCount}
                            </TableCell>
                            <TableCell className="hidden xl:table-cell">
                              {customer.isActive ? (
                                <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700">
                                  Active
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="border-red-200 bg-red-50 text-red-700">
                                  Inactive
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <Pencil className="h-4 w-4" />
                                    <span className="sr-only">Open menu</span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedCustomer(customer);
                                      setEditDialogOpen(true);
                                    }}
                                  >
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Edit Customer
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <CreditCard className="mr-2 h-4 w-4" />
                                    Manage Billing
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Package className="mr-2 h-4 w-4" />
                                    Change Plan
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem>
                                    <Mail className="mr-2 h-4 w-4" />
                                    Send Email
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  {customer.isActive ? (
                                    <DropdownMenuItem className="text-red-600">
                                      <X className="mr-2 h-4 w-4" />
                                      Deactivate Account
                                    </DropdownMenuItem>
                                  ) : (
                                    <DropdownMenuItem className="text-green-600">
                                      <Check className="mr-2 h-4 w-4" />
                                      Activate Account
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
              <CardFooter className="flex items-center justify-between py-4">
                <div className="text-sm text-muted-foreground">
                  Showing <strong>{filteredCustomers.length}</strong> of{" "}
                  <strong>{customers?.length || 0}</strong> customers
                </div>
                {/* Pagination would go here */}
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
        
        {/* Edit Customer Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Edit Customer</DialogTitle>
              <DialogDescription>
                Update customer information, subscription plan, and billing details.
              </DialogDescription>
            </DialogHeader>
            {selectedCustomer && <CustomerEditForm customer={selectedCustomer} />}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}