import DashboardLayout from "@/components/dashboard/layout";
import React, { useState } from "react";
import { Helmet } from "react-helmet";
import { useQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
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
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  BarChart,
  Check,
  Copy,
  CreditCard,
  Edit,
  Eye,
  FileImage,
  FileText,
  Globe,
  ImageIcon,
  Info,
  Laptop,
  Layout,
  LayoutDashboard,
  Layers,
  Link2,
  Mail,
  MapPin,
  MessageSquare,
  Paintbrush,
  PenSquare,
  Save,
  Settings,
  Smartphone,
  UserCircle,
  Users2,
} from "lucide-react";
import { queryClient } from "@/lib/queryClient";

// Types
interface WhiteLabelSettings {
  brandName: string;
  companyLogo: string;
  favicon: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  domain: string | null;
  customCss: string | null;
  footerText: string;
  emailSettings: {
    senderName: string;
    senderEmail: string;
    headerImage: string | null;
    footerImage: string | null;
    showPoweredBy: boolean;
  };
  loginPage: {
    backgroundImage: string | null;
    welcomeText: string;
    loginButtonText: string;
  };
  enabledFeatures: string[];
}

// Form schema
const brandingFormSchema = z.object({
  brandName: z.string().min(2, "Brand name must be at least 2 characters"),
  companyLogo: z.string().optional(),
  favicon: z.string().optional(),
  primaryColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Must be a valid hex color"),
  secondaryColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Must be a valid hex color"),
  accentColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Must be a valid hex color"),
  footerText: z.string(),
});

const domainFormSchema = z.object({
  domain: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  customCss: z.string().optional(),
});

const emailFormSchema = z.object({
  senderName: z.string().min(2, "Sender name must be at least 2 characters"),
  senderEmail: z.string().email("Must be a valid email address"),
  headerImage: z.string().optional(),
  footerImage: z.string().optional(),
  showPoweredBy: z.boolean().default(true),
});

const loginFormSchema = z.object({
  backgroundImage: z.string().optional(),
  welcomeText: z.string().min(5, "Welcome text must be at least 5 characters"),
  loginButtonText: z.string().min(2, "Button text must be at least 2 characters"),
});

const featuresFormSchema = z.object({
  enabledFeatures: z.array(z.string()),
});

