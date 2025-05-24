import React from 'react';
import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/use-auth';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '../lib/queryClient';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useToast } from '../hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Switch } from '../components/ui/switch';
import { Badge } from '../components/ui/badge';
import { Loader2, PlusCircle, Trash2, UserCog } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../components/ui/alert-dialog';

// Define zod schema for location form
const locationFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  address: z.string().optional(),
  phone: z.string().optional(),
  googlePlaceId: z.string().optional(),
  yelpBusinessId: z.string().optional(),
  facebookPageId: z.string().optional(),
  applePlaceId: z.string().optional(),
});

// Define zod schema for user form 
const userFormSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  fullName: z.string().min(1, 'Full name is required'),
  role: z.enum(['admin', 'staff', 'user']),
});

type Location = {
  id: number;
  name: string;
  address: string | null;
  phone: string | null;
  googlePlaceId: string | null;
  yelpBusinessId: string | null;
  facebookPageId?: string | null;
  applePlaceId?: string | null;
};

type User = {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: string;
  isActive: boolean;
};

const SettingsPage = () => {
  const { user, permissions } = useAuth();
  const { toast } = useToast();
  const [addLocationOpen, setAddLocationOpen] = useState(false);
  const [addUserOpen, setAddUserOpen] = useState(false);
  const [deletingLocation, setDeletingLocation] = useState<number | null>(null);
  const [roleDialogOpen, setRoleDialogOpen] = useState<number | null>(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState<number | null>(null);

  // Fetch all locations, either for specific user or all (for admin/staff)
  const { data: locations, isLoading: locationsLoading } = useQuery({
    queryKey: ['/api/locations'],
    queryFn: async () => {
      const endpoint = permissions?.canViewAllLocations 
        ? '/api/staff/locations' 
        : '/api/locations';
      
      const res = await apiRequest('GET', endpoint);
      return res.json();
    },
  });

  // Fetch all users (admin only)
  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['/api/admin/users'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/admin/users');
      return res.json();
    },
    enabled: !!permissions?.canManageUsers,
  });

  // Add Location Form
  const locationForm = useForm<z.infer<typeof locationFormSchema>>({
    resolver: zodResolver(locationFormSchema),
    defaultValues: {
      name: '',
      address: '',
      phone: '',
      googlePlaceId: '',
      yelpBusinessId: '',
      facebookPageId: '',
      applePlaceId: '',
    },
  });

  // Add User Form
  const userForm = useForm<z.infer<typeof userFormSchema>>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      fullName: '',
      role: 'user',
    },
  });

  // Add Location Mutation
  const addLocationMutation = useMutation({
    mutationFn: async (values: z.infer<typeof locationFormSchema>) => {
      const res = await apiRequest('POST', '/api/locations', values);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Location Added',
        description: 'The location has been added successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/locations'] });
      locationForm.reset();
      setAddLocationOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to add location: ${error.message}`,
        variant: 'destructive',
      });
    }
  });

  // Delete Location Mutation
  const deleteLocationMutation = useMutation({
    mutationFn: async (locationId: number) => {
      await apiRequest('DELETE', `/api/locations/${locationId}`);
    },
    onSuccess: () => {
      toast({
        title: 'Location Deleted',
        description: 'The location has been deleted successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/locations'] });
      setDeletingLocation(null);
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to delete location: ${error.message}`,
        variant: 'destructive',
      });
    }
  });

  // Add User Mutation
  const addUserMutation = useMutation({
    mutationFn: async (values: z.infer<typeof userFormSchema>) => {
      // TODO: Verify API endpoint and payload for adding a user
      const res = await apiRequest('POST', '/api/register', values);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: 'User Added',
        description: 'The user has been added successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      userForm.reset();
      setAddUserOpen(false);
    },
    onError: (error: Error) => {
      // TODO: Consider extracting more specific error messages from API responses if available.
      toast({
        title: 'Error',
        description: `Failed to add user: ${error.message}`,
        variant: 'destructive',
      });
    }
  });

  // Update User Role Mutation
  const updateUserRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: number, role: string }) => {
      // TODO: Verify API endpoint and payload for updating user role
      const res = await apiRequest('PATCH', `/api/admin/users/${userId}/role`, { role });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Role Updated',
        description: 'The user role has been updated successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      setRoleDialogOpen(null);
    },
    onError: (error: Error) => {
      // TODO: Consider extracting more specific error messages from API responses if available.
      toast({
        title: 'Error',
        description: `Failed to update user role: ${error.message}`,
        variant: 'destructive',
      });
    }
  });

  // Update User Status Mutation
  const updateUserStatusMutation = useMutation({
    mutationFn: async ({ userId, isActive }: { userId: number, isActive: boolean }) => {
      // TODO: Verify API endpoint and payload for updating user status
      const res = await apiRequest('PATCH', `/api/admin/users/${userId}/active`, { isActive });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Status Updated',
        description: 'The user status has been updated successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      setStatusDialogOpen(null);
    },
    onError: (error: Error) => {
      // TODO: Consider extracting more specific error messages from API responses if available.
      toast({
        title: 'Error',
        description: `Failed to update user status: ${error.message}`,
        variant: 'destructive',
      });
    }
  });

  const onLocationSubmit = (values: z.infer<typeof locationFormSchema>) => {
    addLocationMutation.mutate(values);
  };

  const onUserSubmit = (values: z.infer<typeof userFormSchema>) => {
    addUserMutation.mutate(values);
  };

  return (
    <div className="container mx-auto py-6 space-y-8">
      <h1 className="text-3xl font-bold">Settings</h1>
      <Tabs defaultValue="locations">
        <TabsList className="mb-6">
          <TabsTrigger value="locations">Locations</TabsTrigger>
          {permissions?.canManageUsers && <TabsTrigger value="users">Users</TabsTrigger>}
          <TabsTrigger value="account">Account</TabsTrigger>
        </TabsList>

        {/* Locations Tab */}
        <TabsContent value="locations" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Manage Locations</h2>
            <Dialog open={addLocationOpen} onOpenChange={setAddLocationOpen}>
              <DialogTrigger asChild>
                <Button aria-label="Add Location"><PlusCircle className="mr-2 h-4 w-4" /> Add Location</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Add New Location</DialogTitle>
                  <DialogDescription>
                    Add the details of your business location here.
                  </DialogDescription>
                </DialogHeader>
                <Form {...locationForm}>
                  <form onSubmit={locationForm.handleSubmit(onLocationSubmit)} className="space-y-4">
                    <FormField
                      control={locationForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location Name*</FormLabel>
                          <FormControl>
                            <Input placeholder="Main Office" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={locationForm.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address</FormLabel>
                          <FormControl>
                            <Input placeholder="123 Main St, City, State, ZIP" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={locationForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input placeholder="555-123-4567" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <h3 className="text-lg font-semibold pt-4">Review Platform IDs</h3>
                    <FormField
                      control={locationForm.control}
                      name="googlePlaceId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Google Place ID</FormLabel>
                          <FormControl>
                            <Input placeholder="ChIJrTLr-GyuEmsRBfy61i59si0" {...field} />
                          </FormControl>
                          <FormDescription>Used to fetch Google reviews</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={locationForm.control}
                      name="yelpBusinessId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Yelp Business ID</FormLabel>
                          <FormControl>
                            <Input placeholder="xyz-cafe-san-francisco" {...field} />
                          </FormControl>
                          <FormDescription>Used to fetch Yelp reviews</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={locationForm.control}
                      name="facebookPageId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Facebook Page ID</FormLabel>
                          <FormControl>
                            <Input placeholder="123456789012345" {...field} />
                          </FormControl>
                          <FormDescription>Used to fetch Facebook reviews</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={locationForm.control}
                      name="applePlaceId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Apple Maps Place ID</FormLabel>
                          <FormControl>
                            <Input placeholder="abcdef123456" {...field} />
                          </FormControl>
                          <FormDescription>Used to fetch Apple Maps reviews</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                      <Button type="submit" disabled={addLocationMutation.isPending} aria-label="Add Location">
                        {addLocationMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Add Location
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          {locationsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : locations && locations.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Connected Platforms</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {locations.map((location: Location) => (
                    <TableRow key={location.id}>
                      <TableCell className="font-medium">{location.name}</TableCell>
                      <TableCell>{location.address || "—"}</TableCell>
                      <TableCell>{location.phone || "—"}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {location.googlePlaceId && <Badge>Google</Badge>}
                          {location.yelpBusinessId && <Badge>Yelp</Badge>}
                          {location.facebookPageId && <Badge>Facebook</Badge>}
                          {location.applePlaceId && <Badge>Apple Maps</Badge>}
                          {!location.googlePlaceId && !location.yelpBusinessId && 
                           !location.facebookPageId && !location.applePlaceId && "—"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <AlertDialog 
                          open={deletingLocation === location.id} 
                          onOpenChange={(open) => !open && setDeletingLocation(null)}
                        >
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setDeletingLocation(location.id)}
                              aria-label="Delete Location"
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete the location "{location.name}" and all associated data.
                                This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteLocationMutation.mutate(location.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                aria-label="Delete Location"
                              >
                                {deleteLocationMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
            <Card>
              <CardHeader>
                <CardTitle>No Locations Found</CardTitle>
                <CardDescription>
                  You haven't added any locations yet. Add your first location to start tracking reviews.
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Button onClick={() => setAddLocationOpen(true)} aria-label="Add Location">
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Your First Location
                </Button>
              </CardFooter>
            </Card>
          )}
        </TabsContent>

        {/* Users Tab - Only visible to admins */}
        {permissions?.canManageUsers && (
          <TabsContent value="users" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Manage Users</h2>
              <Dialog open={addUserOpen} onOpenChange={setAddUserOpen}>
                <DialogTrigger asChild>
                  <Button aria-label="Add User"><PlusCircle className="mr-2 h-4 w-4" /> Add User</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Add New User</DialogTitle>
                    <DialogDescription>
                      Create a new user account with appropriate permissions.
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...userForm}>
                    <form onSubmit={userForm.handleSubmit(onUserSubmit)} className="space-y-4">
                      <FormField
                        control={userForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username*</FormLabel>
                            <FormControl>
                              <Input placeholder="johndoe" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={userForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email*</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="john.doe@example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={userForm.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name*</FormLabel>
                            <FormControl>
                              <Input placeholder="John Doe" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={userForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password*</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="••••••••" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={userForm.control}
                        name="role"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Role*</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a role" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="staff">Staff</SelectItem>
                                <SelectItem value="user">User</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Admin: Full access to all features
                              <br />
                              Staff: Can manage locations and reviews
                              <br />
                              User: Basic access to own data
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <DialogFooter>
                        <Button type="submit" disabled={addUserMutation.isPending} aria-label="Add User">
                          {addUserMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Add User
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>

            {usersLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : users && users.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Username</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user: User) => (
                      <TableRow key={user.id} className={!user.isActive ? "opacity-50" : ""}>
                        <TableCell className="font-medium">{user.fullName}</TableCell>
                        <TableCell>{user.username}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant={user.role === 'admin' ? "default" : 
                                        user.role === 'staff' ? "outline" : "secondary"}>
                            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.isActive ? "default" : "destructive"}>
                            {user.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            {/* Change Role Dialog */}
                            <Dialog open={roleDialogOpen === user.id} onOpenChange={(open) => !open && setRoleDialogOpen(null)}>
                              <DialogTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => setRoleDialogOpen(user.id)}
                                  disabled={user.id === user?.id}
                                  aria-label="Change Role"
                                >
                                  <UserCog className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                  <DialogTitle>Change User Role</DialogTitle>
                                  <DialogDescription>
                                    Update the role for user {user.fullName}.
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                  <div className="space-y-2">
                                    <h3 className="text-sm font-medium">Current Role: {user.role}</h3>
                                    <div className="grid grid-cols-3 gap-2">
                                      <Button 
                                        variant={user.role === 'admin' ? 'default' : 'outline'} 
                                        onClick={() => updateUserRoleMutation.mutate({ userId: user.id, role: 'admin' })}
                                      >
                                        Admin
                                      </Button>
                                      <Button 
                                        variant={user.role === 'staff' ? 'default' : 'outline'} 
                                        onClick={() => updateUserRoleMutation.mutate({ userId: user.id, role: 'staff' })}
                                      >
                                        Staff
                                      </Button>
                                      <Button 
                                        variant={user.role === 'user' ? 'default' : 'outline'} 
                                        onClick={() => updateUserRoleMutation.mutate({ userId: user.id, role: 'user' })}
                                      >
                                        User
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                                <DialogFooter>
                                  <Button variant="outline" onClick={() => setRoleDialogOpen(null)}>Cancel</Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>

                            {/* Change Status Dialog */}
                            <Dialog open={statusDialogOpen === user.id} onOpenChange={(open) => !open && setStatusDialogOpen(null)}>
                              <DialogTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => setStatusDialogOpen(user.id)}
                                  disabled={user.id === user?.id}
                                  aria-label="Change Status"
                                >
                                  <Switch checked={user.isActive} />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                  <DialogTitle>Change User Status</DialogTitle>
                                  <DialogDescription>
                                    {user.isActive 
                                      ? "Deactivating this user will prevent them from accessing the system."
                                      : "Activating this user will restore their access to the system."}
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="py-6 flex items-center justify-center space-x-2">
                                  <Switch 
                                    checked={user.isActive}
                                    onCheckedChange={(checked) => {
                                      updateUserStatusMutation.mutate({ userId: user.id, isActive: checked });
                                    }}
                                  />
                                  <span>{user.isActive ? "Active" : "Inactive"}</span>
                                </div>
                                <DialogFooter>
                                  <Button variant="outline" onClick={() => setStatusDialogOpen(null)}>Cancel</Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>No Additional Users Found</CardTitle>
                  <CardDescription>
                    You haven't added any additional users yet. Add users to give them access to the system.
                  </CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button onClick={() => setAddUserOpen(true)} aria-label="Add User">
                    <PlusCircle className="mr-2 h-4 w-4" /> Add User
                  </Button>
                </CardFooter>
              </Card>
            )}
          </TabsContent>
        )}

        {/* Account Tab */}
        <TabsContent value="account" className="space-y-6">
          <h2 className="text-2xl font-bold">Account Settings</h2>
          
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your personal information and account settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Full Name</h3>
                  <p className="text-sm text-muted-foreground">{user?.fullName || 'N/A'}</p>
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Email</h3>
                  <p className="text-sm text-muted-foreground">{user?.email || 'N/A'}</p>
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Username</h3>
                  <p className="text-sm text-muted-foreground">{user?.username || 'N/A'}</p>
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Role</h3>
                  <p className="text-sm text-muted-foreground">
                    {user?.role ? (
                      <Badge variant={user.role === 'admin' ? "default" :
                                      user.role === 'staff' ? "outline" : "secondary"}>
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </Badge>
                    ) : 'N/A'}
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              {/* // TODO: Implement "Edit Profile" functionality. */}
              <Button variant="outline" aria-label="Edit Profile">Edit Profile</Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>
                Update your password to maintain account security
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* // TODO: Implement "Change Password" functionality (including form handling and API call). Define and verify API endpoints. */}
              <div className="space-y-4">
                <div className="grid gap-2">
                  {/* FIXED: Use FormLabel directly */}
                  <FormLabel htmlFor="current-password">Current Password</FormLabel>
                  <Input id="current-password" type="password" />
                </div>
                <div className="grid gap-2">
                  {/* FIXED: Use FormLabel directly */}
                  <FormLabel htmlFor="new-password">New Password</FormLabel>
                  <Input id="new-password" type="password" />
                </div>
                <div className="grid gap-2">
                  {/* FIXED: Use FormLabel directly */}
                  <FormLabel htmlFor="confirm-password">Confirm New Password</FormLabel>
                  <Input id="confirm-password" type="password" />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button aria-label="Change Password">Change Password</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;