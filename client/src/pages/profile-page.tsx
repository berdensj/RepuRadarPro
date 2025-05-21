import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCaption,
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
} from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Lock, 
  CreditCard, 
  Bell, 
  CheckCircle2, 
  LogOut, 
  Loader2, 
  Upload,
  Trash2,
  ExternalLink
} from 'lucide-react';

// Profile update schema
const profileFormSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  profilePicture: z.string().optional(),
  companyName: z.string().optional(),
  jobTitle: z.string().optional(),
  phone: z.string().optional(),
});

// Password update schema
const passwordFormSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(8, 'Password must be at least 8 characters'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Notification settings schema
const notificationSettingsSchema = z.object({
  emailNotifications: z.boolean().default(true),
  smsNotifications: z.boolean().default(false),
  reviewAlerts: z.boolean().default(true),
  weeklyReports: z.boolean().default(true),
  marketingEmails: z.boolean().default(false),
});

const ProfilePage = () => {
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [timeZone, setTimeZone] = useState('America/New_York');

  // Profile Form
  const profileForm = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      fullName: user?.fullName || '',
      email: user?.email || '',
      username: user?.username || '',
      profilePicture: user?.profilePicture || '',
      companyName: '',
      jobTitle: '',
      phone: '',
    }
  });

  // Password Form
  const passwordForm = useForm<z.infer<typeof passwordFormSchema>>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    }
  });
  
  // Notification Settings Form
  const notificationForm = useForm<z.infer<typeof notificationSettingsSchema>>({
    resolver: zodResolver(notificationSettingsSchema),
    defaultValues: {
      emailNotifications: true,
      smsNotifications: false,
      reviewAlerts: true,
      weeklyReports: true,
      marketingEmails: false,
    }
  });

  // Update Profile Mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (values: z.infer<typeof profileFormSchema>) => {
      const res = await apiRequest('PATCH', '/api/user/profile', values);
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['/api/user'], data);
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been updated successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Update Failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Change Password Mutation
  const changePasswordMutation = useMutation({
    mutationFn: async (values: z.infer<typeof passwordFormSchema>) => {
      const { currentPassword, newPassword } = values;
      const res = await apiRequest('POST', '/api/user/change-password', { 
        currentPassword, 
        newPassword 
      });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Password Changed',
        description: 'Your password has been changed successfully.',
      });
      passwordForm.reset();
      setIsChangingPassword(false);
    },
    onError: (error: Error) => {
      toast({
        title: 'Password Change Failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Update Notification Settings Mutation
  const updateNotificationsMutation = useMutation({
    mutationFn: async (values: z.infer<typeof notificationSettingsSchema>) => {
      const res = await apiRequest('PATCH', '/api/user/notifications', values);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Notifications Updated',
        description: 'Your notification preferences have been updated.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Update Failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Delete Account Mutation
  const deleteAccountMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('DELETE', '/api/user/account');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      queryClient.setQueryData(['/api/user'], null);
      window.location.href = '/auth';
    },
    onError: (error: Error) => {
      toast({
        title: 'Account Deletion Failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Handle form submissions
  const onProfileSubmit = (values: z.infer<typeof profileFormSchema>) => {
    updateProfileMutation.mutate(values);
  };

  const onPasswordSubmit = (values: z.infer<typeof passwordFormSchema>) => {
    changePasswordMutation.mutate(values);
  };

  const onNotificationSubmit = (values: z.infer<typeof notificationSettingsSchema>) => {
    updateNotificationsMutation.mutate(values);
  };

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Image upload functionality would be implemented here
    setUploadingImage(true);
    setTimeout(() => {
      setUploadingImage(false);
      profileForm.setValue('profilePicture', 'https://example.com/uploads/profile.jpg');
      toast({
        title: 'Image Uploaded',
        description: 'Your profile picture has been updated.',
      });
    }, 1500);
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  // Get user's initials for avatar fallback
  const getInitials = () => {
    if (!user?.fullName) return 'U';
    
    const names = user.fullName.split(' ');
    if (names.length === 1) return names[0].charAt(0);
    return `${names[0].charAt(0)}${names[names.length - 1].charAt(0)}`;
  };

  const getSubscriptionBadge = (plan: string | undefined) => {
    switch (plan?.toLowerCase()) {
      case 'pro':
        return <Badge className="bg-blue-100 text-blue-800">Pro Plan</Badge>;
      case 'business':
        return <Badge className="bg-purple-100 text-purple-800">Business Plan</Badge>;
      case 'enterprise':
        return <Badge className="bg-indigo-100 text-indigo-800">Enterprise Plan</Badge>;
      default:
        return <Badge variant="outline">Free Plan</Badge>;
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-8">
      <h1 className="text-3xl font-bold">Profile Settings</h1>
      
      <Tabs defaultValue="account" className="space-y-6">
        <TabsList>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>
        
        {/* Account Tab */}
        <TabsContent value="account" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_3fr] gap-6">
            {/* Profile Picture Card */}
            <Card>
              <CardHeader>
                <CardTitle>Profile Picture</CardTitle>
                <CardDescription>
                  This is how others see you on the platform.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center space-y-4">
                <Avatar className="h-32 w-32">
                  <AvatarImage src={user?.profilePicture || ''} alt={user?.fullName || ''} />
                  <AvatarFallback className="text-3xl">{getInitials()}</AvatarFallback>
                </Avatar>
                
                <div className="flex flex-col items-center gap-2">
                  <label htmlFor="profile-upload" className="cursor-pointer">
                    <div className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md">
                      {uploadingImage ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4" />
                      )}
                      <span>{uploadingImage ? 'Uploading...' : 'Upload Image'}</span>
                    </div>
                    <input
                      id="profile-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                    />
                  </label>
                  
                  {user?.profilePicture && (
                    <Button variant="outline" size="sm" onClick={() => profileForm.setValue('profilePicture', '')}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remove Picture
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* Profile Info Card */}
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  Update your account details and profile information.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...profileForm}>
                  <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={profileForm.control}
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
                        control={profileForm.control}
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
                    </div>
                    
                    <FormField
                      control={profileForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <Input placeholder="john.doe@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={profileForm.control}
                        name="companyName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Company Name (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="Acme Inc." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={profileForm.control}
                        name="jobTitle"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Job Title (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="Marketing Manager" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={profileForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="+1 (555) 123-4567" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      className="mt-4"
                      disabled={updateProfileMutation.isPending}
                    >
                      {updateProfileMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Save Changes
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
          
          {/* General Settings */}
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Manage your account settings and preferences.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium">Language</h3>
                  <p className="text-sm text-muted-foreground">
                    Set your preferred language for the interface.
                  </p>
                </div>
                <Select defaultValue="en-US">
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en-US">English (US)</SelectItem>
                    <SelectItem value="en-GB">English (UK)</SelectItem>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="de">Deutsch</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium">Time Zone</h3>
                  <p className="text-sm text-muted-foreground">
                    Set your time zone to see the correct local times.
                  </p>
                </div>
                <Select 
                  defaultValue={timeZone} 
                  onValueChange={setTimeZone}
                >
                  <SelectTrigger className="w-60">
                    <SelectValue placeholder="Select time zone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                    <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                    <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                    <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                    <SelectItem value="Europe/London">Greenwich Mean Time (GMT)</SelectItem>
                    <SelectItem value="Europe/Paris">Central European Time (CET)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Separator />
              
              <div className="flex flex-col space-y-2">
                <h3 className="text-sm font-medium">Data Export</h3>
                <p className="text-sm text-muted-foreground">
                  Download a copy of your data from Reputation Sentinel.
                </p>
                <div className="flex space-x-2 mt-2">
                  <Button variant="outline">
                    Export All Data
                  </Button>
                  <Button variant="outline">
                    Download Reviews
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Password</CardTitle>
              <CardDescription>
                Change your password to keep your account secure.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...passwordForm}>
                <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                  <FormField
                    control={passwordForm.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={passwordForm.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormDescription>
                          Password must be at least 8 characters long.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={passwordForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm New Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    disabled={changePasswordMutation.isPending}
                  >
                    {changePasswordMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Change Password
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Session History</CardTitle>
              <CardDescription>
                See where you're currently logged in and manage your sessions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[180px]">Device</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Last Active</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <span>Chrome on Windows</span>
                        <Badge variant="outline" className="ml-2">Current</Badge>
                      </div>
                    </TableCell>
                    <TableCell>New York, USA</TableCell>
                    <TableCell>102.45.67.89</TableCell>
                    <TableCell>Now</TableCell>
                    <TableCell className="text-right">
                      -
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Safari on iPhone</TableCell>
                    <TableCell>New York, USA</TableCell>
                    <TableCell>102.45.67.90</TableCell>
                    <TableCell>Yesterday at 2:30 PM</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        Sign out
                      </Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Firefox on Mac</TableCell>
                    <TableCell>Boston, USA</TableCell>
                    <TableCell>98.35.67.123</TableCell>
                    <TableCell>May 5, 2025</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        Sign out
                      </Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
              
              <div className="mt-4">
                <Button variant="outline" className="w-full">
                  Sign out of all other sessions
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Two-Factor Authentication</CardTitle>
              <CardDescription>
                Add an extra layer of security to your account by enabling two-factor authentication.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <Lock className="h-8 w-8 text-primary" />
                <div className="flex-1">
                  <h3 className="text-lg font-medium">Two-Factor Authentication</h3>
                  <p className="text-sm text-muted-foreground">
                    Protect your account with an additional authentication step.
                  </p>
                </div>
                <Button>Enable</Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
              <CardDescription>
                Permanently delete your account and all of your data.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                This action is irreversible and will permanently delete your account, 
                all your reviews, and all associated data. This cannot be undone.
              </p>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">Delete Account</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your account
                      and remove all your data from our servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => deleteAccountMutation.mutate()}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {deleteAccountMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Deleting...
                        </>
                      ) : (
                        "Delete Account"
                      )}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Billing Tab */}
        <TabsContent value="billing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Subscription</CardTitle>
              <CardDescription>
                Manage your subscription and billing information.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col space-y-2">
                <h3 className="text-lg font-medium">Current Plan</h3>
                <div className="flex justify-between items-center">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Pro Plan</span>
                      <Badge className="bg-blue-100 text-blue-800">Active</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Renews on June 1, 2025
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold">$29.99/month</div>
                    <div className="text-sm text-muted-foreground">
                      Billed monthly
                    </div>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Plan Features</h3>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span>Track up to 50 reviews</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span>10 review response templates</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span>Weekly reports and analytics</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span>Email notifications</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span>Priority support</span>
                  </li>
                </ul>
              </div>
              
              <div className="flex flex-col space-y-2">
                <div className="flex gap-2">
                  <Button>Change Plan</Button>
                  <Button variant="outline">Cancel Subscription</Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
              <CardDescription>
                Manage your payment methods and billing information.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <CreditCard className="h-8 w-8 text-primary" />
                  <div>
                    <h3 className="text-sm font-medium">Visa ending in 4242</h3>
                    <p className="text-sm text-muted-foreground">
                      Expires 12/2025
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm">
                    Edit
                  </Button>
                  <Button variant="ghost" size="sm">
                    Remove
                  </Button>
                </div>
              </div>
              
              <Separator />
              
              <Button variant="outline">
                <CreditCard className="mr-2 h-4 w-4" />
                Add Payment Method
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Billing History</CardTitle>
              <CardDescription>
                View your previous invoices and payment history.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Invoice</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">#INV-1234</TableCell>
                    <TableCell>May 1, 2025</TableCell>
                    <TableCell>$29.99</TableCell>
                    <TableCell>
                      <Badge className="bg-green-100 text-green-800">Paid</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">#INV-1233</TableCell>
                    <TableCell>Apr 1, 2025</TableCell>
                    <TableCell>$29.99</TableCell>
                    <TableCell>
                      <Badge className="bg-green-100 text-green-800">Paid</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">#INV-1232</TableCell>
                    <TableCell>Mar 1, 2025</TableCell>
                    <TableCell>$29.99</TableCell>
                    <TableCell>
                      <Badge className="bg-green-100 text-green-800">Paid</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                View All Invoices
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Manage how and when you receive notifications from Reputation Sentinel.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...notificationForm}>
                <form onSubmit={notificationForm.handleSubmit(onNotificationSubmit)} className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2 items-start">
                        <Bell className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <h3 className="text-sm font-medium">Email Notifications</h3>
                          <p className="text-sm text-muted-foreground">
                            Receive notifications via email.
                          </p>
                        </div>
                      </div>
                      <FormField
                        control={notificationForm.control}
                        name="emailNotifications"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-y-0 space-x-2">
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2 items-start">
                        <Bell className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <h3 className="text-sm font-medium">SMS Notifications</h3>
                          <p className="text-sm text-muted-foreground">
                            Receive notifications via text message.
                          </p>
                        </div>
                      </div>
                      <FormField
                        control={notificationForm.control}
                        name="smsNotifications"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-y-0 space-x-2">
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <Separator />
                    
                    <h3 className="text-sm font-medium">Notification Types</h3>
                    
                    <div className="pl-6 space-y-2">
                      <FormField
                        control={notificationForm.control}
                        name="reviewAlerts"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between space-y-0">
                            <div>
                              <FormLabel className="font-normal">New Review Alerts</FormLabel>
                              <FormDescription>
                                Receive notifications for new reviews.
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={notificationForm.control}
                        name="weeklyReports"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between space-y-0">
                            <div>
                              <FormLabel className="font-normal">Weekly Reports</FormLabel>
                              <FormDescription>
                                Receive weekly summary reports of your reviews.
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={notificationForm.control}
                        name="marketingEmails"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between space-y-0">
                            <div>
                              <FormLabel className="font-normal">Marketing Emails</FormLabel>
                              <FormDescription>
                                Receive product updates and promotional emails.
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    disabled={updateNotificationsMutation.isPending}
                  >
                    {updateNotificationsMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Notification Settings
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProfilePage;