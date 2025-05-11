import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
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
import { useToast } from '@/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Form schemas for each integration
const googlePlacesSchema = z.object({
  placeId: z.string().min(1, 'Google Place ID is required'),
  apiKey: z.string().min(1, 'API Key is required'),
  locationId: z.string().optional()
});

const yelpSchema = z.object({
  businessId: z.string().min(1, 'Yelp Business ID is required'),
  apiKey: z.string().min(1, 'API Key is required'),
  locationId: z.string().optional()
});

const facebookSchema = z.object({
  pageId: z.string().min(1, 'Facebook Page ID is required'),
  accessToken: z.string().min(1, 'Access Token is required'),
  locationId: z.string().optional()
});

const appleMapsSchema = z.object({
  placeId: z.string().min(1, 'Apple Maps Place ID is required'),
  teamId: z.string().min(1, 'Team ID is required'),
  keyId: z.string().min(1, 'Key ID is required'),
  privateKey: z.string().min(1, 'Private Key is required'),
  locationId: z.string().optional()
});

type IntegrationStatus = 'idle' | 'loading' | 'success' | 'error';

const IntegrationsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
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

  // Form setup
  const googleForm = useForm<z.infer<typeof googlePlacesSchema>>({
    resolver: zodResolver(googlePlacesSchema),
    defaultValues: {
      placeId: '',
      apiKey: '',
      locationId: ''
    }
  });

  const yelpForm = useForm<z.infer<typeof yelpSchema>>({
    resolver: zodResolver(yelpSchema),
    defaultValues: {
      businessId: '',
      apiKey: '',
      locationId: ''
    }
  });

  const facebookForm = useForm<z.infer<typeof facebookSchema>>({
    resolver: zodResolver(facebookSchema),
    defaultValues: {
      pageId: '',
      accessToken: '',
      locationId: ''
    }
  });

  const appleForm = useForm<z.infer<typeof appleMapsSchema>>({
    resolver: zodResolver(appleMapsSchema),
    defaultValues: {
      placeId: '',
      teamId: '',
      keyId: '',
      privateKey: '',
      locationId: ''
    }
  });

  // Mutations
  const googleMutation = useMutation({
    mutationFn: async (values: z.infer<typeof googlePlacesSchema>) => {
      const res = await apiRequest('POST', '/api/integrations/google-places/import', values);
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
      const res = await apiRequest('POST', '/api/integrations/yelp/import', values);
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
      const res = await apiRequest('POST', '/api/integrations/facebook/import', values);
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
      const res = await apiRequest('POST', '/api/integrations/apple-maps/import', values);
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
                Import reviews from your Google Business Profile.
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

                  <FormField
                    control={googleForm.control}
                    name="locationId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Location ID" {...field} />
                        </FormControl>
                        <FormDescription>
                          Link these reviews to a specific location
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
                Import and monitor reviews from your Yelp Business page.
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
                  
                  <FormField
                    control={yelpForm.control}
                    name="locationId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Location ID" {...field} />
                        </FormControl>
                        <FormDescription>
                          Link these reviews to a specific location
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
                <li>Look at the URL: https://www.yelp.com/biz/<strong>[your-business-id]</strong></li>
                <li>Copy the part after "/biz/"</li>
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
                Import and monitor reviews from your Facebook Business page.
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
                          The ID of your Facebook business page
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
                          <Input type="password" placeholder="Your Facebook access token" {...field} />
                        </FormControl>
                        <FormDescription>
                          Enter a long-lived page access token
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={facebookForm.control}
                    name="locationId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Location ID" {...field} />
                        </FormControl>
                        <FormDescription>
                          Link these reviews to a specific location
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
              <h4 className="text-sm font-semibold mb-2">How to find your Facebook Page ID:</h4>
              <ol className="text-sm text-muted-foreground list-decimal pl-5 space-y-1">
                <li>Go to your Facebook Page</li>
                <li>Click on "About" in the left sidebar</li>
                <li>Scroll down to find your Page ID</li>
                <li>For access tokens, use the <a href="https://developers.facebook.com/tools/explorer/" target="_blank" rel="noopener noreferrer" className="text-primary underline">Graph API Explorer</a></li>
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
                Import and monitor reviews from Apple Maps.
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
                          <Input placeholder="Place ID" {...field} />
                        </FormControl>
                        <FormDescription>
                          The unique identifier for your business on Apple Maps
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
                          <Input placeholder="Apple Developer Team ID" {...field} />
                        </FormControl>
                        <FormDescription>
                          Your Apple Developer Team ID
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
                          <Input placeholder="Key ID" {...field} />
                        </FormControl>
                        <FormDescription>
                          The ID of your private key from Apple Developer
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
                            as="textarea" 
                            placeholder="-----BEGIN PRIVATE KEY----- ..." 
                            className="h-24" 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Your private key for MapKit JS
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={appleForm.control}
                    name="locationId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Location ID" {...field} />
                        </FormControl>
                        <FormDescription>
                          Link these reviews to a specific location
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
              <h4 className="text-sm font-semibold mb-2">Apple Maps Integration Instructions:</h4>
              <ol className="text-sm text-muted-foreground list-decimal pl-5 space-y-1">
                <li>Register for the <a href="https://developer.apple.com/maps/" target="_blank" rel="noopener noreferrer" className="text-primary underline">Apple Maps APIs</a></li>
                <li>Create a MapKit JS key in your Apple Developer account</li>
                <li>Generate and download your private key</li>
                <li>Copy your Team ID and Key ID from the developer portal</li>
              </ol>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IntegrationsPage;