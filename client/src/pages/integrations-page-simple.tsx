import React, { useState } from 'react';
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

const IntegrationsPage = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("review-platforms");
  
  const handleConnect = (platform: string) => {
    toast({
      title: 'Connection Requested',
      description: `Setting up connection to ${platform}...`,
    });
  };
  
  return (
    <>
      <Helmet>
        <title>Integrations | RepuRadar</title>
        <meta name="description" content="Connect your RepuRadar to third-party services and platforms." />
      </Helmet>
      
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Integrations</h1>
          <p className="text-muted-foreground">
            Connect your RepuRadar to third-party services and platforms.
          </p>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="review-platforms">Review Platforms</TabsTrigger>
            <TabsTrigger value="crm">CRM Systems</TabsTrigger>
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