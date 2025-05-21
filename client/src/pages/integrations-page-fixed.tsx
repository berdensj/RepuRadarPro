import React, { useState, useEffect } from 'react';
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
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';

const IntegrationsPage = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("review-platforms");
  const [isHealthcare, setIsHealthcare] = useState(true); // Always set to true for demo
  
  // Fetch user's business type to determine if they're a healthcare client
  const { data: onboardingStatus } = useQuery({
    queryKey: ['/api/user/onboarding/status']
  });
  
  const handleConnect = (platform: string) => {
    toast({
      title: 'Connection Requested',
      description: `Setting up connection to ${platform}...`,
    });
    
    // Redirect to healthcare settings page for EHR integrations
    if (['DrChrono', 'Jane App', 'Symplast', 'Aesthetic Record', 'Open Dental', 
         'Dentrix', 'ChiroFusion', 'Athenahealth', 'Tebra', 'Cerner', 'Epic', 
         'eClinicalWorks'].includes(platform)) {
      // Show connecting message
      toast({
        title: 'Redirecting to Settings',
        description: 'Opening healthcare settings to configure your integration...',
      });
      
      // Use setTimeout to give the toast time to display before navigation
      setTimeout(() => {
        window.location.href = '/healthcare-settings';
      }, 1500);
    }
  };
  
  return (
    <>
      <Helmet>
        <title>Integrations | Reputation Sentinel</title>
        <meta name="description" content="Connect your Reputation Sentinel to third-party services and platforms." />
      </Helmet>
      
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Integrations</h1>
          <p className="text-muted-foreground">
            Connect your Reputation Sentinel to third-party services and platforms.
          </p>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="review-platforms">Review Platforms</TabsTrigger>
            <TabsTrigger value="crm">CRM Systems</TabsTrigger>
            <TabsTrigger value="ehr">EHR Systems</TabsTrigger>
            <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="review-platforms" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
              {/* Google */}
              <Card>
                <CardHeader>
                  <CardTitle>Google Business Profile</CardTitle>
                  <CardDescription>
                    Import and respond to Google reviews
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Connect your Google Business Profile to automatically import reviews and publish responses.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button onClick={() => handleConnect('Google')}>Connect</Button>
                </CardFooter>
              </Card>
              
              {/* Yelp */}
              <Card>
                <CardHeader>
                  <CardTitle>Yelp</CardTitle>
                  <CardDescription>
                    Import Yelp reviews
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Connect your Yelp Business account to monitor and import reviews.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button onClick={() => handleConnect('Yelp')}>Connect</Button>
                </CardFooter>
              </Card>
              
              {/* Facebook */}
              <Card>
                <CardHeader>
                  <CardTitle>Facebook</CardTitle>
                  <CardDescription>
                    Import Facebook recommendations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Connect your Facebook Page to monitor and import recommendations.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button onClick={() => handleConnect('Facebook')}>Connect</Button>
                </CardFooter>
              </Card>
              
              {/* Apple */}
              <Card>
                <CardHeader>
                  <CardTitle>Apple Maps</CardTitle>
                  <CardDescription>
                    Import Apple Maps ratings and reviews
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Connect your Apple Business Connect account to monitor Apple Maps ratings.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button onClick={() => handleConnect('Apple Maps')}>Connect</Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="crm" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Salesforce</CardTitle>
                  <CardDescription>
                    Sync customers and reviews with Salesforce
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Integrate with Salesforce to sync customer data and reviews.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button onClick={() => handleConnect('Salesforce')}>Connect</Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>HubSpot</CardTitle>
                  <CardDescription>
                    Sync customers and reviews with HubSpot
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Integrate with HubSpot to sync customer data and reviews.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button onClick={() => handleConnect('HubSpot')}>Connect</Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="ehr" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {/* Athenahealth */}
              <Card>
                <CardHeader>
                  <CardTitle>Athenahealth</CardTitle>
                  <CardDescription>
                    Connect patient data with Athenahealth EHR
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Send review requests to patients automatically after appointments and sync contact information.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button onClick={() => handleConnect('Athenahealth')}>Connect</Button>
                </CardFooter>
              </Card>
              
              {/* DrChrono */}
              <Card>
                <CardHeader>
                  <CardTitle>DrChrono</CardTitle>
                  <CardDescription>
                    Connect patient data with DrChrono EHR
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Integrate appointment data and automate review collection from patients after visits.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button onClick={() => handleConnect('DrChrono')}>Connect</Button>
                </CardFooter>
              </Card>
              
              {/* Tebra (Kareo) */}
              <Card>
                <CardHeader>
                  <CardTitle>Tebra (Kareo)</CardTitle>
                  <CardDescription>
                    Connect patient data with Tebra/Kareo
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Automate patient communications and review requests based on appointment data.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button onClick={() => handleConnect('Tebra')}>Connect</Button>
                </CardFooter>
              </Card>
              
              {/* Cerner */}
              <Card>
                <CardHeader>
                  <CardTitle>Cerner</CardTitle>
                  <CardDescription>
                    Connect patient data with Cerner EHR
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Integrate with Cerner to automate patient outreach and review collection workflows.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button onClick={() => handleConnect('Cerner')}>Connect</Button>
                </CardFooter>
              </Card>
              
              {/* Epic */}
              <Card>
                <CardHeader>
                  <CardTitle>Epic</CardTitle>
                  <CardDescription>
                    Connect patient data with Epic EHR
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Synchronize with Epic's patient portal to streamline review collection after appointments.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button onClick={() => handleConnect('Epic')}>Connect</Button>
                </CardFooter>
              </Card>
              
              {/* eClinicalWorks */}
              <Card>
                <CardHeader>
                  <CardTitle>eClinicalWorks</CardTitle>
                  <CardDescription>
                    Connect patient data with eClinicalWorks
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Integrate appointment data to automate patient review requests and reputation management.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button onClick={() => handleConnect('eClinicalWorks')}>Connect</Button>
                </CardFooter>
              </Card>
              
              {/* Symplast */}
              <Card>
                <CardHeader>
                  <CardTitle>Symplast</CardTitle>
                  <CardDescription>
                    Connect patient data with Symplast
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Integrate with Symplast EHR for med spas and aesthetic practices to streamline review collection.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button onClick={() => handleConnect('Symplast')}>Connect</Button>
                </CardFooter>
              </Card>
              
              {/* Aesthetic Record */}
              <Card>
                <CardHeader>
                  <CardTitle>Aesthetic Record</CardTitle>
                  <CardDescription>
                    Connect patient data with Aesthetic Record
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Sync appointment data from Aesthetic Record to automate review requests for cosmetic procedures.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button onClick={() => handleConnect('Aesthetic Record')}>Connect</Button>
                </CardFooter>
              </Card>
              
              {/* Open Dental */}
              <Card>
                <CardHeader>
                  <CardTitle>Open Dental</CardTitle>
                  <CardDescription>
                    Connect patient data with Open Dental
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Integrate with Open Dental to automate review requests after dental appointments.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button onClick={() => handleConnect('Open Dental')}>Connect</Button>
                </CardFooter>
              </Card>
              
              {/* Dentrix */}
              <Card>
                <CardHeader>
                  <CardTitle>Dentrix</CardTitle>
                  <CardDescription>
                    Connect patient data with Dentrix
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Synchronize dental patient appointments with Dentrix to streamline review collection.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button onClick={() => handleConnect('Dentrix')}>Connect</Button>
                </CardFooter>
              </Card>
              
              {/* ChiroFusion */}
              <Card>
                <CardHeader>
                  <CardTitle>ChiroFusion</CardTitle>
                  <CardDescription>
                    Connect patient data with ChiroFusion
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Integrate with ChiroFusion to automatically request reviews after chiropractic treatments.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button onClick={() => handleConnect('ChiroFusion')}>Connect</Button>
                </CardFooter>
              </Card>
              
              {/* Jane App */}
              <Card>
                <CardHeader>
                  <CardTitle>Jane App</CardTitle>
                  <CardDescription>
                    Connect patient data with Jane App
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Sync appointment data from Jane App for allied health professionals to automate review collection.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button onClick={() => handleConnect('Jane App')}>Connect</Button>
                </CardFooter>
              </Card>
            </div>
            
            <div className="mt-6 bg-muted p-4 rounded-lg border border-border">
              <h3 className="text-sm font-medium mb-2">Healthcare Integration Notes</h3>
              <p className="text-sm text-muted-foreground">
                All EHR integrations are HIPAA-compliant and only sync appointment data and contact information. 
                No protected health information (PHI) is accessed or stored in Reputation Sentinel.
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="webhooks" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Webhooks Configuration</CardTitle>
                <CardDescription>
                  Set up webhooks to connect with other services
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Configure webhooks to receive real-time notifications when new reviews are received.
                </p>
                <Button onClick={() => handleConnect('Webhooks')}>Setup Webhooks</Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="analytics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Google Analytics</CardTitle>
                <CardDescription>
                  Connect to Google Analytics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Send review metrics and customer engagement data to Google Analytics.
                </p>
                <Button onClick={() => handleConnect('Google Analytics')}>Connect</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default IntegrationsPage;