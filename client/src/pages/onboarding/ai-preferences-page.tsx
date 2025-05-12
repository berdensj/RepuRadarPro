import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Sparkles, Star, Bell } from "lucide-react";
import { 
  RadioGroup, 
  RadioGroupItem 
} from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";

interface AiPreferencesPageProps {
  data: any;
  updateData: (section: string, data: any) => void;
  goNext: () => void;
}

export default function AiPreferencesPage({ 
  data, 
  updateData, 
  goNext 
}: AiPreferencesPageProps) {
  const { toast } = useToast();
  
  // Initialize AI preferences from existing data
  const [aiPreferences, setAiPreferences] = useState({
    defaultTone: data.aiPreferences?.defaultTone || "professional",
    autoReplyToFiveStars: data.aiPreferences?.autoReplyToFiveStars || false,
    notificationFrequency: data.aiPreferences?.notificationFrequency || "daily",
  });
  
  // Handle tone selection
  const handleToneChange = (tone: string) => {
    setAiPreferences(prev => ({
      ...prev,
      defaultTone: tone
    }));
  };
  
  // Handle auto-reply toggle
  const handleAutoReplyChange = (checked: boolean) => {
    setAiPreferences(prev => ({
      ...prev,
      autoReplyToFiveStars: checked
    }));
  };
  
  // Handle notification frequency change
  const handleNotificationFrequencyChange = (frequency: string) => {
    setAiPreferences(prev => ({
      ...prev,
      notificationFrequency: frequency
    }));
  };
  
  // Handle save and continue
  const handleSaveAndContinue = () => {
    // Update data in parent component
    updateData('aiPreferences', aiPreferences);
    
    toast({
      title: "AI preferences saved",
      description: "Your AI and notification preferences have been saved",
    });
    
    // Move to next step
    goNext();
  };
  
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2 mb-6">
        <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 text-primary mb-2">
          <Sparkles className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-bold text-slate-800">AI & Notification Preferences</h1>
        <p className="text-slate-600 max-w-lg mx-auto">
          Customize how our AI assists you with review responses and how you receive notifications.
        </p>
      </div>
      
      <div className="grid gap-6">
        {/* AI Reply Tone */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <span className="mr-2">Default Reply Tone</span>
            </CardTitle>
            <CardDescription>
              Choose the default tone for AI-generated responses to your reviews
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={aiPreferences.defaultTone}
              onValueChange={handleToneChange}
              className="grid gap-4 grid-cols-1 sm:grid-cols-3"
            >
              <div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="professional" id="professional" />
                  <Label htmlFor="professional" className="font-medium">Professional</Label>
                </div>
                <p className="text-sm text-slate-500 mt-1 ml-6">
                  Formal, respectful, and business-appropriate
                </p>
              </div>
              
              <div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="friendly" id="friendly" />
                  <Label htmlFor="friendly" className="font-medium">Friendly</Label>
                </div>
                <p className="text-sm text-slate-500 mt-1 ml-6">
                  Warm, conversational, and approachable
                </p>
              </div>
              
              <div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="apologetic" id="apologetic" />
                  <Label htmlFor="apologetic" className="font-medium">Apologetic</Label>
                </div>
                <p className="text-sm text-slate-500 mt-1 ml-6">
                  Empathetic, solution-focused for negative reviews
                </p>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>
        
        {/* Auto-reply to 5-star reviews */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <span className="mr-2">Automatic Replies</span>
              <Star className="h-4 w-4 text-amber-400" />
            </CardTitle>
            <CardDescription>
              Configure automatic AI responses for positive reviews
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="auto-reply">Auto-reply to 5-star reviews</Label>
                <p className="text-sm text-slate-500">
                  Automatically generate and post replies to 5-star reviews
                </p>
              </div>
              <Switch
                id="auto-reply"
                checked={aiPreferences.autoReplyToFiveStars}
                onCheckedChange={handleAutoReplyChange}
              />
            </div>
            
            {aiPreferences.autoReplyToFiveStars && (
              <div className="mt-4 p-3 bg-amber-50 rounded-md border border-amber-100 text-sm text-amber-800">
                <p>
                  <strong>Note:</strong> Auto-replies will be generated using your selected tone and will thank customers for their positive feedback. You can edit automated replies in the dashboard if needed.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Notification Frequency */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <span className="mr-2">Notification Frequency</span>
              <Bell className="h-4 w-4" />
            </CardTitle>
            <CardDescription>
              Set how often you want to receive email notifications about new reviews
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={aiPreferences.notificationFrequency}
              onValueChange={handleNotificationFrequencyChange}
              className="grid gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="instant" id="instant" />
                <Label htmlFor="instant" className="font-medium">Instant</Label>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                  Real-time
                </span>
                <p className="text-sm text-slate-500 ml-2">
                  Get notified immediately when new reviews are posted
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="daily" id="daily" />
                <Label htmlFor="daily" className="font-medium">Daily Digest</Label>
                <p className="text-sm text-slate-500 ml-2">
                  Receive a summary of new reviews once a day
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="weekly" id="weekly" />
                <Label htmlFor="weekly" className="font-medium">Weekly Digest</Label>
                <p className="text-sm text-slate-500 ml-2">
                  Receive a weekly summary of all new reviews
                </p>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>
      </div>
      
      <div className="flex justify-end pt-4">
        <Button onClick={handleSaveAndContinue}>
          Save Preferences
        </Button>
      </div>
    </div>
  );
}