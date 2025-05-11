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
          
          {/* General Preferences Card */}
          <Card>
            <CardHeader>
              <CardTitle>General Preferences</CardTitle>
              <CardDescription>
                Customize your account settings and preferences.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col space-y-3">
                <h3 className="text-sm font-medium leading-none">Time Zone</h3>
                <p className="text-sm text-muted-foreground">
                  Choose your local time zone to ensure that your reports and notifications are delivered at appropriate times.
                </p>
                <Select
                  value={timeZone}
                  onValueChange={setTimeZone}
                >
                  <SelectTrigger className="w-full sm:w-[300px]">
                    <SelectValue placeholder="Select time zone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="America/New_York">Eastern Time (US & Canada)</SelectItem>
                    <SelectItem value="America/Chicago">Central Time (US & Canada)</SelectItem>
                    <SelectItem value="America/Denver">Mountain Time (US & Canada)</SelectItem>
                    <SelectItem value="America/Los_Angeles">Pacific Time (US & Canada)</SelectItem>
                    <SelectItem value="America/Anchorage">Alaska</SelectItem>
                    <SelectItem value="America/Honolulu">Hawaii</SelectItem>
                    <SelectItem value="Europe/London">London</SelectItem>
                    <SelectItem value="Europe/Paris">Paris</SelectItem>
                    <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                    <SelectItem value="Australia/Sydney">Sydney</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h3 className="text-sm font-medium leading-none">Language</h3>
                  <p className="text-sm text-muted-foreground">
                    Set your preferred language for the platform interface.
                  </p>
                </div>
                <Select defaultValue="en-US">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en-US">English (US)</SelectItem>
                    <SelectItem value="en-GB">English (UK)</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="de">German</SelectItem>
                    <SelectItem value="pt">Portuguese</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Separator />
              
              <div className="flex flex-row items-center justify-between rounded-lg">
                <div className="space-y-0.5">
                  <h3 className="text-sm font-medium leading-none">Email Digests</h3>
                  <p className="text-sm text-muted-foreground">Receive a digest of your activity.</p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <Separator />
              
              <div className="flex flex-row items-center justify-between rounded-lg">
                <div className="space-y-0.5">
                  <h3 className="text-sm font-medium leading-none">Auto-Refresh Dashboard</h3>
                  <p className="text-sm text-muted-foreground">Automatically refresh dashboard data.</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
          
          {/* Account Management Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-red-600">Account Management</CardTitle>
              <CardDescription>
                Manage your account status and subscription.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center py-2">
                <div>
                  <h3 className="text-sm font-medium">Delete Account</h3>
                  <p className="text-sm text-muted-foreground">
                    Permanently delete your account and all your data.
                  </p>
                </div>
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
                        {deleteAccountMutation.isPending && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Delete Account
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
              
              <div className="flex justify-between items-center py-2">
                <div>
                  <h3 className="text-sm font-medium">Log Out</h3>
                  <p className="text-sm text-muted-foreground">
                    Sign out of your account on this device.
                  </p>
                </div>
                <Button variant="outline" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Log Out
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>
                Update your password to keep your account secure.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...passwordForm}>
                <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6">
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
                    className="mt-4"
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
              <CardTitle>Two-Factor Authentication</CardTitle>
              <CardDescription>
                Add an extra layer of security to your account.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h3 className="text-sm font-medium">Email Authentication</h3>
                  <p className="text-sm text-muted-foreground">Receive a code via email when signing in.</p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h3 className="text-sm font-medium">Authenticator App</h3>
                  <p className="text-sm text-muted-foreground">Use an authenticator app to generate codes.</p>
                </div>
                <Button variant="outline">Set Up</Button>
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h3 className="text-sm font-medium">SMS Authentication</h3>
                  <p className="text-sm text-muted-foreground">Receive a code via SMS when signing in.</p>
                </div>
                <Button variant="outline">Set Up</Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Login Sessions</CardTitle>
              <CardDescription>
                Manage your active login sessions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-muted/40 p-3 rounded-lg">
                  <div className="space-y-0.5">
                    <div className="flex items-center">
                      <h3 className="text-sm font-medium">Current Session</h3>
                      <Badge className="ml-2 bg-green-100 text-green-800">Active</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Chrome on Windows • IP: 192.168.1.1 • Last active: Just now
                    </p>
                  </div>
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                </div>
                
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="space-y-0.5">
                    <h3 className="text-sm font-medium">Safari on MacOS</h3>
                    <p className="text-xs text-muted-foreground">
                      IP: 192.168.1.2 • Last active: 2 days ago
                    </p>
                  </div>
                  <Button variant="ghost" size="sm">Sign Out</Button>
                </div>
                
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="space-y-0.5">
                    <h3 className="text-sm font-medium">Firefox on Android</h3>
                    <p className="text-xs text-muted-foreground">
                      IP: 192.168.1.3 • Last active: 5 days ago
                    </p>
                  </div>
                  <Button variant="ghost" size="sm">Sign Out</Button>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">Sign Out of All Sessions</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Billing Tab */}
        <TabsContent value="billing" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Subscription Plan</CardTitle>
                  <CardDescription>
                    Manage your subscription and billing details.
                  </CardDescription>
                </div>
                {getSubscriptionBadge(user?.plan)}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border border-primary/20">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Free</CardTitle>
                    <CardDescription>$0/month</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                      <li>1 Location</li>
                      <li>Basic analytics</li>
                      <li>Google & Yelp integrations</li>
                      <li>100 review requests/month</li>
                      <li>Email support</li>
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      variant={user?.plan === 'free' ? 'secondary' : 'outline'} 
                      className="w-full"
                      disabled={user?.plan === 'free'}
                    >
                      {user?.plan === 'free' ? 'Current Plan' : 'Downgrade'}
                    </Button>
                  </CardFooter>
                </Card>
                
                <Card className="border-2 border-primary">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Pro</CardTitle>
                    <CardDescription>$49/month</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                      <li>5 Locations</li>
                      <li>Advanced analytics</li>
                      <li>All platform integrations</li>
                      <li>500 review requests/month</li>
                      <li>AI response suggestions</li>
                      <li>Priority support</li>
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      variant={user?.plan === 'pro' ? 'secondary' : 'default'} 
                      className="w-full"
                      disabled={user?.plan === 'pro'}
                    >
                      {user?.plan === 'pro' ? 'Current Plan' : 'Upgrade'}
                    </Button>
                  </CardFooter>
                </Card>
                
                <Card className="border border-muted">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Business</CardTitle>
                    <CardDescription>$149/month</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                      <li>Unlimited locations</li>
                      <li>Custom analytics</li>
                      <li>White-label reports</li>
                      <li>Unlimited review requests</li>
                      <li>API access</li>
                      <li>Dedicated support</li>
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      variant={user?.plan === 'business' ? 'secondary' : 'outline'} 
                      className="w-full"
                      disabled={user?.plan === 'business'}
                    >
                      {user?.plan === 'business' ? 'Current Plan' : 'Upgrade'}
                    </Button>
                  </CardFooter>
                </Card>
              </div>
              
              <div className="bg-muted/40 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Need more?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Contact our team for custom enterprise solutions with advanced features, dedicated support, and custom integrations.
                </p>
                <Button variant="outline">Contact Sales</Button>
              </div>
              
              {user?.plan !== 'free' && (
                <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" className="text-red-600">Cancel Subscription</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Your subscription will be canceled, and you'll lose access to premium features at the end of your current billing period.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Keep My Subscription</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => setCancelDialogOpen(false)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Cancel Subscription
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
              <CardDescription>
                Update your payment details and billing address.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center">
                  <div className="w-12 h-8 mr-4 bg-gray-800 rounded-md flex items-center justify-center text-white font-semibold">
                    VISA
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">Visa ending in 4242</h3>
                    <p className="text-xs text-muted-foreground">Expires 12/2025</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm">Edit</Button>
                  <Button variant="ghost" size="sm">Remove</Button>
                </div>
              </div>
              
              <Button variant="outline">
                <CreditCard className="mr-2 h-4 w-4" /> Add Payment Method
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Billing History</CardTitle>
              <CardDescription>
                View your past invoices and billing details.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Invoice</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>May 1, 2023</TableCell>
                      <TableCell>Pro Plan - Monthly</TableCell>
                      <TableCell>$49.00</TableCell>
                      <TableCell>
                        <Badge className="bg-green-100 text-green-800">Paid</Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="link" size="sm" className="h-auto p-0">
                          <ExternalLink className="h-4 w-4 mr-1" /> View
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Apr 1, 2023</TableCell>
                      <TableCell>Pro Plan - Monthly</TableCell>
                      <TableCell>$49.00</TableCell>
                      <TableCell>
                        <Badge className="bg-green-100 text-green-800">Paid</Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="link" size="sm" className="h-auto p-0">
                          <ExternalLink className="h-4 w-4 mr-1" /> View
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Mar 1, 2023</TableCell>
                      <TableCell>Pro Plan - Monthly</TableCell>
                      <TableCell>$49.00</TableCell>
                      <TableCell>
                        <Badge className="bg-green-100 text-green-800">Paid</Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="link" size="sm" className="h-auto p-0">
                          <ExternalLink className="h-4 w-4 mr-1" /> View
                        </Button>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Manage how and when you receive notifications.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...notificationForm}>
                <form onSubmit={notificationForm.handleSubmit(onNotificationSubmit)} className="space-y-6">
                  <div className="space-y-4">
                    <FormField
                      control={notificationForm.control}
                      name="emailNotifications"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-4 border">
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Email Notifications</FormLabel>
                            <FormDescription>
                              Receive notifications via email.
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={notificationForm.control}
                      name="smsNotifications"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-4 border">
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>SMS Notifications</FormLabel>
                            <FormDescription>
                              Receive notifications via text messages.
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={notificationForm.control}
                      name="reviewAlerts"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-4 border">
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>New Review Alerts</FormLabel>
                            <FormDescription>
                              Get notified immediately when you receive new reviews.
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={notificationForm.control}
                      name="weeklyReports"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-4 border">
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Weekly Summary Reports</FormLabel>
                            <FormDescription>
                              Receive a weekly summary of your review performance.
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={notificationForm.control}
                      name="marketingEmails"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-4 border">
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Marketing Emails</FormLabel>
                            <FormDescription>
                              Receive updates about new features, tips, and promotional offers.
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    disabled={updateNotificationsMutation.isPending}
                  >
                    {updateNotificationsMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Preferences
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Alert Thresholds</CardTitle>
              <CardDescription>
                Set thresholds for when you want to be alerted.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Negative Review Threshold</h3>
                <p className="text-sm text-muted-foreground">
                  Alert me when a review rating is below:
                </p>
                <Select defaultValue="3">
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Select a rating" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Star</SelectItem>
                    <SelectItem value="2">2 Stars</SelectItem>
                    <SelectItem value="3">3 Stars</SelectItem>
                    <SelectItem value="4">4 Stars</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Rating Drop Alert</h3>
                <p className="text-sm text-muted-foreground">
                  Alert me when average rating drops by:
                </p>
                <Select defaultValue="0.2">
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Select threshold" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0.1">0.1 Stars</SelectItem>
                    <SelectItem value="0.2">0.2 Stars</SelectItem>
                    <SelectItem value="0.3">0.3 Stars</SelectItem>
                    <SelectItem value="0.5">0.5 Stars</SelectItem>
                    <SelectItem value="1.0">1.0 Stars</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Competitor Alert</h3>
                <p className="text-sm text-muted-foreground">
                  Alert me when a competitor's rating exceeds mine by:
                </p>
                <Select defaultValue="0.3">
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Select threshold" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0.1">0.1 Stars</SelectItem>
                    <SelectItem value="0.2">0.2 Stars</SelectItem>
                    <SelectItem value="0.3">0.3 Stars</SelectItem>
                    <SelectItem value="0.5">0.5 Stars</SelectItem>
                    <SelectItem value="1.0">1.0 Stars</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button className="mt-4">
                Save Thresholds
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

interface Table {
  TableHeader: React.FC<React.HTMLAttributes<HTMLTableSectionElement>>;
  TableBody: React.FC<React.HTMLAttributes<HTMLTableSectionElement>>;
  TableFooter: React.FC<React.HTMLAttributes<HTMLTableSectionElement>>;
  TableHead: React.FC<React.ThHTMLAttributes<HTMLTableCellElement>>;
  TableRow: React.FC<React.HTMLAttributes<HTMLTableRowElement>>;
  TableCell: React.FC<React.TdHTMLAttributes<HTMLTableCellElement>>;
  TableCaption: React.FC<React.HTMLAttributes<HTMLTableCaptionElement>>;
}

// This is a workaround for TypeScript since we're not importing the actual Table component
const Table: React.FC<React.TableHTMLAttributes<HTMLTableElement>> & Table = (props) => (
  <table {...props} className={`w-full caption-bottom text-sm ${props.className || ''}`}>
    {props.children}
  </table>
);

Table.TableHeader = ({ ...props }) => (
  <thead {...props} className={`[&_tr]:border-b ${props.className || ''}`}>
    {props.children}
  </thead>
);

Table.TableBody = ({ ...props }) => (
  <tbody {...props} className={`[&_tr:last-child]:border-0 ${props.className || ''}`}>
    {props.children}
  </tbody>
);

Table.TableFooter = ({ ...props }) => (
  <tfoot {...props} className={`border-t bg-muted/50 font-medium [&>tr]:last:border-b-0 ${props.className || ''}`}>
    {props.children}
  </tfoot>
);

Table.TableHead = ({ ...props }) => (
  <th
    {...props}
    className={`h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 ${props.className || ''}`}
  >
    {props.children}
  </th>
);

Table.TableRow = ({ ...props }) => (
  <tr
    {...props}
    className={`border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted ${props.className || ''}`}
  >
    {props.children}
  </tr>
);

Table.TableCell = ({ ...props }) => (
  <td
    {...props}
    className={`p-4 align-middle [&:has([role=checkbox])]:pr-0 ${props.className || ''}`}
  >
    {props.children}
  </td>
);

Table.TableCaption = ({ ...props }) => (
  <caption
    {...props}
    className={`mt-4 text-sm text-muted-foreground ${props.className || ''}`}
  >
    {props.children}
  </caption>
);

export default ProfilePage;