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
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';

const SettingsPage = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('general');
  
  // General settings
  const [language, setLanguage] = useState('en');
  const [timezone, setTimezone] = useState('America/New_York');
  const [dateFormat, setDateFormat] = useState('MM/DD/YYYY');
  
  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [browserNotifications, setBrowserNotifications] = useState(true);
  const [slackNotifications, setSlackNotifications] = useState(false);
  const [notificationFrequency, setNotificationFrequency] = useState('immediate');
  
  // Security settings
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState('60');
  const [loginAttempts, setLoginAttempts] = useState('5');
  
  // Accessibility settings
  const [highContrast, setHighContrast] = useState(false);
  const [largeText, setLargeText] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  
  const handleSaveChanges = () => {
    toast({
      title: 'Settings Saved',
      description: 'Your settings have been updated successfully.',
    });
  };
  
  return (
    <>
      <Helmet>
        <title>Settings | RepuRadar</title>
        <meta name="description" content="Manage your RepuRadar account settings" />
      </Helmet>
      
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account and application preferences
          </p>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="accessibility">Accessibility</TabsTrigger>
            <TabsTrigger value="data">Data Management</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>
                  Configure basic account preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="language">Language</Label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger id="language">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select value={timezone} onValueChange={setTimezone}>
                    <SelectTrigger id="timezone">
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                      <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                      <SelectItem value="Europe/London">London (GMT)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="date-format">Date Format</Label>
                  <RadioGroup value={dateFormat} onValueChange={setDateFormat}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="MM/DD/YYYY" id="fmt-mdy" />
                      <Label htmlFor="fmt-mdy">MM/DD/YYYY</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="DD/MM/YYYY" id="fmt-dmy" />
                      <Label htmlFor="fmt-dmy">DD/MM/YYYY</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="YYYY-MM-DD" id="fmt-ymd" />
                      <Label htmlFor="fmt-ymd">YYYY-MM-DD</Label>
                    </div>
                  </RadioGroup>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSaveChanges}>Save Changes</Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your account details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="fullname">Full Name</Label>
                  <Input id="fullname" defaultValue="Jane Smith" />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" defaultValue="jane@example.com" />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="job-title">Job Title</Label>
                  <Input id="job-title" defaultValue="Marketing Manager" />
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSaveChanges}>Save Changes</Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Configure how and when you receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="email-notif" className="flex-1">Email Notifications</Label>
                  <Switch
                    id="email-notif"
                    checked={emailNotifications}
                    onCheckedChange={setEmailNotifications}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="browser-notif" className="flex-1">Browser Notifications</Label>
                  <Switch
                    id="browser-notif"
                    checked={browserNotifications}
                    onCheckedChange={setBrowserNotifications}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="slack-notif" className="flex-1">Slack Notifications</Label>
                  <Switch
                    id="slack-notif"
                    checked={slackNotifications}
                    onCheckedChange={setSlackNotifications}
                  />
                </div>
                
                <div className="grid gap-2 pt-4">
                  <Label htmlFor="notification-frequency">Notification Frequency</Label>
                  <Select value={notificationFrequency} onValueChange={setNotificationFrequency}>
                    <SelectTrigger id="notification-frequency">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">Immediate</SelectItem>
                      <SelectItem value="hourly">Hourly Digest</SelectItem>
                      <SelectItem value="daily">Daily Digest</SelectItem>
                      <SelectItem value="weekly">Weekly Summary</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSaveChanges}>Save Changes</Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Notification Events</CardTitle>
                <CardDescription>
                  Choose which events trigger notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="new-review-notif" className="flex-1">New Reviews</Label>
                  <Switch id="new-review-notif" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="neg-review-notif" className="flex-1">Negative Reviews (3★ or less)</Label>
                  <Switch id="neg-review-notif" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="reply-notif" className="flex-1">Review Replies</Label>
                  <Switch id="reply-notif" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="rating-change-notif" className="flex-1">Rating Changes</Label>
                  <Switch id="rating-change-notif" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="reports-notif" className="flex-1">Weekly Reports</Label>
                  <Switch id="reports-notif" defaultChecked />
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSaveChanges}>Save Changes</Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="security" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>
                  Configure account security options
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="2fa" className="mb-1 block">Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <Switch
                    id="2fa"
                    checked={twoFactorEnabled}
                    onCheckedChange={setTwoFactorEnabled}
                  />
                </div>
                
                <div className="grid gap-2 pt-4">
                  <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                  <Input
                    id="session-timeout"
                    type="number"
                    value={sessionTimeout}
                    onChange={(e) => setSessionTimeout(e.target.value)}
                    min="15"
                    max="480"
                  />
                  <p className="text-sm text-muted-foreground">
                    Time until your session expires due to inactivity
                  </p>
                </div>
                
                <div className="grid gap-2 pt-4">
                  <Label htmlFor="login-attempts">Maximum Login Attempts</Label>
                  <Input
                    id="login-attempts"
                    type="number"
                    value={loginAttempts}
                    onChange={(e) => setLoginAttempts(e.target.value)}
                    min="3"
                    max="10"
                  />
                  <p className="text-sm text-muted-foreground">
                    Number of failed login attempts before account lockout
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSaveChanges}>Save Changes</Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>
                  Update your account password
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input id="current-password" type="password" />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input id="new-password" type="password" />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input id="confirm-password" type="password" />
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSaveChanges}>Update Password</Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="accessibility" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Accessibility Settings</CardTitle>
                <CardDescription>
                  Configure display and interface options for better accessibility
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="high-contrast" className="mb-1 block">High Contrast Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Increase contrast for better visibility
                    </p>
                  </div>
                  <Switch
                    id="high-contrast"
                    checked={highContrast}
                    onCheckedChange={setHighContrast}
                  />
                </div>
                
                <div className="flex items-center justify-between pt-4">
                  <div>
                    <Label htmlFor="large-text" className="mb-1 block">Large Text</Label>
                    <p className="text-sm text-muted-foreground">
                      Increase text size throughout the application
                    </p>
                  </div>
                  <Switch
                    id="large-text"
                    checked={largeText}
                    onCheckedChange={setLargeText}
                  />
                </div>
                
                <div className="flex items-center justify-between pt-4">
                  <div>
                    <Label htmlFor="reduced-motion" className="mb-1 block">Reduced Motion</Label>
                    <p className="text-sm text-muted-foreground">
                      Minimize animations and motion effects
                    </p>
                  </div>
                  <Switch
                    id="reduced-motion"
                    checked={reducedMotion}
                    onCheckedChange={setReducedMotion}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSaveChanges}>Save Changes</Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="data" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Data Management</CardTitle>
                <CardDescription>
                  Manage your data and privacy settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="data-retention">Data Retention Period</Label>
                  <Select defaultValue="24">
                    <SelectTrigger id="data-retention">
                      <SelectValue placeholder="Select retention period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3 months</SelectItem>
                      <SelectItem value="6">6 months</SelectItem>
                      <SelectItem value="12">12 months</SelectItem>
                      <SelectItem value="24">24 months</SelectItem>
                      <SelectItem value="36">36 months</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    Period for which review data will be retained
                  </p>
                </div>
                
                <div className="space-y-2 pt-4">
                  <Label>Data Export</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Download all your data in a machine-readable format
                  </p>
                  <Button variant="outline">Export All Data</Button>
                </div>
                
                <div className="space-y-2 pt-4">
                  <Label className="text-red-500">Danger Zone</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Delete your account and all associated data
                  </p>
                  <Button variant="destructive">Delete Account</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default SettingsPage;