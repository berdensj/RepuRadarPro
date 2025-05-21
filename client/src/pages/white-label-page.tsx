import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
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
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

const WhiteLabelPage = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('branding');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [customCssEnabled, setCustomCssEnabled] = useState(false);

  // Sample state for form values
  const [brandName, setBrandName] = useState('My Brand');
  const [customDomain, setCustomDomain] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#4f46e5');
  const [customCss, setCustomCss] = useState('');
  const [emailFooter, setEmailFooter] = useState('');

  const handleSaveChanges = () => {
    toast({
      title: 'Changes Saved',
      description: 'Your white label settings have been updated successfully.',
    });
  };

  const handleResetDefaults = () => {
    setBrandName('My Brand');
    setCustomDomain('');
    setLogoUrl('');
    setPrimaryColor('#4f46e5');
    setCustomCss('');
    setEmailFooter('');
    setIsDarkMode(false);
    setCustomCssEnabled(false);

    toast({
      title: 'Settings Reset',
      description: 'White label settings have been reset to defaults.',
    });
  };

  return (
    <>
      <Helmet>
        <title>White Label | Reputation Sentinel</title>
        <meta name="description" content="Customize your Reputation Sentinel dashboard with your own branding" />
      </Helmet>

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">White Label</h1>
          <p className="text-muted-foreground">
            Customize your Reputation Sentinel dashboard with your own branding
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="branding">Branding</TabsTrigger>
            <TabsTrigger value="domain">Domain</TabsTrigger>
            <TabsTrigger value="emails">Emails</TabsTrigger>
            <TabsTrigger value="custom-css">Custom CSS</TabsTrigger>
          </TabsList>

          <TabsContent value="branding" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Brand Identity</CardTitle>
                <CardDescription>
                  Customize how your dashboard appears to clients
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="brand-name">Brand Name</Label>
                  <Input 
                    id="brand-name" 
                    value={brandName} 
                    onChange={(e) => setBrandName(e.target.value)} 
                    placeholder="Your Brand Name"
                  />
                  <p className="text-sm text-muted-foreground">
                    This name will appear throughout the dashboard interface
                  </p>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="logo-url">Logo URL</Label>
                  <Input 
                    id="logo-url" 
                    value={logoUrl} 
                    onChange={(e) => setLogoUrl(e.target.value)} 
                    placeholder="https://yourbrand.com/logo.png"
                  />
                  <p className="text-sm text-muted-foreground">
                    Recommended size: 200px × 50px (PNG or SVG with transparency)
                  </p>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="primary-color">Primary Color</Label>
                  <div className="flex gap-4 items-center">
                    <Input 
                      id="primary-color" 
                      type="color" 
                      value={primaryColor} 
                      onChange={(e) => setPrimaryColor(e.target.value)} 
                      className="w-16 h-10"
                    />
                    <Input 
                      value={primaryColor} 
                      onChange={(e) => setPrimaryColor(e.target.value)} 
                      className="flex-1"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    This color will be used for buttons, links, and accents
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch 
                    id="dark-mode" 
                    checked={isDarkMode} 
                    onCheckedChange={setIsDarkMode}
                  />
                  <Label htmlFor="dark-mode">Enable Dark Mode by Default</Label>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={handleResetDefaults}>Reset to Defaults</Button>
                <Button onClick={handleSaveChanges}>Save Changes</Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Dashboard Preview</CardTitle>
                <CardDescription>
                  See how your branding changes will look
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-md p-4">
                  <p className="text-center text-muted-foreground">Preview not available in this version</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="domain" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Custom Domain</CardTitle>
                <CardDescription>
                  Set up a custom domain for your client's dashboard
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="custom-domain">Custom Domain</Label>
                  <Input 
                    id="custom-domain" 
                    value={customDomain} 
                    onChange={(e) => setCustomDomain(e.target.value)} 
                    placeholder="dashboard.yourbrand.com"
                  />
                  <p className="text-sm text-muted-foreground">
                    You'll need to set up DNS records to point this domain to our servers
                  </p>
                </div>

                <div className="bg-muted p-4 rounded-md">
                  <h3 className="text-sm font-medium mb-2">DNS Configuration</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Add the following CNAME record to your DNS settings:
                  </p>
                  <div className="bg-background p-2 rounded border">
                    <code className="text-xs">
                      Type: CNAME<br />
                      Host: dashboard (or subdomain of your choice)<br />
                      Value: custom.repuradar.com<br />
                      TTL: 3600
                    </code>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="ssl" defaultChecked disabled />
                  <Label htmlFor="ssl">SSL Certificate (Automatically provisioned)</Label>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSaveChanges}>Save Changes</Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="emails" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Email Customization</CardTitle>
                <CardDescription>
                  Customize emails sent to your clients
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="from-name">From Name</Label>
                  <Input 
                    id="from-name" 
                    defaultValue={brandName} 
                    placeholder="Your Brand Name"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="reply-to">Reply-To Email</Label>
                  <Input 
                    id="reply-to" 
                    defaultValue="support@yourbrand.com" 
                    placeholder="support@yourbrand.com"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="email-footer">Email Footer</Label>
                  <Textarea 
                    id="email-footer" 
                    value={emailFooter} 
                    onChange={(e) => setEmailFooter(e.target.value)} 
                    placeholder="© 2025 Your Brand | Privacy Policy | Terms of Service"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Email Types</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="review-alerts" defaultChecked />
                      <Label htmlFor="review-alerts">Review Alerts</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="weekly-reports" defaultChecked />
                      <Label htmlFor="weekly-reports">Weekly Reports</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="review-requests" defaultChecked />
                      <Label htmlFor="review-requests">Review Requests</Label>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSaveChanges}>Save Changes</Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="custom-css" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Custom CSS</CardTitle>
                <CardDescription>
                  Add custom CSS to further customize your dashboard
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="enable-css" 
                    checked={customCssEnabled} 
                    onCheckedChange={setCustomCssEnabled}
                  />
                  <Label htmlFor="enable-css">Enable Custom CSS</Label>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="custom-css">CSS Code</Label>
                  <Textarea 
                    id="custom-css" 
                    value={customCss} 
                    onChange={(e) => setCustomCss(e.target.value)} 
                    placeholder=".sidebar { background-color: #f8f9fa; }\n.header { border-bottom: 1px solid #e2e8f0; }"
                    rows={10}
                    disabled={!customCssEnabled}
                    className="font-mono text-sm"
                  />
                  <p className="text-sm text-muted-foreground">
                    Advanced: Custom CSS allows you to make detailed styling changes to your dashboard
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSaveChanges} disabled={!customCssEnabled}>Save Changes</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default WhiteLabelPage;