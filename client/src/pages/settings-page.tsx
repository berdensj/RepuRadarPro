import DashboardLayout from "@/components/dashboard/layout";
import React, { useState } from "react";
import { Helmet } from "react-helmet";
import { useQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { format } from "date-fns";
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
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  AlertCircle,
  AtSign,
  Bell,
  BellOff,
  Calendar,
  Check,
  Clock,
  Edit,
  Globe,
  Lock,
  LogOut,
  Mail,
  MessageSquare,
  Moon,
  Save,
  Settings as SettingsIcon,
  Shield,
  Smartphone,
  Star,
  Sun,
  User,
  UserPlus,
} from "lucide-react";
import { queryClient } from "@/lib/queryClient";

// Types and schemas
interface NotificationSettings {
  email: {
    enabled: boolean;
    newReviews: boolean;
    reviewResponses: boolean;
    alerts: boolean;
    reportReady: boolean;
    weeklyDigest: boolean;
    marketingUpdates: boolean;
    time: string;
    weekday: string;
  };
  mobile: {
    enabled: boolean;
    newReviews: boolean;
    reviewResponses: boolean;
    alerts: boolean;
    reportReady: boolean;
  };
  browser: {
    enabled: boolean;
    newReviews: boolean;
    reviewResponses: boolean;
    alerts: boolean;
  };
}

interface UserSettings {
  theme: "light" | "dark" | "system";
  language: string;
  timezone: string;
  dateFormat: string;
  timeFormat: "12h" | "24h";
}

interface SecuritySettings {
  twoFactorEnabled: boolean;
  lastPasswordChange: string;
  activeSessions: {
    device: string;
    location: string;
    lastActive: string;
    current: boolean;
  }[];
  loginHistory: {
    date: string;
    ip: string;
    device: string;
    location: string;
    status: "success" | "failed";
  }[];
}

// Form schemas
const notificationsFormSchema = z.object({
  email: z.object({
    enabled: z.boolean(),
    newReviews: z.boolean(),
    reviewResponses: z.boolean(),
    alerts: z.boolean(),
    reportReady: z.boolean(),
    weeklyDigest: z.boolean(),
    marketingUpdates: z.boolean(),
    time: z.string(),
    weekday: z.string(),
  }),
  mobile: z.object({
    enabled: z.boolean(),
    newReviews: z.boolean(),
    reviewResponses: z.boolean(),
    alerts: z.boolean(),
    reportReady: z.boolean(),
  }),
  browser: z.object({
    enabled: z.boolean(),
    newReviews: z.boolean(),
    reviewResponses: z.boolean(),
    alerts: z.boolean(),
  }),
});

const profileFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().optional(),
  jobTitle: z.string().optional(),
  company: z.string().optional(),
  bio: z.string().optional(),
});

const preferencesFormSchema = z.object({
  theme: z.enum(["light", "dark", "system"]),
  language: z.string(),
  timezone: z.string(),
  dateFormat: z.string(),
  timeFormat: z.enum(["12h", "24h"]),
});

const passwordFormSchema = z.object({
  currentPassword: z.string().min(8, "Password must be at least 8 characters"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Password must be at least 8 characters"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState("notifications");
  const { toast } = useToast();

  // Fetch notification settings
  const {
    data: notificationSettings,
    isLoading: isLoadingNotifications,
    error: notificationsError,
  } = useQuery({
    queryKey: ["/api/settings/notifications"],
    queryFn: async () => {
      // Mock data
      const settings: NotificationSettings = {
        email: {
          enabled: true,
          newReviews: true,
          reviewResponses: true,
          alerts: true,
          reportReady: true,
          weeklyDigest: true,
          marketingUpdates: false,
          time: "09:00",
          weekday: "monday",
        },
        mobile: {
          enabled: true,
          newReviews: true,
          reviewResponses: false,
          alerts: true,
          reportReady: false,
        },
        browser: {
          enabled: true,
          newReviews: true,
          reviewResponses: true,
          alerts: true,
        },
      };

      return settings;
    },
  });

  // Fetch user profile data
  const {
    data: profileData,
    isLoading: isLoadingProfile,
    error: profileError,
  } = useQuery({
    queryKey: ["/api/user/profile"],
    queryFn: async () => {
      // Mock data
      return {
        name: "Alex Johnson",
        email: "alex.johnson@example.com",
        phone: "+1 (555) 123-4567",
        jobTitle: "Marketing Manager",
        company: "Acme Inc.",
        bio: "Marketing professional with 8+ years experience managing brand reputation and customer engagement strategies.",
        avatarUrl: "https://i.pravatar.cc/150?img=3"
      };
    },
  });

  // Fetch user preferences
  const {
    data: userPreferences,
    isLoading: isLoadingPreferences,
    error: preferencesError,
  } = useQuery({
    queryKey: ["/api/settings/preferences"],
    queryFn: async () => {
      // Mock data
      const settings: UserSettings = {
        theme: "system",
        language: "en-US",
        timezone: "America/New_York",
        dateFormat: "MM/DD/YYYY",
        timeFormat: "12h",
      };

      return settings;
    },
  });

  // Fetch security settings
  const {
    data: securitySettings,
    isLoading: isLoadingSecurity,
    error: securityError,
  } = useQuery({
    queryKey: ["/api/settings/security"],
    queryFn: async () => {
      // Mock data
      const settings: SecuritySettings = {
        twoFactorEnabled: true,
        lastPasswordChange: "2025-04-15T10:30:00",
        activeSessions: [
          {
            device: "Chrome on Windows",
            location: "New York, USA",
            lastActive: "2025-05-11T11:30:00",
            current: true,
          },
          {
            device: "Safari on iPhone",
            location: "New York, USA",
            lastActive: "2025-05-10T18:45:00",
            current: false,
          },
        ],
        loginHistory: [
          {
            date: "2025-05-11T11:30:00",
            ip: "192.168.1.1",
            device: "Chrome on Windows",
            location: "New York, USA",
            status: "success",
          },
          {
            date: "2025-05-10T18:45:00",
            ip: "192.168.1.2",
            device: "Safari on iPhone",
            location: "New York, USA",
            status: "success",
          },
          {
            date: "2025-05-08T14:20:00",
            ip: "192.168.1.1",
            device: "Chrome on Windows",
            location: "New York, USA",
            status: "success",
          },
          {
            date: "2025-05-07T08:15:00",
            ip: "203.0.113.1",
            device: "Firefox on Windows",
            location: "Chicago, USA",
            status: "failed",
          },
        ],
      };

      return settings;
    },
  });

  // Notifications form
  const notificationsForm = useForm<z.infer<typeof notificationsFormSchema>>({
    resolver: zodResolver(notificationsFormSchema),
    defaultValues: {
      email: {
        enabled: true,
        newReviews: true,
        reviewResponses: true,
        alerts: true,
        reportReady: true,
        weeklyDigest: true,
        marketingUpdates: false,
        time: "09:00",
        weekday: "monday",
      },
      mobile: {
        enabled: true,
        newReviews: true,
        reviewResponses: false,
        alerts: true,
        reportReady: false,
      },
      browser: {
        enabled: true,
        newReviews: true,
        reviewResponses: true,
        alerts: true,
      },
    },
  });

  // Profile form
  const profileForm = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      jobTitle: "",
      company: "",
      bio: "",
    },
  });

  // Preferences form
  const preferencesForm = useForm<z.infer<typeof preferencesFormSchema>>({
    resolver: zodResolver(preferencesFormSchema),
    defaultValues: {
      theme: "system",
      language: "en-US",
      timezone: "America/New_York",
      dateFormat: "MM/DD/YYYY",
      timeFormat: "12h",
    },
  });

  // Password form
  const passwordForm = useForm<z.infer<typeof passwordFormSchema>>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Set form defaults from fetched data
  React.useEffect(() => {
    if (notificationSettings) {
      notificationsForm.reset(notificationSettings);
    }

    if (profileData) {
      profileForm.reset({
        name: profileData.name,
        email: profileData.email,
        phone: profileData.phone,
        jobTitle: profileData.jobTitle,
        company: profileData.company,
        bio: profileData.bio,
      });
    }

    if (userPreferences) {
      preferencesForm.reset(userPreferences);
    }
  }, [
    notificationSettings, 
    profileData, 
    userPreferences, 
    notificationsForm, 
    profileForm, 
    preferencesForm
  ]);

  const onNotificationsSubmit = (values: z.infer<typeof notificationsFormSchema>) => {
    console.log("Updating notification settings:", values);
    
    toast({
      title: "Notifications Updated",
      description: "Your notification preferences have been saved.",
    });
    
    // Refresh notifications data
    queryClient.invalidateQueries({ queryKey: ["/api/settings/notifications"] });
  };

  const onProfileSubmit = (values: z.infer<typeof profileFormSchema>) => {
    console.log("Updating profile:", values);
    
    toast({
      title: "Profile Updated",
      description: "Your profile information has been saved.",
    });
    
    // Refresh profile data
    queryClient.invalidateQueries({ queryKey: ["/api/user/profile"] });
  };

  const onPreferencesSubmit = (values: z.infer<typeof preferencesFormSchema>) => {
    console.log("Updating preferences:", values);
    
    toast({
      title: "Preferences Updated",
      description: "Your user preferences have been saved.",
    });
    
    // Refresh preferences data
    queryClient.invalidateQueries({ queryKey: ["/api/settings/preferences"] });
  };

  const onPasswordSubmit = (values: z.infer<typeof passwordFormSchema>) => {
    console.log("Updating password:", values);
    
    toast({
      title: "Password Updated",
      description: "Your password has been changed successfully.",
    });
    
    passwordForm.reset();
  };

  return (
    <>
      <Helmet>
        <title>Settings | RepuRadar</title>
        <meta
          name="description"
          content="Manage your account settings and notification preferences."
        />
      </Helmet>

      <div className="min-h-screen flex flex-col lg:flex-row">
        <Sidebar />

        <main className="flex-1 p-4 lg:p-6 bg-slate-50 min-h-screen">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <header className="mb-6">
              <h1 className="text-2xl font-semibold text-slate-800">Account Settings</h1>
              <p className="text-slate-500">
                Manage your profile, preferences, and notification settings
              </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Settings Tabs */}
              <div className="col-span-1">
                <Card>
                  <CardContent className="p-0">
                    <nav className="flex flex-col">
                      <button 
                        className={`flex items-center gap-2 p-3 text-sm border-l-2 hover:bg-slate-50 ${
                          activeTab === "notifications" 
                            ? "border-l-blue-600 bg-slate-50 font-medium text-slate-900" 
                            : "border-l-transparent text-slate-600"
                        }`}
                        onClick={() => setActiveTab("notifications")}
                      >
                        <Bell className="h-4 w-4" />
                        Notifications
                      </button>
                      <button 
                        className={`flex items-center gap-2 p-3 text-sm border-l-2 hover:bg-slate-50 ${
                          activeTab === "profile" 
                            ? "border-l-blue-600 bg-slate-50 font-medium text-slate-900" 
                            : "border-l-transparent text-slate-600"
                        }`}
                        onClick={() => setActiveTab("profile")}
                      >
                        <User className="h-4 w-4" />
                        Profile
                      </button>
                      <button 
                        className={`flex items-center gap-2 p-3 text-sm border-l-2 hover:bg-slate-50 ${
                          activeTab === "preferences" 
                            ? "border-l-blue-600 bg-slate-50 font-medium text-slate-900" 
                            : "border-l-transparent text-slate-600"
                        }`}
                        onClick={() => setActiveTab("preferences")}
                      >
                        <SettingsIcon className="h-4 w-4" />
                        Preferences
                      </button>
                      <button 
                        className={`flex items-center gap-2 p-3 text-sm border-l-2 hover:bg-slate-50 ${
                          activeTab === "security" 
                            ? "border-l-blue-600 bg-slate-50 font-medium text-slate-900" 
                            : "border-l-transparent text-slate-600"
                        }`}
                        onClick={() => setActiveTab("security")}
                      >
                        <Shield className="h-4 w-4" />
                        Security
                      </button>
                    </nav>
                  </CardContent>
                </Card>

                <Card className="mt-4">
                  <CardContent className="p-4">
                    <div className="flex flex-col items-center justify-center text-center">
                      <div className="h-20 w-20 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                        {profileData?.avatarUrl ? (
                          <img
                            src={profileData.avatarUrl}
                            alt={profileData.name}
                            className="h-20 w-20 rounded-full object-cover"
                          />
                        ) : (
                          <User className="h-8 w-8 text-slate-400" />
                        )}
                      </div>
                      <h3 className="font-medium text-slate-900">
                        {profileData?.name || "User Name"}
                      </h3>
                      <p className="text-sm text-slate-500 mt-1">
                        {profileData?.email || "user@example.com"}
                      </p>
                      {profileData?.jobTitle && (
                        <Badge variant="outline" className="mt-2">
                          {profileData.jobTitle}
                        </Badge>
                      )}
                      <Button variant="outline" className="mt-4 w-full" size="sm">
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Settings Content */}
              <div className="lg:col-span-3">
                {/* Notifications Tab */}
                {activeTab === "notifications" && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Notification Settings</CardTitle>
                        <CardDescription>
                          Configure how and when you want to receive notifications
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {isLoadingNotifications ? (
                          <div className="flex justify-center p-8">
                            <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
                          </div>
                        ) : notificationsError ? (
                          <div className="p-4 border rounded-md bg-red-50 text-red-800">
                            Failed to load notification settings. Please try again.
                          </div>
                        ) : (
                          <Form {...notificationsForm}>
                            <form
                              onSubmit={notificationsForm.handleSubmit(onNotificationsSubmit)}
                              className="space-y-6"
                            >
                              {/* Email Notifications */}
                              <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <Mail className="h-5 w-5 text-blue-500" />
                                    <h3 className="text-lg font-medium">Email Notifications</h3>
                                  </div>
                                  <FormField
                                    control={notificationsForm.control}
                                    name="email.enabled"
                                    render={({ field }) => (
                                      <FormItem className="flex items-center gap-2 space-y-0">
                                        <FormControl>
                                          <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                          />
                                        </FormControl>
                                        <FormLabel className="font-normal">
                                          {field.value ? "Enabled" : "Disabled"}
                                        </FormLabel>
                                      </FormItem>
                                    )}
                                  />
                                </div>
                                
                                <div className="space-y-2 border-l-2 border-slate-100 pl-4">
                                  <FormField
                                    control={notificationsForm.control}
                                    name="email.newReviews"
                                    render={({ field }) => (
                                      <FormItem className="flex items-center justify-between space-y-0">
                                        <FormLabel className="font-normal">New reviews</FormLabel>
                                        <FormControl>
                                          <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                            disabled={!notificationsForm.watch("email.enabled")}
                                          />
                                        </FormControl>
                                      </FormItem>
                                    )}
                                  />
                                  <FormField
                                    control={notificationsForm.control}
                                    name="email.reviewResponses"
                                    render={({ field }) => (
                                      <FormItem className="flex items-center justify-between space-y-0">
                                        <FormLabel className="font-normal">
                                          Review responses
                                        </FormLabel>
                                        <FormControl>
                                          <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                            disabled={!notificationsForm.watch("email.enabled")}
                                          />
                                        </FormControl>
                                      </FormItem>
                                    )}
                                  />
                                  <FormField
                                    control={notificationsForm.control}
                                    name="email.alerts"
                                    render={({ field }) => (
                                      <FormItem className="flex items-center justify-between space-y-0">
                                        <FormLabel className="font-normal">Important alerts</FormLabel>
                                        <FormControl>
                                          <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                            disabled={!notificationsForm.watch("email.enabled")}
                                          />
                                        </FormControl>
                                      </FormItem>
                                    )}
                                  />
                                  <FormField
                                    control={notificationsForm.control}
                                    name="email.reportReady"
                                    render={({ field }) => (
                                      <FormItem className="flex items-center justify-between space-y-0">
                                        <FormLabel className="font-normal">
                                          Report ready notifications
                                        </FormLabel>
                                        <FormControl>
                                          <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                            disabled={!notificationsForm.watch("email.enabled")}
                                          />
                                        </FormControl>
                                      </FormItem>
                                    )}
                                  />
                                  <Separator className="my-3" />
                                  <FormField
                                    control={notificationsForm.control}
                                    name="email.weeklyDigest"
                                    render={({ field }) => (
                                      <FormItem className="flex items-center justify-between space-y-0">
                                        <div>
                                          <FormLabel className="font-normal">
                                            Weekly digest
                                          </FormLabel>
                                          <FormDescription>
                                            Weekly summary of your review activity
                                          </FormDescription>
                                        </div>
                                        <FormControl>
                                          <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                            disabled={!notificationsForm.watch("email.enabled")}
                                          />
                                        </FormControl>
                                      </FormItem>
                                    )}
                                  />
                                  {notificationsForm.watch("email.weeklyDigest") && (
                                    <div className="grid grid-cols-2 gap-4 mt-2">
                                      <FormField
                                        control={notificationsForm.control}
                                        name="email.weekday"
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel>Day of week</FormLabel>
                                            <Select
                                              onValueChange={field.onChange}
                                              defaultValue={field.value}
                                              disabled={!notificationsForm.watch("email.enabled")}
                                            >
                                              <FormControl>
                                                <SelectTrigger>
                                                  <SelectValue placeholder="Select day" />
                                                </SelectTrigger>
                                              </FormControl>
                                              <SelectContent>
                                                <SelectItem value="monday">Monday</SelectItem>
                                                <SelectItem value="tuesday">Tuesday</SelectItem>
                                                <SelectItem value="wednesday">Wednesday</SelectItem>
                                                <SelectItem value="thursday">Thursday</SelectItem>
                                                <SelectItem value="friday">Friday</SelectItem>
                                                <SelectItem value="saturday">Saturday</SelectItem>
                                                <SelectItem value="sunday">Sunday</SelectItem>
                                              </SelectContent>
                                            </Select>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />
                                      <FormField
                                        control={notificationsForm.control}
                                        name="email.time"
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel>Time</FormLabel>
                                            <FormControl>
                                              <Input
                                                type="time"
                                                {...field}
                                                disabled={!notificationsForm.watch("email.enabled")}
                                              />
                                            </FormControl>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />
                                    </div>
                                  )}
                                  <Separator className="my-3" />
                                  <FormField
                                    control={notificationsForm.control}
                                    name="email.marketingUpdates"
                                    render={({ field }) => (
                                      <FormItem className="flex items-center justify-between space-y-0">
                                        <div>
                                          <FormLabel className="font-normal">
                                            Marketing updates
                                          </FormLabel>
                                          <FormDescription>
                                            News, tips and product updates from RepuRadar
                                          </FormDescription>
                                        </div>
                                        <FormControl>
                                          <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                            disabled={!notificationsForm.watch("email.enabled")}
                                          />
                                        </FormControl>
                                      </FormItem>
                                    )}
                                  />
                                </div>
                              </div>

                              {/* Mobile Notifications */}
                              <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <Smartphone className="h-5 w-5 text-blue-500" />
                                    <h3 className="text-lg font-medium">
                                      Mobile Push Notifications
                                    </h3>
                                  </div>
                                  <FormField
                                    control={notificationsForm.control}
                                    name="mobile.enabled"
                                    render={({ field }) => (
                                      <FormItem className="flex items-center gap-2 space-y-0">
                                        <FormControl>
                                          <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                          />
                                        </FormControl>
                                        <FormLabel className="font-normal">
                                          {field.value ? "Enabled" : "Disabled"}
                                        </FormLabel>
                                      </FormItem>
                                    )}
                                  />
                                </div>
                                
                                <div className="space-y-2 border-l-2 border-slate-100 pl-4">
                                  <FormField
                                    control={notificationsForm.control}
                                    name="mobile.newReviews"
                                    render={({ field }) => (
                                      <FormItem className="flex items-center justify-between space-y-0">
                                        <FormLabel className="font-normal">New reviews</FormLabel>
                                        <FormControl>
                                          <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                            disabled={!notificationsForm.watch("mobile.enabled")}
                                          />
                                        </FormControl>
                                      </FormItem>
                                    )}
                                  />
                                  <FormField
                                    control={notificationsForm.control}
                                    name="mobile.reviewResponses"
                                    render={({ field }) => (
                                      <FormItem className="flex items-center justify-between space-y-0">
                                        <FormLabel className="font-normal">
                                          Review responses
                                        </FormLabel>
                                        <FormControl>
                                          <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                            disabled={!notificationsForm.watch("mobile.enabled")}
                                          />
                                        </FormControl>
                                      </FormItem>
                                    )}
                                  />
                                  <FormField
                                    control={notificationsForm.control}
                                    name="mobile.alerts"
                                    render={({ field }) => (
                                      <FormItem className="flex items-center justify-between space-y-0">
                                        <FormLabel className="font-normal">Important alerts</FormLabel>
                                        <FormControl>
                                          <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                            disabled={!notificationsForm.watch("mobile.enabled")}
                                          />
                                        </FormControl>
                                      </FormItem>
                                    )}
                                  />
                                  <FormField
                                    control={notificationsForm.control}
                                    name="mobile.reportReady"
                                    render={({ field }) => (
                                      <FormItem className="flex items-center justify-between space-y-0">
                                        <FormLabel className="font-normal">
                                          Report ready notifications
                                        </FormLabel>
                                        <FormControl>
                                          <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                            disabled={!notificationsForm.watch("mobile.enabled")}
                                          />
                                        </FormControl>
                                      </FormItem>
                                    )}
                                  />
                                </div>
                              </div>

                              {/* Browser Notifications */}
                              <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <Globe className="h-5 w-5 text-blue-500" />
                                    <h3 className="text-lg font-medium">
                                      Browser Notifications
                                    </h3>
                                  </div>
                                  <FormField
                                    control={notificationsForm.control}
                                    name="browser.enabled"
                                    render={({ field }) => (
                                      <FormItem className="flex items-center gap-2 space-y-0">
                                        <FormControl>
                                          <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                          />
                                        </FormControl>
                                        <FormLabel className="font-normal">
                                          {field.value ? "Enabled" : "Disabled"}
                                        </FormLabel>
                                      </FormItem>
                                    )}
                                  />
                                </div>
                                
                                <div className="space-y-2 border-l-2 border-slate-100 pl-4">
                                  <FormField
                                    control={notificationsForm.control}
                                    name="browser.newReviews"
                                    render={({ field }) => (
                                      <FormItem className="flex items-center justify-between space-y-0">
                                        <FormLabel className="font-normal">New reviews</FormLabel>
                                        <FormControl>
                                          <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                            disabled={!notificationsForm.watch("browser.enabled")}
                                          />
                                        </FormControl>
                                      </FormItem>
                                    )}
                                  />
                                  <FormField
                                    control={notificationsForm.control}
                                    name="browser.reviewResponses"
                                    render={({ field }) => (
                                      <FormItem className="flex items-center justify-between space-y-0">
                                        <FormLabel className="font-normal">
                                          Review responses
                                        </FormLabel>
                                        <FormControl>
                                          <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                            disabled={!notificationsForm.watch("browser.enabled")}
                                          />
                                        </FormControl>
                                      </FormItem>
                                    )}
                                  />
                                  <FormField
                                    control={notificationsForm.control}
                                    name="browser.alerts"
                                    render={({ field }) => (
                                      <FormItem className="flex items-center justify-between space-y-0">
                                        <FormLabel className="font-normal">Important alerts</FormLabel>
                                        <FormControl>
                                          <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                            disabled={!notificationsForm.watch("browser.enabled")}
                                          />
                                        </FormControl>
                                      </FormItem>
                                    )}
                                  />
                                </div>
                              </div>

                              <div className="flex justify-end">
                                <Button type="submit">Save Notification Settings</Button>
                              </div>
                            </form>
                          </Form>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Profile Tab */}
                {activeTab === "profile" && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Profile Information</CardTitle>
                        <CardDescription>
                          Update your account information and personal details
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {isLoadingProfile ? (
                          <div className="flex justify-center p-8">
                            <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
                          </div>
                        ) : profileError ? (
                          <div className="p-4 border rounded-md bg-red-50 text-red-800">
                            Failed to load profile data. Please try again.
                          </div>
                        ) : (
                          <Form {...profileForm}>
                            <form
                              onSubmit={profileForm.handleSubmit(onProfileSubmit)}
                              className="space-y-4"
                            >
                              <div className="flex items-center gap-4 mb-6">
                                <div className="h-20 w-20 rounded-full bg-slate-100 flex items-center justify-center relative">
                                  {profileData?.avatarUrl ? (
                                    <img
                                      src={profileData.avatarUrl}
                                      alt={profileData.name}
                                      className="h-20 w-20 rounded-full object-cover"
                                    />
                                  ) : (
                                    <User className="h-8 w-8 text-slate-400" />
                                  )}
                                  <Button
                                    size="icon"
                                    variant="outline"
                                    className="absolute -bottom-2 -right-2 h-7 w-7 rounded-full"
                                  >
                                    <Edit className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                                <div>
                                  <h3 className="font-medium text-slate-900">Profile Photo</h3>
                                  <p className="text-sm text-slate-500">
                                    Upload a photo to personalize your account
                                  </p>
                                  <div className="flex gap-2 mt-2">
                                    <Button size="sm" variant="outline">
                                      Upload
                                    </Button>
                                    <Button size="sm" variant="ghost">
                                      Remove
                                    </Button>
                                  </div>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                  control={profileForm.control}
                                  name="name"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Full Name</FormLabel>
                                      <FormControl>
                                        <Input placeholder="Your name" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />

                                <FormField
                                  control={profileForm.control}
                                  name="email"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Email Address</FormLabel>
                                      <FormControl>
                                        <Input placeholder="your.email@example.com" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />

                                <FormField
                                  control={profileForm.control}
                                  name="phone"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Phone Number</FormLabel>
                                      <FormControl>
                                        <Input placeholder="+1 (555) 123-4567" {...field} />
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
                                      <FormLabel>Job Title</FormLabel>
                                      <FormControl>
                                        <Input placeholder="Marketing Manager" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />

                                <FormField
                                  control={profileForm.control}
                                  name="company"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Company</FormLabel>
                                      <FormControl>
                                        <Input placeholder="Company name" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>

                              <FormField
                                control={profileForm.control}
                                name="bio"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Bio</FormLabel>
                                    <FormControl>
                                      <Textarea
                                        placeholder="A brief description about yourself"
                                        className="min-h-[100px]"
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <div className="flex justify-end">
                                <Button type="submit">Save Profile</Button>
                              </div>
                            </form>
                          </Form>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Preferences Tab */}
                {activeTab === "preferences" && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>User Preferences</CardTitle>
                        <CardDescription>
                          Customize your experience with language, theme, and regional settings
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {isLoadingPreferences ? (
                          <div className="flex justify-center p-8">
                            <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
                          </div>
                        ) : preferencesError ? (
                          <div className="p-4 border rounded-md bg-red-50 text-red-800">
                            Failed to load preferences. Please try again.
                          </div>
                        ) : (
                          <Form {...preferencesForm}>
                            <form
                              onSubmit={preferencesForm.handleSubmit(onPreferencesSubmit)}
                              className="space-y-6"
                            >
                              <FormField
                                control={preferencesForm.control}
                                name="theme"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Theme</FormLabel>
                                    <div className="space-y-2">
                                      <RadioGroup
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        className="grid grid-cols-3 gap-4"
                                      >
                                        <FormItem>
                                          <FormLabel className="[&:has([data-state=checked])>div]:border-blue-500">
                                            <FormControl>
                                              <RadioGroupItem value="light" className="sr-only" />
                                            </FormControl>
                                            <div className="border-2 rounded-md p-4 cursor-pointer hover:border-blue-300 flex flex-col items-center gap-2">
                                              <Sun className="h-6 w-6 text-amber-500" />
                                              <div className="font-medium text-center">Light</div>
                                            </div>
                                          </FormLabel>
                                        </FormItem>
                                        <FormItem>
                                          <FormLabel className="[&:has([data-state=checked])>div]:border-blue-500">
                                            <FormControl>
                                              <RadioGroupItem value="dark" className="sr-only" />
                                            </FormControl>
                                            <div className="border-2 rounded-md p-4 cursor-pointer hover:border-blue-300 flex flex-col items-center gap-2">
                                              <Moon className="h-6 w-6 text-indigo-500" />
                                              <div className="font-medium text-center">Dark</div>
                                            </div>
                                          </FormLabel>
                                        </FormItem>
                                        <FormItem>
                                          <FormLabel className="[&:has([data-state=checked])>div]:border-blue-500">
                                            <FormControl>
                                              <RadioGroupItem value="system" className="sr-only" />
                                            </FormControl>
                                            <div className="border-2 rounded-md p-4 cursor-pointer hover:border-blue-300 flex flex-col items-center gap-2">
                                              <SettingsIcon className="h-6 w-6 text-slate-500" />
                                              <div className="font-medium text-center">System</div>
                                            </div>
                                          </FormLabel>
                                        </FormItem>
                                      </RadioGroup>
                                    </div>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                  control={preferencesForm.control}
                                  name="language"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Language</FormLabel>
                                      <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                      >
                                        <FormControl>
                                          <SelectTrigger>
                                            <SelectValue placeholder="Select language" />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                          <SelectItem value="en-US">English (US)</SelectItem>
                                          <SelectItem value="en-GB">English (UK)</SelectItem>
                                          <SelectItem value="es-ES">Spanish</SelectItem>
                                          <SelectItem value="fr-FR">French</SelectItem>
                                          <SelectItem value="de-DE">German</SelectItem>
                                        </SelectContent>
                                      </Select>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={preferencesForm.control}
                                  name="timezone"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Timezone</FormLabel>
                                      <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                      >
                                        <FormControl>
                                          <SelectTrigger>
                                            <SelectValue placeholder="Select timezone" />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                          <SelectItem value="America/New_York">
                                            Eastern Time (ET)
                                          </SelectItem>
                                          <SelectItem value="America/Chicago">
                                            Central Time (CT)
                                          </SelectItem>
                                          <SelectItem value="America/Denver">
                                            Mountain Time (MT)
                                          </SelectItem>
                                          <SelectItem value="America/Los_Angeles">
                                            Pacific Time (PT)
                                          </SelectItem>
                                          <SelectItem value="Europe/London">
                                            London (GMT)
                                          </SelectItem>
                                          <SelectItem value="Europe/Paris">
                                            Paris (CET)
                                          </SelectItem>
                                        </SelectContent>
                                      </Select>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={preferencesForm.control}
                                  name="dateFormat"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Date Format</FormLabel>
                                      <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                      >
                                        <FormControl>
                                          <SelectTrigger>
                                            <SelectValue placeholder="Select date format" />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                          <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                                          <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                                          <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                                          <SelectItem value="YYYY.MM.DD">YYYY.MM.DD</SelectItem>
                                          <SelectItem value="DD.MM.YYYY">DD.MM.YYYY</SelectItem>
                                          <SelectItem value="DD-MMM-YYYY">DD-MMM-YYYY</SelectItem>
                                        </SelectContent>
                                      </Select>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={preferencesForm.control}
                                  name="timeFormat"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Time Format</FormLabel>
                                      <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                      >
                                        <FormControl>
                                          <SelectTrigger>
                                            <SelectValue placeholder="Select time format" />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                          <SelectItem value="12h">12-hour (1:30 PM)</SelectItem>
                                          <SelectItem value="24h">24-hour (13:30)</SelectItem>
                                        </SelectContent>
                                      </Select>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>

                              <div className="flex justify-end">
                                <Button type="submit">Save Preferences</Button>
                              </div>
                            </form>
                          </Form>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Security Tab */}
                {activeTab === "security" && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Password</CardTitle>
                        <CardDescription>
                          Change your password or update security settings
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Form {...passwordForm}>
                          <form
                            onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
                            className="space-y-4"
                          >
                            <FormField
                              control={passwordForm.control}
                              name="currentPassword"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Current Password</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="Enter your current password"
                                      type="password"
                                      {...field}
                                    />
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
                                    <Input
                                      placeholder="Enter your new password"
                                      type="password"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormDescription>
                                    Password must be at least 8 characters long
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
                                    <Input
                                      placeholder="Confirm your new password"
                                      type="password"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <div className="flex justify-end">
                              <Button type="submit">Change Password</Button>
                            </div>
                          </form>
                        </Form>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Two-Factor Authentication</CardTitle>
                        <CardDescription>
                          Add an extra layer of security to your account
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {isLoadingSecurity ? (
                          <div className="flex justify-center p-8">
                            <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
                          </div>
                        ) : securityError ? (
                          <div className="p-4 border rounded-md bg-red-50 text-red-800">
                            Failed to load security settings. Please try again.
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <div className="flex items-start gap-3">
                              <div className={`p-2 rounded-md ${securitySettings?.twoFactorEnabled ? 'bg-green-100' : 'bg-slate-100'}`}>
                                {securitySettings?.twoFactorEnabled ? (
                                  <Shield className="h-5 w-5 text-green-600" />
                                ) : (
                                  <Shield className="h-5 w-5 text-slate-400" />
                                )}
                              </div>
                              <div>
                                <h3 className="font-medium">
                                  {securitySettings?.twoFactorEnabled
                                    ? "Two-factor authentication is enabled"
                                    : "Two-factor authentication is disabled"}
                                </h3>
                                <p className="text-sm text-slate-500 mt-1">
                                  {securitySettings?.twoFactorEnabled
                                    ? "Your account is protected with an authentication app"
                                    : "Add an extra layer of security by enabling 2FA"}
                                </p>
                              </div>
                            </div>
                            <Button variant={securitySettings?.twoFactorEnabled ? "ghost" : "default"}>
                              {securitySettings?.twoFactorEnabled ? "Manage 2FA" : "Enable 2FA"}
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Active Sessions</CardTitle>
                        <CardDescription>
                          Manage your logged-in sessions across devices
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {isLoadingSecurity ? (
                          <div className="flex justify-center p-8">
                            <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
                          </div>
                        ) : securityError ? (
                          <div className="p-4 border rounded-md bg-red-50 text-red-800">
                            Failed to load security settings. Please try again.
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {securitySettings?.activeSessions.map((session, index) => (
                              <div key={index} className="flex items-center justify-between border-b pb-3">
                                <div className="flex items-start gap-3">
                                  <div className="p-2 rounded-md bg-slate-100">
                                    <Globe className="h-5 w-5 text-slate-600" />
                                  </div>
                                  <div>
                                    <h3 className="font-medium flex items-center">
                                      {session.device}
                                      {session.current && (
                                        <Badge className="ml-2 bg-green-500">Current</Badge>
                                      )}
                                    </h3>
                                    <div className="text-sm text-slate-500 mt-1">
                                      {session.location} • Last active {format(new Date(session.lastActive), "MMM d, yyyy 'at' h:mm a")}
                                    </div>
                                  </div>
                                </div>
                                {!session.current && (
                                  <Button variant="ghost" size="sm">
                                    <LogOut className="h-4 w-4 mr-2" />
                                    Sign Out
                                  </Button>
                                )}
                              </div>
                            ))}
                            <Button variant="outline" className="w-full">
                              Sign Out All Other Sessions
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Login History</CardTitle>
                        <CardDescription>
                          Recent account activity and login attempts
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {isLoadingSecurity ? (
                          <div className="flex justify-center p-8">
                            <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
                          </div>
                        ) : securityError ? (
                          <div className="p-4 border rounded-md bg-red-50 text-red-800">
                            Failed to load security settings. Please try again.
                          </div>
                        ) : (
                          <div className="rounded-md border">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Date & Time</TableHead>
                                  <TableHead>Device</TableHead>
                                  <TableHead className="hidden md:table-cell">Location</TableHead>
                                  <TableHead className="hidden md:table-cell">IP Address</TableHead>
                                  <TableHead>Status</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {securitySettings?.loginHistory.map((login, index) => (
                                  <TableRow key={index}>
                                    <TableCell>
                                      {format(new Date(login.date), "MMM d, yyyy 'at' h:mm a")}
                                    </TableCell>
                                    <TableCell>{login.device}</TableCell>
                                    <TableCell className="hidden md:table-cell">
                                      {login.location}
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell">
                                      {login.ip}
                                    </TableCell>
                                    <TableCell>
                                      {login.status === "success" ? (
                                        <Badge className="bg-green-500">Success</Badge>
                                      ) : (
                                        <Badge variant="destructive">Failed</Badge>
                                      )}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        )}
                      </CardContent>
                      <CardFooter>
                        <Button variant="outline" size="sm" className="ml-auto">
                          Download Full History
                        </Button>
                      </CardFooter>
                    </Card>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default SettingsPage;