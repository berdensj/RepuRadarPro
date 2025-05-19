import React from 'react';
import { SidebarLayout } from '@/components/dashboard/layout';
import { TabsContent, Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useForm, Controller } from 'react-hook-form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, AlertCircle, ExternalLink, RefreshCcw } from 'lucide-react';
import { Loader2 } from 'lucide-react';

interface HealthcareSettings {
  id?: number;
  userId: number;
  enableReviewAutomation: boolean;
  requestDelay: string;
  defaultTemplateId?: number;
  googleProfileLink?: string;
  usePatientTerminology: boolean;
  hipaaMode: boolean;
  drchronoEnabled: boolean;
  drchronoClientId?: string;
  drchronoClientSecret?: string;
  drchronoRefreshToken?: string;
  janeappEnabled: boolean;
  janeappApiKey?: string;
  janeappApiSecret?: string;
  primaryLocationId?: number;
  autoSendReviewRequests: boolean;
  defaultReviewPlatform: string;
  lastPolledAt?: Date;
}

interface Appointment {
  id: string;
  patient: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  ehrSource: 'drchrono' | 'janeapp';
  appointmentTime: string;
  providerId: string;
  providerName: string;
  status: string;
  locationId?: number;
  metadata?: Record<string, any>;
}

interface Patient {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  ehrId: string | null;
  ehrSource: string;
  lastAppointment: string | null;
  reviewRequestSent: string | null;
  reviewCompleted: boolean | null;
  reviewCompletedAt: string | null;
  reviewPlatform: string | null;
  rating: number | null;
}

interface ReviewStats {
  totalPatients: number;
  requestsSent: number;
  reviewsCompleted: number;
  conversionRate: number;
}