const WhiteLabelPage = () => {
  const [activeTab, setActiveTab] = useState("branding");
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");
  const { toast } = useToast();

  // Fetch white label settings
  const {
    data: settingsData,
    isLoading: isLoadingSettings,
    error: settingsError,
  } = useQuery({
    queryKey: ["/api/white-label-settings"],
    queryFn: async () => {
      // Mock data
      const settings: WhiteLabelSettings = {
        brandName: "RepuRadar Enterprise",
        companyLogo: "/logo-placeholder.svg",
        favicon: "/favicon.ico",
        primaryColor: "#0F172A",
        secondaryColor: "#3B82F6",
        accentColor: "#10B981",
        domain: "dashboard.repuradar.com",
        customCss: null,
        footerText: "© 2025 RepuRadar Enterprise. All rights reserved.",
        emailSettings: {
          senderName: "RepuRadar Support",
          senderEmail: "support@repuradar.com",
          headerImage: "/email-header.png",
          footerImage: null,
          showPoweredBy: true,
        },
        loginPage: {
          backgroundImage: "/login-bg.jpg",
          welcomeText: "Welcome to your RepuRadar Dashboard",
          loginButtonText: "Sign In",
        },
        enabledFeatures: [
          "dashboard",
          "reviews",
          "analytics",
          "reports",
          "settings",
          "templates",
          "locations",
          "competitors",
        ],
      };

      return settings;
    },
  });

  // Branding form
  const brandingForm = useForm<z.infer<typeof brandingFormSchema>>({
    resolver: zodResolver(brandingFormSchema),
    defaultValues: {
      brandName: "",
      companyLogo: "",
      favicon: "",
      primaryColor: "#0F172A",
      secondaryColor: "#3B82F6",
      accentColor: "#10B981",
      footerText: "",
    },
  });

  // Domain form
  const domainForm = useForm<z.infer<typeof domainFormSchema>>({
    resolver: zodResolver(domainFormSchema),
    defaultValues: {
      domain: "",
      customCss: "",
    },
  });

  // Email form
  const emailForm = useForm<z.infer<typeof emailFormSchema>>({
    resolver: zodResolver(emailFormSchema),
    defaultValues: {
      senderName: "",
      senderEmail: "",
      headerImage: "",
      footerImage: "",
      showPoweredBy: true,
    },
  });

  // Login form
  const loginForm = useForm<z.infer<typeof loginFormSchema>>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      backgroundImage: "",
      welcomeText: "",
      loginButtonText: "",
    },
  });

  // Features form
  const featuresForm = useForm<z.infer<typeof featuresFormSchema>>({
    resolver: zodResolver(featuresFormSchema),
    defaultValues: {
      enabledFeatures: [],
    },
  });

  // Set form defaults from fetched data
  React.useEffect(() => {
    if (settingsData) {
      brandingForm.reset({
        brandName: settingsData.brandName,
        companyLogo: settingsData.companyLogo,
        favicon: settingsData.favicon,
        primaryColor: settingsData.primaryColor,
        secondaryColor: settingsData.secondaryColor,
        accentColor: settingsData.accentColor,
        footerText: settingsData.footerText,
      });

      domainForm.reset({
        domain: settingsData.domain || "",
        customCss: settingsData.customCss || "",
      });

      emailForm.reset({
        senderName: settingsData.emailSettings.senderName,
        senderEmail: settingsData.emailSettings.senderEmail,
        headerImage: settingsData.emailSettings.headerImage || "",
        footerImage: settingsData.emailSettings.footerImage || "",
        showPoweredBy: settingsData.emailSettings.showPoweredBy,
      });

      loginForm.reset({
        backgroundImage: settingsData.loginPage.backgroundImage || "",
        welcomeText: settingsData.loginPage.welcomeText,
        loginButtonText: settingsData.loginPage.loginButtonText,
      });

      featuresForm.reset({
        enabledFeatures: settingsData.enabledFeatures,
      });
    }
  }, [settingsData, brandingForm, domainForm, emailForm, loginForm, featuresForm]);

  const onBrandingSubmit = (values: z.infer<typeof brandingFormSchema>) => {
    console.log("Updating branding settings:", values);
    
    toast({
      title: "Branding Updated",
      description: "Your branding settings have been updated successfully.",
    });
    
    // Invalidate queries to refresh data
    queryClient.invalidateQueries({ queryKey: ["/api/white-label-settings"] });
  };

  const onDomainSubmit = (values: z.infer<typeof domainFormSchema>) => {
    console.log("Updating domain settings:", values);
    
    toast({
      title: "Domain Settings Updated",
      description: "Your domain settings have been updated successfully.",
    });
    
    // Invalidate queries to refresh data
    queryClient.invalidateQueries({ queryKey: ["/api/white-label-settings"] });
  };

  const onEmailSubmit = (values: z.infer<typeof emailFormSchema>) => {
    console.log("Updating email settings:", values);
    
    toast({
      title: "Email Settings Updated",
      description: "Your email settings have been updated successfully.",
    });
    
    // Invalidate queries to refresh data
    queryClient.invalidateQueries({ queryKey: ["/api/white-label-settings"] });
  };

  const onLoginSubmit = (values: z.infer<typeof loginFormSchema>) => {
    console.log("Updating login settings:", values);
    
    toast({
      title: "Login Page Updated",
      description: "Your login page settings have been updated successfully.",
    });
    
    // Invalidate queries to refresh data
    queryClient.invalidateQueries({ queryKey: ["/api/white-label-settings"] });
  };

  const onFeaturesSubmit = (values: z.infer<typeof featuresFormSchema>) => {
    console.log("Updating features settings:", values);
    
    toast({
      title: "Features Updated",
      description: "Your feature settings have been updated successfully.",
    });
    
    // Invalidate queries to refresh data
    queryClient.invalidateQueries({ queryKey: ["/api/white-label-settings"] });
  };

  return (
    <>
      <Helmet>
        <title>White Label Settings | RepuRadar</title>
        <meta
          name="description"
          content="Customize and configure white label settings for your branded dashboard."
        />
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <main className="flex-1 p-4 lg:p-6 bg-slate-50 min-h-screen">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <header className="mb-6">
              <h1 className="text-2xl font-semibold text-slate-800">White Label Configuration</h1>
              <p className="text-slate-500">
                Customize the look and feel of your branded dashboard
              </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Tabs and Forms */}
              <div className="lg:col-span-2">
                <Tabs
                  defaultValue="branding"
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="w-full"
                >
                  <TabsList className="mb-6">
                    <TabsTrigger value="branding">
                      <Paintbrush className="h-4 w-4 mr-2" />
                      Branding
                    </TabsTrigger>
                    <TabsTrigger value="domain">
                      <Globe className="h-4 w-4 mr-2" />
                      Domain
                    </TabsTrigger>
                    <TabsTrigger value="email">
                      <Mail className="h-4 w-4 mr-2" />
                      Email
                    </TabsTrigger>
                    <TabsTrigger value="login">
                      <UserCircle className="h-4 w-4 mr-2" />
                      Login
                    </TabsTrigger>
                    <TabsTrigger value="features">
                      <Layers className="h-4 w-4 mr-2" />
                      Features
                    </TabsTrigger>
                  </TabsList>

                  {/* Branding Tab */}
                  <TabsContent value="branding">
                    <Card>
                      <CardHeader>
                        <CardTitle>Branding Settings</CardTitle>
                        <CardDescription>
                          Customize your platform appearance with your brand elements
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Form {...brandingForm}>
                          <form
                            onSubmit={brandingForm.handleSubmit(onBrandingSubmit)}
                            className="space-y-6"
                          >
                            <FormField
                              control={brandingForm.control}
                              name="brandName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Brand Name</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Your Company Name" {...field} />
                                  </FormControl>
                                  <FormDescription>
                                    This name will appear in the dashboard header and emails
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <FormField
                                control={brandingForm.control}
                                name="companyLogo"
                                render={({ field }) => (
                                  <FormItem className="col-span-1">
                                    <FormLabel>Company Logo</FormLabel>
                                    <div className="flex items-center gap-2">
                                      <div className="w-16 h-16 border rounded-md flex items-center justify-center bg-white">
                                        {field.value ? (
                                          <img
                                            src={field.value}
                                            alt="Logo"
                                            className="max-w-full max-h-full object-contain"
                                          />
                                        ) : (
                                          <ImageIcon className="h-8 w-8 text-slate-300" />
                                        )}
                                      </div>
                                      <div className="flex-1">
                                        <FormControl>
                                          <Input
                                            placeholder="URL to your logo"
                                            {...field}
                                            className="mb-2"
                                          />
                                        </FormControl>
                                        <Button type="button" variant="outline" size="sm">
                                          <FileImage className="h-4 w-4 mr-2" />
                                          Upload Logo
                                        </Button>
                                      </div>
                                    </div>
                                    <FormDescription>
                                      Recommended size: 200x50px, format: SVG, PNG or JPG
                                    </FormDescription>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={brandingForm.control}
                                name="favicon"
                                render={({ field }) => (
                                  <FormItem className="col-span-1">
                                    <FormLabel>Favicon</FormLabel>
                                    <div className="flex items-center gap-2">
                                      <div className="w-16 h-16 border rounded-md flex items-center justify-center bg-white">
                                        {field.value ? (
                                          <img
                                            src={field.value}
                                            alt="Favicon"
                                            className="max-w-full max-h-full object-contain"
                                          />
                                        ) : (
                                          <ImageIcon className="h-8 w-8 text-slate-300" />
                                        )}
                                      </div>
                                      <div className="flex-1">
                                        <FormControl>
                                          <Input
                                            placeholder="URL to your favicon"
                                            {...field}
                                            className="mb-2"
                                          />
                                        </FormControl>
                                        <Button type="button" variant="outline" size="sm">
                                          <FileImage className="h-4 w-4 mr-2" />
                                          Upload Icon
                                        </Button>
                                      </div>
                                    </div>
                                    <FormDescription>
                                      Recommended size: 32x32px, format: ICO, PNG
                                    </FormDescription>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>

                            <h3 className="text-lg font-medium pt-2">Color Scheme</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <FormField
                                control={brandingForm.control}
                                name="primaryColor"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Primary Color</FormLabel>
                                    <div className="flex gap-2">
                                      <div
                                        className="w-10 h-10 rounded border"
                                        style={{ backgroundColor: field.value }}
                                      />
                                      <FormControl>
                                        <Input {...field} />
                                      </FormControl>
                                    </div>
                                    <FormDescription>
                                      Main brand color
                                    </FormDescription>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={brandingForm.control}
                                name="secondaryColor"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Secondary Color</FormLabel>
                                    <div className="flex gap-2">
                                      <div
                                        className="w-10 h-10 rounded border"
                                        style={{ backgroundColor: field.value }}
                                      />
                                      <FormControl>
                                        <Input {...field} />
                                      </FormControl>
                                    </div>
                                    <FormDescription>
                                      Used for highlights
                                    </FormDescription>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={brandingForm.control}
                                name="accentColor"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Accent Color</FormLabel>
                                    <div className="flex gap-2">
                                      <div
                                        className="w-10 h-10 rounded border"
                                        style={{ backgroundColor: field.value }}
                                      />
                                      <FormControl>
                                        <Input {...field} />
                                      </FormControl>
                                    </div>
                                    <FormDescription>
                                      Used for buttons, etc.
                                    </FormDescription>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>

                            <FormField
                              control={brandingForm.control}
                              name="footerText"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Footer Text</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="© 2025 Your Company. All rights reserved."
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormDescription>
                                    Text to display in the footer of your dashboard
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <div className="flex justify-end">
                              <Button type="submit">Save Branding Settings</Button>
                            </div>
                          </form>
                        </Form>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Domain Tab */}
                  <TabsContent value="domain">
                    <Card>
                      <CardHeader>
                        <CardTitle>Domain and URL Settings</CardTitle>
                        <CardDescription>
                          Configure your custom domain and CSS customizations
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Form {...domainForm}>
                          <form
                            onSubmit={domainForm.handleSubmit(onDomainSubmit)}
                            className="space-y-6"
                          >
                            <FormField
                              control={domainForm.control}
                              name="domain"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Custom Domain</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="dashboard.yourcompany.com"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormDescription>
                                    Your branded dashboard URL (requires Enterprise plan)
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <div className="border rounded-md p-4 bg-slate-50">
                              <h3 className="text-sm font-medium mb-2">Custom Domain Setup</h3>
                              <div className="space-y-4">
                                <div>
                                  <span className="text-sm font-medium">Step 1:</span>
                                  <p className="text-sm text-slate-500">
                                    Create a CNAME record at your domain provider pointing to:
                                    <code className="ml-1 px-1 py-0.5 bg-slate-200 rounded text-slate-800">
                                      dashboard.repuradar.com
                                    </code>
                                  </p>
                                </div>
                                <div>
                                  <span className="text-sm font-medium">Step 2:</span>
                                  <p className="text-sm text-slate-500">
                                    Add your domain above and save settings
                                  </p>
                                </div>
                                <div>
                                  <span className="text-sm font-medium">Step 3:</span>
                                  <p className="text-sm text-slate-500">
                                    We'll provision SSL certificates automatically (may take up to 24 hours)
                                  </p>
                                </div>
                              </div>
                            </div>

                            <Separator className="my-6" />

                            <FormField
                              control={domainForm.control}
                              name="customCss"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Custom CSS</FormLabel>
                                  <FormControl>
                                    <Textarea
                                      placeholder=".my-custom-class { color: #ff0000; }"
                                      className="font-mono text-sm h-32"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormDescription>
                                    Add custom CSS to further customize your dashboard appearance
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <div className="flex justify-end">
                              <Button type="submit">Save Domain Settings</Button>
                            </div>
                          </form>
                        </Form>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Email Tab */}
                  <TabsContent value="email">
                    <Card>
                      <CardHeader>
                        <CardTitle>Email Branding</CardTitle>
                        <CardDescription>
                          Customize the appearance of notification emails sent from the platform
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Form {...emailForm}>
                          <form
                            onSubmit={emailForm.handleSubmit(onEmailSubmit)}
                            className="space-y-6"
                          >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <FormField
                                control={emailForm.control}
                                name="senderName"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Sender Name</FormLabel>
                                    <FormControl>
                                      <Input
                                        placeholder="Your Company Support"
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormDescription>
                                      Name that appears in the 'From' field
                                    </FormDescription>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={emailForm.control}
                                name="senderEmail"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Sender Email</FormLabel>
                                    <FormControl>
                                      <Input
                                        placeholder="support@yourcompany.com"
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormDescription>
                                      Email address that appears in the 'From' field
                                    </FormDescription>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <FormField
                                control={emailForm.control}
                                name="headerImage"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Email Header Image</FormLabel>
                                    <div className="border rounded-md overflow-hidden bg-white">
                                      {field.value ? (
                                        <img
                                          src={field.value}
                                          alt="Email Header"
                                          className="max-w-full h-20 object-contain"
                                        />
                                      ) : (
                                        <div className="h-20 flex items-center justify-center">
                                          <ImageIcon className="h-8 w-8 text-slate-300" />
                                        </div>
                                      )}
                                    </div>
                                    <div className="mt-2">
                                      <FormControl>
                                        <Input
                                          placeholder="URL to your email header image"
                                          {...field}
                                          className="mb-2"
                                        />
                                      </FormControl>
                                      <Button type="button" variant="outline" size="sm">
                                        <FileImage className="h-4 w-4 mr-2" />
                                        Upload Image
                                      </Button>
                                    </div>
                                    <FormDescription>
                                      Recommended size: 600x150px, format: PNG or JPG
                                    </FormDescription>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={emailForm.control}
                                name="footerImage"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Email Footer Image</FormLabel>
                                    <div className="border rounded-md overflow-hidden bg-white">
                                      {field.value ? (
                                        <img
                                          src={field.value}
                                          alt="Email Footer"
                                          className="max-w-full h-20 object-contain"
                                        />
                                      ) : (
                                        <div className="h-20 flex items-center justify-center">
                                          <ImageIcon className="h-8 w-8 text-slate-300" />
                                        </div>
                                      )}
                                    </div>
                                    <div className="mt-2">
                                      <FormControl>
                                        <Input
                                          placeholder="URL to your email footer image"
                                          {...field}
                                          className="mb-2"
                                        />
                                      </FormControl>
                                      <Button type="button" variant="outline" size="sm">
                                        <FileImage className="h-4 w-4 mr-2" />
                                        Upload Image
                                      </Button>
                                    </div>
                                    <FormDescription>
                                      Recommended size: 600x100px, format: PNG or JPG
                                    </FormDescription>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>

                            <FormField
                              control={emailForm.control}
                              name="showPoweredBy"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                    />
                                  </FormControl>
                                  <div className="space-y-1 leading-none">
                                    <FormLabel>Show "Powered by RepuRadar"</FormLabel>
                                    <FormDescription>
                                      Include a subtle "Powered by RepuRadar" text in email footers
                                    </FormDescription>
                                  </div>
                                </FormItem>
                              )}
                            />

                            <div className="flex justify-end">
                              <Button type="submit">Save Email Settings</Button>
                            </div>
                          </form>
                        </Form>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Login Tab */}
                  <TabsContent value="login">
                    <Card>
                      <CardHeader>
                        <CardTitle>Login Page Customization</CardTitle>
                        <CardDescription>
                          Configure the appearance of your branded login page
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Form {...loginForm}>
                          <form
                            onSubmit={loginForm.handleSubmit(onLoginSubmit)}
                            className="space-y-6"
                          >
                            <FormField
                              control={loginForm.control}
                              name="backgroundImage"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Background Image</FormLabel>
                                  <div className="border rounded-md overflow-hidden">
                                    {field.value ? (
                                      <img
                                        src={field.value}
                                        alt="Login Background"
                                        className="max-w-full h-40 w-full object-cover"
                                      />
                                    ) : (
                                      <div className="h-40 bg-slate-100 flex items-center justify-center">
                                        <ImageIcon className="h-10 w-10 text-slate-300" />
                                      </div>
                                    )}
                                  </div>
                                  <div className="mt-2">
                                    <FormControl>
                                      <Input
                                        placeholder="URL to your background image"
                                        {...field}
                                        className="mb-2"
                                      />
                                    </FormControl>
                                    <Button type="button" variant="outline" size="sm">
                                      <FileImage className="h-4 w-4 mr-2" />
                                      Upload Image
                                    </Button>
                                  </div>
                                  <FormDescription>
                                    Recommended size: 1920x1080px, format: PNG or JPG
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={loginForm.control}
                              name="welcomeText"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Welcome Message</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="Welcome to Your Company Dashboard"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormDescription>
                                    Text displayed on the login page
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={loginForm.control}
                              name="loginButtonText"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Login Button Text</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Sign In" {...field} />
                                  </FormControl>
                                  <FormDescription>
                                    Text displayed on the login button
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <div className="flex justify-end">
                              <Button type="submit">Save Login Settings</Button>
                            </div>
                          </form>
                        </Form>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Features Tab */}
                  <TabsContent value="features">
                    <Card>
                      <CardHeader>
                        <CardTitle>Feature Configuration</CardTitle>
                        <CardDescription>
                          Configure which features are available to your users
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Form {...featuresForm}>
                          <form
                            onSubmit={featuresForm.handleSubmit(onFeaturesSubmit)}
                            className="space-y-6"
                          >
                            <FormField
                              control={featuresForm.control}
                              name="enabledFeatures"
                              render={() => (
                                <FormItem>
                                  <div className="mb-4">
                                    <FormLabel>Enabled Features</FormLabel>
                                    <FormDescription>
                                      Select which features to show in your white-labeled dashboard
                                    </FormDescription>
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {[
                                      {
                                        id: "dashboard",
                                        label: "Dashboard",
                                        description: "Main dashboard overview",
                                        icon: <LayoutDashboard className="h-4 w-4" />,
                                      },
                                      {
                                        id: "reviews",
                                        label: "Reviews Management",
                                        description: "View and respond to reviews",
                                        icon: <MessageSquare className="h-4 w-4" />,
                                      },
                                      {
                                        id: "analytics",
                                        label: "Analytics",
                                        description: "Performance metrics and charts",
                                        icon: <BarChart className="h-4 w-4" />,
                                      },
                                      {
                                        id: "reports",
                                        label: "Reports",
                                        description: "Automated reports and insights",
                                        icon: <FileText className="h-4 w-4" />,
                                      },
                                      {
                                        id: "templates",
                                        label: "Response Templates",
                                        description: "Manage response templates",
                                        icon: <PenSquare className="h-4 w-4" />,
                                      },
                                      {
                                        id: "integrations",
                                        label: "Integrations",
                                        description: "Connect to external services",
                                        icon: <Link2 className="h-4 w-4" />,
                                      },
                                      {
                                        id: "locations",
                                        label: "Locations",
                                        description: "Manage multiple business locations",
                                        icon: <MapPin className="h-4 w-4" />,
                                      },
                                      {
                                        id: "competitors",
                                        label: "Competitors",
                                        description: "Track competitor performance",
                                        icon: <Users2 className="h-4 w-4" />,
                                      },
                                      {
                                        id: "settings",
                                        label: "Settings",
                                        description: "User and account settings",
                                        icon: <Settings className="h-4 w-4" />,
                                      },
                                      {
                                        id: "billing",
                                        label: "Billing",
                                        description: "Manage subscription and billing",
                                        icon: <CreditCard className="h-4 w-4" />,
                                      },
                                    ].map((feature) => (
                                      <FormField
                                        key={feature.id}
                                        control={featuresForm.control}
                                        name="enabledFeatures"
                                        render={({ field }) => {
                                          return (
                                            <FormItem
                                              key={feature.id}
                                              className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4"
                                            >
                                              <FormControl>
                                                <Checkbox
                                                  checked={field.value?.includes(feature.id)}
                                                  onCheckedChange={(checked) => {
                                                    return checked
                                                      ? field.onChange([
                                                          ...(field.value || []),
                                                          feature.id,
                                                        ])
                                                      : field.onChange(
                                                          field.value?.filter(
                                                            (value) => value !== feature.id
                                                          )
                                                        );
                                                  }}
                                                />
                                              </FormControl>
                                              <div className="space-y-1 leading-none">
                                                <FormLabel className="flex items-center">
                                                  <span className="mr-2">{feature.icon}</span>
                                                  {feature.label}
                                                </FormLabel>
                                                <FormDescription>
                                                  {feature.description}
                                                </FormDescription>
                                              </div>
                                            </FormItem>
                                          );
                                        }}
                                      />
                                    ))}
                                  </div>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <div className="flex justify-end">
                              <Button type="submit">Save Feature Settings</Button>
                            </div>
                          </form>
                        </Form>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>

              {/* Preview */}
              <div className="col-span-1">
                <div className="sticky top-6">
                  <Card>
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle>Preview</CardTitle>
                        <div className="flex border rounded-md overflow-hidden">
                          <Button
                            variant={previewMode === "desktop" ? "default" : "ghost"}
                            size="sm"
                            className="rounded-none"
                            onClick={() => setPreviewMode("desktop")}
                          >
                            <Laptop className="h-4 w-4" />
                          </Button>
                          <Button
                            variant={previewMode === "mobile" ? "default" : "ghost"}
                            size="sm"
                            className="rounded-none"
                            onClick={() => setPreviewMode("mobile")}
                          >
                            <Smartphone className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div
                        className={`border rounded-md overflow-hidden mx-4 mb-4 ${
                          previewMode === "desktop" ? "w-full" : "w-1/2 mx-auto"
                        }`}
                      >
                        {/* Preview content based on active tab */}
                        {activeTab === "branding" && (
                          <div className="bg-white">
                            {/* Header */}
                            <div
                              className="p-4 border-b"
                              style={{
                                backgroundColor: brandingForm.watch("primaryColor"),
                                color: "white",
                              }}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  {brandingForm.watch("companyLogo") ? (
                                    <img
                                      src={brandingForm.watch("companyLogo")}
                                      alt="Logo"
                                      className="h-8 max-w-28 object-contain"
                                    />
                                  ) : (
                                    <div className="font-bold text-lg">
                                      {brandingForm.watch("brandName") || "Company Name"}
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <UserCircle className="h-5 w-5" />
                                </div>
                              </div>
                            </div>
                            {/* Content */}
                            <div className="p-4 space-y-4">
                              <div className="h-20 bg-slate-100 rounded-md"></div>
                              <div className="space-y-2">
                                <div className="h-5 bg-slate-100 rounded-md w-3/4"></div>
                                <div className="h-5 bg-slate-100 rounded-md w-1/2"></div>
                              </div>
                              <div className="flex gap-2">
                                <div
                                  className="px-3 py-1 rounded-md text-white text-xs"
                                  style={{
                                    backgroundColor: brandingForm.watch("accentColor"),
                                  }}
                                >
                                  Button
                                </div>
                                <div
                                  className="px-3 py-1 rounded-md text-xs"
                                  style={{
                                    backgroundColor: "white",
                                    color: brandingForm.watch("secondaryColor"),
                                    border: `1px solid ${brandingForm.watch("secondaryColor")}`,
                                  }}
                                >
                                  Button
                                </div>
                              </div>
                            </div>
                            {/* Footer */}
                            <div className="p-3 border-t text-xs text-center text-slate-500">
                              {brandingForm.watch("footerText") ||
                                "© 2025 Company Name. All rights reserved."}
                            </div>
                          </div>
                        )}

                        {activeTab === "domain" && (
                          <div className="bg-white">
                            {/* Browser bar */}
                            <div className="bg-slate-100 p-2 flex items-center gap-2 text-xs">
                              <div className="text-green-600">
                                <Lock className="h-3 w-3" />
                              </div>
                              <div className="flex-1 bg-white px-2 py-1 rounded truncate">
                                {domainForm.watch("domain") || "dashboard.repuradar.com"}
                              </div>
                            </div>
                            {/* Page content */}
                            <div className="h-40 bg-white p-4 flex flex-col items-center justify-center text-center">
                              <div className="text-sm font-medium mb-1">Your domain:</div>
                              <div className="text-xs bg-slate-50 px-2 py-1 rounded">
                                {domainForm.watch("domain") || "dashboard.repuradar.com"}
                              </div>
                              {domainForm.watch("customCss") && (
                                <div className="mt-4 text-xs text-green-600 flex items-center">
                                  <Check className="h-3 w-3 mr-1" />
                                  Custom CSS applied
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {activeTab === "email" && (
                          <div className="bg-slate-50">
                            {/* Email preview */}
                            <div className="p-4 space-y-4">
                              {/* Header */}
                              <div className="bg-white rounded-t-md overflow-hidden shadow-sm">
                                {emailForm.watch("headerImage") ? (
                                  <img
                                    src={emailForm.watch("headerImage")}
                                    alt="Email Header"
                                    className="w-full h-16 object-cover"
                                  />
                                ) : (
                                  <div className="h-16 bg-slate-100 flex items-center justify-center">
                                    <div className="font-bold text-slate-400">
                                      {brandingForm.watch("brandName") || "Company Name"}
                                    </div>
                                  </div>
                                )}
                                <div className="p-4 text-xs">
                                  <div className="font-medium mb-2">Subject: Your Weekly Review Report</div>
                                  <div className="space-y-1">
                                    <div className="h-2 bg-slate-100 rounded-md w-full"></div>
                                    <div className="h-2 bg-slate-100 rounded-md w-3/4"></div>
                                    <div className="h-2 bg-slate-100 rounded-md w-5/6"></div>
                                  </div>
                                </div>
                              </div>
                              {/* Footer */}
                              <div className="bg-white rounded-b-md overflow-hidden shadow-sm">
                                {emailForm.watch("footerImage") && (
                                  <img
                                    src={emailForm.watch("footerImage")}
                                    alt="Email Footer"
                                    className="w-full h-10 object-cover"
                                  />
                                )}
                                <div className="p-3 text-center text-xs text-slate-400">
                                  {brandingForm.watch("footerText") ||
                                    "© 2025 Company Name. All rights reserved."}
                                  {emailForm.watch("showPoweredBy") && (
                                    <div className="mt-1 text-[10px]">Powered by RepuRadar</div>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="p-3 text-xs text-center text-slate-500">
                              From: {emailForm.watch("senderName") || "Sender Name"}{" "}
                              &lt;{emailForm.watch("senderEmail") || "email@example.com"}&gt;
                            </div>
                          </div>
                        )}

                        {activeTab === "login" && (
                          <div
                            className="h-60 bg-white relative flex items-center justify-center"
                            style={{
                              backgroundImage: loginForm.watch("backgroundImage")
                                ? `url(${loginForm.watch("backgroundImage")})`
                                : "none",
                              backgroundSize: "cover",
                              backgroundPosition: "center",
                            }}
                          >
                            <div className="absolute inset-0 bg-black/20"></div>
                            <div className="relative z-10 bg-white p-4 rounded-md shadow-lg text-center">
                              {brandingForm.watch("companyLogo") ? (
                                <img
                                  src={brandingForm.watch("companyLogo")}
                                  alt="Logo"
                                  className="h-8 mx-auto mb-3 object-contain"
                                />
                              ) : (
                                <div className="font-bold text-lg mb-3">
                                  {brandingForm.watch("brandName") || "Company Name"}
                                </div>
                              )}
                              <div className="text-sm font-medium mb-3">
                                {loginForm.watch("welcomeText") || "Welcome to Dashboard"}
                              </div>
                              <div className="space-y-2 mb-3">
                                <div className="h-8 bg-slate-100 rounded-md w-full"></div>
                                <div className="h-8 bg-slate-100 rounded-md w-full"></div>
                              </div>
                              <div
                                className="px-3 py-1 rounded-md text-white text-sm w-full"
                                style={{
                                  backgroundColor: brandingForm.watch("accentColor") || "#10B981",
                                }}
                              >
                                {loginForm.watch("loginButtonText") || "Sign In"}
                              </div>
                            </div>
                          </div>
                        )}

                        {activeTab === "features" && (
                          <div className="bg-white">
                            {/* Sidebar preview */}
                            <div className="flex h-60">
                              <div className="w-1/3 border-r">
                                <div className="p-3 border-b bg-slate-50">
                                  {brandingForm.watch("companyLogo") ? (
                                    <img
                                      src={brandingForm.watch("companyLogo")}
                                      alt="Logo"
                                      className="h-6 object-contain"
                                    />
                                  ) : (
                                    <div className="font-bold text-sm">
                                      {brandingForm.watch("brandName") || "Company Name"}
                                    </div>
                                  )}
                                </div>
                                <div className="p-2">
                                  <ScrollArea className="h-44">
                                    {(featuresForm.watch("enabledFeatures") || []).map(
                                      (feature) => {
                                        const featureData = {
                                          dashboard: {
                                            label: "Dashboard",
                                            icon: <LayoutDashboard className="h-3 w-3" />,
                                          },
                                          reviews: {
                                            label: "Reviews",
                                            icon: <MessageSquare className="h-3 w-3" />,
                                          },
                                          analytics: {
                                            label: "Analytics",
                                            icon: <BarChart className="h-3 w-3" />,
                                          },
                                          reports: {
                                            label: "Reports",
                                            icon: <FileText className="h-3 w-3" />,
                                          },
                                          templates: {
                                            label: "Templates",
                                            icon: <PenSquare className="h-3 w-3" />,
                                          },
                                          integrations: {
                                            label: "Integrations",
                                            icon: <Link2 className="h-3 w-3" />,
                                          },
                                          locations: {
                                            label: "Locations",
                                            icon: <MapPin className="h-3 w-3" />,
                                          },
                                          competitors: {
                                            label: "Competitors",
                                            icon: <Users2 className="h-3 w-3" />,
                                          },
                                          settings: {
                                            label: "Settings",
                                            icon: <Settings className="h-3 w-3" />,
                                          },
                                          billing: {
                                            label: "Billing",
                                            icon: <CreditCard className="h-3 w-3" />,
                                          },
                                        }[feature];

                                        return (
                                          featureData && (
                                            <div
                                              key={feature}
                                              className="flex items-center gap-2 px-2 py-1.5 text-[10px] rounded-md hover:bg-slate-50"
                                            >
                                              {featureData.icon}
                                              <span>{featureData.label}</span>
                                            </div>
                                          )
                                        );
                                      }
                                    )}
                                  </ScrollArea>
                                </div>
                              </div>
                              <div className="w-2/3 p-3 flex flex-col">
                                <div className="text-[10px] font-medium mb-2">Dashboard</div>
                                <div className="space-y-2 flex-1">
                                  <div className="h-2 bg-slate-100 rounded-md w-full"></div>
                                  <div className="grid grid-cols-2 gap-2">
                                    <div className="h-12 bg-slate-100 rounded-md"></div>
                                    <div className="h-12 bg-slate-100 rounded-md"></div>
                                  </div>
                                  <div className="h-20 bg-slate-100 rounded-md"></div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-center">
                      <div className="text-xs text-slate-500 flex items-center">
                        <Info className="h-3 w-3 mr-1" />
                        Preview updates as you make changes
                      </div>
                    </CardFooter>
                  </Card>

                  <Card className="mt-4">
                    <CardHeader>
                      <CardTitle>White Label Settings</CardTitle>
                      <CardDescription>
                        Current plan settings and limitations
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="text-sm font-medium flex items-center">
                            Current Plan: Enterprise
                            <Badge className="ml-2 bg-purple-500">Enterprise</Badge>
                          </div>
                          <p className="text-sm text-slate-500 mt-1">
                            Full white label capabilities are available on your plan
                          </p>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="text-sm">Brand customization</div>
                            <Check className="h-4 w-4 text-green-500" />
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="text-sm">Custom domain</div>
                            <Check className="h-4 w-4 text-green-500" />
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="text-sm">Email customization</div>
                            <Check className="h-4 w-4 text-green-500" />
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="text-sm">Hide "Powered by"</div>
                            <Check className="h-4 w-4 text-green-500" />
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="text-sm">Feature control</div>
                            <Check className="h-4 w-4 text-green-500" />
                          </div>
                        </div>

                        <div className="text-xs text-slate-500">
                          Need help with white labeling? Contact our support team.
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default WhiteLabelPage;