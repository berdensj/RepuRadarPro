import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { Link } from "wouter";
import { z } from "zod";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  UserPlus2,
  Search,
  X,
  Edit, 
  Trash2,
  Download,
  MoreHorizontal,
  Building,
  Lock,
  User
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Define types for users and locations
interface UserWithLocationCount {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: string;
  profilePicture: string | null;
  isActive: boolean;
  createdAt: string;
  locationCount: number;
}

interface Location {
  id: number;
  userId: number;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
}

interface LocationManager {
  id: number;
  userId: number;
  locationId: number;
}

// Form schema for creating a new user
const newUserSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters long"),
  email: z.string().email("Please enter a valid email address"),
  fullName: z.string().min(2, "Full name is required"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  role: z.enum(["user", "manager", "staff"]),
});

// Form schema for assigning a location manager
const locationManagerSchema = z.object({
  userId: z.string(),
  locationId: z.string(),
});

import ClientAdminLayout from "@/components/client-admin/layout";

export default function ClientAdminUsersPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [addUserOpen, setAddUserOpen] = useState(false);
  const [editUserOpen, setEditUserOpen] = useState(false);
  const [assignLocationOpen, setAssignLocationOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserWithLocationCount | null>(null);
  const [editingRole, setEditingRole] = useState<number | null>(null);
  const [confirmDeleteUser, setConfirmDeleteUser] = useState<number | null>(null);

  // Fetch users - only those that belong to the client's organization
  const { data: users = [], isLoading: usersLoading } = useQuery<UserWithLocationCount[]>({
    queryKey: ["/api/client/users"],
    queryFn: async () => {
      // Temporarily using the existing endpoint until we create a client-specific one
      const res = await apiRequest("GET", "/api/locations");
      
      // For now, we'll filter out system admins when API returns
      return [
        {
          id: 101,
          username: "manager1",
          email: "manager1@example.com",
          fullName: "Location Manager 1",
          role: "manager",
          profilePicture: null,
          isActive: true,
          createdAt: new Date().toISOString(),
          locationCount: 1
        },
        {
          id: 102,
          username: "manager2",
          email: "manager2@example.com",
          fullName: "Location Manager 2",
          role: "manager",
          profilePicture: null,
          isActive: true,
          createdAt: new Date().toISOString(),
          locationCount: 1
        },
        {
          id: 103,
          username: "staff1",
          email: "staff1@example.com",
          fullName: "Staff Member 1",
          role: "staff",
          profilePicture: null,
          isActive: true,
          createdAt: new Date().toISOString(),
          locationCount: 0
        },
        {
          id: 104,
          username: "user1",
          email: "user1@example.com",
          fullName: "Regular User 1",
          role: "user",
          profilePicture: null,
          isActive: true,
          createdAt: new Date().toISOString(),
          locationCount: 0
        }
      ];
    },
  });

  // Fetch locations
  const { data: locations = [], isLoading: locationsLoading } = useQuery<Location[]>({
    queryKey: ["/api/locations"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/locations");
      return await res.json();
    },
  });

  // Fetch location managers (temporary mock data)
  const { data: locationManagers = [], isLoading: managersLoading } = useQuery<LocationManager[]>({
    queryKey: ["/api/client/location-managers"],
    queryFn: async () => {
      // Mock data until we implement the proper endpoint
      return [
        { id: 1, userId: 101, locationId: 4 }, // Manager 1 manages Downtown Office
        { id: 2, userId: 102, locationId: 5 }, // Manager 2 manages Uptown Branch
      ];
    },
  });

  // Form setup for adding a new user
  const newUserForm = useForm<z.infer<typeof newUserSchema>>({
    resolver: zodResolver(newUserSchema),
    defaultValues: {
      username: "",
      email: "",
      fullName: "",
      password: "",
      role: "user",
    },
  });

  // Form setup for assigning a location manager
  const assignLocationForm = useForm<z.infer<typeof locationManagerSchema>>({
    resolver: zodResolver(locationManagerSchema),
    defaultValues: {
      userId: "",
      locationId: "",
    },
  });

  // Mutations (temporarily mocked)
  const createUserMutation = useMutation({
    mutationFn: async (userData: z.infer<typeof newUserSchema>) => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { ...userData, id: Math.floor(Math.random() * 1000) + 200 };
    },
    onSuccess: () => {
      toast({
        title: "User created",
        description: "The user has been created successfully.",
      });
      setAddUserOpen(false);
      newUserForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error creating user",
        description: error.message || "There was an error creating the user.",
        variant: "destructive",
      });
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: number; role: string }) => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      return { userId, role };
    },
    onSuccess: () => {
      toast({
        title: "Role updated",
        description: "The user's role has been updated successfully.",
      });
      setEditingRole(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error updating role",
        description: error.message || "There was an error updating the role.",
        variant: "destructive",
      });
    },
  });

  const assignLocationManagerMutation = useMutation({
    mutationFn: async (data: z.infer<typeof locationManagerSchema>) => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      return { id: Math.floor(Math.random() * 1000), userId: parseInt(data.userId), locationId: parseInt(data.locationId) };
    },
    onSuccess: () => {
      toast({
        title: "Location assigned",
        description: "The location has been assigned to the manager successfully.",
      });
      setAssignLocationOpen(false);
      assignLocationForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error assigning location",
        description: error.message || "There was an error assigning the location.",
        variant: "destructive",
      });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1200));
      return true;
    },
    onSuccess: () => {
      toast({
        title: "User deleted",
        description: "The user has been deleted successfully.",
      });
      setConfirmDeleteUser(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error deleting user",
        description: error.message || "There was an error deleting the user.",
        variant: "destructive",
      });
    },
  });
  
  // Form state for edit user
  const [editFullName, setEditFullName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editIsActive, setEditIsActive] = useState<boolean>(true);
  
  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async (data: { id: number; fullName: string; email: string; isActive: boolean }) => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      return { ...data };
    },
    onSuccess: () => {
      toast({
        title: "User updated",
        description: "The user information has been updated successfully.",
      });
      setEditUserOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Update failed",
        description: error.message || "There was an error updating the user.",
        variant: "destructive",
      });
    },
  });
  
  // Handle opening the edit dialog with pre-populated data
  const handleEditUser = (user: UserWithLocationCount) => {
    setSelectedUser(user);
    setEditFullName(user.fullName);
    setEditEmail(user.email);
    setEditIsActive(user.isActive);
    setEditUserOpen(true);
  };

  const deleteLocationManagerMutation = useMutation({
    mutationFn: async ({ userId, locationId }: { userId: number; locationId: number }) => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 600));
      return true;
    },
    onSuccess: () => {
      toast({
        title: "Location manager removed",
        description: "The location manager assignment has been removed successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error removing location manager",
        description: error.message || "There was an error removing the location manager.",
        variant: "destructive",
      });
    },
  });

  // Filter users based on search query and filters
  const filteredUsers = users.filter((user) => {
    // Search query filter
    const matchesSearch =
      searchQuery === "" ||
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.fullName.toLowerCase().includes(searchQuery.toLowerCase());

    // Role filter
    const matchesRole = roleFilter === "all" || user.role === roleFilter;

    // Location filter
    const matchesLocation =
      locationFilter === "all" ||
      (locationFilter === "multi" && user.locationCount > 1) ||
      (locationFilter === "single" && user.locationCount === 1) ||
      (locationFilter === "none" && user.locationCount === 0);

    return matchesSearch && matchesRole && matchesLocation;
  });

  // Handle role change for a user
  const handleRoleChange = (userId: number, role: string) => {
    updateRoleMutation.mutate({ userId, role });
  };

  // Form submission handlers
  const onSubmitNewUser = (data: z.infer<typeof newUserSchema>) => {
    createUserMutation.mutate(data);
  };

  const onSubmitAssignLocation = (data: z.infer<typeof locationManagerSchema>) => {
    assignLocationManagerMutation.mutate(data);
  };

  // Get location assignments for a user
  const getUserLocationAssignments = (userId: number) => {
    return locationManagers
      .filter((manager) => manager.userId === userId)
      .map((manager) => {
        const location = locations.find((loc) => loc.id === manager.locationId);
        return { managerId: manager.id, location };
      });
  };

  // Check if a user is assigned to a specific location
  const isUserAssignedToLocation = (userId: number, locationId: number) => {
    return locationManagers.some(
      (manager) => manager.userId === userId && manager.locationId === locationId
    );
  };

  // Update user selection when assigning locations
  useEffect(() => {
    if (selectedUser) {
      assignLocationForm.setValue("userId", selectedUser.id.toString());
    }
  }, [selectedUser, assignLocationForm]);

  return (
    <div className="container p-6 mx-auto">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-4">
        <Link href="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link>
        <span>/</span>
        <Link href="/client-admin/users" className="text-primary font-medium">User Management</Link>
      </div>
      
      {/* Top Navigation Bar */}
      <div className="bg-card p-4 rounded-lg shadow-sm mb-6 flex flex-wrap gap-2">
        <Link href="/dashboard" className="inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium hover:bg-accent">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Dashboard
        </Link>
        <Link href="/reviews" className="inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium hover:bg-accent">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
          Reviews
        </Link>
        <Link href="/analytics" className="inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium hover:bg-accent">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Analytics
        </Link>
      </div>
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">User Management</h1>
        <div className="flex space-x-2">
          <Dialog open={addUserOpen} onOpenChange={setAddUserOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus2 className="mr-2 h-4 w-4" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New User</DialogTitle>
                <DialogDescription>
                  Create a new user account. They will receive an email with instructions to set their password.
                </DialogDescription>
              </DialogHeader>
              <Form {...newUserForm}>
                <form onSubmit={newUserForm.handleSubmit(onSubmitNewUser)} className="space-y-4">
                  <FormField
                    control={newUserForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input placeholder="johndoe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={newUserForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="john.doe@example.com" type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={newUserForm.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={newUserForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input placeholder="••••••••" type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={newUserForm.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="user">User</SelectItem>
                            <SelectItem value="manager">Location Manager</SelectItem>
                            <SelectItem value="staff">Staff</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Staff can access all locations. Location managers need specific location assignments.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter className="pt-4">
                    <Button type="submit" disabled={createUserMutation.isPending}>
                      {createUserMutation.isPending ? "Creating..." : "Create User"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
          
          <Dialog open={assignLocationOpen} onOpenChange={setAssignLocationOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Assign Location</DialogTitle>
                <DialogDescription>
                  Assign {selectedUser?.fullName} to manage a specific location.
                </DialogDescription>
              </DialogHeader>
              <Form {...assignLocationForm}>
                <form onSubmit={assignLocationForm.handleSubmit(onSubmitAssignLocation)} className="space-y-4">
                  <FormField
                    control={assignLocationForm.control}
                    name="locationId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a location" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {locations.map((location) => (
                              <SelectItem 
                                key={location.id} 
                                value={location.id.toString()}
                                disabled={selectedUser ? isUserAssignedToLocation(selectedUser.id, location.id) : false}
                              >
                                {location.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Select a location to assign to this user.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter className="pt-4">
                    <Button type="submit" disabled={assignLocationManagerMutation.isPending}>
                      {assignLocationManagerMutation.isPending ? "Assigning..." : "Assign Location"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>
            Manage users and their access to your organization's locations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
            <div className="relative w-full md:w-[300px]">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search users..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  className="absolute right-2 top-2.5"
                  onClick={() => setSearchQuery("")}
                >
                  <X className="h-4 w-4 text-slate-400" />
                </button>
              )}
            </div>
            
            <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full md:w-[150px]">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                  <SelectItem value="manager">Managers</SelectItem>
                  <SelectItem value="user">Regular Users</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger className="w-full md:w-[170px]">
                  <SelectValue placeholder="Filter by locations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  <SelectItem value="multi">Multi-Location</SelectItem>
                  <SelectItem value="single">Single Location</SelectItem>
                  <SelectItem value="none">No Locations</SelectItem>
                </SelectContent>
              </Select>
              
              <Button variant="outline" className="md:w-auto">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
          
          {usersLoading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[250px]">User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Location Access</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                        No users found. Try adjusting your filters or create a new user.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-700">
                              {user.profilePicture ? (
                                <img src={user.profilePicture} alt={user.fullName} className="w-8 h-8 rounded-full" />
                              ) : (
                                <User className="w-4 h-4" />
                              )}
                            </div>
                            <div>
                              <div className="font-medium">{user.fullName}</div>
                              <div className="text-xs text-slate-500">{user.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {editingRole === user.id ? (
                            <Select
                              defaultValue={user.role}
                              onValueChange={(value) => handleRoleChange(user.id, value)}
                              onOpenChange={() => setEditingRole(null)}
                            >
                              <SelectTrigger className="w-[140px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="user">User</SelectItem>
                                <SelectItem value="manager">Location Manager</SelectItem>
                                <SelectItem value="staff">Staff</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            <div className="flex gap-1 items-center">
                              <Badge
                                variant={
                                  user.role === "staff"
                                    ? "outline"
                                    : user.role === "manager"
                                    ? "secondary"
                                    : "default"
                                }
                                className="cursor-pointer"
                                onClick={() => setEditingRole(user.id)}
                              >
                                {user.role === "user" && "Regular User"}
                                {user.role === "manager" && "Location Manager"}
                                {user.role === "staff" && "Staff"}
                              </Badge>
                              <Edit className="h-3 w-3 text-slate-400 cursor-pointer" onClick={() => setEditingRole(user.id)} />
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.isActive ? "default" : "destructive"}>
                            {user.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            {user.locationCount === 0 ? (
                              <span className="text-xs text-slate-500">No locations assigned</span>
                            ) : (
                              <div className="space-y-1">
                                {getUserLocationAssignments(user.id).map(({ managerId, location }) => (
                                  <div key={managerId} className="flex items-center gap-1.5">
                                    <Building className="h-3 w-3 text-slate-400" />
                                    <span className="text-xs">{location?.name}</span>
                                    <button
                                      onClick={() => 
                                        deleteLocationManagerMutation.mutate({ 
                                          userId: user.id, 
                                          locationId: location?.id || 0 
                                        })
                                      }
                                      className="text-slate-400 hover:text-destructive"
                                    >
                                      <X className="h-3 w-3" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                            {user.role === "manager" && (
                              <Button
                                variant="link"
                                size="sm"
                                className="p-0 h-auto text-xs"
                                onClick={() => {
                                  setSelectedUser(user);
                                  setAssignLocationOpen(true);
                                }}
                              >
                                Assign location
                              </Button>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-5 w-5" />
                                <span className="sr-only">Actions</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleEditUser(user)}
                              >
                                <Edit className="h-4 w-4 mr-2" /> Edit User
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedUser(user);
                                  setAssignLocationOpen(true);
                                }}
                              >
                                <Building className="h-4 w-4 mr-2" /> Manage Locations
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Lock className="h-4 w-4 mr-2" /> Reset Password
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => setConfirmDeleteUser(user.id)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" /> Delete User
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>

                          <AlertDialog open={confirmDeleteUser === user.id} onOpenChange={(open) => !open && setConfirmDeleteUser(null)}>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently delete the user "{user.fullName}". This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  onClick={() => deleteUserMutation.mutate(user.id)}
                                >
                                  {deleteUserMutation.isPending && confirmDeleteUser === user.id ? (
                                    <>
                                      <div className="animate-spin mr-2 h-4 w-4 border-2 border-destructive-foreground border-t-transparent rounded-full" />
                                      Deleting...
                                    </>
                                  ) : (
                                    "Delete"
                                  )}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-sm text-slate-500">
            Showing {filteredUsers.length} of {users.length} users
          </div>
        </CardFooter>
      </Card>
      
      {/* Edit User Dialog */}
      <Dialog open={editUserOpen} onOpenChange={(open) => {
        setEditUserOpen(open);
        if (!open) setSelectedUser(null);
      }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information for {selectedUser?.fullName}.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <FormLabel className="text-right">Name</FormLabel>
              <Input 
                id="fullName" 
                value={editFullName}
                onChange={(e) => setEditFullName(e.target.value)} 
                className="col-span-3" 
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <FormLabel className="text-right">Email</FormLabel>
              <Input 
                id="email" 
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                className="col-span-3" 
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <FormLabel className="text-right">Status</FormLabel>
              <Select 
                value={editIsActive ? "active" : "inactive"}
                onValueChange={(value) => setEditIsActive(value === "active")}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditUserOpen(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              onClick={() => {
                if (selectedUser) {
                  updateUserMutation.mutate({
                    id: selectedUser.id,
                    fullName: editFullName,
                    email: editEmail,
                    isActive: editIsActive
                  });
                }
              }}
              disabled={updateUserMutation.isPending}
            >
              {updateUserMutation.isPending ? (
                <>
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-background border-t-transparent rounded-full" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}