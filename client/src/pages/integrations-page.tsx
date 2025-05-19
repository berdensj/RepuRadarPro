import React from 'react';
import { Helmet } from 'react-helmet';
import { Button } from "@/components/ui/button";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Define the Location interface
interface Location {
  id: number;
  userId: number;
  name: string;
  address?: string;
  phone?: string;
}

// Form schemas for each integration
const googlePlacesSchema = z.object({
  placeId: z.string().min(1, 'Google Place ID is required'),
  apiKey: z.string().min(1, 'API Key is required')
});

const yelpSchema = z.object({
  businessId: z.string().min(1, 'Yelp Business ID is required'),
  apiKey: z.string().min(1, 'API Key is required')
});

const facebookSchema = z.object({
  pageId: z.string().min(1, 'Facebook Page ID is required'),
  accessToken: z.string().min(1, 'Access Token is required')
});

const appleMapsSchema = z.object({
  placeId: z.string().min(1, 'Apple Maps Place ID is required'),
  teamId: z.string().min(1, 'Team ID is required'),
  keyId: z.string().min(1, 'Key ID is required'),
  privateKey: z.string().min(1, 'Private Key is required')
});

type IntegrationStatus = 'idle' | 'loading' | 'success' | 'error';

const IntegrationsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Add state for selected location
  const [selectedLocation, setSelectedLocation] = useState<string>("all");
  
  // Add state for locations
  const [locations, setLocations] = useState<any[]>([]);
  
  // Fetch locations
  const { data: locationsData } = useQuery({
    queryKey: ['/api/locations'],
    onSuccess: (data) => {
      if (Array.isArray(data)) {
        setLocations(data);
      }
    }
  });
  
  // Integration status states
  const [googleStatus, setGoogleStatus] = useState<IntegrationStatus>('idle');
  const [yelpStatus, setYelpStatus] = useState<IntegrationStatus>('idle');
  const [facebookStatus, setFacebookStatus] = useState<IntegrationStatus>('idle');
  const [appleStatus, setAppleStatus] = useState<IntegrationStatus>('idle');

  // Error message states
  const [googleError, setGoogleError] = useState<string | null>(null);
  const [yelpError, setYelpError] = useState<string | null>(null);
  const [facebookError, setFacebookError] = useState<string | null>(null);
  const [appleError, setAppleError] = useState<string | null>(null);
  
  // Fetch locations for dropdown
  const { data: locations = [] } = useQuery({
    queryKey: ['/api/locations'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/locations');
      return res.json();
    }
  });

  // Form setup
  const googleForm = useForm<z.infer<typeof googlePlacesSchema>>({
    resolver: zodResolver(googlePlacesSchema),
    defaultValues: {
      placeId: '',
      apiKey: ''
    }
  });

  const yelpForm = useForm<z.infer<typeof yelpSchema>>({
    resolver: zodResolver(yelpSchema),
    defaultValues: {
      businessId: '',
      apiKey: ''
    }
  });

  const facebookForm = useForm<z.infer<typeof facebookSchema>>({
    resolver: zodResolver(facebookSchema),
    defaultValues: {
      pageId: '',
      accessToken: ''
    }
  });

  const appleForm = useForm<z.infer<typeof appleMapsSchema>>({
    resolver: zodResolver(appleMapsSchema),
    defaultValues: {
      placeId: '',
      teamId: '',
      keyId: '',
      privateKey: ''
    }
  });

  // Get selected location name for display
  const getSelectedLocationName = () => {
    if (selectedLocation === "all") return "All Locations";
    const location = locations.find((loc: Location) => String(loc.id) === selectedLocation);
    return location ? location.name : "Unknown Location";
  };

  // Mutations
  const googleMutation = useMutation({
    mutationFn: async (values: z.infer<typeof googlePlacesSchema>) => {
      // Add location to the payload
      const payload = { ...values, locationId: selectedLocation === "all" ? null : selectedLocation };
      const res = await apiRequest('POST', '/api/integrations/google-places/import', payload);
      return res.json();
    },
    onMutate: () => {
      setGoogleStatus('loading');
      setGoogleError(null);
    },
    onSuccess: (data) => {
      setGoogleStatus('success');
      toast({
        title: 'Google Places Integration Successful',
        description: `Imported ${data.importedCount} reviews.`,
      });
    },
    onError: (error: Error) => {
      setGoogleStatus('error');
      setGoogleError(error.message);
      toast({
        title: 'Google Places Integration Failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  const yelpMutation = useMutation({
    mutationFn: async (values: z.infer<typeof yelpSchema>) => {
      // Add location to the payload
      const payload = { ...values, locationId: selectedLocation === "all" ? null : selectedLocation };
      const res = await apiRequest('POST', '/api/integrations/yelp/import', payload);
      return res.json();
    },
    onMutate: () => {
      setYelpStatus('loading');
      setYelpError(null);
    },
    onSuccess: (data) => {
      setYelpStatus('success');
      toast({
        title: 'Yelp Integration Successful',
        description: `Imported ${data.importedCount} reviews.`,
      });
    },
    onError: (error: Error) => {
      setYelpStatus('error');
      setYelpError(error.message);
      toast({
        title: 'Yelp Integration Failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  const facebookMutation = useMutation({
    mutationFn: async (values: z.infer<typeof facebookSchema>) => {
      // Add location to the payload
      const payload = { ...values, locationId: selectedLocation === "all" ? null : selectedLocation };
      const res = await apiRequest('POST', '/api/integrations/facebook/import', payload);
      return res.json();
    },
    onMutate: () => {
      setFacebookStatus('loading');
      setFacebookError(null);
    },
    onSuccess: (data) => {
      setFacebookStatus('success');
      toast({
        title: 'Facebook Integration Successful',
        description: `Imported ${data.importedCount} reviews.`,
      });
    },
    onError: (error: Error) => {
      setFacebookStatus('error');
      setFacebookError(error.message);
      toast({
        title: 'Facebook Integration Failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  const appleMutation = useMutation({
    mutationFn: async (values: z.infer<typeof appleMapsSchema>) => {
      // Add location to the payload
      const payload = { ...values, locationId: selectedLocation === "all" ? null : selectedLocation };
      const res = await apiRequest('POST', '/api/integrations/apple-maps/import', payload);
      return res.json();
    },
    onMutate: () => {
      setAppleStatus('loading');
      setAppleError(null);
    },
    onSuccess: (data) => {
      setAppleStatus('success');
      toast({
        title: 'Apple Maps Integration Successful',
        description: `Imported ${data.importedCount} reviews.`,
      });
    },
    onError: (error: Error) => {
      setAppleStatus('error');
      setAppleError(error.message);
      toast({
        title: 'Apple Maps Integration Failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Handle form submissions
  const onGoogleSubmit = (values: z.infer<typeof googlePlacesSchema>) => {
    googleMutation.mutate(values);
  };

  const onYelpSubmit = (values: z.infer<typeof yelpSchema>) => {
    yelpMutation.mutate(values);
  };

  const onFacebookSubmit = (values: z.infer<typeof facebookSchema>) => {
    facebookMutation.mutate(values);
  };

  const onAppleSubmit = (values: z.infer<typeof appleMapsSchema>) => {
    appleMutation.mutate(values);
  };

  return (
    <div className="container mx-auto py-6 space-y-8">
      <h1 className="text-3xl font-bold">External Integrations</h1>
      <p className="text-muted-foreground">
        Connect your business profiles from various platforms to import and track reviews.
      </p>
      
      {/* Location Selector */}
      <div className="bg-card p-4 rounded-lg border border-border shadow-sm">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div>
            <h2 className="text-lg font-medium">Select Location</h2>
            <p className="text-muted-foreground text-sm">
              Choose which location to import reviews for
            </p>
          </div>
          <div className="w-full md:w-64">
            <Select
              value={selectedLocation}
              onValueChange={setSelectedLocation}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {Array.isArray(locations) && locations.map((location: Location) => (
                  <SelectItem key={location.id} value={String(location.id)}>
                    {location.name}
                  </SelectItem>
                ))}
                {!Array.isArray(locations) && (
                  <SelectItem value="main">Main Location</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {selectedLocation !== "all" && (
          <div className="mt-4 p-3 bg-muted/50 rounded-md">
            <p className="text-sm">
              <span className="font-medium">Selected Location:</span> {getSelectedLocationName()}
            </p>
          </div>
        )}
      </div>

      <Tabs defaultValue="google">
        <TabsList className="mb-6">
          <TabsTrigger value="google">Google Places</TabsTrigger>
          <TabsTrigger value="yelp">Yelp</TabsTrigger>
          <TabsTrigger value="facebook">Facebook</TabsTrigger>
          <TabsTrigger value="apple">Apple Maps</TabsTrigger>
        </TabsList>

        {/* Google Places */}
        <TabsContent value="google">
          <Card>
            <CardHeader>
              <CardTitle>Google Places Integration</CardTitle>
              <CardDescription>
                Import reviews from your Google Business Profile for {selectedLocation === "all" ? "all locations" : getSelectedLocationName()}.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {googleStatus === 'success' && (
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertTitle>Integration Successful</AlertTitle>
                  <AlertDescription>
                    Your Google Places reviews have been imported successfully.
                  </AlertDescription>
                </Alert>
              )}
              
              {googleStatus === 'error' && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Integration Failed</AlertTitle>
                  <AlertDescription>
                    {googleError || 'There was an error connecting to Google Places.'}
                  </AlertDescription>
                </Alert>
              )}

              <Form {...googleForm}>
                <form onSubmit={googleForm.handleSubmit(onGoogleSubmit)} className="space-y-4">
                  <FormField
                    control={googleForm.control}
                    name="placeId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Google Place ID*</FormLabel>
                        <FormControl>
                          <Input placeholder="ChIJ... " {...field} />
                        </FormControl>
                        <FormDescription>
                          Find your Place ID in your Google Business Profile settings
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={googleForm.control}
                    name="apiKey"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Google API Key*</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="AIza..." {...field} />
                        </FormControl>
                        <FormDescription>
                          Enter your Google Places API key with Places API enabled
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    disabled={googleStatus === 'loading'}
                    className="mt-2"
                  >
                    {googleStatus === 'loading' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Connect & Import
                  </Button>
                </form>
              </Form>
            </CardContent>
            <CardFooter className="flex flex-col items-start">
              <h4 className="text-sm font-semibold mb-2">How to find your Google Place ID:</h4>
              <ol className="text-sm text-muted-foreground list-decimal pl-5 space-y-1">
                <li>Go to <a href="https://developers.google.com/maps/documentation/places/web-service/place-id" target="_blank" rel="noopener noreferrer" className="text-primary underline">Google's Place ID Finder</a></li>
                <li>Enter your business name and location</li>
                <li>Copy the Place ID displayed on the map</li>
              </ol>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Yelp */}
        <TabsContent value="yelp">
          <Card>
            <CardHeader>
              <CardTitle>Yelp Integration</CardTitle>
              <CardDescription>
                Import and monitor reviews from your Yelp Business page for {selectedLocation === "all" ? "all locations" : getSelectedLocationName()}.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {yelpStatus === 'success' && (
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertTitle>Integration Successful</AlertTitle>
                  <AlertDescription>
                    Your Yelp reviews have been imported successfully.
                  </AlertDescription>
                </Alert>
              )}
              
              {yelpStatus === 'error' && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Integration Failed</AlertTitle>
                  <AlertDescription>
                    {yelpError || 'There was an error connecting to Yelp.'}
                  </AlertDescription>
                </Alert>
              )}

              <Form {...yelpForm}>
                <form onSubmit={yelpForm.handleSubmit(onYelpSubmit)} className="space-y-4">
                  <FormField
                    control={yelpForm.control}
                    name="businessId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Yelp Business ID*</FormLabel>
                        <FormControl>
                          <Input placeholder="your-business-name-city" {...field} />
                        </FormControl>
                        <FormDescription>
                          The business ID from your Yelp business page URL
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={yelpForm.control}
                    name="apiKey"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Yelp API Key*</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Your Yelp API key" {...field} />
                        </FormControl>
                        <FormDescription>
                          Enter your Yelp Fusion API key
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    disabled={yelpStatus === 'loading'}
                    className="mt-2"
                  >
                    {yelpStatus === 'loading' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Connect & Import
                  </Button>
                </form>
              </Form>
            </CardContent>
            <CardFooter className="flex flex-col items-start">
              <h4 className="text-sm font-semibold mb-2">How to find your Yelp Business ID:</h4>
              <ol className="text-sm text-muted-foreground list-decimal pl-5 space-y-1">
                <li>Go to your business page on Yelp</li>
                <li>Your business ID is in the URL (e.g., 'your-business-name-city')</li>
                <li>For Yelp API access, you need to apply in the <a href="https://www.yelp.com/developers" target="_blank" rel="noopener noreferrer" className="text-primary underline">Yelp Developer Program</a></li>
              </ol>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Facebook */}
        <TabsContent value="facebook">
          <Card>
            <CardHeader>
              <CardTitle>Facebook Integration</CardTitle>
              <CardDescription>
                Connect your Facebook business page to import reviews for {selectedLocation === "all" ? "all locations" : getSelectedLocationName()}.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {facebookStatus === 'success' && (
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertTitle>Integration Successful</AlertTitle>
                  <AlertDescription>
                    Your Facebook reviews have been imported successfully.
                  </AlertDescription>
                </Alert>
              )}
              
              {facebookStatus === 'error' && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Integration Failed</AlertTitle>
                  <AlertDescription>
                    {facebookError || 'There was an error connecting to Facebook.'}
                  </AlertDescription>
                </Alert>
              )}

              <Form {...facebookForm}>
                <form onSubmit={facebookForm.handleSubmit(onFacebookSubmit)} className="space-y-4">
                  <FormField
                    control={facebookForm.control}
                    name="pageId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Facebook Page ID*</FormLabel>
                        <FormControl>
                          <Input placeholder="123456789012345" {...field} />
                        </FormControl>
                        <FormDescription>
                          The numeric ID of your Facebook business page
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={facebookForm.control}
                    name="accessToken"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Access Token*</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Your long-lived access token" {...field} />
                        </FormControl>
                        <FormDescription>
                          A page access token with manage_pages permission
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    disabled={facebookStatus === 'loading'}
                    className="mt-2"
                  >
                    {facebookStatus === 'loading' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Connect & Import
                  </Button>
                </form>
              </Form>
            </CardContent>
            <CardFooter className="flex flex-col items-start">
              <h4 className="text-sm font-semibold mb-2">How to get Facebook Page Access:</h4>
              <ol className="text-sm text-muted-foreground list-decimal pl-5 space-y-1">
                <li>Create a Facebook Developer account at <a href="https://developers.facebook.com/" target="_blank" rel="noopener noreferrer" className="text-primary underline">developers.facebook.com</a></li>
                <li>Create an app and request the Pages API permissions</li>
                <li>Generate a long-lived access token with the pages_read_engagement permission</li>
              </ol>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Apple Maps */}
        <TabsContent value="apple">
          <Card>
            <CardHeader>
              <CardTitle>Apple Maps Integration</CardTitle>
              <CardDescription>
                Import reviews from your Apple Maps Connect business listing for {selectedLocation === "all" ? "all locations" : getSelectedLocationName()}.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {appleStatus === 'success' && (
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertTitle>Integration Successful</AlertTitle>
                  <AlertDescription>
                    Your Apple Maps reviews have been imported successfully.
                  </AlertDescription>
                </Alert>
              )}
              
              {appleStatus === 'error' && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Integration Failed</AlertTitle>
                  <AlertDescription>
                    {appleError || 'There was an error connecting to Apple Maps.'}
                  </AlertDescription>
                </Alert>
              )}

              <Form {...appleForm}>
                <form onSubmit={appleForm.handleSubmit(onAppleSubmit)} className="space-y-4">
                  <FormField
                    control={appleForm.control}
                    name="placeId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Apple Maps Place ID*</FormLabel>
                        <FormControl>
                          <Input placeholder="place.12345678" {...field} />
                        </FormControl>
                        <FormDescription>
                          The place ID from Apple Maps Connect
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={appleForm.control}
                    name="teamId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Team ID*</FormLabel>
                        <FormControl>
                          <Input placeholder="ABCDE12345" {...field} />
                        </FormControl>
                        <FormDescription>
                          Your Apple Developer team ID
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={appleForm.control}
                    name="keyId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Key ID*</FormLabel>
                        <FormControl>
                          <Input placeholder="ABCDEF1234" {...field} />
                        </FormControl>
                        <FormDescription>
                          The Key ID for your Maps API key
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={appleForm.control}
                    name="privateKey"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Private Key*</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Your private key content" 
                            className="font-mono text-xs"
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          The contents of your private key file
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    disabled={appleStatus === 'loading'}
                    className="mt-2"
                  >
                    {appleStatus === 'loading' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Connect & Import
                  </Button>
                </form>
              </Form>
            </CardContent>
            <CardFooter className="flex flex-col items-start">
              <h4 className="text-sm font-semibold mb-2">How to access Apple Maps Connect API:</h4>
              <ol className="text-sm text-muted-foreground list-decimal pl-5 space-y-1">
                <li>Register for the <a href="https://developer.apple.com/maps/mapkitjs/" target="_blank" rel="noopener noreferrer" className="text-primary underline">Maps Connect API program</a></li>
                <li>Create a Maps API key in your Apple Developer Account</li>
                <li>Generate a private key and note the Key ID</li>
                <li>Your Team ID is found in your Apple Developer membership details</li>
              </ol>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IntegrationsPage;