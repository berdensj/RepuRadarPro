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
import ClientAdminLayout from "@/components/client-admin/layout";

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
    <ClientAdminLayout>
      <div className="container p-6 mx-auto">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-4">
          <Link href="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link>
          <span>/</span>
          <Link href="/client-admin/users" className="text-primary font-medium">User Management</Link>
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
                            <Input placeholder="******" type="password" {...field} />
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
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a role" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="user">User</SelectItem>
                              <SelectItem value="staff">Staff</SelectItem>
                              <SelectItem value="manager">Location Manager</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            This determines the permissions the user will have.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                      <Button 
                        type="submit" 
                        disabled={createUserMutation.isPending}
                      >
                        {createUserMutation.isPending ? (
                          <>
                            <div className="animate-spin mr-2 h-4 w-4 border-2 border-background border-t-transparent rounded-full" />
                            Creating...
                          </>
                        ) : (
                          "Create User"
                        )}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <div className="flex space-x-2">
              <div className="relative w-full">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  type="search" 
                  placeholder="Search users..." 
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
          <div>
            <Select
              value={roleFilter}
              onValueChange={setRoleFilter}
            >
              <SelectTrigger>
                <div className="flex items-center">
                  <Lock className="mr-2 h-4 w-4" />
                  <span>Role: {roleFilter === "all" ? "All Roles" : roleFilter}</span>
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="staff">Staff</SelectItem>
                <SelectItem value="manager">Location Manager</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Select
              value={locationFilter}
              onValueChange={setLocationFilter}
            >
              <SelectTrigger>
                <div className="flex items-center">
                  <Building className="mr-2 h-4 w-4" />
                  <span>
                    {locationFilter === "all" && "All Locations"}
                    {locationFilter === "multi" && "Multiple Locations"}
                    {locationFilter === "single" && "Single Location"}
                    {locationFilter === "none" && "No Locations"}
                  </span>
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                <SelectItem value="multi">Multiple Locations</SelectItem>
                <SelectItem value="single">Single Location</SelectItem>
                <SelectItem value="none">No Locations</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Card>
          <CardContent className="pt-6">
            {usersLoading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No users match your search criteria.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Locations</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full flex items-center justify-center bg-slate-100">
                            {user.profilePicture ? (
                              <img 
                                src={user.profilePicture} 
                                alt={user.fullName} 
                                className="w-9 h-9 rounded-full object-cover"
                              />
                            ) : (
                              <User className="h-5 w-5 text-slate-500" />
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
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="user">User</SelectItem>
                              <SelectItem value="staff">Staff</SelectItem>
                              <SelectItem value="manager">Manager</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Badge 
                              className={
                                user.role === "manager" 
                                  ? "bg-blue-100 text-blue-800 hover:bg-blue-100" 
                                  : user.role === "staff" 
                                  ? "bg-purple-100 text-purple-800 hover:bg-purple-100" 
                                  : "bg-gray-100 text-gray-800 hover:bg-gray-100"
                              }
                            >
                              {user.role === "manager" && "Location Manager"}
                              {user.role === "staff" && "Staff"}
                              {user.role === "user" && "User"}
                            </Badge>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-6 w-6"
                              onClick={() => setEditingRole(user.id)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {user.locationCount === 0 ? (
                            <span className="text-sm text-muted-foreground">None assigned</span>
                          ) : (
                            getUserLocationAssignments(user.id).map(({ managerId, location }) => (
                              <div key={managerId} className="flex items-center gap-1">
                                <span className="text-sm">{location?.name}</span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-5 w-5 rounded-full"
                                  onClick={() => {
                                    if (location) {
                                      deleteLocationManagerMutation.mutate({ 
                                        userId: user.id, 
                                        locationId: location.id 
                                      });
                                    }
                                  }}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            ))
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.isActive ? "default" : "destructive"}>
                          {user.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
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
                            <DropdownMenuItem
                              onClick={() => handleEditUser(user)}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              <span>Edit Details</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedUser(user);
                                setAssignLocationOpen(true);
                              }}
                            >
                              <Building className="mr-2 h-4 w-4" />
                              <span>Assign Location</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => setConfirmDeleteUser(user.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              <span>Delete User</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Assign Location Dialog */}
        <Dialog open={assignLocationOpen} onOpenChange={setAssignLocationOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Assign Location</DialogTitle>
              <DialogDescription>
                Assign a location to the selected user.
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
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
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
                              disabled={selectedUser && isUserAssignedToLocation(selectedUser.id, location.id)}
                            >
                              {location.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button 
                    type="submit" 
                    disabled={assignLocationManagerMutation.isPending}
                  >
                    {assignLocationManagerMutation.isPending ? (
                      <>
                        <div className="animate-spin mr-2 h-4 w-4 border-2 border-background border-t-transparent rounded-full" />
                        Assigning...
                      </>
                    ) : (
                      "Assign Location"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Delete User Confirmation Dialog */}
        <AlertDialog open={confirmDeleteUser !== null} onOpenChange={(open) => !open && setConfirmDeleteUser(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the user account and remove their data from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (confirmDeleteUser !== null) {
                    deleteUserMutation.mutate(confirmDeleteUser);
                  }
                }}
                className="bg-red-600 hover:bg-red-700"
              >
                {deleteUserMutation.isPending ? (
                  <>
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-background border-t-transparent rounded-full" />
                    Deleting...
                  </>
                ) : (
                  "Delete User"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        
        {/* Edit User Dialog */}
        <Dialog open={editUserOpen} onOpenChange={setEditUserOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>
                Update user details
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <FormLabel htmlFor="fullName">Full Name</FormLabel>
                <Input 
                  id="fullName" 
                  value={editFullName} 
                  onChange={(e) => setEditFullName(e.target.value)} 
                />
              </div>
              
              <div className="space-y-2">
                <FormLabel htmlFor="email">Email</FormLabel>
                <Input 
                  id="email" 
                  type="email" 
                  value={editEmail} 
                  onChange={(e) => setEditEmail(e.target.value)} 
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  id="isActive" 
                  checked={editIsActive} 
                  onChange={(e) => setEditIsActive(e.target.checked)}
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <FormLabel htmlFor="isActive" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Account Active
                </FormLabel>
              </div>
            </div>
            
            <DialogFooter>
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
    </ClientAdminLayout>
  );
}