import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Search, 
  PlusCircle, 
  Trash2, 
  Edit, 
  AlertTriangle,
  Shield,
  ShieldCheck,
  ShieldAlert,
  ShieldQuestion,
  UserPlus,
  Info
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

interface Role {
  id: number;
  name: string;
  description: string;
  userCount: number;
  isBuiltIn: boolean;
  permissions: Permission[];
}

interface Permission {
  id: string;
  name: string;
  description: string;
  module: string;
  granted: boolean;
}

interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: string;
  isActive: boolean;
  permissions?: string[];
  createdAt: string;
  profilePicture?: string | null;
}

export default function AdminRolesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddRoleDialogOpen, setIsAddRoleDialogOpen] = useState(false);
  const [isManageUserRoleDialogOpen, setIsManageUserRoleDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleDescription, setNewRoleDescription] = useState("");
  const [selectedTab, setSelectedTab] = useState("roles");
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Fetch roles
  const { data: roles, isLoading: isLoadingRoles } = useQuery<Role[]>({
    queryKey: ["/api/admin/roles"],
  });
  
  // Fetch users
  const { data: users, isLoading: isLoadingUsers } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
  });
  
  // Mock permissions grouped by module
  const permissionModules = [
    {
      name: "Dashboard",
      permissions: [
        { id: "dashboard.view", name: "View Dashboard", description: "View main dashboard and statistics" },
        { id: "dashboard.export", name: "Export Dashboard Data", description: "Export dashboard data in various formats" }
      ]
    },
    {
      name: "Users",
      permissions: [
        { id: "users.view", name: "View Users", description: "View user profiles and information" },
        { id: "users.create", name: "Create Users", description: "Create new user accounts" },
        { id: "users.edit", name: "Edit Users", description: "Edit existing user information" },
        { id: "users.delete", name: "Delete Users", description: "Delete user accounts" },
        { id: "users.impersonate", name: "Impersonate Users", description: "Login as another user for support purposes" }
      ]
    },
    {
      name: "Reviews",
      permissions: [
        { id: "reviews.view", name: "View Reviews", description: "View all customer reviews" },
        { id: "reviews.respond", name: "Respond to Reviews", description: "Create and edit responses to reviews" },
        { id: "reviews.delete", name: "Delete Reviews", description: "Delete reviews from the system" }
      ]
    },
    {
      name: "Customers",
      permissions: [
        { id: "customers.view", name: "View Customers", description: "View customer data" },
        { id: "customers.create", name: "Create Customers", description: "Create new customer accounts" },
        { id: "customers.edit", name: "Edit Customers", description: "Edit customer information" },
        { id: "customers.delete", name: "Delete Customers", description: "Delete customer accounts" }
      ]
    },
    {
      name: "Analytics",
      permissions: [
        { id: "analytics.view", name: "View Analytics", description: "View analytics data and reports" },
        { id: "analytics.export", name: "Export Analytics", description: "Export analytics data" }
      ]
    },
    {
      name: "Settings",
      permissions: [
        { id: "settings.view", name: "View Settings", description: "View system settings" },
        { id: "settings.edit", name: "Edit Settings", description: "Modify system settings" }
      ]
    },
    {
      name: "Integrations",
      permissions: [
        { id: "integrations.view", name: "View Integrations", description: "View all system integrations" },
        { id: "integrations.configure", name: "Configure Integrations", description: "Set up and configure integrations" }
      ]
    }
  ];
  
  // Add Role Mutation
  const addRoleMutation = useMutation({
    mutationFn: async (newRole: { name: string; description: string }) => {
      // In a real app, you would call the API here
      // For this demo, we'll mock it
      console.log("Adding role:", newRole);
      return { ...newRole, id: Math.floor(Math.random() * 1000), userCount: 0, isBuiltIn: false };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/roles"] });
      toast({
        title: "Role added",
        description: "The new role has been created successfully.",
      });
      setIsAddRoleDialogOpen(false);
      setNewRoleName("");
      setNewRoleDescription("");
    },
    onError: (error: any) => {
      toast({
        title: "Error adding role",
        description: error.message || "Failed to add role. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  // Update User Role Mutation
  const updateUserRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: number; role: string }) => {
      // In a real app, you would call the API here
      console.log("Updating user role:", { userId, role });
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "User role updated",
        description: "The user's role has been updated successfully.",
      });
      setIsManageUserRoleDialogOpen(false);
      setSelectedUserId(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error updating user role",
        description: error.message || "Failed to update user role. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  // Update Role Permissions Mutation
  const updateRolePermissionsMutation = useMutation({
    mutationFn: async ({ roleId, permissions }: { roleId: number; permissions: string[] }) => {
      // In a real app, you would call the API here
      console.log("Updating role permissions:", { roleId, permissions });
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/roles"] });
      toast({
        title: "Permissions updated",
        description: "The role permissions have been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error updating permissions",
        description: error.message || "Failed to update permissions. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  // Filter roles by search query
  const filteredRoles = roles
    ? roles.filter(role => 
        role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        role.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];
    
  // Filter users by search query
  const filteredUsers = users
    ? users.filter(user => 
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.role.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];
  
  const handleAddRole = () => {
    if (!newRoleName.trim()) {
      toast({
        title: "Validation error",
        description: "Role name is required.",
        variant: "destructive",
      });
      return;
    }
    
    addRoleMutation.mutate({
      name: newRoleName,
      description: newRoleDescription,
    });
  };
  
  const handleUpdateUserRole = (newRole: string) => {
    if (!selectedUserId) return;
    
    updateUserRoleMutation.mutate({
      userId: selectedUserId,
      role: newRole,
    });
  };
  
  const handleOpenUserRoleDialog = (userId: number) => {
    setSelectedUserId(userId);
    setIsManageUserRoleDialogOpen(true);
  };
  
  const handleTogglePermission = (role: Role, permissionId: string, granted: boolean) => {
    if (!role) return;
    
    const updatedPermissions = role.permissions.map(p => 
      p.id === permissionId ? { ...p, granted } : p
    );
    
    updateRolePermissionsMutation.mutate({
      roleId: role.id,
      permissions: updatedPermissions.filter(p => p.granted).map(p => p.id),
    });
  };
  
  const renderRoleIcon = (roleName: string) => {
    const name = roleName.toLowerCase();
    
    if (name.includes("admin") || name === "administrator") {
      return <ShieldAlert className="h-5 w-5 text-red-500" />;
    } else if (name.includes("manager")) {
      return <ShieldCheck className="h-5 w-5 text-amber-500" />;
    } else if (name.includes("staff") || name.includes("support")) {
      return <Shield className="h-5 w-5 text-blue-500" />;
    } else if (name.includes("viewer") || name.includes("guest")) {
      return <ShieldQuestion className="h-5 w-5 text-gray-500" />;
    } else {
      return <Shield className="h-5 w-5 text-gray-500" />;
    }
  };
  
  return (
    <AdminLayout pageTitle="Role Management">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Role-Based Access Control</h2>
            <p className="text-muted-foreground">
              Manage roles and permissions to control system access
            </p>
          </div>
          
          <div className="flex gap-2">
            <Dialog open={isAddRoleDialogOpen} onOpenChange={setIsAddRoleDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <PlusCircle className="h-4 w-4" />
                  Add Role
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Role</DialogTitle>
                  <DialogDescription>
                    Define a new role with specific access permissions.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="roleName">Role Name</Label>
                    <Input 
                      id="roleName" 
                      placeholder="e.g., Support Agent" 
                      value={newRoleName}
                      onChange={(e) => setNewRoleName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="roleDescription">Description</Label>
                    <Input 
                      id="roleDescription" 
                      placeholder="e.g., Staff who handle customer support tasks" 
                      value={newRoleDescription}
                      onChange={(e) => setNewRoleDescription(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button 
                    onClick={handleAddRole}
                    disabled={addRoleMutation.isPending}
                  >
                    {addRoleMutation.isPending ? "Creating..." : "Create Role"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="roles">Roles</TabsTrigger>
            <TabsTrigger value="users">User Assignments</TabsTrigger>
          </TabsList>
          
          {/* Roles Tab */}
          <TabsContent value="roles" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex flex-col md:flex-row justify-between gap-4 md:items-center">
                  <div>
                    <CardTitle>System Roles</CardTitle>
                    <CardDescription>
                      Define and configure roles with specific permissions
                    </CardDescription>
                  </div>
                  <div className="relative w-full md:w-64">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search roles..."
                      className="w-full pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[180px]">Role</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="w-[100px] text-center">Users</TableHead>
                      <TableHead className="w-[180px]">Status</TableHead>
                      <TableHead className="text-right w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoadingRoles ? (
                      Array(4).fill(0).map((_, i) => (
                        <TableRow key={i}>
                          <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                          <TableCell><Skeleton className="h-6 w-full" /></TableCell>
                          <TableCell className="text-center"><Skeleton className="h-6 w-12 mx-auto" /></TableCell>
                          <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                          <TableCell className="text-right"><Skeleton className="h-6 w-16 ml-auto" /></TableCell>
                        </TableRow>
                      ))
                    ) : filteredRoles.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          No roles found matching your search
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredRoles.map((role) => (
                        <TableRow key={role.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {renderRoleIcon(role.name)}
                              <span className="font-medium">{role.name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {role.description}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline" className="text-primary">
                              {role.userCount}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {role.isBuiltIn ? (
                              <Badge variant="outline" className="border-amber-500 text-amber-600 gap-1 flex items-center w-fit">
                                <Info className="h-3 w-3" />
                                Built-in (Protected)
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="border-green-500 text-green-600 gap-1 flex items-center w-fit">
                                Custom
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <Edit className="h-4 w-4" />
                                  <span className="sr-only">Open menu</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => setSelectedRole(role)}>
                                  Edit Permissions
                                </DropdownMenuItem>
                                <DropdownMenuItem>Duplicate Role</DropdownMenuItem>
                                {!role.isBuiltIn && (
                                  <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="text-red-600">
                                      Delete Role
                                    </DropdownMenuItem>
                                  </>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            
            {/* Role Permission Editor */}
            {selectedRole && (
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {renderRoleIcon(selectedRole.name)}
                        <span>Permissions for {selectedRole.name}</span>
                      </CardTitle>
                      <CardDescription>{selectedRole.description}</CardDescription>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setSelectedRole(null)}
                    >
                      Close
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Role Info */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Role Type</p>
                        <p className="text-sm text-muted-foreground">
                          {selectedRole.isBuiltIn ? 'Built-in (System Protected)' : 'Custom Role'}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Users Assigned</p>
                        <p className="text-sm text-muted-foreground">
                          {selectedRole.userCount} user{selectedRole.userCount !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Last Modified</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date().toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <Separator />
                    
                    {/* Permission Groups */}
                    {selectedRole.isBuiltIn && (
                      <div className="bg-amber-50 border border-amber-200 rounded-md p-3 mb-4 flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
                        <div>
                          <h5 className="text-sm font-medium text-amber-800">Built-in Role</h5>
                          <p className="text-xs text-amber-700 mt-1">
                            This is a system built-in role. Some permissions cannot be modified to 
                            ensure system stability and security.
                          </p>
                        </div>
                      </div>
                    )}
                    
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium">Permission Settings</h3>
                        <Switch 
                          id="airplane-mode" 
                          disabled={selectedRole.isBuiltIn}
                        />
                      </div>
                      
                      <Accordion type="multiple" className="w-full">
                        {permissionModules.map((module) => (
                          <AccordionItem key={module.name} value={module.name}>
                            <AccordionTrigger className="hover:no-underline">
                              <span className="text-sm font-medium">{module.name} Permissions</span>
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="space-y-4 pt-2">
                                {module.permissions.map((permission) => (
                                  <div 
                                    key={permission.id} 
                                    className="flex items-start space-x-3 p-2 rounded-md hover:bg-muted/40"
                                  >
                                    <Checkbox 
                                      id={permission.id}
                                      disabled={selectedRole.isBuiltIn && 
                                        (permission.id.includes('admin') || permission.id.includes('delete'))}
                                      defaultChecked={Math.random() > 0.3}
                                      onCheckedChange={(checked) => 
                                        handleTogglePermission(selectedRole, permission.id, !!checked)
                                      }
                                    />
                                    <div className="space-y-1 leading-none">
                                      <Label
                                        htmlFor={permission.id}
                                        className="text-sm font-medium cursor-pointer"
                                      >
                                        {permission.name}
                                      </Label>
                                      <p className="text-xs text-muted-foreground">
                                        {permission.description}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          {/* Users Tab */}
          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex flex-col md:flex-row justify-between gap-4 md:items-center">
                  <div>
                    <CardTitle>User Role Assignments</CardTitle>
                    <CardDescription>
                      Manage which users have specific roles and permissions
                    </CardDescription>
                  </div>
                  <div className="relative w-full md:w-64">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search users..."
                      className="w-full pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[250px]">User</TableHead>
                      <TableHead className="w-[180px]">Current Role</TableHead>
                      <TableHead className="w-[120px]">Status</TableHead>
                      <TableHead>Last Changed</TableHead>
                      <TableHead className="text-right w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoadingUsers ? (
                      Array(5).fill(0).map((_, i) => (
                        <TableRow key={i}>
                          <TableCell><Skeleton className="h-6 w-36" /></TableCell>
                          <TableCell><Skeleton className="h-6 w-28" /></TableCell>
                          <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                          <TableCell><Skeleton className="h-6 w-28" /></TableCell>
                          <TableCell className="text-right"><Skeleton className="h-6 w-16 ml-auto" /></TableCell>
                        </TableRow>
                      ))
                    ) : filteredUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          No users found matching your search
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                {user.profilePicture ? (
                                  <AvatarImage src={user.profilePicture} alt={user.fullName} />
                                ) : (
                                  <AvatarFallback>
                                    {user.fullName.charAt(0)}
                                  </AvatarFallback>
                                )}
                              </Avatar>
                              <div>
                                <p className="font-medium">{user.fullName}</p>
                                <p className="text-xs text-muted-foreground">{user.email}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {renderRoleIcon(user.role)}
                              <span className="text-sm">{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {user.isActive ? (
                              <Badge variant="outline" className="border-green-500 text-green-500 flex items-center gap-1 w-fit">
                                Active
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="border-red-500 text-red-500 flex items-center gap-1 w-fit">
                                Inactive
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-muted-foreground">
                              {new Date(user.createdAt).toLocaleDateString()}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-8 w-8 p-0"
                              onClick={() => handleOpenUserRoleDialog(user.id)}
                            >
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Edit user role</span>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        {/* Dialog for Editing User Roles */}
        <Dialog 
          open={isManageUserRoleDialogOpen} 
          onOpenChange={setIsManageUserRoleDialogOpen}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Change User Role</DialogTitle>
              <DialogDescription>
                Assign a different role to this user to modify their access permissions.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {selectedUserId && users && (
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>
                        {(users.find(u => u.id === selectedUserId)?.fullName || "").charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {users.find(u => u.id === selectedUserId)?.fullName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {users.find(u => u.id === selectedUserId)?.email}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="userRole">Select Role</Label>
                    <Select 
                      defaultValue={users.find(u => u.id === selectedUserId)?.role}
                      onValueChange={handleUpdateUserRole}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Administrator</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="staff">Staff</SelectItem>
                        <SelectItem value="user">User</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="mt-6 bg-amber-50 border border-amber-200 rounded-md p-3 text-sm">
                    <div className="flex">
                      <AlertTriangle className="h-5 w-5 text-amber-500 mr-2 mt-0.5" />
                      <div>
                        <p className="font-medium text-amber-800">Changing a user's role:</p>
                        <ul className="list-disc pl-5 mt-1 text-amber-700 text-xs space-y-1">
                          <li>Will immediately affect their access permissions</li>
                          <li>Will log them out if they are currently logged in</li>
                          <li>Will be recorded in the admin audit log</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button 
                disabled={updateUserRoleMutation.isPending}
                onClick={() => {
                  if (!selectedUserId || !users) return;
                  const user = users.find(u => u.id === selectedUserId);
                  if (user) {
                    handleUpdateUserRole(user.role);
                  }
                }}
              >
                {updateUserRoleMutation.isPending ? "Updating..." : "Update Role"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}