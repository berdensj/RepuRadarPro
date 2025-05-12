import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plug, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";

// Import platform icons
import { 
  SiGoogle as GoogleIcon, 
  SiYelp as YelpIcon, 
  SiFacebook as FacebookIcon
} from "react-icons/si";

interface ConnectPlatformsPageProps {
  data: any;
  updateData: (section: string, data: any) => void;
  goNext: () => void;
}

export default function ConnectPlatformsPage({ 
  data, 
  updateData, 
  goNext
}: ConnectPlatformsPageProps) {
  const { toast } = useToast();
  
  // Platform connection states
  const [platforms, setPlatforms] = useState(data.platforms || {
    google: false,
    yelp: false,
    facebook: false,
  });
  
  // Modal state
  const [activeDialog, setActiveDialog] = useState<string | null>(null);
  const [googlePlaceId, setGooglePlaceId] = useState("");
  const [yelpBusinessId, setYelpBusinessId] = useState("");
  const [facebookPageId, setFacebookPageId] = useState("");
  
  // Handle connect platform
  const handleConnect = (platform: string) => {
    // In a real app, this would open OAuth flow or API key entry
    // For now, we'll just simulate connection
    
    // Validation (in a real app, this would be more robust)
    if (platform === 'google' && !googlePlaceId) {
      toast({
        title: "Missing Google Place ID",
        description: "Please enter your Google Place ID to connect",
        variant: "destructive"
      });
      return;
    }
    
    if (platform === 'yelp' && !yelpBusinessId) {
      toast({
        title: "Missing Yelp Business ID",
        description: "Please enter your Yelp Business ID to connect",
        variant: "destructive"
      });
      return;
    }
    
    if (platform === 'facebook' && !facebookPageId) {
      toast({
        title: "Missing Facebook Page ID",
        description: "Please enter your Facebook Page ID to connect",
        variant: "destructive"
      });
      return;
    }
    
    // Update connected state
    const updatedPlatforms = {
      ...platforms,
      [platform]: true,
    };
    
    setPlatforms(updatedPlatforms);
    updateData('platforms', updatedPlatforms);
    
    // Show success message
    toast({
      title: "Platform connected",
      description: `Successfully connected to ${platform.charAt(0).toUpperCase() + platform.slice(1)}`,
    });
    
    // Close dialog
    setActiveDialog(null);
  };
  
  // Handle disconnect platform
  const handleDisconnect = (platform: string) => {
    const updatedPlatforms = {
      ...platforms,
      [platform]: false,
    };
    
    setPlatforms(updatedPlatforms);
    updateData('platforms', updatedPlatforms);
    
    toast({
      title: "Platform disconnected",
      description: `${platform.charAt(0).toUpperCase() + platform.slice(1)} has been disconnected`,
    });
  };
  
  const renderPlatformCard = (
    platform: string, 
    title: string, 
    description: string, 
    icon: React.ReactNode,
    dialog: React.ReactNode
  ) => {
    const isConnected = platforms[platform as keyof typeof platforms];
    
    return (
      <Card className={isConnected ? "border-primary/50 shadow-md" : ""}>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="bg-primary/10 p-2 rounded text-primary">
              {icon}
            </div>
            {isConnected && (
              <div className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium flex items-center">
                <Check className="h-3 w-3 mr-1" />
                Connected
              </div>
            )}
          </div>
          <CardTitle className="text-lg">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardFooter>
          {isConnected ? (
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => handleDisconnect(platform)}
            >
              Disconnect
            </Button>
          ) : (
            <Dialog open={activeDialog === platform} onOpenChange={(open) => setActiveDialog(open ? platform : null)}>
              <DialogTrigger asChild>
                <Button className="w-full">Connect</Button>
              </DialogTrigger>
              {dialog}
            </Dialog>
          )}
        </CardFooter>
      </Card>
    );
  };
  
  // Google Dialog
  const googleDialog = (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Connect Google Business Profile</DialogTitle>
        <DialogDescription>
          Enter your Google Place ID to monitor reviews from Google.
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="googlePlaceId">Google Place ID</Label>
          <Input
            id="googlePlaceId"
            value={googlePlaceId}
            onChange={(e) => setGooglePlaceId(e.target.value)}
            placeholder="Enter your Google Place ID"
          />
          <p className="text-xs text-slate-500">
            You can find your Place ID by searching for your business on{" "}
            <a 
              href="https://developers.google.com/maps/documentation/places/web-service/place-id" 
              target="_blank"
              rel="noreferrer"
              className="text-primary hover:underline"
            >
              Google's Place ID Finder
            </a>
          </p>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={() => setActiveDialog(null)}>
          Cancel
        </Button>
        <Button onClick={() => handleConnect('google')}>
          Connect
        </Button>
      </DialogFooter>
    </DialogContent>
  );
  
  // Yelp Dialog
  const yelpDialog = (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Connect Yelp Business</DialogTitle>
        <DialogDescription>
          Enter your Yelp Business ID to track reviews from Yelp.
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="yelpBusinessId">Yelp Business ID</Label>
          <Input
            id="yelpBusinessId"
            value={yelpBusinessId}
            onChange={(e) => setYelpBusinessId(e.target.value)}
            placeholder="Enter your Yelp Business ID"
          />
          <p className="text-xs text-slate-500">
            Your Yelp Business ID can be found in your Yelp Business URL after "biz/" (e.g., your-business-name-los-angeles)
          </p>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={() => setActiveDialog(null)}>
          Cancel
        </Button>
        <Button onClick={() => handleConnect('yelp')}>
          Connect
        </Button>
      </DialogFooter>
    </DialogContent>
  );
  
  // Facebook Dialog
  const facebookDialog = (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Connect Facebook Page</DialogTitle>
        <DialogDescription>
          Enter your Facebook Page ID to monitor reviews from Facebook.
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="facebookPageId">Facebook Page ID</Label>
          <Input
            id="facebookPageId"
            value={facebookPageId}
            onChange={(e) => setFacebookPageId(e.target.value)}
            placeholder="Enter your Facebook Page ID"
          />
          <p className="text-xs text-slate-500">
            You can find your Page ID in your Facebook Page URL or in your Page settings.
          </p>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={() => setActiveDialog(null)}>
          Cancel
        </Button>
        <Button onClick={() => handleConnect('facebook')}>
          Connect
        </Button>
      </DialogFooter>
    </DialogContent>
  );
  
  const handleContinue = () => {
    // Check if at least one platform is connected (optional)
    const hasConnections = Object.values(platforms).some(connected => connected);
    
    if (!hasConnections) {
      // Confirm the user wants to continue without connections
      if (window.confirm("You haven't connected any platforms. Would you still like to continue?")) {
        goNext();
      }
    } else {
      goNext();
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2 mb-6">
        <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 text-primary mb-2">
          <Plug className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-bold text-slate-800">Connect Your Platforms</h1>
        <p className="text-slate-600 max-w-lg mx-auto">
          Connect the platforms where your business has reviews to automatically import and monitor them.
        </p>
      </div>
      
      <div className="grid gap-4 sm:grid-cols-3">
        {renderPlatformCard(
          'google',
          'Google Business Profile',
          'Connect your Google Business Profile to monitor and respond to Google reviews.',
          <GoogleIcon className="h-6 w-6" />,
          googleDialog
        )}
        
        {renderPlatformCard(
          'yelp',
          'Yelp Business',
          'Track and manage your Yelp reviews to improve customer satisfaction.',
          <YelpIcon className="h-6 w-6" />,
          yelpDialog
        )}
        
        {renderPlatformCard(
          'facebook',
          'Facebook Page',
          'Monitor reviews and recommendations from your Facebook business page.',
          <FacebookIcon className="h-6 w-6" />,
          facebookDialog
        )}
      </div>
      
      <div className="text-center pt-4">
        <p className="text-sm text-slate-500 mb-4">
          {Object.values(platforms).filter(Boolean).length === 0
            ? "You haven't connected any platforms yet. Connecting platforms will help you manage all your reviews in one place."
            : `You've connected ${Object.values(platforms).filter(Boolean).length} ${Object.values(platforms).filter(Boolean).length === 1 ? 'platform' : 'platforms'}.`}
        </p>
        
        <Button onClick={handleContinue}>
          Continue Setup
        </Button>
      </div>
    </div>
  );
}