// Component for displaying the Healthcare Settings
const HealthcareSettingsForm = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Get locations for dropdown
  const { data: locations = [] } = useQuery({
    queryKey: ['/api/locations'],
  });
  
  // Fetch healthcare settings
  const { data: settings, isLoading } = useQuery({
    queryKey: ['/api/healthcare/settings'],
    queryFn: async () => {
      try {
        const res = await apiRequest('GET', '/api/healthcare/settings');
        return await res.json();
      } catch (error) {
        // If settings don't exist yet, return default values
        return {
          enableReviewAutomation: false,
          requestDelay: 'immediately',
          usePatientTerminology: true,
          hipaaMode: true,
          drchronoEnabled: false,
          janeappEnabled: false,
          autoSendReviewRequests: true,
          defaultReviewPlatform: 'google'
        };
      }
    }
  });
  
  // Form setup
  const { control, handleSubmit, watch, formState: { errors, isDirty } } = useForm<HealthcareSettings>({
    defaultValues: settings || {
      enableReviewAutomation: false,
      requestDelay: 'immediately',
      usePatientTerminology: true,
      hipaaMode: true,
      drchronoEnabled: false,
      janeappEnabled: false,
      autoSendReviewRequests: true,
      defaultReviewPlatform: 'google'
    }
  });
  
  // Watch for enabled state to conditionally show settings
  const drchronoEnabled = watch('drchronoEnabled');
  const janeappEnabled = watch('janeappEnabled');
  
  // Save settings mutation
  const saveSettingsMutation = useMutation({
    mutationFn: async (data: HealthcareSettings) => {
      const res = await apiRequest('POST', '/api/healthcare/settings', data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Settings Saved",
        description: "Your healthcare integration settings have been updated",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/healthcare/settings'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error Saving Settings",
        description: error.message || "An error occurred while saving settings",
        variant: "destructive",
      });
    }
  });
  
  // Handle form submission
  const onSubmit = (data: HealthcareSettings) => {
    saveSettingsMutation.mutate(data);
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-6">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>General Healthcare Settings</CardTitle>
          <CardDescription>
            Configure HIPAA compliance and review request settings for your healthcare practice
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between space-x-2">
            <div>
              <Label htmlFor="hipaa-mode" className="text-base font-medium">HIPAA Compliance Mode</Label>
              <p className="text-sm text-muted-foreground">
                Enables additional privacy features for healthcare organizations
              </p>
            </div>
            <Controller
              name="hipaaMode"
              control={control}
              render={({ field }) => (
                <Switch
                  id="hipaa-mode"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between space-x-2">
            <div>
              <Label htmlFor="patient-terminology" className="text-base font-medium">Use Patient Terminology</Label>
              <p className="text-sm text-muted-foreground">
                Use healthcare-specific terminology in communications
              </p>
            </div>
            <Controller
              name="usePatientTerminology"
              control={control}
              render={({ field }) => (
                <Switch
                  id="patient-terminology"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between space-x-2">
            <div>
              <Label htmlFor="review-automation" className="text-base font-medium">Enable Review Automation</Label>
              <p className="text-sm text-muted-foreground">
                Automatically request reviews after appointments
              </p>
            </div>
            <Controller
              name="enableReviewAutomation"
              control={control}
              render={({ field }) => (
                <Switch
                  id="review-automation"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
          </div>
          
          <Separator />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="request-delay">Request Delay</Label>
              <Controller
                name="requestDelay"
                control={control}
                render={({ field }) => (
                  <Select 
                    value={field.value} 
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger id="request-delay">
                      <SelectValue placeholder="Select when to send request" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediately">Immediately after appointment</SelectItem>
                      <SelectItem value="1hour">1 hour after appointment</SelectItem>
                      <SelectItem value="24hours">24 hours after appointment</SelectItem>
                      <SelectItem value="48hours">48 hours after appointment</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="default-platform">Default Review Platform</Label>
              <Controller
                name="defaultReviewPlatform"
                control={control}
                render={({ field }) => (
                  <Select 
                    value={field.value} 
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger id="default-platform">
                      <SelectValue placeholder="Select default platform" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="google">Google</SelectItem>
                      <SelectItem value="healthgrades">Healthgrades</SelectItem>
                      <SelectItem value="webmd">WebMD</SelectItem>
                      <SelectItem value="vitals">Vitals</SelectItem>
                      <SelectItem value="ratemds">RateMDs</SelectItem>
                      <SelectItem value="zocdoc">ZocDoc</SelectItem>
                      <SelectItem value="yelp">Yelp</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="primary-location">Primary Location</Label>
              <Controller
                name="primaryLocationId"
                control={control}
                render={({ field }) => (
                  <Select 
                    value={field.value?.toString() || ""} 
                    onValueChange={(value) => field.onChange(parseInt(value))}
                  >
                    <SelectTrigger id="primary-location">
                      <SelectValue placeholder="Select primary location" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map((location: any) => (
                        <SelectItem key={location.id} value={location.id.toString()}>
                          {location.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="google-profile">Google Business Profile Link</Label>
              <Controller
                name="googleProfileLink"
                control={control}
                render={({ field }) => (
                  <div className="flex">
                    <Input
                      id="google-profile"
                      placeholder="https://g.page/your-business"
                      {...field}
                      value={field.value || ""}
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="icon"
                      className="ml-2"
                      onClick={() => window.open(field.value, '_blank')}
                      disabled={!field.value}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>EHR Integrations</CardTitle>
          <CardDescription>
            Connect your Electronic Health Record system to automate review requests
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* DrChrono Integration */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">DrChrono Integration</h3>
                <p className="text-sm text-muted-foreground">
                  Connect to DrChrono to automatically request reviews after appointments
                </p>
              </div>
              <Controller
                name="drchronoEnabled"
                control={control}
                render={({ field }) => (
                  <Switch
                    id="drchrono-enabled"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
            </div>
            
            {drchronoEnabled && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6 border-l-2 border-primary/20">
                <div className="space-y-2">
                  <Label htmlFor="drchrono-client-id">Client ID</Label>
                  <Controller
                    name="drchronoClientId"
                    control={control}
                    rules={{ required: drchronoEnabled }}
                    render={({ field }) => (
                      <Input
                        id="drchrono-client-id"
                        placeholder="Enter your DrChrono Client ID"
                        {...field}
                        value={field.value || ""}
                      />
                    )}
                  />
                  {errors.drchronoClientId && (
                    <p className="text-sm text-destructive">Client ID is required</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="drchrono-client-secret">Client Secret</Label>
                  <Controller
                    name="drchronoClientSecret"
                    control={control}
                    rules={{ required: drchronoEnabled }}
                    render={({ field }) => (
                      <Input
                        id="drchrono-client-secret"
                        type="password"
                        placeholder="Enter your DrChrono Client Secret"
                        {...field}
                        value={field.value || ""}
                      />
                    )}
                  />
                  {errors.drchronoClientSecret && (
                    <p className="text-sm text-destructive">Client Secret is required</p>
                  )}
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="drchrono-token">Refresh Token</Label>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={() => toast({
                        title: "Authentication Required",
                        description: "Please complete the DrChrono authentication flow to get a refresh token",
                      })}
                    >
                      Authenticate with DrChrono
                    </Button>
                  </div>
                  <Controller
                    name="drchronoRefreshToken"
                    control={control}
                    render={({ field }) => (
                      <Input
                        id="drchrono-token"
                        type="password"
                        placeholder="Refresh token is generated automatically after authentication"
                        {...field}
                        value={field.value || ""}
                        disabled
                      />
                    )}
                  />
                </div>
              </div>
            )}
          </div>
          
          <Separator />
          
          {/* Jane App Integration */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">Jane App Integration</h3>
                <p className="text-sm text-muted-foreground">
                  Connect to Jane App to automatically request reviews after appointments
                </p>
              </div>
              <Controller
                name="janeappEnabled"
                control={control}
                render={({ field }) => (
                  <Switch
                    id="janeapp-enabled"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
            </div>
            
            {janeappEnabled && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6 border-l-2 border-primary/20">
                <div className="space-y-2">
                  <Label htmlFor="janeapp-api-key">API Key</Label>
                  <Controller
                    name="janeappApiKey"
                    control={control}
                    rules={{ required: janeappEnabled }}
                    render={({ field }) => (
                      <Input
                        id="janeapp-api-key"
                        placeholder="Enter your Jane App API Key"
                        {...field}
                        value={field.value || ""}
                      />
                    )}
                  />
                  {errors.janeappApiKey && (
                    <p className="text-sm text-destructive">API Key is required</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="janeapp-api-secret">API Secret</Label>
                  <Controller
                    name="janeappApiSecret"
                    control={control}
                    rules={{ required: janeappEnabled }}
                    render={({ field }) => (
                      <Input
                        id="janeapp-api-secret"
                        type="password"
                        placeholder="Enter your Jane App API Secret"
                        {...field}
                        value={field.value || ""}
                      />
                    )}
                  />
                  {errors.janeappApiSecret && (
                    <p className="text-sm text-destructive">API Secret is required</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-end">
        <Button 
          type="submit" 
          disabled={!isDirty || saveSettingsMutation.isPending}
          className="w-full md:w-auto"
        >
          {saveSettingsMutation.isPending && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          Save Settings
        </Button>
      </div>
    </form>
  );
};

// Component for displaying today's appointments
const AppointmentsTab = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch today's appointments
  const { data: appointments = [], isLoading, refetch } = useQuery({
    queryKey: ['/api/healthcare/appointments/today'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/healthcare/appointments/today');
      return await res.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Manually trigger appointment polling
  const pollMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/healthcare/appointments/poll');
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Polling Complete",
        description: "Appointment status has been updated",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/healthcare/appointments/today'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to poll appointments",
        variant: "destructive",
      });
    }
  });
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-6">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Today's Appointments</h2>
        <Button 
          onClick={() => {
            refetch();
            pollMutation.mutate();
          }}
          variant="outline"
          disabled={pollMutation.isPending}
        >
          <RefreshCcw className="mr-2 h-4 w-4" />
          {pollMutation.isPending ? "Refreshing..." : "Refresh Appointments"}
        </Button>
      </div>
      
      {appointments.length === 0 ? (
        <Card>
          <CardContent className="p-6 flex flex-col items-center justify-center text-center">
            <CalendarIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No appointments for today</h3>
            <p className="text-sm text-muted-foreground mt-2">
              Appointments will appear here when they are scheduled in your EHR system
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {appointments.map((appointment: Appointment) => (
            <Card key={appointment.id}>
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h3 className="font-medium">{appointment.patient.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {appointment.patient.email || 'No email'} | {appointment.patient.phone || 'No phone'}
                    </p>
                    <div className="mt-2">
                      <Badge variant={appointment.status === 'Complete' ? 'success' : appointment.status === 'Confirmed' ? 'default' : 'secondary'}>
                        {appointment.status}
                      </Badge>
                      <Badge variant="outline" className="ml-2">
                        {appointment.ehrSource}
                      </Badge>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium">Appointment Time</p>
                    <p className="text-sm">{formatDate(appointment.appointmentTime)}</p>
                    
                    <p className="text-sm font-medium mt-2">Provider</p>
                    <p className="text-sm">{appointment.providerName}</p>
                  </div>
                  
                  <div>
                    {appointment.metadata && (
                      <>
                        <p className="text-sm font-medium">Type</p>
                        <p className="text-sm">{appointment.metadata.appointmentType || 'N/A'}</p>
                        
                        <p className="text-sm font-medium mt-2">Duration</p>
                        <p className="text-sm">{appointment.metadata.duration ? `${appointment.metadata.duration} minutes` : 'N/A'}</p>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

// Component for displaying review request statistics
const ReviewStatsTab = () => {
  // Fetch review request statistics
  const { data: stats, isLoading } = useQuery({
    queryKey: ['/api/healthcare/appointments/stats'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/healthcare/appointments/stats');
      return await res.json();
    }
  });
  
  // Fetch patients with review status
  const { data: patients = [], isLoading: patientsLoading } = useQuery({
    queryKey: ['/api/healthcare/patients'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/healthcare/patients');
      return await res.json();
    }
  });
  
  if (isLoading || patientsLoading) {
    return (
      <div className="flex items-center justify-center p-6">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-base">Total Patients</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-3xl font-bold">{stats?.totalPatients || 0}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-base">Review Requests Sent</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-3xl font-bold">{stats?.requestsSent || 0}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-base">Reviews Completed</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-3xl font-bold">{stats?.reviewsCompleted || 0}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-base">Conversion Rate</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-3xl font-bold">{stats?.conversionRate || 0}%</p>
          </CardContent>
        </Card>
      </div>
      
      <h2 className="text-2xl font-bold mt-8">Recent Review Requests</h2>
      
      {patients.length === 0 ? (
        <Card>
          <CardContent className="p-6 flex flex-col items-center justify-center text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No review requests sent yet</h3>
            <p className="text-sm text-muted-foreground mt-2">
              Completed appointments will trigger review requests based on your settings
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Patient</th>
                <th className="text-left p-2">Last Appointment</th>
                <th className="text-left p-2">Request Sent</th>
                <th className="text-left p-2">Platform</th>
                <th className="text-left p-2">Status</th>
                <th className="text-left p-2">Rating</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((patient: Patient) => (
                <tr key={patient.id} className="border-b hover:bg-muted/50">
                  <td className="p-2">
                    <div>
                      <p className="font-medium">{patient.name}</p>
                      <p className="text-sm text-muted-foreground">{patient.email || 'No email'}</p>
                    </div>
                  </td>
                  <td className="p-2">{formatDate(patient.lastAppointment)}</td>
                  <td className="p-2">{formatDate(patient.reviewRequestSent)}</td>
                  <td className="p-2">{patient.reviewPlatform || 'N/A'}</td>
                  <td className="p-2">
                    {patient.reviewCompleted ? (
                      <Badge variant="success">Completed</Badge>
                    ) : patient.reviewRequestSent ? (
                      <Badge>Sent</Badge>
                    ) : (
                      <Badge variant="outline">Pending</Badge>
                    )}
                  </td>
                  <td className="p-2">{patient.rating || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default function HealthcareSettingsPage() {
  return (
    <SidebarLayout>
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">Healthcare Settings</h1>
        
        <Tabs defaultValue="settings" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="appointments">Today's Appointments</TabsTrigger>
            <TabsTrigger value="stats">Review Requests</TabsTrigger>
          </TabsList>
          
          <TabsContent value="settings" className="space-y-6">
            <HealthcareSettingsForm />
          </TabsContent>
          
          <TabsContent value="appointments">
            <AppointmentsTab />
          </TabsContent>
          
          <TabsContent value="stats">
            <ReviewStatsTab />
          </TabsContent>
        </Tabs>
      </div>
    </SidebarLayout>
  );
}